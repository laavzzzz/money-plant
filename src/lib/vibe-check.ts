import type { Transaction } from "@/hooks/useTransactions";

export const DEMO_PROFILE = {
  name: "Ananya Sharma",
  level: "Level 12 Financial Sage",
  email: "ananya@moneyplant.dev",
  phone: "+91 98765 43210",
  aura: 12450,
  globalRank: 42,
  tagline: "Grinding for that Sprout Stage 2",
};

export const APP_ROUTES = [
  { path: "/dashboard", label: "Home", description: "Overview, plant, savings, charts, quick actions" },
  { path: "/transactions", label: "Transactions", description: "View and add income/expense transactions" },
  { path: "/garden", label: "Garden", description: "Plant growth, water plant, achievements" },
  { path: "/wishlist", label: "Wishlist", description: "Monthly wishlist items, savings targets, Gen-Z goals" },
  { path: "/leaderboard", label: "Ranks", description: "Leaderboard and aura rankings" },
  { path: "/profile", label: "Profile", description: "Character sheet, settings, linked accounts" },
  { path: "/analytics", label: "Analytics", description: "Spending breakdown and trends" },
] as const;

export type FinanceSnapshot = {
  pathname: string;
  profile: typeof DEMO_PROFILE;
  income: number;
  expense: number;
  savings: number;
  safeToSpend: number;
  plantStage: { name: string; level?: number };
  plantStatus: string;
  streak: number;
  categoryTotals: Record<string, number>;
  recentTransactions: Array<{
    title: string;
    amount: number;
    category: string;
    type: string;
    date?: string;
  }>;
  transactionCount: number;
};

export function buildCategoryTotals(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    totals[tx.category] = (totals[tx.category] || 0) + (tx.amount || 0);
  }
  return totals;
}

export function buildFinanceSnapshot(
  transactions: Transaction[],
  pathname: string,
  streak: number,
  income: number,
  expense: number,
  savings: number,
  plantStage: { name: string; level?: number },
  plantStatus: string
): FinanceSnapshot {
  const categoryTotals = buildCategoryTotals(transactions);
  const safeToSpend = Math.max(0, income - expense);

  return {
    pathname,
    profile: DEMO_PROFILE,
    income,
    expense,
    savings,
    safeToSpend,
    plantStage,
    plantStatus,
    streak,
    categoryTotals,
    recentTransactions: transactions.slice(0, 12).map((tx) => ({
      title: tx.title,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      date: tx.date,
    })),
    transactionCount: transactions.length,
  };
}

export function formatSnapshotForPrompt(snapshot: FinanceSnapshot): string {
  const categories = Object.entries(snapshot.categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `${cat}: ₹${amt}`)
    .join(", ");

  const recent = snapshot.recentTransactions.length
    ? snapshot.recentTransactions
        .map(
          (tx) =>
            `- ${tx.type === "income" ? "+" : "-"}₹${tx.amount} ${tx.title} (${tx.category})`
        )
        .join("\n")
    : "No transactions logged yet.";

  const routes = APP_ROUTES.map(
    (r) => `- ${r.label} → ${r.path}: ${r.description}`
  ).join("\n");

  const currentRoute =
    APP_ROUTES.find((r) => r.path === snapshot.pathname)?.label ?? snapshot.pathname;

  return `
USER PROFILE:
- Name: ${snapshot.profile.name}
- Level: ${snapshot.profile.level}
- Email: ${snapshot.profile.email}
- Phone: ${snapshot.profile.phone}
- Aura points: ${snapshot.profile.aura}
- Global rank: #${snapshot.profile.globalRank}
- Bio: ${snapshot.profile.tagline}

CURRENT PAGE: ${currentRoute} (${snapshot.pathname})

FINANCES:
- Total income (logged): ₹${snapshot.income}
- Total expenses (logged): ₹${snapshot.expense}
- Net savings: ₹${snapshot.savings}
- Safe to spend (income − expenses): ₹${snapshot.safeToSpend}
- Spending streak: ${snapshot.streak} days
- Plant stage: ${snapshot.plantStage.name}
- Plant status: ${snapshot.plantStatus}
- Transaction count: ${snapshot.transactionCount}

SPENDING BY CATEGORY: ${categories || "None yet"}

RECENT TRANSACTIONS:
${recent}

APP NAVIGATION (suggest these paths when helping users move around):
${routes}
`.trim();
}
