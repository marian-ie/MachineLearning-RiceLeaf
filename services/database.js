import * as SQLite from "expo-sqlite";

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync("rice_history.db");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS scan_history (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      image_uri        TEXT,
      label            TEXT NOT NULL,
      display_name     TEXT NOT NULL,
      confidence       REAL NOT NULL,
      is_uncertain     INTEGER DEFAULT 0,
      drought_prob     REAL DEFAULT 0,
      pest_prob        REAL DEFAULT 0,
      healthy_prob     REAL DEFAULT 0,
      recommendation   TEXT,
      timestamp        TEXT NOT NULL
    );
  `);
  console.log("✅ Database ready");
  return db;
};

export const saveScan = async (scanData) => {
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
      (image_uri, label, display_name, confidence, is_uncertain,
       drought_prob, pest_prob, healthy_prob, recommendation, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [image_uri ?? null, predicted_class, display_name, confidence,
     is_uncertain ? 1 : 0, droughtProb, pestProb, healthyProb,
     recommendation ?? "", timestamp]
  );
  return result.lastInsertRowId;
};

export const getAllScans = async () => {
  if (!db) await initDatabase();
  const rows = await db.getAllAsync("SELECT * FROM scan_history ORDER BY id DESC");
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

export const deleteScan = async (id) => {
  if (!db) await initDatabase();
  await db.runAsync("DELETE FROM scan_history WHERE id = ?", [id]);
};

export const clearAllScans = async () => {
  if (!db) await initDatabase();
  await db.runAsync("DELETE FROM scan_history");
};

export const getScanStats = async () => {
  if (!db) await initDatabase();
  const total   = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history");
  const drought = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'Drought'");
  const pest    = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'PestInfestation'");
  const healthy = await db.getFirstAsync("SELECT COUNT(*) as count FROM scan_history WHERE display_name = 'Healthy'");
  return {
    total  : total?.count   ?? 0,
    drought: drought?.count ?? 0,
    pest   : pest?.count    ?? 0,
    healthy: healthy?.count ?? 0,
  };
};