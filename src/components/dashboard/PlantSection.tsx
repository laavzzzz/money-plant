"use client";

import GlassCard from "../ui/GlassCard";
import { motion } from "framer-motion";
import ProgressBar from "../goals/ProgressBars";
import {
  Apple,
  CircleDot,
  Flower2,
  Leaf,
  LucideIcon,
  Sprout,
  TreePine,
} from "lucide-react";

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

type PlantConfig = {
  Icon: LucideIcon;
  glow: string;
  aura: string;
  iconBg: string;
  iconColor: string;
};

/* 🌿 STAGE ICON + STYLE SYSTEM */
function getPlantConfig(stage?: PlantStage, growth = 0): PlantConfig {
  const level =
    stage?.level ??
    (growth >= 95 ? 7 : growth >= 75 ? 6 : growth >= 50 ? 5 : growth >= 30 ? 4 : growth >= 15 ? 3 : growth >= 5 ? 2 : 1);

  if (level === 1)
    return {
      Icon: CircleDot,
      glow: "from-green-100/40 to-lime-100/30",
      aura: "bg-green-200",
      iconBg: "bg-lime-100 dark:bg-lime-400/10",
      iconColor: "text-lime-700 dark:text-lime-300",
    };

  if (level === 2)
    return {
      Icon: Sprout,
      glow: "from-emerald-200/40 to-green-100/30",
      aura: "bg-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-400/10",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    };

  if (level === 3)
    return {
      Icon: Leaf,
      glow: "from-green-300/40 to-teal-100/30",
      aura: "bg-teal-300",
      iconBg: "bg-teal-100 dark:bg-teal-400/10",
      iconColor: "text-teal-700 dark:text-teal-300",
    };

  if (level === 4)
    return {
      Icon: Sprout,
      glow: "from-green-300/40 to-cyan-100/30",
      aura: "bg-green-300",
      iconBg: "bg-green-100 dark:bg-green-400/10",
      iconColor: "text-green-700 dark:text-green-300",
    };

  if (level === 5)
    return {
      Icon: TreePine,
      glow: "from-green-400/40 to-yellow-100/30",
      aura: "bg-green-300",
      iconBg: "bg-green-100 dark:bg-green-400/10",
      iconColor: "text-green-800 dark:text-green-300",
    };

  if (level === 6)
    return {
      Icon: Flower2,
      glow: "from-pink-200/40 to-yellow-100/30",
      aura: "bg-pink-200",
      iconBg: "bg-pink-100 dark:bg-pink-400/10",
      iconColor: "text-pink-700 dark:text-pink-300",
    };

  return {
    Icon: Apple,
    glow: "from-rose-200/40 to-amber-100/30",
    aura: "bg-rose-200",
    iconBg: "bg-rose-100 dark:bg-rose-400/10",
    iconColor: "text-rose-700 dark:text-rose-300",
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

  const plant = getPlantConfig(stage, safeGrowth);
  const StageIcon = plant.Icon;

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
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/40 shadow-2xl ${plant.iconBg}`}
        >
          <StageIcon size={54} strokeWidth={1.8} className={plant.iconColor} />
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
