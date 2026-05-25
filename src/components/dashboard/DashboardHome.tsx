"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Plus, Target, Sparkles } from "lucide-react";
import HeroCard from "@/components/dashboard/HeroCard";
import PlantSection from "@/components/dashboard/PlantSection";
import SafeToSpendCard from "@/components/dashboard/SafeToSpendCard";
import StreakCard from "@/components/dashboard/StreakCard";
import OverviewChart from "@/components/dashboard/OverviewChart";
import QuickActions from "@/components/dashboard/QuickActions";
import ActionButtons from "@/components/dashboard/ActionButtons";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import InsightCard from "@/components/analytics/AIInsightCard";
import { useFinanceContext } from "@/components/providers/FinanceProvider";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { generateAIInsight } from "@/lib/ai";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

function DreamVault() {
  const router = useRouter();
  const { openAdd } = useTransactionModal();

  return (
    <div className="glass-panel p-5 sm:p-6 h-full flex flex-col relative overflow-hidden min-h-0">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 truncate">
            Dream Vault <Sparkles size={16} className="text-secondary shrink-0" />
          </h3>
          <p className="label-caps opacity-60 text-[10px] sm:text-xs">Manifesting wealth</p>
        </div>
        <button
          type="button"
          onClick={() => openAdd("income")}
          className="p-2.5 sm:p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl transition-all active:scale-95 shrink-0"
          aria-label="Add savings"
        >
          <Plus size={22} />
        </button>
      </div>
      <div className="space-y-3 sm:space-y-4 flex-1 min-h-0">
        <button
          type="button"
          onClick={() => router.push("/goals")}
          className="w-full p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-left hover:bg-white/10 transition-colors gap-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent shrink-0">
              🎸
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">Fender Strat</p>
              <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">
                ₹1,02,000 goal
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold text-primary">85%</p>
            <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary w-[85%]" />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => router.push("/wishlist")}
          className="w-full p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-left hover:bg-white/10 transition-colors gap-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary shrink-0">
              🧥
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">Zara Jacket</p>
              <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">
                Open wishlist
              </p>
            </div>
          </div>
          <Target size={16} className="text-text-light shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const {
    transactions,
    loading,
    error,
    income,
    expense,
    savings,
    streak,
    plantStage,
    plantStatus,
    refreshTransactions,
  } = useFinanceContext();
  const { data: leaderboard, loading: leaderboardLoading } = useLeaderboard();

  const growth = Math.min(Math.max(0, savings) / 10000 * 100, 100);

  const aiInsight = useMemo(
    () => generateAIInsight({ income, expense }),
    [income, expense]
  );

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => refreshTransactions()} />
    );

  const safeStage = plantStage ?? { level: 1, name: "Seed", min: 0 };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6 w-full min-w-0"
    >
      {/* Center / hero — first on mobile */}
      <section className="lg:col-span-6 flex flex-col gap-4 sm:gap-5 order-1 lg:order-2 min-w-0">
        <motion.div variants={itemVariants} className="min-w-0">
          <PlantSection growth={growth} stage={safeStage} status={plantStatus} />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <OverviewChart transactions={transactions} />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <ActionButtons />
        </motion.div>
      </section>

      {/* Left column */}
      <aside className="lg:col-span-3 flex flex-col gap-4 sm:gap-5 order-2 lg:order-1 min-w-0">
        <motion.div variants={itemVariants}>
          <HeroCard savings={savings} income={income} expense={expense} />
        </motion.div>
        <motion.div variants={itemVariants} className="min-h-0">
          <DreamVault />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StreakCard streak={streak} />
        </motion.div>
      </aside>

      {/* Right column */}
      <aside className="lg:col-span-3 flex flex-col gap-4 sm:gap-5 order-3 min-w-0">
        <motion.div variants={itemVariants}>
          <InsightCard message={aiInsight.message} tone={aiInsight.tone} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SafeToSpendCard income={income} expense={expense} />
        </motion.div>
        <motion.div variants={itemVariants} className="min-h-0 flex-1">
          <LeaderboardList users={leaderboard} loading={leaderboardLoading} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>
      </aside>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 animate-pulse w-full">
      <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
        <div className="h-28 rounded-3xl bg-black/5 dark:bg-white/5" />
        <div className="h-48 rounded-3xl bg-black/5 dark:bg-white/5" />
      </div>
      <div className="lg:col-span-6 h-72 sm:h-96 rounded-[32px] bg-black/5 dark:bg-white/5 order-1 lg:order-2" />
      <div className="lg:col-span-3 h-64 rounded-3xl bg-black/5 dark:bg-white/5 order-3" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh] text-center px-4 w-full">
      <div className="glass-panel p-8 sm:p-12 rounded-[32px] border-red-500/20 max-w-md w-full">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-red-400 text-lg font-bold">Garden Sync Interrupted</p>
        <p className="text-xs text-text-light mt-2">{message}</p>
        <button
          type="button"
          onClick={onRetry ?? (() => window.location.reload())}
          className="mt-6 w-full sm:w-auto bg-white/10 hover:bg-white/15 px-8 py-3 rounded-full text-sm font-bold border border-white/10"
        >
          Re-sync System
        </button>
      </div>
    </div>
  );
}
