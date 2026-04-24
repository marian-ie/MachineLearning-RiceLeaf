// 1. Define the base light colors (your original colors)
const lightColors = {
  appBg        : "#F2F2F2",
  pageBg       : "#F2F2F2",
  cardBg       : "#FFFFFF", 
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
  white        : "#1E1E1E", 
  primary      : "#3DAB6E", 
  primaryDark  : "#2E8B57",
  primaryLight : "#1B6B3A",
  accent       : "#4ade80",
  text         : "#E0E0E0", 
  textLight    : "#A0A0A0",
  textMuted    : "#6B6B6B",
  textGreen    : "#3DAB6E",
  border       : "#333333",
  borderLight  : "#2A2A2A",
  drought      : "#FFB74D",
  droughtBg    : "#4E342E", 
  droughtBorder: "#F57C00",
  pest         : "#EF5350",
  pestBg       : "#4A148C", 
  pestBorder   : "#D32F2F",
  healthy      : "#4ade80",
  healthyBg    : "#145229", 
  healthyBorder: "#2E8B57",
  modalOverlay : "rgba(0,0,0,0.75)",
};

// 3. Create a function to get the correct colors
export const getColors = (isDark) => isDark ? darkColors : lightColors;

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

// 4. Fully written out STRESS_DATA so nothing is undefined!
export const getStressData = (isDark) => {
  const c = getColors(isDark);
  return {
    Drought: {
      title      : "Drought Stress",
      icon       : "sun",
      color      : c.drought,
      bg         : c.droughtBg,
      border     : c.droughtBorder,
      description: "Drought stress occurs when rice plants do not receive sufficient water. It causes wilting, browning of leaf tips, and reduced growth.",
      symptoms   : [
        "Brown or yellowish leaf tips",
        "Wilting and drooping leaves",
        "Dry, crispy leaf edges",
        "Stunted plant growth",
        "Rolling of leaves inward",
      ],
      recommendations: [
        "Increase irrigation frequency immediately",
        "Check and repair irrigation system",
        "Apply mulching to retain soil moisture",
        "Monitor soil moisture levels daily",
        "Avoid fertilizing during drought stress",
      ],
      treatments: [
        "Flood irrigation if available",
        "Install drip irrigation system",
        "Apply anti-transpirant spray",
        "Use drought-tolerant rice varieties for next planting",
        "Consult local agricultural extension for water management",
      ],
      severity: "Moderate to Severe",
    },
    PestInfestation: {
      title      : "Pest Infestation",
      icon       : "bug",
      color      : c.pest,
      bg         : c.pestBg,
      border     : c.pestBorder,
      description: "Pest infestation occurs when insects attack rice plants, causing physical damage to leaves, stems, and grains. Common pests include stem borers, leafhoppers, and leafrollers.",
      symptoms   : [
        "Irregular holes in leaves",
        "Rolled or folded leaves",
        "White or silvery streaks on leaves",
        "Dead hearts (wilted central shoot)",
        "Visible insects, eggs, or larvae",
        "Brown discoloration from feeding damage",
      ],
      recommendations: [
        "Inspect plants closely for insects and eggs",
        "Apply appropriate pesticide immediately",
        "Monitor surrounding plants for spread",
        "Remove and destroy heavily infested plants",
        "Set up light traps for night-flying insects",
      ],
      treatments: [
        "Apply systemic insecticide (consult agronomist for type)",
        "Use biological control agents (Trichogramma wasps)",
        "Apply neem-based organic pesticide",
        "Drain field temporarily to expose soil-dwelling pests",
        "Consult local agronomist for pesticide recommendation",
      ],
      severity: "Moderate to Severe",
    },
    Healthy: {
      title      : "Healthy Plant",
      icon       : "leaf",
      color      : c.healthy,
      bg         : c.healthyBg,
      border     : c.healthyBorder,
      description: "Your rice plant appears healthy with no visible stress symptoms. Continue regular monitoring and maintenance to keep your plants in good condition.",
      symptoms   : [
        "Vibrant green leaf color",
        "No holes or physical damage",
        "Upright and firm plant structure",
        "Normal leaf texture and appearance",
      ],
      recommendations: [
        "Continue regular irrigation schedule",
        "Apply balanced fertilizer as scheduled",
        "Monitor weekly for early signs of stress",
        "Maintain proper plant spacing",
        "Keep field free of weeds",
      ],
      treatments: [
        "No treatment needed at this time",
        "Continue preventive pest management",
        "Maintain optimal water level in field",
        "Apply foliar nutrients if needed",
      ],
      severity: "None",
    },
  };
};