"use client";

import GlassCard from "../ui/GlassCard";
import { motion } from "framer-motion";
import ProgressBar from "../goals/ProgressBars";

/* 🧠 TYPES */
export type PlantStage = {
  level: number;
  name: string;
  min: number;
};

type PlantProps = {
  growth: number;
  stage?: PlantStage;
  status: string;
  reducedMotion?: boolean;
};

/* 🌿 EMOJI + STYLE SYSTEM */
function getPlantConfig(growth: number) {
  if (growth <= 20)
    return {
      emoji: "🌱",
      glow: "from-green-100/40 to-lime-100/30",
      aura: "bg-green-200",
    };

  if (growth <= 45)
    return {
      emoji: "🌿",
      glow: "from-emerald-200/40 to-green-100/30",
      aura: "bg-emerald-400",
    };

  if (growth <= 70)
    return {
      emoji: "🪴",
      glow: "from-green-300/40 to-teal-100/30",
      aura: "bg-teal-300",
    };

  if (growth <= 90)
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
  reducedMotion = false,
}: PlantProps) {
  const safeGrowth = Math.max(0, Math.min(growth, 100));

  const plant = getPlantConfig(safeGrowth);

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
          animate={
            reducedMotion
              ? { y: 0, rotate: 0, scale: 1 }
              : {
                  y: [0, -10, 0],
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }
          className="text-6xl"
        >
          {plant.emoji}
        </motion.div>

        {/* 💬 STATUS */}
        <div className="h-6 flex items-center justify-center mt-2">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-500 font-medium"
          >
            {status}
          </motion.p>
        </div>

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
        <div className="mt-2 flex justify-center h-6">
          <motion.span 
            key={stage?.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/40 backdrop-blur text-gray-600 border border-white/20"
          >
            {stage?.name || `Level ${stage?.level || 1}`}
          </motion.span>
        </div>
      </div>
    </GlassCard>
  );
}