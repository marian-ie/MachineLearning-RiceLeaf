// 1. Define the base light colors (your original colors)
const lightColors = {
  appBg        : "#F2F2F2",
  pageBg       : "#F2F2F2",
  cardBg       : "#FFFFFF", // Changed from #E0F5EC for better contrast
  cardBgDark   : "#C8EDD9",
  white        : "#FFFFFF",
  primary      : "#1B6B3A",
  primaryDark  : "#145229",
  primaryLight : "#2E8B57",
  accent       : "#3DAB6E",
  text         : "#1A1A1A",
  textLight    : "#6B6B6B",
  textMuted    : "#9E9E9E",
  textGreen    : "#1B6B3A",
  border       : "#B2DFC5",
  borderLight  : "#D4EFE0",
  drought      : "#E65100",
  droughtBg    : "#FFF3E0",
  droughtBorder: "#FF9800",
  pest         : "#B71C1C",
  pestBg       : "#FCE4EC",
  pestBorder   : "#F44336",
  healthy      : "#1B6B3A",
  healthyBg    : "#E0F5EC",
  healthyBorder: "#2E8B57",
  modalOverlay : "rgba(0,0,0,0.45)",
};

// 2. Define the dark mode counterparts
const darkColors = {
  appBg        : "#121212",
  pageBg       : "#121212",
  cardBg       : "#1E1E1E",
  cardBgDark   : "#2A2A2A",
  white        : "#1E1E1E", // In dark mode, "white" areas usually become dark gray
  primary      : "#3DAB6E", // Brighter green for better visibility on dark bg
  primaryDark  : "#2E8B57",
  primaryLight : "#1B6B3A",
  accent       : "#4ade80",
  text         : "#E0E0E0", // Light text for dark backgrounds
  textLight    : "#A0A0A0",
  textMuted    : "#6B6B6B",
  textGreen    : "#3DAB6E",
  border       : "#333333",
  borderLight  : "#2A2A2A",
  drought      : "#FFB74D",
  droughtBg    : "#4E342E", // Darker brown/orange background
  droughtBorder: "#F57C00",
  pest         : "#EF5350",
  pestBg       : "#4A148C", // Darker red/purple background
  pestBorder   : "#D32F2F",
  healthy      : "#4ade80",
  healthyBg    : "#145229", // Darker green background
  healthyBorder: "#2E8B57",
  modalOverlay : "rgba(0,0,0,0.75)",
};

// 3. Create a function to get the correct colors
export const getColors = (isDark) => isDark ? darkColors : lightColors;

// Keep these exports as they are, but we'll update how screens access them
export const CLASS_COLORS = (isDark) => {
  const c = getColors(isDark);
  return {
    Drought        : { bg: c.droughtBg, text: c.drought, border: c.droughtBorder },
    PestInfestation: { bg: c.pestBg, text: c.pest, border: c.pestBorder },
    Healthy        : { bg: c.healthyBg, text: c.healthy, border: c.healthyBorder },
  };
};

export const CLASS_FA_ICONS = {
  Drought        : "sun",
  PestInfestation: "bug",
  Healthy        : "leaf",
};

// Update STRESS_DATA to be a function so it can adopt the correct colors
export const getStressData = (isDark) => {
  const c = getColors(isDark);
  return {
    Drought: {
      title      : "Drought Stress",
      icon       : "sun",
      color      : c.drought,
      bg         : c.droughtBg,
      border     : c.droughtBorder,
      // ... keep description, symptoms, recommendations, treatments, severity exact same
    },
    PestInfestation: {
      title      : "Pest Infestation",
      icon       : "bug",
      color      : c.pest,
      bg         : c.pestBg,
      border     : c.pestBorder,
      // ... keep description, symptoms, recommendations, treatments, severity exact same
    },
    Healthy: {
      title      : "Healthy Plant",
      icon       : "leaf",
      color      : c.healthy,
      bg         : c.healthyBg,
      border     : c.healthyBorder,
      // ... keep description, symptoms, recommendations, treatments, severity exact same
    },
  };
};