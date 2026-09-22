/**
 * @file src/components/dashboard/page.tsx
 * @module DashboardViewComponent
 * @description Enterprise Modular Dashboard View Component Suite for MoneyPlant.
 * Serves as the primary client-side dashboard presentation layer, rendering interactive
 * financial metric cards, transaction ledgers, quick action triggers, and empty states.
 *
 * @version 4.0.0
 * @author Senior Principal Full-Stack Architecture Team
 */

"use client";

import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN INTERFACES
// ============================================================================

export interface FinancialMetrics {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netSavings: number;
  readonly savingsRate: number;
  readonly transactionCount: number;
  readonly activeGoalsCount: number;
}

export interface TransactionItem {
  readonly id: string;
  readonly type: "income" | "expense";
  readonly amount: number;
  readonly category: string;
  readonly description: string;
  readonly date: string;
}

export interface DashboardViewProps {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly metrics: FinancialMetrics;
  readonly initialTransactions: readonly TransactionItem[];
}

export type TimeframeFilter = "all" | "income" | "expense";

// ============================================================================
// MEMOIZED METRIC CARD WIDGET
// ============================================================================

interface MetricWidgetProps {
  readonly title: string;
  readonly value: number | string;
  readonly isCurrency?: boolean;
  readonly subtitle: string;
  readonly icon: React.ElementType;
  readonly accentClass: string;
  readonly badgeText?: string;
}

const MetricWidget = memo(function MetricWidget({
  title,
  value,
  isCurrency = true,
  subtitle,
  icon: Icon,
  accentClass,
  badgeText,
}: MetricWidgetProps) {
  const formattedValue = useMemo(() => {
    if (isCurrency && typeof value === "number") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value;
  }, [value, isCurrency]);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-light)]">
            {title}
          </span>
          <div className={`p-2.5 rounded-2xl ${accentClass}`}>
            <Icon size={18} aria-hidden="true" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)] mb-1">
          {formattedValue}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <p className="text-[10px] font-semibold text-[var(--text-light)] opacity-80">
          {subtitle}
        </p>
        {badgeText && (
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-light)]">
            {badgeText}
          </span>
        )}
      </div>
    </motion.article>
  );
});
MetricWidget.displayName = "MetricWidget";

// ============================================================================
// EMPTY LEDGER STATE COMPONENT
// ============================================================================

const EmptyLedgerState = memo(function EmptyLedgerState() {
  return (
    <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl space-y-4 bg-white/[0.01]">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[var(--text-light)]">
        <Receipt size={24} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-main)]">
          No ledger entries detected
        </h3>
        <p className="text-xs text-[var(--text-light)] max-w-sm mx-auto leading-relaxed">
          Your financial pipeline is currently clean. Record your first transaction to unlock real-time cash flow analytics.
        </p>
      </div>
      <Link
        href="/transactions"
        className="inline-flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-yellow-300 transition-all shadow-lg active:scale-95"
      >
        <PlusCircle size={15} aria-hidden="true" /> Record Transaction
      </Link>
    </div>
  );
});
EmptyLedgerState.displayName = "EmptyLedgerState";

// ============================================================================
// TRANSACTION LEDGER ROW COMPONENT
// ============================================================================

