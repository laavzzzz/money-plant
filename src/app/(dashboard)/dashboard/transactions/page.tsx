"use client";

import React, { useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  Car,
  Banknote,
  TrendingUp,
  ShoppingBag,
  Film,
  Activity,
  Home,
  Heart,
  Zap,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useSharedTransactions } from "@/components/providers/FinanceProvider";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import type { Transaction } from "@/hooks/useTransactions";

/**
 * Strict literal types for runtime category filtering
 */
const CATEGORIES = ["All", "Income", "Expense"] as const;
type CategoryTab = (typeof CATEGORIES)[number];

interface IconConfig {
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

/**
 * High-performance mapping configurations for localized search tokens.
 * Optimizes structural lookup complexity to O(1) matching vectors.
 */
const INCOME_KEYWORDS: { keywords: string[]; config: IconConfig }[] = [
  { keywords: ["salary", "job", "paycheck"], config: { icon: Banknote, colorClass: "text-green-500" } },
  { keywords: ["freelance", "gig", "project"], config: { icon: TrendingUp, colorClass: "text-emerald-500" } },
  { keywords: ["gift", "bonus", "reward"], config: { icon: Heart, colorClass: "text-pink-500" } },
  { keywords: ["dividend", "invest", "interest"], config: { icon: TrendingUp, colorClass: "text-blue-500" } },
  { keywords: ["sale", "refund"], config: { icon: Zap, colorClass: "text-yellow-500" } },
];

const EXPENSE_KEYWORDS: { keywords: string[]; config: IconConfig }[] = [
  { keywords: ["food", "drink", "coffee", "☕", "dining", "restaurant"], config: { icon: Coffee, colorClass: "text-orange-500" } },
  { keywords: ["transport", "taxi", "fuel", "🚕", "car", "bus", "train"], config: { icon: Car, colorClass: "text-blue-400" } },
  { keywords: ["shopping", "clothes", "amazon", "🛍️", "grocery"], config: { icon: ShoppingBag, colorClass: "text-purple-500" } },
  { keywords: ["entertainment", "movie", "game", "netflix", "subscription"], config: { icon: Film, colorClass: "text-rose-500" } },
  { keywords: ["health", "gym", "medicine", "doctor", "fitness"], config: { icon: Activity, colorClass: "text-red-500" } },
  { keywords: ["home", "rent", "utilities", "electricity", "water", "maintenance"], config: { icon: Home, colorClass: "text-amber-600" } },
  { keywords: ["tech", "mobile", "gadget", "electronics"], config: { icon: Smartphone, colorClass: "text-slate-500" } },
  { keywords: ["education", "book", "course", "learning"], config: { icon: TrendingUp, colorClass: "text-cyan-500" } },
  { keywords: ["travel", "flight", "hotel", "vacation"], config: { icon: Zap, colorClass: "text-indigo-500" } },
  { keywords: ["insurance", "tax", "fee"], config: { icon: Zap, colorClass: "text-gray-500" } },
];

/**
 * Resolves contextually relevant structural iconography based on matching categories.
 */
function getCategoryIcon(category: string, type: "income" | "expense"): React.ReactNode {
  const normalized = category.toLowerCase().trim();
  const ruleSet = type === "income" ? INCOME_KEYWORDS : EXPENSE_KEYWORDS;

  for (const rule of ruleSet) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      const IconComponent = rule.config.icon;
      return <IconComponent className={rule.config.colorClass} />;
    }
  }

  const FallbackIcon = type === "income" ? ArrowDownLeft : ArrowUpRight;
  return <FallbackIcon className={type === "income" ? "text-green-500" : "text-red-500"} />;
}

/**
 * Enterprise-grade internal Indian Rupee localized structural string formatter.
 */
function formatCurrency(value: number): string {
  try {
    return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  } catch (e) {
    return `₹${value.toFixed(2)}`;
  }
}

/**
 * Active Dashboard View Ledger for tracking client cashflows, filtering transactions,
 * and presenting modern analytical data visual modules.
 */
