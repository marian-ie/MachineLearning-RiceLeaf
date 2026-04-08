// ⚠️ CHANGE THIS to your computer's local IP address
// Open cmd → type ipconfig → look for IPv4 Address
// Example: 192.168.1.5  (NOT localhost or 127.0.0.1)
const API_BASE_URL = "https://marian522-ricestressclassification.hf.space";

export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method : "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const predictImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri : imageUri,
      name: "rice_leaf.jpg",
      type: "image/jpeg",
    });
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body  : formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};