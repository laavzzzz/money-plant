/**
 * @file src/components/dashboard/StreakCard.tsx
 * @module Components/Dashboard/StreakCard
 * @description Enterprise financial streak tracking card component. Displays current consecutive
 * user activity days with dynamic milestone messaging, animated fire indicators, and glassmorphic styling.
 * 
 * @version 4.0.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export type StreakCardProps = {
  readonly streak?: number;
};

// ============================================================================
// HELPERS
// ============================================================================

function getMessage(streak: number): string {
  if (streak === 0) return "Start your streak today 🌱";
  if (streak < 3) return "Good start, keep going!";
  if (streak < 7) return "You're building momentum 🚀";
  if (streak < 14) return "Impressive consistency 🔥";
  return "Unstoppable discipline 💪";
}

function getFireSize(streak: number): string {
  if (streak < 3) return "text-xl";
  if (streak < 7) return "text-2xl";
  if (streak < 14) return "text-3xl";
  return "text-4xl";
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function StreakCard({ streak = 0 }: StreakCardProps): React.ReactElement {
  const safeStreak = Math.max(0, Number(streak) || 0);
  const message = getMessage(safeStreak);
  const fireSize = getFireSize(safeStreak);

  return (
    <GlassCard className="relative overflow-hidden">
      
      {/* 🌟 MULTI-LAYER GLOW */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-orange-100/50 via-yellow-100/40 to-transparent dark:from-orange-950/20 dark:via-yellow-950/10 blur-2xl opacity-60 pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-30 pointer-events-none" 
        aria-hidden="true" 
      />

      <motion.div
        whileHover={{ x: 5 }}
        className="relative z-10 flex justify-between items-center"
      >
        {/* 📊 TEXT */}
        <div>
          <p className="text-xs text-gray-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Current Streak
          </p>

          {/* 🔢 STREAK COUNT */}
          <motion.p
            key={safeStreak}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-black text-orange-600 dark:text-orange-400 mt-0.5 tracking-tight"
          >
            🔥 {safeStreak} Day{safeStreak !== 1 ? "s" : ""}
          </motion.p>

          {/* 💬 MESSAGE */}
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-medium"
          >
            {message}
          </motion.p>
        </div>

        {/* 🔥 FIRE ICON */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: "easeInOut",
          }}
          className={`${fireSize} select-none`}
          aria-hidden="true"
        >
          🔥
        </motion.div>
      </motion.div>
    </GlassCard>
  );
}