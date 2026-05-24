"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

/* 🧠 TYPES */
type Props = {
  streak?: number;
};

/* 🔥 HELPER: MESSAGE BASED ON STREAK */
function getMessage(streak: number) {
  if (streak === 0) return "Start your streak today 🌱";
  if (streak < 3) return "Good start, keep going!";
  if (streak < 7) return "You're building momentum 🚀";
  if (streak < 14) return "Impressive consistency 🔥";
  return "Unstoppable discipline 💪";
}

/* 🔥 HELPER: FIRE SIZE */
function getFireSize(streak: number) {
  if (streak < 3) return "text-xl";
  if (streak < 7) return "text-2xl";
  if (streak < 14) return "text-3xl";
  return "text-4xl";
}

/* 🎨 COMPONENT */
export default function StreakCard({ streak = 0 }: Props) {
  const safeStreak = Math.max(0, streak);
  const message = getMessage(safeStreak);
  const fireSize = getFireSize(safeStreak);

  return (
    <GlassCard className="relative overflow-hidden">
      
      {/* 🌟 MULTI-LAYER GLOW */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 via-yellow-100/40 to-transparent blur-2xl opacity-60" />
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-orange-200 rounded-full blur-3xl opacity-30" />

      <motion.div
        whileHover={{ x: 5 }}
        className="relative z-10 flex justify-between items-center"
      >
        {/* 📊 TEXT */}
        <div>
          <p className="text-sm text-gray-600">
            Current Streak
          </p>

          {/* 🔢 STREAK COUNT */}
          <motion.p
            key={safeStreak}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-bold text-orange-600"
          >
            🔥 {safeStreak} Day{safeStreak !== 1 ? "s" : ""}
          </motion.p>

          {/* 💬 MESSAGE */}
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-gray-400 mt-1"
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
          className={`${fireSize}`}
        >
          🔥
        </motion.div>
      </motion.div>
    </GlassCard>
  );
}