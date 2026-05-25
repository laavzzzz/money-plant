"use client";

import React, { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTransactions } from "@/hooks/useTransactions";
import { usePlant } from "@/hooks/usePlant";
import { useStreak } from "@/hooks/useStreak";
import { buildFinanceSnapshot, type FinanceSnapshot } from "@/lib/vibe-check";
import type { Transaction } from "@/hooks/useTransactions";

type FinanceContextValue = FinanceSnapshot & {
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  adding: boolean;
  refreshTransactions: () => void;
  addTransaction: ReturnType<typeof useTransactions>["addTransaction"];
  deleteTransaction: ReturnType<typeof useTransactions>["deleteTransaction"];
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    transactions,
    loading,
    error,
    adding,
    addTransaction,
    deleteTransaction,
    refresh,
  } = useTransactions();
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
      error,
      transactions,
      adding,
      refreshTransactions: refresh,
      addTransaction,
      deleteTransaction,
    }),
    [snapshot, loading, error, transactions, adding, refresh, addTransaction, deleteTransaction]
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

/** Shared transaction state (same instance as finance context) */
export function useSharedTransactions() {
  const ctx = useFinanceContext();
  return {
    transactions: ctx.transactions,
    loading: ctx.loading,
    error: ctx.error,
    adding: ctx.adding,
    addTransaction: ctx.addTransaction,
    deleteTransaction: ctx.deleteTransaction,
    refresh: ctx.refreshTransactions,
  };
}
