"use client";

import { motion } from "framer-motion";

export default function InsightCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-100 rounded-3xl p-4 shadow-md"
    >
      <p className="text-sm text-gray-600 mb-1">
        🤖 AI Insight
      </p>

      <p className="text-green-700 font-medium">
        You spent 30% more on food this week 😭  
        Maybe cook 2 meals → save ₹1500 💅
      </p>
    </motion.div>
  );
}