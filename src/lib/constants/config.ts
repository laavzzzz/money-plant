/* 🌿 APP CONFIG */

export const APP_CONFIG = {
  appName: "MoneyPlant 🌿",
  currency: "INR",
  currencySymbol: "₹",
};

/* 🌱 PLANT GROWTH LEVELS */

export const PLANT_LEVELS = [
  { level: 1, name: "Seed 🌱", min: 0 },
  { level: 2, name: "Sprout 🌿", min: 500 },
  { level: 3, name: "Plant 🌱", min: 2000 },
  { level: 4, name: "Tree 🌳", min: 5000 },
  { level: 5, name: "Bloom 🌸", min: 10000 },
];

/* 🔥 STREAK CONFIG */

export const STREAK_CONFIG = {
  maxStreak: 365,
  breakAfterDays: 1, // if no activity
};

/* 💸 SPENDING LIMIT RULE */

export const SAFE_SPEND_PERCENTAGE = 0.3; 
// 30% of income safe to spend

/* 🤖 AI CONFIG */

export const AI_CONFIG = {
  tone: "genz",
  roastLevel: "medium",
};