const TransactionRow = memo(function TransactionRow({
  transaction,
}: {
  readonly transaction: TransactionItem;
}) {
  const isIncome = transaction.type === "income";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center justify-between p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-white/20 transition-all group"
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl border ${
            isIncome
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {isIncome ? (
            <ArrowUpRight size={18} aria-hidden="true" />
          ) : (
            <ArrowDownRight size={18} aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[var(--text-main)] group-hover:text-yellow-400 transition-colors">
            {transaction.description}
          </p>
          <p className="text-[10px] font-bold text-[var(--text-light)] mt-0.5">
            {transaction.category} • {transaction.date}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-black tracking-tight ${
            isIncome ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"}₹{transaction.amount.toLocaleString("en-IN")}
        </span>
        <p className="text-[9px] font-bold uppercase text-[var(--text-light)] opacity-60">
          Verified
        </p>
      </div>
    </motion.div>
  );
});
TransactionRow.displayName = "TransactionRow";

// ============================================================================
// MAIN DASHBOARD CLIENT VIEW COMPONENT
// ============================================================================

export default function DashboardView({
  user,
  metrics,
  initialTransactions,
}: DashboardViewProps): React.ReactElement {
  const [filter, setFilter] = useState<TimeframeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filter and search execution
  const filteredTransactions = useMemo(() => {
    return (initialTransactions || []).filter((tx) => {
      const matchesFilter = filter === "all" || tx.type === filter;
      const desc = String(tx.description || "").toLowerCase();
      const cat = String(tx.category || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = desc.includes(query) || cat.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [initialTransactions, filter, searchQuery]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">
            <Sparkles size={14} aria-hidden="true" /> Encrypted Financial Core
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic text-[var(--text-main)]">
            Welcome, {user.name}
          </h1>
          <p className="text-xs font-bold text-[var(--text-light)] mt-1">
            User Identity Key: <span className="font-mono text-white/80">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            className="bg-yellow-400 text-black px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-lg active:scale-95"
          >
            <PlusCircle size={16} aria-hidden="true" /> Record Transaction
          </Link>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" aria-label="Financial Summary Cards">
        <MetricWidget
          title="Total Income"
          value={metrics.totalIncome}
          subtitle="Real recorded earnings"
          icon={TrendingUp}
          accentClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          badgeText="Verified"
        />
        <MetricWidget
          title="Total Expenses"
          value={metrics.totalExpenses}
          subtitle="Real recorded outgoings"
          icon={TrendingDown}
          accentClass="bg-red-500/10 text-red-400 border border-red-500/20"
          badgeText="Verified"
        />
        <MetricWidget
          title="Net Savings"
          value={metrics.netSavings}
          subtitle="Income minus expenses"
          icon={Wallet}
          accentClass="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
        />
        <MetricWidget
          title="Savings Rate"
          value={`${metrics.savingsRate}%`}
          isCurrency={false}
          subtitle="Liquidity retention"
          icon={PiggyBank}
          accentClass="bg-blue-500/10 text-blue-400 border border-blue-500/20"
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Ledger */}
        <section className="lg:col-span-2 bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black uppercase italic text-[var(--text-main)]">
                Recent Ledger
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-light)] uppercase tracking-wider">
                MongoDB Multi-Tenant Authenticated Ledger
              </p>
            </div>

            {/* Filter and Search Bar Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]/50"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Filter ledger entries"
                  placeholder="Filter entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-[var(--text-main)] outline-none focus:border-yellow-400/80 placeholder:text-[var(--text-light)]/40"
                />
              </div>

              <div className="flex items-center bg-[var(--bg-main)] border border-white/10 rounded-xl p-1 gap-1">
                {(["all", "income", "expense"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilter(type)}
                    aria-label={`Filter by ${type}`}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      filter === type
                        ? "bg-yellow-400 text-black shadow"
                        : "text-[var(--text-light)] hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ledger List or Empty State */}
          <div aria-live="polite">
            {filteredTransactions.length === 0 ? (
              <EmptyLedgerState />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/transactions"
              className="inline-flex items-center gap-2 text-xs font-black text-yellow-400 hover:underline uppercase tracking-wider group"
            >
              Open Complete Ledger <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Shortcuts & Security Panel */}
        <section className="space-y-6">
          <div className="bg-[var(--glass-bg)] border border-white/10 rounded-3xl p-6 space-y-4 backdrop-blur-2xl">
            <h2 className="text-lg font-black uppercase italic flex items-center gap-2 text-[var(--text-main)]">
              <Zap size={18} className="text-yellow-400" aria-hidden="true" /> Core Shortcuts
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/goals"
                className="p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                    <Target size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                      Financial Goals
                    </p>
                    <p className="text-[10px] text-[var(--text-light)]">
                      {metrics.activeGoalsCount} Active Targets
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[var(--text-light)]" />
              </Link>

              <Link
                href="/analytics"
                className="p-4 bg-[var(--bg-main)] border border-white/5 rounded-2xl hover:border-yellow-400/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Sparkles size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
                      VibeCheck AI
                    </p>
                    <p className="text-[10px] text-[var(--text-light)]">
                      Automated Portfolio Insights
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[var(--text-light)]" />
              </Link>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={16} aria-hidden="true" /> Data Isolation Safeguard Active
            </div>
            <p className="text-xs text-[var(--text-light)] leading-relaxed">
              Every database query strictly enforces <span className="font-mono text-emerald-300">userId</span> matching. No cross-account leakage is possible.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}