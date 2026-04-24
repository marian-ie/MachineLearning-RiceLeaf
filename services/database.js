import * as SQLite from "expo-sqlite";
import bcrypt from "bcryptjs";

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync("rice_history.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,           
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      image_uri        TEXT,
      label            TEXT NOT NULL,
      display_name     TEXT NOT NULL,
      confidence       REAL NOT NULL,
      is_uncertain     INTEGER DEFAULT 0,
      drought_prob     REAL DEFAULT 0,
      pest_prob        REAL DEFAULT 0,
      healthy_prob     REAL DEFAULT 0,
      recommendation   TEXT,
      timestamp        TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);
  console.log("Database ready with Authentication");
  return db;
};

export const registerUser = async (name, username, password) => {
  if (!db) await initDatabase();
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const result = await db.runAsync(
      "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
      [name, username, hashedPassword] 
    );
    return { success: true, userId: result.lastInsertRowId };
  } catch (error) {
    return { success: false, error: "Username already exists or is invalid." };
  }
};

export const loginUser = async (username, password) => {
  if (!db) await initDatabase();
  const user = await db.getFirstAsync("SELECT * FROM users WHERE username = ?", [username]);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    return { success: true, user: { id: user.id, name: user.name, email: user.username } };
  }
  return { success: false, error: "Invalid username or password" };
};

export const saveScan = async (scanData, userId) => {
  if (!db) await initDatabase();
  const {
    image_uri, predicted_class, display_name,
    confidence, is_uncertain, all_probabilities, recommendation,
  } = scanData;
  const timestamp    = new Date().toISOString();
  const droughtProb  = all_probabilities?.["ClassA-Drought"] ?? 0;
  const pestProb     = all_probabilities?.["ClassB-PestInfestation"] ?? 0;
  const healthyProb  = all_probabilities?.["ClassC-Healthy"] ?? 0;
  
  const result = await db.runAsync(
    `INSERT INTO scan_history
      (user_id, image_uri, label, display_name, confidence, is_uncertain,
       drought_prob, pest_prob, healthy_prob, recommendation, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, image_uri ?? null, predicted_class, display_name, confidence,
     is_uncertain ? 1 : 0, droughtProb, pestProb, healthyProb,
     recommendation ?? "", timestamp]
  );
  return result.lastInsertRowId;
};

export const getAllScans = async (userId) => {
  if (!db) await initDatabase();
  const rows = await db.getAllAsync(
    "SELECT * FROM scan_history WHERE user_id = ? ORDER BY id DESC", 
    [userId]
  );
  
  return rows.map((row) => ({
    ...row,
    is_uncertain: row.is_uncertain === 1,
    all_probabilities: {
      "ClassA-Drought"         : row.drought_prob,
      "ClassB-PestInfestation" : row.pest_prob,
      "ClassC-Healthy"         : row.healthy_prob,
    },
  }));
};

export const deleteScan = async (id, userId) => {
  if (!db) await initDatabase();
  await db.runAsync("DELETE FROM scan_history WHERE id = ? AND user_id = ?", [id, userId]);
};

export const clearAllScans = async (userId) => {
  if (!db) await initDatabase();
  await db.runAsync("DELETE FROM scan_history WHERE user_id = ?", [userId]);
};

export const getScanStats = async (userId) => {
  if (!db) await initDatabase();
  const total   = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE user_id = ?", [userId]);
  const drought = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'Drought' AND user_id = ?", [userId]);
  const pest    = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'PestInfestation' AND user_id = ?", [userId]);
  const healthy = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'Healthy' AND user_id = ?", [userId]);
  
  return {
    total  : total?.count   ?? 0,
    drought: drought?.count ?? 0,
    pest   : pest?.count    ?? 0,
    healthy: healthy?.count ?? 0,
  };
};


export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  if (!db) await initDatabase();
  
  // 1. Fetch the user to verify their current password
  const user = await db.getFirstAsync("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) return { success: false, error: "User not found." };

  // 2. Compare current password using bcrypt
  const isMatch = bcrypt.compareSync(currentPassword, user.password);
  if (!isMatch) return { success: false, error: "Current password is incorrect." };

  // 3. Hash the NEW password
  const salt = bcrypt.genSaltSync(10);
  const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

  // 4. Update the database
  await db.runAsync(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedNewPassword, userId]
  );
  return { success: true };
};

export const deleteUserAccount = async (userId) => {
  if (!db) await initDatabase();
  
  // 1. Delete all of their history first (to clean up the device storage)
  await db.runAsync("DELETE FROM scan_history WHERE user_id = ?", [userId]);
  
  // 2. Delete the user account
  await db.runAsync("DELETE FROM users WHERE id = ?", [userId]);
  return { success: true };
};