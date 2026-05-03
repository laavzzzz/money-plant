"use client";

import { useMemo } from "react";
import { PLANT_LEVELS } from "@/constants/config";
import { Transaction } from "./useTransactions";

export function usePlant(transactions: Transaction[]) {
  
  // 💰 calculate totals
  const { income, expense, savings } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    });

    return {
      income,
      expense,
      savings: income - expense,
    };
  }, [transactions]);

  // 🌿 determine plant stage
  const plantStage = useMemo(() => {
    return PLANT_LEVELS
      .slice()
      .reverse()
      .find((level) => savings >= level.min);
  }, [savings]);

  // 📈 growth %
  const growth = Math.min((savings / 10000) * 100, 100);

  return {
    income,
    expense,
    savings,
    growth,
    plantStage,
  };
}