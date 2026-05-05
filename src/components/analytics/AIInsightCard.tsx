"use client";

import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

/* 🧠 TYPES */
type Props = {
  message: string;
  tone?: "good" | "warning" | "danger";
};

/* 🎨 HELPER: COLOR BASED ON TONE */
function getToneStyles(tone: Props["tone"]) {
  switch (tone) {
    case "good":
      return {
        text: "text-green-600",
        glow: "from-green-100/40 to-transparent",
      };
    case "danger":
      return {
        text: "text-red-500",
        glow: "from-red-100/40 to-transparent",
      };
    default:
      return {
        text: "text-yellow-600",
        glow: "from-yellow-100/40 to-transparent",
      };
  }
}

/* 🤖 COMPONENT */
export default function InsightCard({
  message,
  tone = "warning",
}: Props) {
  const styles = getToneStyles(tone);

  return (
    <GlassCard className="relative overflow-hidden">
      
      {/* 🌟 GLOW BACKGROUND */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${styles.glow} blur-2xl opacity-50`}
      />

      <motion.div
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 space-y-2"
      >
        {/* 🧠 LABEL */}
        <p className="text-xs text-gray-500 tracking-wide">
          🤖 AI Insight
        </p>

        {/* 💬 MESSAGE */}
        <p
          className={`text-sm font-medium leading-relaxed ${styles.text}`}
        >
          {message}
        </p>
      </motion.div>
    </GlassCard>
  );
}