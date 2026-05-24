"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTransactions } from "@/hooks/useTransactions";
import { usePlant } from "@/hooks/usePlant";
import { useStreak } from "@/hooks/useStreak";
import { buildFinanceSnapshot, type FinanceSnapshot } from "@/lib/vibe-check";

type FinanceContextValue = FinanceSnapshot & {
  loading: boolean;
  refreshTransactions: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { transactions, loading, refresh } = useTransactions();
  const { streak } = useStreak();
  const { income, expense, savings, plantStage, status } = usePlant(transactions);

  const snapshot = useMemo(
    () =>
      buildFinanceSnapshot(
        transactions,
        pathname,
        streak,
        income,
        expense,
        savings,
        plantStage ?? { name: "Seed", level: 1 },
        status
      ),
    [transactions, pathname, streak, income, expense, savings, plantStage, status]
  );

  const value = useMemo(
    () => ({
      ...snapshot,
      loading,
      refreshTransactions: refresh,
    }),
    [snapshot, loading, refresh]
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error("useFinanceContext must be used within FinanceProvider");
  }
  return ctx;
}
