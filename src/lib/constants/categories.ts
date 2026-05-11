export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

/* 💰 EXPENSE CATEGORIES */
export const EXPENSE_CATEGORIES: Category[] = [
  { id: "food", name: "Food", type: "expense", icon: "🍔", color: "#f87171" },
  { id: "travel", name: "Travel", type: "expense", icon: "🚗", color: "#60a5fa" },
  { id: "shopping", name: "Shopping", type: "expense", icon: "🛍️", color: "#facc15" },
  { id: "bills", name: "Bills", type: "expense", icon: "💡", color: "#fb923c" },
  { id: "health", name: "Health", type: "expense", icon: "💊", color: "#34d399" },
  { id: "entertainment", name: "Entertainment", type: "expense", icon: "🎮", color: "#a78bfa" },
];

/* 💧 INCOME CATEGORIES */
export const INCOME_CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", type: "income", icon: "💼", color: "#22c55e" },
  { id: "freelance", name: "Freelance", type: "income", icon: "💻", color: "#38bdf8" },
  { id: "gift", name: "Gift", type: "income", icon: "🎁", color: "#f472b6" },
  { id: "investment", name: "Investment", type: "income", icon: "📈", color: "#4ade80" },
];

/* 🔄 ALL */
export const ALL_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
];