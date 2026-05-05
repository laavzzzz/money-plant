"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

/* 🧠 TYPES */
type User = {
  _id?: string;
  name?: string;
  score: number;
  savings?: number;
};

/* 🏆 HELPER: MEDAL + COLOR */
function getRankStyle(index: number) {
  if (index === 0)
    return {
      medal: "🥇",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    };

  if (index === 1)
    return {
      medal: "🥈",
      bg: "bg-gray-100",
      text: "text-gray-700",
    };

  if (index === 2)
    return {
      medal: "🥉",
      bg: "bg-orange-100",
      text: "text-orange-700",
    };

  return {
    medal: `#${index + 1}`,
    bg: "bg-white",
    text: "text-gray-600",
  };
}

/* 🎨 COMPONENT */
export default function LeaderboardList({
  users = [],
  loading = false,
}: {
  users?: User[];
  loading?: boolean;
}) {
  return (
    <GlassCard className="space-y-4">
      {/* 🏆 HEADER */}
      <p className="text-sm text-gray-500">
        🏆 Leaderboard
      </p>

      {/* ⏳ LOADING */}
      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">
          Loading rankings...
        </p>
      )}

      {/* ❌ EMPTY */}
      {!loading && users.length === 0 && (
        <p className="text-sm text-gray-400">
          No rankings yet 👀
        </p>
      )}

      {/* 📊 LIST */}
      <div className="space-y-3">
        {users.map((user, index) => {
          const style = getRankStyle(index);

          return (
            <motion.div
              key={user._id || index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`flex justify-between items-center p-4 rounded-xl shadow-sm ${style.bg}`}
            >
              {/* 👤 NAME */}
              <span className="flex items-center gap-2 font-medium">
                <span>{style.medal}</span>
                {user.name || `User ${index + 1}`}
              </span>

              {/* 💰 SCORE */}
              <span className={`font-semibold ${style.text}`}>
                ₹{user.score.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}