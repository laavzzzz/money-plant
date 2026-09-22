/**
 * @file src/components/dashboard/VibeCheck.tsx
 * @module Components/Dashboard/VibeCheck
 * @description Enterprise financial insight "Vibe Check" horizontal scrolling component suite.
 * Renders gamified behavioral spending insights, subscription alerts, and clean streak metrics
 * with ambient glow backdrops and Framer Motion spring entrances.
 * 
 * @version 4.0.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { 
  Flame, 
  Coffee, 
  CircleAlert, 
  TrendingDown,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Insight {
  readonly id: number;
  readonly title: string;
  readonly desc: string;
  readonly icon: React.ReactNode;
  readonly secondaryIcon?: React.ReactNode;
  readonly bgColor: string;
  readonly iconBg: string;
  readonly accentColor: string;
  readonly borderColor: string;
  readonly titleColor: string;
  readonly hasTrend: boolean;
  readonly progressValue: number;
}

// ============================================================================
// CONSTANTS: INSIGHTS DATA CONFIGURATION
// ============================================================================

const INSIGHTS: readonly Insight[] = Object.freeze([
  {
    id: 1,
    title: "Big W",
    desc: "Saved ₹500 on coffee this week. Plant is thirsty for more!",
    icon: <Flame className="text-amber-600 dark:text-amber-400" size={18} aria-hidden="true" />,
    bgColor: "from-amber-100/40 to-transparent dark:from-amber-950/30",
    iconBg: "bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20",
    accentColor: "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_2px_6px_rgba(245,158,11,0.2)]",
    borderColor: "border-amber-100 dark:border-amber-500/20 hover:border-amber-200 dark:hover:border-amber-500/40",
    titleColor: "text-amber-800 dark:text-amber-300",
    secondaryIcon: <Coffee size={13} className="text-amber-500/70" aria-hidden="true" />,
    hasTrend: false,
    progressValue: 85,
  },
  {
    id: 2,
    title: "Sus Spend",
    desc: "3 subscriptions detected. Do we really need all of them?",
    icon: <CircleAlert className="text-rose-600 dark:text-rose-400" size={18} aria-hidden="true" />,
    bgColor: "from-rose-100/40 to-transparent dark:from-rose-950/30",
    iconBg: "bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20",
    accentColor: "bg-gradient-to-r from-rose-400 to-pink-500 shadow-[0_2px_6px_rgba(244,63,94,0.2)]",
    borderColor: "border-rose-100 dark:border-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/40",
    titleColor: "text-rose-800 dark:text-rose-300",
    secondaryIcon: <TrendingDown size={13} className="text-rose-500/70 animate-pulse" aria-hidden="true" />,
    hasTrend: true,
    progressValue: 40,
  },
  {
    id: 3,
    title: "Clean Streak",
    desc: "No 'L' spends for 3 days. Your aura is glowing! ✨",
    icon: <Sparkles className="text-emerald-600 dark:text-emerald-400" size={18} aria-hidden="true" />,
    bgColor: "from-emerald-100/40 to-transparent dark:from-emerald-950/30",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20",
    accentColor: "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_2px_6px_rgba(16,185,129,0.2)]",
    borderColor: "border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/40",
    titleColor: "text-emerald-800 dark:text-emerald-300",
    hasTrend: false,
    progressValue: 100,
  },
]);

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

export default function VibeCheck(): React.ReactElement {
  const router = useRouter();
  const { openVibeCheck } = useTransactionModal();

  return (
    <section className="space-y-4" aria-label="Financial Vibe Check Insights">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h2 className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
            Vibe Check ⚡️
          </h2>
        </div>
        <button
          type="button"
          onClick={() => openVibeCheck()}
          aria-label="View all financial Vibe Check insights"
          className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase border-b border-emerald-600/30 pb-0.5 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-700/50 transition-all duration-200 cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Cards Horizontal Container */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2 -mx-2 scroll-smooth snap-x snap-mandatory">
        {INSIGHTS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ 
              delay: i * 0.08, 
              ease: [0.16, 1, 0.3, 1],
              duration: 0.6 
            }}
            whileHover={{ y: -4 }}
            className={cn(
              "min-w-[290px] md:min-w-[310px] p-5 rounded-[24px] border snap-start",
              "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md relative overflow-hidden group transition-all duration-300 shadow-md hover:shadow-lg",
              card.borderColor
            )}
          >
            {/* 🎨 Ambient Light Glow Backdrop effect */}
            <div
              className={cn(
                "absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br blur-2xl opacity-70 pointer-events-none transition-transform duration-700 group-hover:scale-150",
                card.bgColor
              )}
              aria-hidden="true"
            />

            {/* Core Content Layout */}
            <div className="flex gap-4 items-start relative z-10">
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105 shrink-0",
                  card.iconBg
                )}
                aria-hidden="true"
              >
                {card.icon}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={cn("font-black tracking-tight uppercase text-xs", card.titleColor)}>
                    {card.title}
                  </h3>

                  <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                    {card.secondaryIcon && card.secondaryIcon}
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {card.desc}
                </p>
              </div>
            </div>

            {/* 📊 Advanced Light Glow-Bar Metric Component */}
            <div className="mt-5 flex items-center gap-3 relative z-10">
              <div 
                className="h-1.5 flex-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/30 dark:border-zinc-700/30"
                role="progressbar"
                aria-valuenow={card.progressValue}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress for ${card.title}`}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${card.progressValue}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.1 + 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn("h-full rounded-full", card.accentColor)}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  card.id === 2
                    ? router.push("/dashboard/transactions")
                    : openVibeCheck()
                }
                aria-label={`View details for ${card.title}`}
                className="text-[9px] font-black text-slate-400 dark:text-zinc-500 tracking-wider uppercase hover:text-slate-800 dark:hover:text-zinc-200 transition-colors duration-200 shrink-0 cursor-pointer"
              >
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}