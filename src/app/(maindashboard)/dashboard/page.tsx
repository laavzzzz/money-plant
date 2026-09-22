/**
 * @file src/app/(maindashboard)/dashboard/page.tsx
 * @module MainDashboardPage
 * @description Enterprise Financial Dashboard Home Page for MoneyPlant.
 * Performs server-side session authentication, fetches user-scoped MongoDB financial
 * metrics, enforces complete data isolation between accounts, and renders real-time
 * financial overview statistics with intentional zero-data empty states and elite UI loading skeletons.
 *
 * @version 4.0.0
 * @author Senior Principal Full-Stack Architecture Team
 */

import React, { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth, type SessionUser } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { Transaction as TransactionModel } from "@/models/Transaction";
import { Goal as GoalModel } from "@/models/Goal";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Receipt,
} from "lucide-react";

// Enforce dynamic server-side rendering for authenticated user dashboard
export const dynamic = "force-dynamic";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN INTERFACES
// ============================================================================

interface FinancialMetrics {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netSavings: number;
  readonly savingsRate: number;
  readonly transactionCount: number;
  readonly activeGoalsCount: number;
}

interface RecentTransactionItem {
  readonly id: string;
  readonly type: "income" | "expense";
  readonly amount: number;
  readonly category: string;
  readonly description: string;
  readonly date: string;
}

interface IMongoRecentTransaction {
  readonly _id: unknown;
  readonly type?: string;
  readonly amount?: number;
  readonly category?: string;
  readonly description?: string;
  readonly title?: string;
  readonly date?: Date | string;
}

// ============================================================================
// SERVER DATA FETCHING SERVICES
// ============================================================================

/**
 * Aggregates real-time financial metrics for the authenticated user from MongoDB.
 * Ensures strict multi-tenant isolation by filtering queries exclusively on userId.
 */
