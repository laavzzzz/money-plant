"use client";

import GlassCard from "../ui/GlassCard";
import { motion } from "framer-motion";
import ProgressBar from "../goals/ProgressBars";

/* 🧠 TYPES */
type PlantStage = {
  level: number;
  name: string;
  min: number;
};

type PlantProps = {
  growth: number;
  stage?: PlantStage;
  status: string;
};

/* 🌿 EMOJI + STYLE SYSTEM */
function getPlantConfig(level: number) {
  if (level <= 1)
    return {
      emoji: "🌱",
      glow: "from-green-100/40 to-lime-100/30",
      aura: "bg-green-200",
    };

  if (level === 2)
    return {
      emoji: "🌿",
      glow: "from-green-200/40 to-emerald-100/30",
      aura: "bg-emerald-200",
    };

  if (level === 3)
    return {
      emoji: "🪴",
      glow: "from-green-300/40 to-teal-100/30",
      aura: "bg-teal-200",
    };

  if (level === 4)
    return {
      emoji: "🌳",
      glow: "from-green-400/40 to-yellow-100/30",
      aura: "bg-green-300",
    };

  return {
    emoji: "🌸",
    glow: "from-pink-200/40 to-yellow-100/30",
    aura: "bg-pink-200",
  };
}

/* 🌱 COMPONENT */
export default function PlantSection({
  growth,
  stage,
  status,
}: PlantProps) {
  const safeLevel = stage?.level ?? 1;
  const safeGrowth = Math.max(0, Math.min(growth, 100));

  const plant = getPlantConfig(safeLevel);

  return (
    <GlassCard
      className="relative overflow-hidden text-center"
      elevation="lg"
    >
      {/* 🌟 DYNAMIC GLOW */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${plant.glow} blur-2xl opacity-50`}
      />

      {/* 🌿 AURA */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 ${plant.aura} rounded-full blur-3xl opacity-30`}
      />

      <div className="relative z-10">
        {/* 🌱 PLANT */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 3, -3, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: [0.42, 0, 0.58, 1], // ✅ fixed easing
          }}
          className="text-6xl"
        >
          {plant.emoji}
        </motion.div>

        {/* 💬 STATUS */}
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500 mt-2"
        >
          {status}
        </motion.p>

        {/* 📊 PROGRESS */}
        <div className="mt-4">
          <ProgressBar value={safeGrowth} />
        </div>

        {/* 📈 PERCENT */}
        <motion.p
          key={safeGrowth}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-green-600 mt-2 text-sm font-semibold"
        >
          {safeGrowth.toFixed(1)}%
        </motion.p>

        {/* 🌱 STAGE INFO */}
        <div className="mt-2 flex justify-center">
          <span className="text-xs px-3 py-1 rounded-full bg-white/40 backdrop-blur text-gray-600">
            {stage?.name ?? "Seed Stage"}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}