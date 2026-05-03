"use client";

import { motion } from "framer-motion";

export default function PlantSection() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex justify-center my-4"
      >
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-4xl">
          🌱
        </div>
      </motion.div>

      <div className="flex justify-between text-sm text-gray-600">
        <p>Water: ₹12,450</p>
        <p>Saved: ₹8,250</p>
      </div>

      <div className="mt-2 text-green-600 font-semibold">
        🌿 Growth: 68%
      </div>

      <div className="text-orange-500 text-sm mt-1">
        🔥 Streak: 7 days
      </div>
    </div>
  );
}