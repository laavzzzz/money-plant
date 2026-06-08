"use client";

import { useMemo } from "react";
import { PLANT_LEVELS } from "@/lib/constants/config";
import { Transaction } from "./useTransactions";

export function usePlant(transactions: Transaction[]) {
  const { income, expense, savings } = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (tx.type === "income") {
        income += tx.amount || 0;
      } else {
        expense += tx.amount || 0;
      }
    }

    return { income, expense, savings: income - expense };
  }, [transactions]);

  const growth = useMemo(() => {
    if (income <= 0) return 0;
    return Math.min(Math.max((Math.max(0, savings) / income) * 100, 0), 100);
  }, [income, savings]);

  const plantStage = useMemo(() => {
    return (
      PLANT_LEVELS.slice()
        .reverse()
        .find((level) => growth >= level.min) || PLANT_LEVELS[0]
    );
  }, [growth]);

  const nextStage = useMemo(
    () => PLANT_LEVELS.find((level) => level.min > growth),
    [growth]
  );

  const progressToNext = useMemo(() => {
    if (!nextStage) return 100;

    const prevMin = plantStage?.min || 0;
    const range = nextStage.min - prevMin;
    if (range <= 0) return 100;

    return Math.min(Math.max(((growth - prevMin) / range) * 100, 0), 100);
  }, [growth, plantStage, nextStage]);

  const status = useMemo(() => {
    if (income <= 0) return "No income logged yet — plant is waiting.";
    if (growth < 5) return "Seed mode: stash a lil cash.";
    if (growth < 15) return "Sprout unlocked — keep the drip.";
    if (growth < 30) return "Leaf life: you're actually saving.";
    if (growth < 50) return "Plant vibes: money energy growing.";
    if (growth < 75) return "Tree flex: strong saving season.";
    if (growth < 95) return "Bloom poppin' — almost legendary.";
    return "Fruit season: savings boss status.";
  }, [income, growth]);

  /* 📊 RETURN EVERYTHING */
  return {
    income,
    expense,
    savings,

    growth,            // overall %
    progressToNext,    // progress in current level

    plantStage,
    nextStage,

    status,
  };
}