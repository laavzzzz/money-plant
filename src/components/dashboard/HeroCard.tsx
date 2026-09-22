/**
 * @file src/components/dashboard/HeroCard.tsx
 * @module Components/Dashboard/HeroCard
 * @description Enterprise financial overview summary card component displaying total balance,
 * monthly income, expenses, and dynamic wealth status badges with smooth Framer Motion animations.
 * 
 * @version 3.1.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface HeroCardProps {
  readonly savings: number;
  readonly income: number;
  readonly expense: number;
}

interface WealthStatus {
  readonly text: string;
  readonly color: string;
  readonly glow: string;
}

// ============================================================================
// HELPER FUNCTION: STATUS CALCULATOR
// ============================================================================

function getStatus(savings: number): WealthStatus {
  if (savings > 5000) {
    return {
      text: "📈 You're building real wealth",
      color: "text-green-600 dark:text-green-400",
      glow: "from-green-200/40 to-emerald-100/30 dark:from-green-900/20 dark:to-emerald-950/10",
    };
  }

  if (savings >= 0) {
    return {
      text: "🙂 You're managing well",
      color: "text-yellow-600 dark:text-yellow-400",
      glow: "from-yellow-200/40 to-orange-100/30 dark:from-yellow-900/20 dark:to-orange-950/10",
    };
  }

  return {
    text: "⚠️ Spending exceeded income",
    color: "text-red-500 dark:text-red-400",
    glow: "from-red-200/40 to-orange-100/30 dark:from-red-900/20 dark:to-orange-950/10",
  };
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function HeroCard({
  savings,
  income,
  expense,
}: HeroCardProps): React.ReactElement {
  const safeSavings = Number(savings) || 0;
  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;

  const status = useMemo(() => getStatus(safeSavings), [safeSavings]);

  return (
    <GlassCard
      className="relative overflow-hidden"
      elevation="lg"
    >
      {/* 🌟 DYNAMIC GLOW */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${status.glow} blur-2xl opacity-50 pointer-events-none`}
        aria-hidden="true"
      />

      {/* ✨ LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[2px] pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        {/* 💬 HEADER */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-zinc-400 tracking-wide font-bold uppercase">
            Total Balance
          </p>

          {/* subtle badge */}
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur text-gray-600 dark:text-zinc-300 font-extrabold uppercase tracking-wider">
            Monthly
          </span>
        </div>

        {/* 💰 MAIN VALUE */}
        <motion.h1
          key={safeSavings}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-3xl sm:text-4xl font-black mt-2 tracking-tight text-text-main"
        >
          {formatCurrency(safeSavings)}
        </motion.h1>

        {/* 📊 STATS ROW */}
        <div className="flex justify-between mt-5 text-sm font-medium">
          <div className="flex flex-col">
            <span className="text-gray-400 dark:text-zinc-500 text-xs font-bold uppercase">
              Income
            </span>
            <span className="text-green-600 dark:text-green-400 font-black">
              + {formatCurrency(safeIncome)}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-gray-400 dark:text-zinc-500 text-xs font-bold uppercase">
              Expense
            </span>
            <span className="text-red-500 dark:text-red-400 font-black">
              - {formatCurrency(safeExpense)}
            </span>
          </div>
        </div>

        {/* 📈 STATUS */}
        <motion.div
          key={status.text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-xs font-black uppercase tracking-wider ${status.color}`}
        >
          {status.text}
        </motion.div>
      </div>
    </GlassCard>
  );
}