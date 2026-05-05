"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

/* 🧠 TYPES */
type Props = {
  income: number;
  expense: number;
};

/* 💸 LOGIC FUNCTION */
function calculateSafeToSpend(income: number, expense: number) {
  // 💡 Rule: user can safely spend 30% of remaining income
  const remaining = income - expense;
  return Math.max(0, remaining * 0.3);
}

/* 🎨 COMPONENT */
export default function SafeToSpendCard({
  income,
  expense,
}: Props) {
  const safeAmount = calculateSafeToSpend(income, expense);

  const isHealthy = safeAmount > 0;

  return (
    <GlassCard className="relative overflow-hidden">
      {/* 🌟 Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-transparent opacity-40 blur-xl" />

      <div className="relative z-10">
        {/* 🏷 Label */}
        <p className="text-gray-500 text-sm">
          Safe to Spend
        </p>

        {/* 💰 Amount (Animated) */}
        <motion.h2
          key={safeAmount}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-3xl font-bold mt-1 ${
            isHealthy ? "text-green-600" : "text-red-500"
          }`}
        >
          {formatCurrency(safeAmount)}
        </motion.h2>

        {/* 💬 STATUS */}
        <p className="text-xs mt-1 text-gray-400">
          {isHealthy
            ? "You're within a safe spending zone ✅"
            : "You've exceeded your safe spending ⚠️"}
        </p>
      </div>
    </GlassCard>
  );
}