"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Plus, Target, Sparkles } from "lucide-react";

/* 🏗️ CORE COMPONENTS */
import AppLayout from "@/components/layout/AppLayout";
import HeroCard from "@/components/dashboard/HeroCard";
import PlantSection from "@/components/dashboard/PlantSection";
import SafeToSpendCard from "@/components/dashboard/SafeToSpendCard";
import StreakCard from "@/components/dashboard/StreakCard";
import OverviewChart from "@/components/dashboard/OverviewChart";
import QuickActions from "@/components/dashboard/QuickActions";
import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import InsightCard from "@/components/analytics/AIInsightCard";

/* 🎣 CUSTOM HOOKS & LOGIC */
import { useTransactions } from "@/hooks/useTransactions";
import { usePlant } from "@/hooks/usePlant";
import { useStreak } from "@/hooks/useStreak";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { generateAIInsight } from "@/lib/ai";

/* 🎬 PREMIUM MOTION VARIANTS */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/* ☁️ DREAM VAULT COMPONENT (Internal for clean layout) */
const DreamVault = () => (
  <div className="glass-panel p-6 h-full flex flex-col relative group overflow-hidden">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
          Dream Vault <Sparkles size={18} className="text-secondary" />
        </h3>
        <p className="label-caps opacity-60">Manifesting wealth</p>
      </div>
      <button className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl transition-all active:scale-90">
        <Plus size={24} />
      </button>
    </div>

    {/* Example Items - This would map through user data */}
    <div className="space-y-4">
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">🎸</div>
          <div>
            <p className="font-bold text-sm">Fender Strat</p>
            <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">$1,200.00</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-primary">85%</p>
          <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">🧥</div>
          <div>
            <p className="font-bold text-sm">Zara Jacket</p>
            <p className="text-[10px] opacity-50 uppercase font-black tracking-widest">Target: Oct</p>
          </div>
        </div>
        <Target size={16} className="text-text-light" />
      </div>
    </div>
    
    {/* Background Glow */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />
  </div>
);

export default function Dashboard() {
  /* 📊 DATA FETCHING */
  const { transactions, loading, error } = useTransactions();
  const { streak } = useStreak();
  const { data: leaderboard, loading: leaderboardLoading } = useLeaderboard();

  /* 🌿 PLANT & ANALYTICS LOGIC */
  const {
    income,
    expense,
    savings,
    growth,
    plantStage,
    status,
  } = usePlant(transactions);

  const aiInsight = useMemo(() => 
    generateAIInsight({ income, expense }), 
    [income, expense]
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!transactions?.length) return <EmptyState />;

  const safeStage = plantStage ?? { level: 1, name: "Seed", min: 0 };

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-[1800px] mx-auto pb-24"
      >
        
        {/* 💰 LEFT COLUMN (Desktop: Spans 3) */}
        <div className="md:col-span-3 space-y-6 flex flex-col">
          <motion.div variants={itemVariants}>
            <HeroCard savings={savings} income={income} expense={expense} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex-1">
            <DreamVault />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StreakCard streak={streak} />
          </motion.div>
        </div>

        {/* 🌿 CENTER COLUMN (Desktop: Spans 6) */}
        <div className="md:col-span-6 space-y-6 flex flex-col">
          <motion.div variants={itemVariants} className="flex-1 min-h-[500px]">
            <PlantSection 
              growth={growth} 
              stage={safeStage} 
              status={status} 
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
             <OverviewChart transactions={transactions} />
          </motion.div>
        </div>

        {/* 🏆 RIGHT COLUMN (Desktop: Spans 3) */}
        <div className="md:col-span-3 space-y-6 flex flex-col">
          <motion.div variants={itemVariants}>
            <InsightCard message={aiInsight.message} tone={aiInsight.tone} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SafeToSpendCard income={income} expense={expense} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex-1">
            <LeaderboardList 
              users={leaderboard} 
              loading={leaderboardLoading} 
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>
        </div>

      </motion.div>
    </AppLayout>
  );
}

/* 🌿 SKELETON LOADER */
function DashboardSkeleton() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse px-6">
        <div className="md:col-span-3 space-y-6">
          <div className="h-32 rounded-3xl bg-gray-200/40" />
          <div className="h-64 rounded-3xl bg-gray-200/40" />
        </div>
        <div className="md:col-span-6 h-[600px] rounded-[40px] bg-gray-200/40" />
        <div className="md:col-span-3 h-[600px] rounded-3xl bg-gray-200/40" />
      </div>
    </AppLayout>
  );
}

/* ❌ ERROR STATE */
function ErrorState({ message }: { message: string }) {
  return (
    <AppLayout>
      <div className="flex flex-col justify-center items-center h-[70vh] text-center px-6 w-full">
        <div className="glass-panel p-12 rounded-[40px] border-red-500/20">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-400 text-lg font-bold">Garden Sync Interrupted</p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">{message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 bg-white/5 hover:bg-white/10 px-8 py-3 rounded-full text-sm font-bold border border-white/10 transition-all"
          >
            Re-sync System
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

/* 🌱 EMPTY STATE */
function EmptyState() {
  return (
    <AppLayout>
      <div className="flex flex-col justify-center items-center h-[75vh] text-center px-6 w-full">
        <div className="glass-panel p-16 rounded-[50px] border-dashed border-2 border-primary/20">
          <p className="text-5xl mb-6">🌱</p>
          <h2 className="text-3xl font-black mb-4">Plant Your Seeds</h2>
          <p className="text-sm text-gray-400 max-w-sm mb-8">
            Your MoneyPlant needs data to grow. Add your first spending or income log to begin your financial garden.
          </p>
          <button className="bg-primary text-white px-10 py-4 rounded-full font-black shadow-[0_10px_30px_rgba(195,172,255,0.4)] hover:scale-105 transition-transform">
            Add First Log
          </button>
        </div>
      </div>
    </AppLayout>
  );
}