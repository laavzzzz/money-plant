/**
 * @fileoverview Gamified Asset Tracking Virtual Garden Core Matrix View
 * @description Encapsulates high-performance rendering elements, decoupled async state
 * managers, and accessible landmark layouts tracking user gamification financial progress.
 */

"use client";

import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  ChevronRight,
  CircleDot,
  Droplets,
  Flower2,
  Leaf,
  LucideIcon,
  Sparkles,
  Sprout,
  Target,
  TreePine,
  Trophy,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useFinanceContext } from "@/components/providers/FinanceProvider";
import { usePlant } from "@/hooks/usePlant";
import { cn } from "@/lib/utils";

// ============================================================================
// DATA CONFIGURATIONS, INTERFACES, & CORE DICTIONARIES
// ============================================================================

interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  done: boolean;
}

interface PlantVisualizerProps {
  isWatering: boolean;
  StageIcon: LucideIcon;
}

interface AchievementRowProps {
  item: AchievementItem;
}

/**
 * Immutable Map matching core plant growth layers to UI tracking vectors.
 */
const STAGE_ICONS: Readonly<Record<number, LucideIcon>> = {
  1: CircleDot,
  2: Sprout,
  3: Leaf,
  4: Sprout,
  5: TreePine,
  6: Flower2,
  7: Apple,
} as const;

/**
 * System mood optimization thresholds mapping growth scores to design text tags.
 */
const MOOD_THRESHOLDS = [
  { threshold: 5, value: "seeded" },
  { threshold: 15, value: "sprouting" },
  { threshold: 30, value: "leafy" },
  { threshold: 50, value: "planting" },
  { threshold: 75, value: "treeing" },
  { threshold: 95, value: "blooming" },
  { threshold: Infinity, value: "fruiting" },
] as const;

// ============================================================================
// PERFORMANCE ISOLATED DECOUPLED INDEPENDENT SUB-COMPONENTS
// ============================================================================

/**
 * PlantVisualizer Component
 * Handles canvas animation layers. Isolated to prevent execution state loops 
 * from invalidating structural parent metadata columns.
 */
