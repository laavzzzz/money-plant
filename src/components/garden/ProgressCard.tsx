"use client";

import React from "react";
import { motion } from "framer-motion";
import { Leaf, Sparkles, TrendingUp } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export default function ProgressCard() {
  const growthStage = "Golden Oak";
  const progress = 72; // Percentage

  return (
    <GlassCard className="relative overflow-hidden p-6 border-none bg-gradient-to-br from-white/80 to-vibe-mint/30 dark:from-vibe-dark/80 dark:to-vibe-mint/10">
      {/* 🟢 TOP STATUS BAR */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-[10px] font-black text-vibe-purple uppercase tracking-[0.2em] mb-1">
            Current Stage
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-text-main tracking-tighter">
              {growthStage}
            </span>
            <div className="bg-vibe-mint/40 p-1 rounded-lg">
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
          </div>
        </div>
        
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="bg-white/50 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/20"
        >
          <Sparkles className="text-vibe-yellow" size={20} />
        </motion.div>
      </div>

      {/* 🌳 VISUAL PROGRESS AREA */}
      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="relative">
          {/* Animated Glow behind the icon */}
          <div className="absolute inset-0 bg-vibe-mint blur-[20px] opacity-30 animate-pulse-slow" />
          
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-vibe-mint rounded-[24px] flex items-center justify-center shadow-vibe relative z-10 border-4 border-white/40"
          >
            <Leaf size={40} className="text-white drop-shadow-md" />
          </motion.div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-xs font-black text-text-light uppercase tracking-widest">Growth</p>
            <p className="text-lg font-black text-vibe-purple">{progress}%</p>
          </div>
          {/* Progress Bar */}
          <div className="h-4 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-[3px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-vibe-purple via-vibe-blue to-vibe-mint rounded-full shadow-[0_0_12px_rgba(178,242,187,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* 📝 QUOTE / INSIGHT */}
      <div className="relative z-10 bg-white/40 dark:bg-black/20 p-3 rounded-vibe-sm border border-white/20">
        <p className="text-[11px] font-bold text-text-main leading-tight italic">
          "Your garden is thriving! Stay consistent to unlock the 
          <span className="text-vibe-purple"> Diamond Root </span> 
          achievement."
        </p>
      </div>

      {/* 🎨 DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-vibe-blue/10 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute -left-4 -top-4 w-24 h-24 bg-vibe-pink/10 rounded-full blur-[30px] pointer-events-none" />
    </GlassCard>
  );
}