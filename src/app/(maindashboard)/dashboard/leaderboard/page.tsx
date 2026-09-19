/**
 * @fileoverview Enterprise Leaderboard Page Component
 * @description High-performance gamified wealth leaderboard showcasing aura balances, 
 * podium positions, and responsive tracking structures. Completely optimized for 
 * accessibility (WCAG), strict type safety, and minimal re-render profiles.
 */

"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Trophy, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE SCHEMAS & CONSTANTS
// ============================================================================

export type LeaderboardPeriod = "month" | "all";

export interface LeaderRecord {
  rank: number;
  name: string;
  aura: number;
  emoji: string;
  isCurrentUser?: boolean;
}

// Structured mock telemetry stream matching API synchronization profiles
const LEADERBOARD_REGISTRY: Record<LeaderboardPeriod, LeaderRecord[]> = {
  month: [
    { rank: 1, name: "MoneyMonk", aura: 34550, emoji: "🐒" },
    { rank: 2, name: "SaverGirl", aura: 18450, emoji: "🌸" },
    { rank: 3, name: "FrugalKing", aura: 15230, emoji: "👑" },
    { rank: 4, name: "BudgetBoss", aura: 13400, emoji: "💼" },
    { rank: 5, name: "SaveMaster", aura: 12450, emoji: "🧙" },
  ],
  all: [
    { rank: 1, name: "WhaleSaver", aura: 894300, emoji: "🐋" },
    { rank: 2, name: "MoneyMonk", aura: 542100, emoji: "🐒" },
    { rank: 3, name: "CryptoGuru", aura: 412900, emoji: "🪙" },
    { rank: 4, name: "SaverGirl", aura: 389400, emoji: "🌸" },
    { rank: 5, name: "FrugalKing", aura: 310200, emoji: "👑" },
  ],
};

const PERIOD_TABS = [
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
] as const;

// ============================================================================
// SUB-COMPONENTS (MEMOIZED & ACCESSIBLE)
// ============================================================================

interface PodiumProps {
  rank: 1 | 2 | 3;
  record?: LeaderRecord;
}

/**
 * Podium Component
 * Renders the top three spatial structural nodes with responsive heights.
 */
const Podium = memo(function Podium({ rank, record }: PodiumProps) {
  if (!record) return null;

  // Configuration map representing deterministic heights and gradients for ranks
  const configuration = {
    1: { height: "h-32 sm:h-36", gradient: "from-yellow-500/20 to-yellow-500/5", border: "border-yellow-500/30" },
    2: { height: "h-24 sm:h-28", gradient: "from-neutral-400/20 to-neutral-400/5", border: "border-neutral-400/20" },
    3: { height: "h-18 sm:h-22", gradient: "from-amber-600/20 to-amber-600/5", border: "border-amber-600/20" },
  };

  const currentConfig = configuration[rank];

  // Safely condense numeric metric notations
  const localizedAuraValue = useMemo(() => {
    return record.aura >= 1000 
      ? `${(record.aura / 1000).toFixed(1)}k` 
      : record.aura.toString();
  }, [record.aura]);

  return (
    <div 
      className={cn(
        "flex flex-col items-center flex-1 min-w-0 max-w-[130px] transform-gpu",
        rank === 1 ? "order-2 z-10 scale-105" : rank === 2 ? "order-1" : "order-3"
      )}
    >
      <span className="text-3xl sm:text-4xl mb-2 drop-shadow-sm select-none" role="img" aria-label={record.name}>
        {record.emoji}
      </span>
      
      <div
        className={cn(
          "w-full rounded-t-2xl bg-gradient-to-t flex flex-col items-center justify-end pb-3 border border-b-0 shadow-sm transition-all duration-500",
          currentConfig.gradient,
          currentConfig.border,
          currentConfig.height
        )}
        style={{ willChange: "transform, height" }}
      >
        <span className={cn(
          "text-xl sm:text-2xl font-black tracking-tight leading-none mb-1",
          rank === 1 ? "text-yellow-500" : rank === 2 ? "text-neutral-400" : "text-amber-600"
        )}>
          {rank}
        </span>
        <div className="w-4 h-1 rounded-full bg-current opacity-30 mb-1" />
      </div>

      <p className="text-xs font-black mt-3 truncate w-full text-center text-text-main tracking-tight">
        {record.name}
      </p>
      <p className="text-[10px] text-text-light font-black uppercase tracking-wider mt-0.5">
        +{localizedAuraValue} Aura
      </p>
    </div>
  );
});

interface LeaderboardRowProps {
  user: LeaderRecord;
  onSelect: (name: string) => void;
}

/**
 * LeaderboardRow Component
 * Renders individual interactive tabular list configurations.
 */
