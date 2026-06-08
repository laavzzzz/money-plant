"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sparkles, Leaf, ChevronRight, Target, Trophy } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useFinanceContext } from "@/components/providers/FinanceProvider";
import { usePlant } from "@/hooks/usePlant";
import { PLANT_LEVELS } from "@/lib/constants/config";
import { cn } from "@/lib/utils";

const STAGES = PLANT_LEVELS.map((stage) => ({
  ...stage,
  label: stage.name,
}));

export default function GardenPage() {
  const router = useRouter();
  const { transactions, income, expense, savings, streak } = useFinanceContext();
  const { growth, plantStage, nextStage, progressToNext, status } = usePlant(transactions);
  const [isWatering, setIsWatering] = useState(false);
  const progress = Math.round(progressToNext);

  const plantMood = useMemo(() => {
    if (growth < 5) return "seeded";
    if (growth < 15) return "sprouting";
    if (growth < 30) return "leafy";
    if (growth < 50) return "planting";
    if (growth < 75) return "treeing";
    if (growth < 95) return "blooming";
    return "fruiting";
  }, [growth]);

  const handleWaterPlant = async () => {
    setIsWatering(true);
    try {
      await fetch("/api/streak", { method: "POST" });
      toast.success("Watered the vibes — streak boosted 🌿");
    } catch {
      toast.error("Plant hydration failed. Try again in a sec.");
    } finally {
      window.setTimeout(() => setIsWatering(false), 1400);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
          <div className="space-y-2">
            <p className="text-xs font-black text-primary uppercase tracking-widest">{plantStage.label}</p>
            <p className="text-sm font-bold text-text-light">Your growing money tree</p>
            <p className="text-xs font-bold text-text-light">{status}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-text-light uppercase">Total Saved</p>
            <p className="text-xl font-black text-accent-dark">₹{savings.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light">Current mood</p>
            <p className="mt-3 text-lg font-black text-text-main uppercase">{plantMood}</p>
          </div>
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light">Next stage</p>
            <p className="mt-3 text-lg font-black text-text-main uppercase">{nextStage?.label ?? "Mastery"}</p>
          </div>
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5">
            <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light">Streak</p>
            <p className="mt-3 text-lg font-black text-text-main uppercase">{streak} days</p>
          </div>
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
          <div className="flex flex-col gap-2 text-xs text-text-light uppercase tracking-tighter">
            <p className="text-center font-bold">{nextStage ? `Next stage: ${nextStage.label}` : "Max growth unlocked"}</p>
            <p className="text-center">
              {nextStage
                ? `You’re ${progress}% of the way to ${nextStage.label}. Keep saving to bloom.`
                : "Your plant is fully grown — keep the good habits going."}
            </p>
          </div>
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
            onClick={() => router.push("/dashboard/goals")}
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
    </div>
  );
}