"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Trophy, Target, Sparkles, ChevronRight, Leaf } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import  Button  from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function GardenPage() {
  const [isWatering, setIsWatering] = useState(false);
  const progress = 65; // Percentage toward next level

  const handleWaterPlant = () => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 2000);
  };

  return (
    <main className="space-y-8 pb-32">
      {/* 🏆 HEADER STATUS */}
      <section className="flex justify-between items-end">
        <div>
          <p className="text-xs font-black text-primary uppercase tracking-widest">Level 14</p>
          <h1 className="text-3xl font-black text-text-main tracking-tighter">Money Tree 🌳</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-text-light uppercase">Total Saved</p>
          <p className="text-xl font-black text-accent-dark">₹42,000</p>
        </div>
      </section>

      {/* 🌿 CENTRAL PLANT VISUALIZER */}
      <section className="relative flex justify-center py-12">
        {/* Glow Aura */}
        <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full animate-pulse" />
        
        <motion.div 
          animate={isWatering ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
          className="relative z-10"
        >
          {/* This is where you'd eventually drop a Rive or Lottie component */}
          <div className="w-56 h-56 bg-gradient-to-b from-accent/40 to-accent rounded-full flex items-center justify-center shadow-float border-8 border-white/50 relative">
             <Leaf size={100} className="text-white drop-shadow-2xl" />
             
             {/* Droplets Animation */}
             <AnimatePresence>
               {isWatering && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 40 }}
                   exit={{ opacity: 0 }}
                   className="absolute top-0 flex gap-2"
                 >
                   <Droplets className="text-blue-400 animate-bounce" />
                   <Droplets className="text-blue-400 animate-bounce delay-100" />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Floating Badges */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-4 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-vibe border border-white"
        >
          <Sparkles className="text-yellow-400" size={20} />
        </motion.div>
      </section>

      {/* 📊 PROGRESS & STATS */}
      <section className="space-y-4">
        <GlassCard hover={false} className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-text-main">Growth Progress</span>
            <span className="text-sm font-black text-primary">{progress}%</span>
          </div>
          <div className="h-4 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_15px_rgba(195,172,255,0.5)]"
            />
          </div>
          <p className="text-[10px] text-center font-bold text-text-light uppercase tracking-tighter">
            Save ₹1,500 more to unlock the "Golden Oak" stage
          </p>
        </GlassCard>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="vibe" 
            fullWidth 
            onClick={handleWaterPlant}
            leftIcon={<Droplets size={18} />}
          >
            Water Plant
          </Button>
          <Button 
            variant="primary" 
            fullWidth 
            leftIcon={<Target size={18} />}
          >
            Set Goal
          </Button>
        </div>
      </section>

      {/* 🏆 MILESTONES */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-text-main">Garden Achievements</h3>
        <div className="space-y-3">
          {[
            { title: "Penny Pincher", desc: "Saved 5 days in a row", icon: <Trophy size={18} />, done: true },
            { title: "Wealth Weaver", desc: "Hit ₹50k total savings", icon: <Sparkles size={18} />, done: false },
          ].map((item, i) => (
            <GlassCard key={i} className={cn("p-4", !item.done && "opacity-60")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-white/20">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-main">{item.title}</p>
                    <p className="text-[10px] font-bold text-text-light uppercase">{item.desc}</p>
                  </div>
                </div>
                {item.done ? (
                  <div className="bg-accent/20 p-1 rounded-full">
                    <ChevronRight className="text-accent-dark" size={16} />
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-text-light">LOCKED</div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </main>
  );
}