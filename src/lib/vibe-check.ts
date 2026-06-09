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
  { path: "/dashboard", label: "Dashboard", description: "Overview, plant, savings, charts, and quick actions" },
  { path: "/dashboard/accounts", label: "Accounts", description: "Linked accounts and account-level finance summary" },
  { path: "/dashboard/transactions", label: "Transactions", description: "View and add income or expense transactions" },
  { path: "/dashboard/analytics", label: "Analytics", description: "Spending breakdown, category trends, and insights" },
  { path: "/dashboard/goals", label: "Goals", description: "Savings goals, progress, and priorities" },
  { path: "/dashboard/garden", label: "Garden", description: "Plant growth, streaks, and achievements" },
  { path: "/dashboard/wishlist", label: "Dream Vault", description: "Wishlist items, saving targets, and purchase planning" },
  { path: "/dashboard/leaderboard", label: "Leaderboard", description: "Leaderboard, aura points, and rankings" },
  { path: "/dashboard/profile", label: "Profile", description: "Profile stats, settings, and linked account details" },
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
