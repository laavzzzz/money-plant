/**
 * @file src/components/dashboard/SafeToSpendCard.tsx
 * @module Components/Dashboard/SafeToSpendCard
 * @description Enterprise financial safety metric card component. Calculates and displays
 * the recommended safe spending allowance based on remaining income with animated state transitions.
 * 
 * @version 4.0.0
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

export type SafeToSpendCardProps = {
  readonly income: number;
  readonly expense: number;
};

// ============================================================================
// LOGIC FUNCTION
// ============================================================================

function calculateSafeToSpend(income: number, expense: number): number {
  const safeIncome = Number(income) || 0;
  const safeExpense = Number(expense) || 0;
  const remaining = safeIncome - safeExpense;
  return Math.max(0, remaining * 0.3);
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function SafeToSpendCard({
  income,
  expense,
}: SafeToSpendCardProps): React.ReactElement {
  const safeAmount = useMemo(() => calculateSafeToSpend(income, expense), [income, expense]);
  const isHealthy = safeAmount > 0;

  return (
    <GlassCard className="relative overflow-hidden">
      {/* 🌟 Glow */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-green-100 to-transparent dark:from-green-950/30 opacity-40 blur-xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10">
        {/* 🏷 Label */}
        <p className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
          Safe to Spend
        </p>

        {/* 💰 Amount (Animated) */}
        <motion.h2
          key={safeAmount}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${
            isHealthy ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}
        >
          {formatCurrency(safeAmount)}
        </motion.h2>

        {/* 💬 STATUS */}
        <p className="text-xs mt-1 text-gray-400 dark:text-zinc-500 font-medium">
          {isHealthy
            ? "You're within a safe spending zone ✅"
            : "You've exceeded your safe spending ⚠️"}
        </p>
      </div>
    </GlassCard>
  );
}