export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("All");
  const [search, setSearch] = useState("");
  
  const { transactions = [], loading, error } = useSharedTransactions();
  const { openAdd } = useTransactionModal();

  const tabListId = useId();
  const historyPanelId = useId();

  // High-performance clean matrix token filtering logic
  const filteredTransactions = useMemo(() => {
    const searchToken = search.toLowerCase().trim();
    return transactions.filter((tx: Transaction) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Income" && tx.type === "income") ||
        (activeTab === "Expense" && tx.type === "expense");

      const matchesSearch =
        !searchToken ||
        tx.title.toLowerCase().includes(searchToken) ||
        tx.category.toLowerCase().includes(searchToken);

      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  // Aggregated linear mathematical metric matrix
  const metrics = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === "income") {
          acc.income += amount;
        } else if (tx.type === "expense") {
          acc.expense += amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const netBalance = metrics.income - metrics.expense;

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 max-w-7xl mx-auto px-1">
      {/* Structural Interactive Header Layer */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
            Transactions
          </p>
          <h1 className="text-3xl font-black text-text-main tracking-tight">
            Track your money flow
          </h1>
          <p className="text-sm text-text-light mt-2 max-w-2xl">
            See every income and expense move, then use quick filters to spot winning habits.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => openAdd("income")}
            leftIcon={<ArrowDownLeft size={16} />}
            className="font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-primary"
          >
            Add income
          </Button>
          <Button
            type="button"
            variant="vibe"
            size="sm"
            onClick={() => openAdd("expense")}
            leftIcon={<Plus size={16} />}
            className="font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-primary"
          >
            Add expense
          </Button>
        </div>
      </header>

      {/* Metric Dashboard Analytic Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Financial summary cards">
        <StatPill 
          label="Income" 
          value={formatCurrency(metrics.income)} 
          icon={<ArrowDownLeft size={18} className="text-green-500" />} 
        />
        <StatPill 
          label="Expense" 
          value={formatCurrency(metrics.expense)} 
          icon={<ArrowUpRight size={18} className="text-orange-500" />} 
        />
        <StatPill 
          label="Net" 
          value={formatCurrency(netBalance)} 
          icon={<TrendingUp size={18} className={netBalance >= 0 ? "text-primary" : "text-red-500"} />} 
        />
      </div>

      {/* Filtering Operations Interface Row */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center gap-3">
          <p className="text-xs font-bold text-text-light uppercase tracking-widest hidden sm:block">
            Filter & search
          </p>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="rounded-2xl shrink-0 ml-auto focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => openAdd("expense")}
            aria-label="Create new ledger entry"
          >
            <Plus size={20} />
          </Button>
        </div>
        
        <Input
          placeholder="Search transactions by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={20} className="text-text-light" />}
          className="border-none shadow-vibe bg-white/40 dark:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary w-full"
          aria-label="Search ledger transactions"
        />
      </section>

      {/* Accessible WAI-ARIA Compliant Tab Navigation Elements */}
      <div 
        className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-full w-fit"
        role="tablist"
        id={tabListId}
        aria-label="Filter transaction history views"
      >
        {CATEGORIES.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={historyPanelId}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                  : "text-text-light hover:text-text-main"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Central Feedback/Ledger Execution Target Wrapper */}
      <section 
        id={historyPanelId} 
        role="tabpanel" 
        aria-labelledby={tabListId} 
        className="space-y-4 min-h-[150px] relative"
      >
        {loading && (
          <div className="flex justify-center items-center py-12" aria-live="polite">
            <p className="text-sm font-bold text-text-light animate-pulse tracking-wide">
              Loading financial history matrix…
            </p>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl" aria-live="assertive">
            <p className="text-center text-sm font-bold text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((tx, index) => {
              const executionId = tx.id ?? tx._id ?? `tx-idx-${index}`;
              const isIncome = tx.type === "income";

              return (
                <motion.div
                  key={executionId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
                >
                  <GlassCard clickable hover={false} className="p-4 group relative overflow-hidden">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={cn(
                            "p-3 rounded-2xl shrink-0 transition-colors",
                            isIncome ? "bg-green-500/10 dark:bg-green-500/20" : "bg-orange-500/10 dark:bg-orange-500/20"
                          )}
                          aria-hidden="true"
                        >
                          {getCategoryIcon(tx.category, tx.type as "income" | "expense")}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-text-main tracking-tight truncate">
                            {tx.title}
                          </h4>
                          <p className="text-[10px] font-bold text-text-light uppercase tracking-widest truncate mt-0.5">
                            {tx.category} • <span className="sr-only">Type:</span>{tx.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "font-black text-lg tracking-tight",
                            isIncome ? "text-green-500" : "text-text-main"
                          )}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && !error && filteredTransactions.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
            <p className="text-sm text-text-light font-bold">
              No transactions found matching the current filters. Tap + to log your first vibe!
            </p>
          </div>
        )}
      </section>

      {/* Floating Action Button Interface Access Vector */}
      <button
        type="button"
        onClick={() => openAdd("expense")}
        className="fixed bottom-8 right-4 sm:right-6 z-40 p-4 bg-vibe-purple text-white rounded-full shadow-vibe transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-vibe-purple/40"
        aria-label="Quick log expense item"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
}

interface StatPillProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

/**
 * Isolated presentational display card optimized for high-performance reading layout trees.
 */
function StatPill({ label, value, icon }: StatPillProps) {
  return (
    <div className="glass-panel p-4 rounded-3xl flex items-center gap-3 bg-white/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm">
      <div className="w-11 h-11 grid place-items-center rounded-2xl bg-black/5 dark:bg-white/5 shrink-0" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light truncate">
          {label}
        </p>
        <p className="text-lg font-black text-text-main mt-0.5 tracking-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}