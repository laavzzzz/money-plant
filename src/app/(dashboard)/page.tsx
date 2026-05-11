"use client";

import AppLayout from "@/components/layout/AppLayout";
import HeroCard from "@/components/dashboard/HeroCard";
import PlantSection from "@/components/dashboard/PlantSection";
import SafeToSpendCard from "@/components/dashboard/SafeToSpendCard";
import StreakCard from "@/components/dashboard/StreakCard";
import OverviewChart from "@/components/dashboard/OverviewChart";
import QuickActions from "@/components/dashboard/QuickActions";

import LeaderboardList from "@/components/leaderboard/LeaderboardList";
import InsightCard from "@/components/analytics/AIInsightCard";

import { useTransactions } from "@/hooks/useTransactions";
import { usePlant } from "@/hooks/usePlant";
import { useStreak } from "@/hooks/useStreak";
import { useLeaderboard } from "@/hooks/useLeaderboard";

import { generateAIInsight } from "@/lib/ai";

import { motion, Variants } from "framer-motion";

/* 🎬 PREMIUM ANIMATION SYSTEM */
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // ✅ premium easing (no TS error)
    },
  },
};

/* 🌿 SKELETON LOADER */
function DashboardSkeleton() {
  return (
    <AppLayout>
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-gray-200/60" />
        <div className="h-40 rounded-3xl bg-gray-200/60" />
        <div className="h-20 rounded-3xl bg-gray-200/60" />
        <div className="h-20 rounded-3xl bg-gray-200/60" />
      </div>
    </AppLayout>
  );
}

/* ❌ ERROR STATE */
function ErrorState({ message }: { message: string }) {
  return (
    <AppLayout>
      <div className="flex flex-col justify-center items-center h-[70vh] text-center px-6">
        <p className="text-red-400 text-sm font-medium">
          Something went wrong 😢
        </p>
        <p className="text-xs text-gray-400 mt-2">{message}</p>
      </div>
    </AppLayout>
  );
}

/* 🌱 EMPTY STATE */
function EmptyState() {
  return (
    <AppLayout>
      <div className="flex flex-col justify-center items-center h-[70vh] text-center px-6">
        <p className="text-lg font-semibold mb-2">
          🌿 Start your financial journey
        </p>
        <p className="text-sm text-gray-400">
          Add your first transaction to grow your plant
        </p>
      </div>
    </AppLayout>
  );
}

/* 🚀 MAIN COMPONENT */
export default function Dashboard() {
  /* 📊 DATA */
  const { transactions, loading, error } = useTransactions();

  const {
    income,
    expense,
    savings,
    growth,
    plantStage,
    status,
  } = usePlant(transactions);

  const { streak } = useStreak();

  const {
    data: leaderboard,
    loading: leaderboardLoading,
  } = useLeaderboard();

  const { message, tone } = generateAIInsight({
    income,
    expense,
  });

  /* 🔄 STATES */
  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!transactions?.length) return <EmptyState />;

  /* 🌱 SAFE FALLBACK */
  const safeStage = plantStage ?? {
    level: 1,
    name: "Seed",
    min: 0,
  };

  /* 🚀 UI */
  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5 pb-8"
      >
        {/* 💰 HERO */}
        <motion.div variants={item}>
          <HeroCard
            savings={savings}
            income={income}
            expense={expense}
          />
        </motion.div>

        {/* 🌱 PLANT */}
        <motion.div variants={item}>
          <PlantSection
            growth={growth}
            stage={safeStage}
            status={status}
          />
        </motion.div>

        {/* 🤖 AI INSIGHT */}
        <motion.div variants={item}>
          <InsightCard message={message} tone={tone} />
        </motion.div>

        {/* 💸 SAFE TO SPEND */}
        <motion.div variants={item}>
          <SafeToSpendCard
            income={income}
            expense={expense}
          />
        </motion.div>

        {/* 🔥 STREAK */}
        <motion.div variants={item}>
          <StreakCard streak={streak} />
        </motion.div>

        {/* 📊 OVERVIEW */}
        <motion.div variants={item}>
          <OverviewChart transactions={transactions} />
        </motion.div>

        {/* ⚡ QUICK ACTIONS */}
        <motion.div variants={item}>
          <QuickActions />
        </motion.div>

        {/* 🏆 LEADERBOARD */}
        <motion.div variants={item}>
          <LeaderboardList
            users={leaderboard}
            loading={leaderboardLoading}
          />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}