import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

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
    const manipulatedImg = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], 
      { format: SaveFormat.JPEG, compress: 0.8 } 
    );

    const formData = new FormData();
    formData.append("image", {
      uri : manipulatedImg.uri, 
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

    if (data.is_uncertain) {
      return { 
        success: false, 
        error: "We couldn't clearly recognize a rice leaf in this photo. Please make sure the leaf is well-lit, in focus, and takes up most of the screen." 
      };
    }
    return { success: true, data };

  } catch (error) {
    let userFriendlyError = error.message;

    if (
      error.message.includes("Network request failed") || 
      error.message.includes("Failed to fetch") ||
      error.message.includes("Aborted")
    ) {
      userFriendlyError = "Unable to connect to the server. Please check your internet connection or try again later.";
    } 
   
    else if (error.message.includes("192.") || error.message.includes("http")) {
      userFriendlyError = "Connection error. The server might be temporarily unavailable.";
    }

    return { success: false, error: userFriendlyError };
    
  }
};