const LeaderboardRow = memo(function LeaderboardRow({ user, onSelect }: LeaderboardRowProps) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(user.name);
    }
  }, [user.name, onSelect]);

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: Math.min(user.rank * 0.03, 0.25) }}
      style={{ willChange: "transform, opacity" }}
      className="list-none"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(user.name)}
        onKeyDown={handleKeyDown}
        aria-label={`Rank ${user.rank}: ${user.name} with ${user.aura} aura points.`}
        className={cn(
          "glass-panel p-4 flex justify-between items-center gap-4 rounded-2xl border border-neutral-200/10 bg-white/40 dark:bg-neutral-900/40 hover:bg-white/80 dark:hover:bg-neutral-900/80 transition-all cursor-pointer transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group",
          user.isCurrentUser && "ring-2 ring-primary bg-primary/5 dark:bg-primary/5"
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="font-black text-text-light text-xs w-5 text-center shrink-0">
            {user.rank}
          </span>
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-500/10 rounded-full flex items-center justify-center text-xl shrink-0 select-none shadow-sm">
            {user.emoji}
          </div>
          <span className="font-black text-sm truncate text-text-main tracking-tight">
            {user.name}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-black text-green-500 tracking-tight">
            +{user.aura.toLocaleString("en-IN")} Aura
          </span>
          <ArrowRight size={16} className="text-text-light transform group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </div>
      </div>
    </motion.li>
  );
});

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function LeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("month");
  const router = useRouter();

  // Retrieve data stream based on selected reactive time token context window
  const activeDataset = useMemo(() => {
    return LEADERBOARD_REGISTRY[activePeriod] || [];
  }, [activePeriod]);

  // Safely extract top three entities using positional mapping logic arrays
  const topThree = useMemo(() => {
    return {
      first: activeDataset.find(u => u.rank === 1),
      second: activeDataset.find(u => u.rank === 2),
      third: activeDataset.find(u => u.rank === 3),
    };
  }, [activeDataset]);

  // Client Routing Core Logic Callbacks
  const handleProfileNavigation = useCallback((profileName?: string) => {
    const routeTarget = profileName 
      ? `/dashboard/profile?user=${encodeURIComponent(profileName)}`
      : "/dashboard/profile";
    router.push(routeTarget);
  }, [router]);

  const handleTransactionNavigation = useCallback(() => {
    router.push("/dashboard/transactions");
  }, [router]);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8" role="region" aria-label="Wealth Gamification Performance Console">
      
      {/* HEADER SECTION LAYOUT */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200/10 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light select-none">
            Leaderboard Telemetry
          </p>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 grid place-items-center rounded-2xl bg-secondary/10 text-secondary border border-secondary/10 shrink-0 shadow-sm" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight">
                Who&apos;s winning the wealth game?
              </h1>
              <p className="text-sm text-text-light leading-relaxed max-w-2xl font-medium">
                Compare your metrics with elite ecosystem capital aggregators. Maximize your asset pool to scale the infrastructure tier.
              </p>
            </div>
          </div>
        </div>

        {/* Global CTA Actions Row */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleProfileNavigation()}
            leftIcon={<Users size={15} />}
            className="rounded-2xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer"
          >
            View stats
          </Button>
          <Button
            variant="vibe"
            size="sm"
            onClick={handleTransactionNavigation}
            leftIcon={<Trophy size={15} />}
            className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-2xl text-xs uppercase font-black tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Add cash
          </Button>
        </div>
      </header>

      {/* FILTER CONTROL CONFIG DECK */}
      <div 
        className="flex justify-center sm:justify-start gap-1.5 p-1.5 bg-neutral-200/40 dark:bg-neutral-950/40 border border-neutral-200/5 rounded-2xl w-full sm:w-fit shadow-inner"
        role="tablist"
        aria-label="Leaderboard timeframe filter metrics configuration"
      >
        {PERIOD_TABS.map((tabItem) => {
          const isSelected = activePeriod === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              id={`tab-${tabItem.id}`}
              onClick={() => setActivePeriod(tabItem.id)}
              className={cn(
                "relative flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all transform-gpu select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary",
                isSelected
                  ? "bg-white dark:bg-neutral-900 text-primary shadow-sm border border-neutral-200/10 font-black"
                  : "text-text-light hover:text-text-main"
              )}
            >
              <span className="relative z-10">{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* THREE-COLUMN PODIUM INTERACTIVE INTERFACE ZONE */}
      <section 
        className="flex justify-center items-end gap-3 sm:gap-6 pt-6 pb-4 px-2 max-w-md mx-auto sm:max-w-none border border-dashed border-neutral-200/5 rounded-3xl bg-neutral-500/2" 
        aria-label="Podium positions configuration showcase tier"
      >
        <Podium rank={2} record={topThree.second} />
        <Podium rank={1} record={topThree.first} />
        <Podium rank={3} record={topThree.third} />
      </section>

      {/* REGISTRY SCROLL SYSTEM COMPONENT BLOCK CONTAINER */}
      <main className="w-full min-h-[250px]">
        <AnimatePresence mode="popLayout">
          {activeDataset.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-neutral-200/10 rounded-2xl"
            >
              <span className="text-3xl mb-2" role="presentation">📊</span>
              <p className="text-sm font-bold text-text-main">No ledger telemetry processed</p>
              <p className="text-xs text-text-light mt-1">Data stream is processing, re-check matrix configurations down-cycle.</p>
            </motion.div>
          ) : (
            <motion.ol 
              role="list"
              aria-label={`Leaderboard system flow container displaying ${activePeriod} parameters.`}
              className="space-y-3 max-w-2xl mx-auto sm:max-w-none w-full pl-0"
            >
              {activeDataset.map((userRecord) => (
                <LeaderboardRow
                  key={`${activePeriod}-${userRecord.rank}-${userRecord.name}`}
                  user={userRecord}
                  onSelect={handleProfileNavigation}
                />
              ))}
            </motion.ol>
          )}
        </AnimatePresence>
      </main>
      
    </div>
  );
}