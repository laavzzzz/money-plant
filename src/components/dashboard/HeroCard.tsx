"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

/* 🧠 TYPES */
type HeroCardProps = {
  savings: number;
  income: number;
  expense: number;
};

/* 🎨 HELPER: STATUS */
function getStatus(savings: number) {
  if (savings > 5000) {
    return {
      text: "📈 You're building real wealth",
      color: "text-green-600",
      glow: "from-green-200/40 to-emerald-100/30",
    };
  }

  if (savings >= 0) {
    return {
      text: "🙂 You're managing well",
      color: "text-yellow-600",
      glow: "from-yellow-200/40 to-orange-100/30",
    };
  }

  return {
    text: "⚠️ Spending exceeded income",
    color: "text-red-500",
    glow: "from-red-200/40 to-orange-100/30",
  };
}

/* 🎨 COMPONENT */
export default function HeroCard({
  savings,
  income,
  expense,
}: HeroCardProps) {
  const status = getStatus(savings);

  return (
    <GlassCard
      className="relative overflow-hidden"
      elevation="lg"
    >
      {/* 🌟 DYNAMIC GLOW */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${status.glow} blur-2xl opacity-50`}
      />

      {/* ✨ LIGHT OVERLAY */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

      <div className="relative z-10">
        {/* 💬 HEADER */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 tracking-wide">
            Total Balance
          </p>

          {/* subtle badge */}
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/40 backdrop-blur text-gray-600">
            Monthly
          </span>
        </div>

        {/* 💰 MAIN VALUE */}
        <motion.h1
          key={savings}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-4xl font-black mt-2 tracking-tight"
        >
          {formatCurrency(savings)}
        </motion.h1>

        {/* 📊 STATS ROW */}
        <div className="flex justify-between mt-5 text-sm font-medium">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">
              Income
            </span>
            <span className="text-green-600">
              + {formatCurrency(income)}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-gray-400 text-xs">
              Expense
            </span>
            <span className="text-red-500">
              - {formatCurrency(expense)}
            </span>
          </div>
        </div>

        {/* 📈 STATUS */}
        <motion.div
          key={status.text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-xs font-medium ${status.color}`}
        >
          {status.text}
        </motion.div>
      </div>
    </GlassCard>
  );
}