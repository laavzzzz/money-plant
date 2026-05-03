"use client";

import { motion } from "framer-motion";

export default function PlantSection({
  growth = 60,
}: {
  growth?: number;
}) {
  const getPlant = () => {
    if (growth < 20) return "🌱";
    if (growth < 50) return "🌿";
    if (growth < 80) return "🌳";
    return "🌸";
  };

  return (
    <div className="text-center mt-3">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex justify-center"
      >
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-5xl shadow-inner">
          {getPlant()}
        </div>
      </motion.div>

      <p className="mt-3 text-sm text-gray-500">
        Growth Level
      </p>

      <p className="text-green-600 font-semibold text-lg">
        {growth}%
      </p>
    </div>
  );
}