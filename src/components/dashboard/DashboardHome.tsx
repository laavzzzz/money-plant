"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants, useReducedMotion } from "framer-motion";
import { Plus, Target, Sparkles, Zap, ZapOff, Flame, Wallet, PiggyBank } from "lucide-react";
import HeroCard from "@/components/dashboard/HeroCard";
import PlantSection, { PlantStage } from "@/components/dashboard/PlantSection";
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

// 🌿 FIXED: 'id' made completely optional to match the 'useTransactions' schema payload
interface Transaction {
  id?: string | number;
  type: "income" | "expense";
  category?: string;
  date?: string | number | Date;
  amount: number;
}

function RecentActivity({ transactions }: { transactions: Transaction[] }) {
  const latest = useMemo(() => [...(transactions || [])].slice(0, 3), [transactions]);

  return (
    <div className="glass-panel p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-light">
          Recent Activity
        </h3>
        <button className="text-[10px] font-bold text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {latest.length > 0 ? (
          latest.map((tx, index) => (
            <div
              key={tx.id ? `tx-${tx.id}-${index}` : `tx-fallback-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs">
                    {tx.type === "income" ? "💰" : "💸"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {tx.category || "General"}
                  </p>
                  <p className="text-[10px] opacity-50 uppercase font-black">
                    {tx.date ? new Date(tx.date).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              <p
                className={`text-xs font-black ${
                  tx.type === "income" ? "text-success" : "text-rose-500"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}₹
                {tx.amount.toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[10px] text-center py-4 opacity-50 font-bold italic">No recent movements</p>
        )}
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

  // 1. Detect system preference
  const systemReducedMotion = useReducedMotion();
  // 2. Manual toggle state
  const [manualReduce, setManualReduce] = useState(false);
  
  const reduced = systemReducedMotion || manualReduce;

  // 3. Memoized variants that adapt to the motion preference
  const variants = useMemo(() => {
    const container: Variants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { 
          staggerChildren: reduced ? 0 : 0.06, 
          delayChildren: 0.05 
        },
      },
    };

    const item: Variants = {
      hidden: { opacity: 0, y: reduced ? 0 : 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: reduced ? { duration: 0 } : { 
          type: "spring",
          damping: 25,
          stiffness: 200,
          max: 0.5
        },
      },
    };
    return { container, item };
  }, [reduced]);

  // Memoize growth calculation based on a fixed target or dynamic goal
  const growth = useMemo(() => {
    const target = 10000; // Define your milestone target here
    return Math.min(Math.max(0, savings) / target * 100, 100);
  }, [savings]);

  const aiInsight = useMemo(
    () => generateAIInsight({ income, expense }),
    [income, expense]
  );

  // safeStage must be defined before any conditional returns to comply with Rules of Hooks
  const safeStage: PlantStage = useMemo(() => {
    const p = plantStage as any;
    if (p && typeof p.level === "number") {
      return {
        level: p.level,
        name: p.name || `Level ${p.level}`,
        min: p.min ?? 0,
      };
    }
    return { level: 1, name: "Seed", min: 0 };
  }, [plantStage]);

  // Handle loading and error states after all hooks have been called
  if (loading) {
    return <DashboardSkeleton />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => refreshTransactions()} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 🌿 TOP WELCOME ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <motion.div variants={variants.item} initial="hidden" animate="show">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight">
              Hi, Ananya! 👋
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 rounded-full text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streak} days streak 🔥</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-bold text-text-light mt-1">
            Your wealth garden is thriving under your care.
          </p>
        </motion.div>

        {/* FINANCIAL QUICK VIEW BANNER */}
        <motion.div 
          variants={variants.item} 
          initial="hidden" 
          animate="show"
          className="flex flex-wrap items-center gap-4 w-full lg:w-auto"
        >
          <div className="flex-1 sm:flex-initial glass-panel p-4 min-w-[160px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-light uppercase tracking-wider">Balance</p>
              <p className="text-base font-black text-text-main">₹{savings.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial glass-panel p-4 min-w-[160px] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
              <PiggyBank size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-light uppercase tracking-wider">Income</p>
              <p className="text-base font-black text-text-main">₹{income.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <button
            onClick={() => setManualReduce(!manualReduce)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors h-[58px]"
          >
            {reduced ? <ZapOff size={14} /> : <Zap size={14} />}
            <span className="hidden sm:inline">{reduced ? "Motion Off" : "Motion On"}</span>
          </button>
        </motion.div>
      </div>

      <motion.div
        variants={variants.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6 w-full min-w-0"
        layout={reduced ? false : true}
      >
        {/* Center / hero — first on mobile */}
        <section className="lg:col-span-6 flex flex-col gap-4 sm:gap-5 order-1 lg:order-2 min-w-0">
          <motion.div variants={variants.item} layout="position" className="min-w-0">
            <PlantSection growth={growth} stage={safeStage} status={plantStatus} reducedMotion={reduced} />
          </motion.div>
          <motion.div variants={variants.item} layout="position" className="min-w-0">
            <OverviewChart transactions={transactions} />
          </motion.div>
          <motion.div variants={variants.item} layout="position" className="min-w-0">
            <ActionButtons />
          </motion.div>
        </section>

        {/* Left column */}
        <aside className="lg:col-span-3 flex flex-col gap-4 sm:gap-5 order-2 lg:order-1 min-w-0">
          <motion.div variants={variants.item} layout="position">
            <HeroCard savings={savings} income={income} expense={expense} />
          </motion.div>
          <motion.div variants={variants.item} layout="position" className="min-h-0">
            <DreamVault />
          </motion.div>
          <motion.div variants={variants.item} layout="position">
            <StreakCard streak={streak} />
          </motion.div>
          <motion.div variants={variants.item} layout="position">
            <RecentActivity transactions={transactions?.filter(tx => tx.date !== undefined) || []} />
          </motion.div>
        </aside>

        {/* Right column */}
        <aside className="lg:col-span-3 flex flex-col gap-4 sm:gap-5 order-3 min-w-0">
          <motion.div variants={variants.item} layout="position">
            <InsightCard message={aiInsight.message} tone={aiInsight.tone} />
          </motion.div>
          <motion.div variants={variants.item} layout="position">
            <SafeToSpendCard income={income} expense={expense} />
          </motion.div>
          <motion.div variants={variants.item} layout="position" className="min-h-0 flex-1">
            <LeaderboardList users={leaderboard} loading={leaderboardLoading} />
          </motion.div>
          <motion.div variants={variants.item} layout="position">
            <QuickActions />
          </motion.div>
        </aside>
      </motion.div>
    </div>
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