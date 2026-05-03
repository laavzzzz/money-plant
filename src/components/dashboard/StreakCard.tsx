"use client";

import { motion } from "framer-motion";

export default function StreakCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-orange-100 rounded-3xl p-4 flex justify-between items-center shadow-md"
    >
      <div>
        <p className="text-sm text-gray-600">Current Streak</p>
        <p className="text-lg font-bold text-orange-600">
          🔥 7 Days
        </p>
      </div>

      <div className="text-2xl">🔥</div>
    </motion.div>
  );
}