async function fetchUserDashboardMetrics(userId: string): Promise<{
  readonly metrics: FinancialMetrics;
  readonly recentTransactions: readonly RecentTransactionItem[];
}> {
  try {
    await dbConnect();

    // 1. Execute parallelized MongoDB aggregation queries scoped to authenticated user
    const [incomeAggregate, expenseAggregate, totalCount, activeGoals, recentDocs] =
      await Promise.all([
        TransactionModel.aggregate([
          { $match: { userId, type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        TransactionModel.aggregate([
          { $match: { userId, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        TransactionModel.countDocuments({ userId }),
        GoalModel.countDocuments({ userId, status: "in_progress" }),
        TransactionModel.find({ userId })
          .sort({ date: -1 })
          .limit(5)
          .lean(),
      ]);

    const totalIncome = incomeAggregate[0]?.total || 0;
    const totalExpenses = expenseAggregate[0]?.total || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, Number(((netSavings / totalIncome) * 100).toFixed(1))) : 0;

    const typedRecentDocs = recentDocs as unknown as readonly IMongoRecentTransaction[];

    const recentTransactions: readonly RecentTransactionItem[] = typedRecentDocs.map((doc) => ({
      id: String(doc._id),
      type: doc.type === "income" ? "income" : "expense",
      amount: Number(doc.amount || 0),
      category: String(doc.category || "General"),
      description: String(doc.description || doc.title || "Transaction"),
      date: doc.date ? new Date(doc.date).toISOString().split("T")[0] : "Recent",
    }));

    return {
      metrics: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        transactionCount: totalCount,
        activeGoalsCount: activeGoals,
      },
      recentTransactions,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[DashboardData] Error aggregating financial metrics:", errorMessage);
    return {
      metrics: {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
        transactionCount: 0,
        activeGoalsCount: 0,
      },
      recentTransactions: [],
    };
  }
}

// ============================================================================
// HELPER COMPONENT SECTIONS
// ============================================================================

function MetricCard({
  title,
  amount,
  isCurrency = true,
  subtitle,
  icon: Icon,
  accentColor,
}: {
  readonly title: string;
  readonly amount: number | string;
  readonly isCurrency?: boolean;
  readonly subtitle: string;
  readonly icon: React.ElementType;
  readonly accentColor: string;
}) {
  const formattedValue =
    isCurrency && typeof amount === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(amount)
      : amount;

  return (
    <div className="bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-light)]">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${accentColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)] mb-1">
        {formattedValue}
      </div>
      <p className="text-[10px] font-semibold text-[var(--text-light)] opacity-70">
        {subtitle}
      </p>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON FALLBACK COMPONENT
// ============================================================================

function DashboardSkeleton(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-4 sm:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/10 rounded-full" />
          <div className="h-8 w-64 bg-white/10 rounded-2xl" />
        </div>
        <div className="h-12 w-44 bg-white/10 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`skeleton-card-${i}`} className="h-36 bg-white/5 rounded-3xl border border-white/10" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-96 bg-white/5 rounded-3xl border border-white/10" />
      </div>
    </main>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function DashboardPage(): Promise<React.ReactElement> {
  let user: SessionUser;

  try {
    user = await requireAuth();
  } catch {
    redirect("/login");
  }

  const { metrics, recentTransactions } = await fetchUserDashboardMetrics(user.id);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-4 sm:p-8 lg:p-12 space-y-8 max-w-7xl mx-auto">
        {/* Header Navigation Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">
              <Sparkles size={14} /> Real-Time Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs font-bold text-[var(--text-light)] mt-1">
              Account Scoped ID: <span className="font-mono text-white/80">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-lg"
            >
              <PlusCircle size={16} /> Record Transaction
            </Link>
          </div>
        </header>

        {/* Core Financial Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Income"
            amount={metrics.totalIncome}
            subtitle="Real recorded earnings"
            icon={TrendingUp}
            accentColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          />
          <MetricCard
            title="Total Expenses"
            amount={metrics.totalExpenses}
            subtitle="Real recorded outgoings"
            icon={TrendingDown}
            accentColor="bg-red-500/10 text-red-400 border border-red-500/20"
          />
          <MetricCard
            title="Net Savings"
            amount={metrics.netSavings}
            subtitle="Income minus expenses"
            icon={Wallet}
            accentColor="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
          />
          <MetricCard
            title="Savings Rate"
            amount={`${metrics.savingsRate}%`}
            isCurrency={false}
            subtitle="Efficiency calculation"
            icon={PiggyBank}
            accentColor="bg-blue-500/10 text-blue-400 border border-blue-500/20"
          />
        </section>

        {/* Dashboard Content split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity List */}
          <section className="lg:col-span-2 bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase italic">Recent Transactions</h2>
                <p className="text-[10px] font-bold text-[var(--text-light)] uppercase tracking-wider">
                  Verified MongoDB Ledger
                </p>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-black text-yellow-400 hover:underline flex items-center gap-1 uppercase tracking-wider"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
                <Receipt size={32} className="mx-auto text-[var(--text-light)]/40" />
                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-light)]">
                  No transactions recorded yet
                </p>
                <p className="text-xs text-[var(--text-light)]/60 max-w-sm mx-auto">
                  Your ledger is clean. Click below to add your first income or expense entry.
                </p>
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                >
                  <PlusCircle size={14} /> Add First Entry
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                          {tx.description}
                        </p>
                        <p className="text-[10px] font-bold text-[var(--text-light)]">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-black tracking-tight ${
                        tx.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Shortcuts & Account Health */}
          <section className="space-y-6">
            <div className="bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black uppercase italic flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" /> Platform Actions
              </h2>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/goals"
                  className="p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Target size={18} className="text-yellow-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Financial Goals</p>
                      <p className="text-[10px] text-[var(--text-light)]">
                        {metrics.activeGoalsCount} Active Goals
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/analytics"
                  className="p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">VibeCheck Analytics</p>
                      <p className="text-[10px] text-[var(--text-light)]">AI Cash Flow Audit</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck size={16} /> Account Security Status
              </div>
              <p className="text-xs text-[var(--text-light)] leading-relaxed">
                All records strictly isolated under your authenticated user key.
              </p>
            </div>
          </section>
        </div>
      </main>
    </Suspense>
  );
}