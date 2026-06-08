/* 🌿 APP CONFIG */

export const APP_CONFIG = {
  appName: "MoneyPlant 🌿",
  currency: "INR",
  currencySymbol: "₹",
};

/* 🌱 PLANT GROWTH LEVELS */

export const PLANT_LEVELS = [
  { level: 1, name: "Seed 🌱", min: 0 },
  { level: 2, name: "Sprout 🌿", min: 5 },
  { level: 3, name: "Leaf 🍃", min: 15 },
  { level: 4, name: "Plant 🌱", min: 30 },
  { level: 5, name: "Tree 🌳", min: 50 },
  { level: 6, name: "Bloom 🌸", min: 75 },
  { level: 7, name: "Fruit 🍉", min: 95 },
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