const PlantVisualizer = memo(function PlantVisualizer({ isWatering, StageIcon }: PlantVisualizerProps) {
  return (
    <section className="relative flex justify-center py-12" aria-label="Visual garden growth tracking module">
      {/* Glow Aura Background Mesh */}
      <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full animate-pulse will-change-transform" aria-hidden="true" />
      
      <motion.div 
        animate={isWatering ? { scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] } : {}}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative z-10 transform-gpu"
      >
        <div className="w-56 h-56 bg-gradient-to-b from-accent/40 to-accent rounded-full flex items-center justify-center shadow-float border-8 border-white/50 relative">
          <StageIcon size={100} className="text-white drop-shadow-2xl" strokeWidth={1.5} aria-hidden="true" />
           
          {/* Fluid Droplets Animation Flow */}
          <AnimatePresence>
            {isWatering && (
              <motion.div 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-4 flex gap-3 transform-gpu"
              >
                <Droplets className="text-blue-400 animate-bounce" style={{ animationDuration: '0.8s' }} aria-hidden="true" />
                <Droplets className="text-blue-300 animate-bounce delay-75" style={{ animationDuration: '0.9s' }} aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Sparkles Badge Matrix Asset */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-6 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-vibe border border-neutral-100 dark:border-neutral-700 transform-gpu"
        aria-hidden="true"
      >
        <Sparkles className="text-yellow-400" size={20} />
      </motion.div>
    </section>
  );
});

/**
 * AchievementRow Component
 * Renders verified user milestone rows with correct accessibility semantics.
 */
const AchievementRow = memo(function AchievementRow({ item }: AchievementRowProps) {
  return (
    <GlassCard className={cn("p-4 transition-all duration-300 transform-gpu", !item.done && "opacity-50 select-none")}>
      <div className="flex items-center justify-between" role="listitem" aria-label={`${item.title} achievement milestone, status: ${item.done ? 'Unlocked' : 'Locked'}`}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-white/20 shadow-sm shrink-0 text-text-main" aria-hidden="true">
            {item.icon}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-text-main truncate">{item.title}</p>
            <p className="text-[10px] font-black text-text-light uppercase tracking-wider mt-0.5 truncate">{item.desc}</p>
          </div>
        </div>
        {item.done ? (
          <div className="bg-accent/20 p-1.5 rounded-full flex items-center justify-center shrink-0" aria-label="Milestone achievement verification checkmark">
            <ChevronRight className="text-accent-dark" size={14} aria-hidden="true" />
          </div>
        ) : (
          <div className="text-[9px] font-black tracking-widest text-text-light/80 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md shrink-0">
            LOCKED
          </div>
        )}
      </div>
    </GlassCard>
  );
});

// ============================================================================
// PRIMARY PARENT SYSTEM INTERFACE VIEW LAYER
// ============================================================================

export default function GardenPage() {
  const router = useRouter();
  
  // Context Subscription Vectors
  const { transactions, savings, streak } = useFinanceContext();
  const { growth, plantStage, nextStage, progressToNext, status } = usePlant(transactions);
  
  // Local Operational UI States
  const [isWatering, setIsWatering] = useState<boolean>(false);

  // Safe Progress Numeric Formatting Checks
  const progress = useMemo(() => {
    const rawProgress = Math.round(progressToNext);
    return Math.min(Math.max(rawProgress, 0), 100);
  }, [progressToNext]);

  // Resolves the plant's visual stage icon dynamically based on properties
  const StageIcon = useMemo(() => STAGE_ICONS[plantStage.level] ?? Leaf, [plantStage.level]);

  // Resolves semantic textual mood flags from context metrics
  const plantMood = useMemo(() => {
    const contextMatch = MOOD_THRESHOLDS.find(element => growth < element.threshold);
    return contextMatch ? contextMatch.value : "fruiting";
  }, [growth]);

  // Clean layout context mapping array configurations
  const achievementsRegistry: AchievementItem[] = useMemo(() => [
    { id: "pincher", title: "Penny Pincher", desc: "Saved 5 days in a row", icon: <Trophy size={18} />, done: true },
    { id: "weaver", title: "Wealth Weaver", desc: "Hit ₹50k total savings", icon: <Sparkles size={18} />, done: savings >= 50000 },
  ], [savings]);

  // Safe Centralized Navigation Handlers
  const handleNavigationRedirect = useCallback((targetUrl: string) => {
    router.push(targetUrl);
  }, [router]);

  // Resilient Async Networking Hydration Framework Handlers
  const handleWaterPlant = useCallback(async () => {
    if (isWatering) return;
    
    setIsWatering(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // Enforce a strict 6-second networking execution ceiling

    try {
      const networkResponse = await fetch("/api/streak", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal
      });
      
      if (!networkResponse.ok) {
        throw new Error(`Server execution invalid runtime error status code: ${networkResponse.status}`);
      }
      
      toast.success("Watered the vibes — streak boosted 🌿");
    } catch (error) {
      console.error("[Garden System Network API Failure Operations Logging]:", error);
      toast.error("Plant hydration failed. Try again in a sec.");
    } finally {
      clearTimeout(timeoutId);
      // Introduce an engineered animation buffer lock before returning controls to interaction threads
      setTimeout(() => setIsWatering(false), 1400);
    }
  }, [isWatering]);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8" role="region" aria-label="Virtual Gamification Asset Garden">
      
      {/* HEADER SUMMARY SEGMENT MODULE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 border-b border-neutral-100 dark:border-neutral-800/60 pb-4">
          <div className="space-y-1.5" role="status" aria-live="polite">
            <p className="text-xs font-black text-primary uppercase tracking-widest select-none">{plantStage.name}</p>
            <h1 className="text-xl font-black text-text-main tracking-tight">Your growing money tree</h1>
            <p className="text-xs font-bold text-text-light flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {status}
            </p>
          </div>
          <div className="text-left sm:text-right bg-black/5 dark:bg-white/5 p-3 px-4 rounded-2xl border border-neutral-200/20">
            <p className="text-[9px] font-black text-text-light uppercase tracking-wider select-none">Total Wealth Accumulated</p>
            <p className="text-2xl font-black text-accent-dark tracking-tight mt-0.5">
              ₹{savings.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* METRIC CARD DASHBOARD HUD SLOTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5 flex flex-col justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-text-light select-none">Current Mood</p>
            <p className="mt-2 text-lg font-black text-text-main uppercase tracking-wide truncate">{plantMood}</p>
          </div>
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5 flex flex-col justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-text-light select-none">Next Target Horizon</p>
            <p className="mt-2 text-lg font-black text-text-main uppercase tracking-wide truncate">{nextStage?.name ?? "Mastery"}</p>
          </div>
          <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-white/60 dark:bg-white/5 flex flex-col justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-text-light select-none">Active Saving Streak</p>
            <p className="mt-2 text-lg font-black text-text-main uppercase tracking-wide truncate">{streak} days</p>
          </div>
        </div>
      </section>

      {/* 🌿 PERFORMANCE ISOLATED CENTRAL ECO-SYSTEM PLANT MOUNTED VISUALIZER CANVAS */}
      <PlantVisualizer isWatering={isWatering} StageIcon={StageIcon} />

      {/* 📊 PROGRESS TIMELINES & CONSOLE TRIGGER ROW SEGMENTS */}
      <section className="space-y-4">
        <GlassCard hover={false} className="space-y-4 p-5 sm:p-6 rounded-[32px] border-white/10">
          <div className="flex justify-between items-center select-none" role="presentation">
            <span className="text-sm font-black text-text-main tracking-tight">Growth Lifecycle Progress</span>
            <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{progress}%</span>
          </div>
          
          {/* Main Visual Progress Bar Container */}
          <div 
            className="h-4 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-1"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Plant life development gauge metrics tracking line"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_12px_rgba(195,172,255,0.4)] transform-gpu"
            />
          </div>
          
          <div className="flex flex-col gap-1 text-[11px] text-text-light font-bold uppercase tracking-wider text-center pt-1 border-t border-neutral-100 dark:border-neutral-800/40">
            <p className="text-text-main">{nextStage ? `Target Milestone: ${nextStage.name}` : "Max standard evolution metrics achieved"}</p>
            <p className="font-medium text-[10px] normal-case text-text-light/80 mt-0.5">
              {nextStage
                ? `You’re ${progress}% of the way to ${nextStage.name}. Keep saving consistency habits to unlock final bloom formats.`
                : "Your digital plant lifecycle parameters are fully maxed out — preserve your current financial metrics to maintain status."}
            </p>
          </div>
        </GlassCard>

        {/* Action Interactions Matrix Panel Controller Triggers */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="vibe" 
            fullWidth 
            onClick={handleWaterPlant}
            disabled={isWatering}
            leftIcon={<Droplets size={18} className={cn(isWatering && "animate-spin")} />}
            aria-label="Water plant asset. Triggers interactive physics graphics parameters and logs streak analytics updates."
          >
            {isWatering ? "Hydrating..." : "Water Plant"}
          </Button>
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Target size={18} />}
            onClick={() => handleNavigationRedirect("/dashboard/goals")}
            aria-label="Navigate forward to configure system asset financial target vectors"
          >
            Set Goal
          </Button>
        </div>
      </section>

      {/* 🏆 ARCHITECTURE REINFORCED SYSTEM MILESTONES CONTROLLERS */}
      <section className="space-y-4 pb-6">
        <h3 className="text-base font-black text-text-main tracking-tight select-none">Garden Achievements Matrix</h3>
        <div className="space-y-3" role="list" aria-label="System account unlocked milestone ledger records index">
          {achievementsRegistry.map((achievement) => (
            <AchievementRow key={achievement.id} item={achievement} />
          ))}
        </div>
      </section>
    </div>
  );
}