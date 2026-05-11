export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
}

/* 🎮 STREAK REWARDS */
export const STREAK_REWARDS: Reward[] = [
  {
    id: "3_days",
    title: "Starter Bloom 🌱",
    description: "3 day streak achieved!",
    icon: "🌱",
    requirement: 3,
  },
  {
    id: "7_days",
    title: "Growing Strong 🌿",
    description: "7 day consistency 🔥",
    icon: "🌿",
    requirement: 7,
  },
  {
    id: "30_days",
    title: "Money Tree 🌳",
    description: "30 day discipline beast",
    icon: "🌳",
    requirement: 30,
  },
];

/* 🏆 BADGES */
export const BADGES = [
  {
    id: "first_save",
    label: "First Save 💰",
  },
  {
    id: "budget_master",
    label: "Budget Master 📊",
  },
  {
    id: "no_spend_7",
    label: "No Spend 7 Days 🚫",
  },
];