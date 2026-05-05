"use client";

import { useMemo } from "react";
import { PLANT_LEVELS } from "@/constants/config";
import { Transaction } from "./useTransactions";

/* 🧠 CONFIG */
const MAX_SAVINGS = 10000; // can later move to config.ts

export function usePlant(transactions: Transaction[]) {
  /* 💰 CALCULATIONS */
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

    const savings = income - expense;

    return { income, expense, savings };
  }, [transactions]);

  /* 🌿 CURRENT STAGE */
  const plantStage = useMemo(() => {
    return (
      PLANT_LEVELS
        .slice()
        .reverse()
        .find((level) => savings >= level.min) || PLANT_LEVELS[0]
    );
  }, [savings]);

  /* 📈 NEXT STAGE */
  const nextStage = useMemo(() => {
    return PLANT_LEVELS.find(
      (level) => level.min > (plantStage?.min || 0)
    );
  }, [plantStage]);

  /* 📊 GROWTH % */
  const growth = useMemo(() => {
    const safeSavings = Math.max(0, savings); // prevent negative UI

    return Math.min((safeSavings / MAX_SAVINGS) * 100, 100);
  }, [savings]);

  /* 🎯 PROGRESS TO NEXT LEVEL */
  const progressToNext = useMemo(() => {
    if (!nextStage) return 100;

    const prevMin = plantStage?.min || 0;
    const range = nextStage.min - prevMin;

    if (range <= 0) return 100;

    return Math.min(
      ((savings - prevMin) / range) * 100,
      100
    );
  }, [savings, plantStage, nextStage]);

  /* 🌸 STATUS MESSAGE (UI READY) */
  const status = useMemo(() => {
    if (savings < 0) return "Your plant is struggling 🥀";
    if (savings < 1000) return "Seed stage 🌱";
    if (savings < 5000) return "Growing nicely 🌿";
    if (savings < 10000) return "Almost a tree 🌳";
    return "Blooming beautifully 🌸";
  }, [savings]);

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