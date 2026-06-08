"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  Car,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useSharedTransactions } from "@/components/providers/FinanceProvider";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import type { Transaction } from "@/hooks/useTransactions";

const CATEGORIES = ["All", "Income", "Expense"] as const;

function iconForCategory(category: string, type: string) {
  if (type === "income") return <Banknote className="text-green-500" />;
  if (category.toLowerCase().includes("food") || category.includes("☕"))
    return <Coffee className="text-orange-500" />;
  if (category.toLowerCase().includes("transport") || category.includes("🚕"))
    return <Car className="text-primary" />;
  return type === "income" ? (
    <ArrowDownLeft className="text-green-500" />
  ) : (
    <ArrowUpRight className="text-red-500" />
  );
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<(typeof CATEGORIES)[number]>("All");
  const [search, setSearch] = useState("");
  const { transactions, loading, error } = useSharedTransactions();
  const { openAdd } = useTransactionModal();

  const filtered = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "Income" && tx.type === "income") ||
        (activeTab === "Expense" && tx.type === "expense");
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [transactions, activeTab, search]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === "income") {
          acc.income += tx.amount;
        } else {
          acc.expense += tx.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
            Transactions
          </p>
          <h1 className="text-3xl font-black text-text-main">Track your money flow</h1>
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
          >
            Add income
          </Button>
          <Button
            type="button"
            variant="vibe"
            size="sm"
            onClick={() => openAdd("expense")}
            leftIcon={<Plus size={16} />}
          >
            Add expense
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatPill label="Income" value={`₹${totals.income.toLocaleString("en-IN")}`} icon={<ArrowDownLeft size={18} className="text-green-500" />} />
        <StatPill label="Expense" value={`₹${totals.expense.toLocaleString("en-IN")}`} icon={<ArrowUpRight size={18} className="text-orange-500" />} />
        <StatPill label="Net" value={`₹${(totals.income - totals.expense).toLocaleString("en-IN")}`} icon={<TrendingUp size={18} className="text-primary" />} />
      </div>

      <section className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center gap-3">
            <p className="text-xs font-bold text-text-light uppercase tracking-widest hidden sm:block">
              Filter & search
            </p>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-2xl shrink-0 ml-auto"
              onClick={() => openAdd("expense")}
              aria-label="Add transaction"
            >
              <Plus size={20} />
            </Button>
          </div>
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={20} className="text-text-light" />}
            className="border-none shadow-vibe bg-white/40 dark:bg-white/5"
          />
        </section>

        <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-full w-fit">
          {CATEGORIES.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter transition-all",
                activeTab === tab
                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                  : "text-text-light hover:text-text-main"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-sm font-bold text-text-light animate-pulse">
            Loading history…
          </p>
        )}
        {error && (
          <p className="text-center text-sm font-bold text-red-500">{error}</p>
        )}

        <section className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((tx, index) => (
              <motion.div
                key={tx._id ?? index}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard clickable hover={false} className="p-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-2xl",
                          tx.type === "income" ? "bg-green-500/10" : "bg-orange-500/10"
                        )}
                      >
                        {iconForCategory(tx.category, tx.type)}
                      </div>
                      <div>
                        <h4 className="font-black text-text-main tracking-tight">
                          {tx.title}
                        </h4>
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-widest">
                          {tx.category} • {tx.type}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "font-black text-lg",
                        tx.type === "income" ? "text-green-500" : "text-text-main"
                      )}
                    >
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && filtered.length === 0 && (
            <p className="text-center text-sm text-text-light font-bold py-8">
              No transactions yet. Tap + to log your first vibe!
            </p>
          )}
        </section>

        <button
          type="button"
          onClick={() => openAdd("expense")}
          className="fixed bottom-8 right-4 sm:right-6 z-40 p-4 bg-vibe-purple text-white rounded-full shadow-vibe hover:scale-110 active:scale-95"
          aria-label="Add transaction"
        >
          <Plus size={28} strokeWidth={3} />
        </button>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-panel p-4 rounded-3xl flex items-center gap-3">
      <div className="w-11 h-11 grid place-items-center rounded-3xl bg-black/5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light">
          {label}
        </p>
        <p className="text-lg font-black text-text-main mt-1">{value}</p>
      </div>
    </div>
  );
}
