/**
 * @fileoverview High-Performance Transaction Ledger & Historical Audit View Portal
 * @description Enterprise-grade historical transaction management console featuring 
 * multi-tier sorting pipelines, search matching matrices, secure layout boundaries, 
 * standard data exports, and accessibility layer integrations.
 */

"use client";

import React, { useMemo, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock3, 
  Search, 
  X,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { useSharedTransactions } from "@/components/providers/FinanceProvider";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE SCHEMAS & INTERFACES
// ============================================================================

export type TransactionType = "income" | "expense";

/**
 * Transaction interface modeled explicitly to preserve compatibility with 
 * centralized custom hooks architecture where both record identifiers and 
 * creation timestamps can contain unassigned parameters prior to persistence.
 */
export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date?: string; // Patched type variance to accept string | undefined safely
  reference?: string;
}

const TABS = ["All", "Income", "Expense"] as const;
type TabOption = (typeof TABS)[number];

interface TabButtonProps {
  tab: TabOption;
  isActive: boolean;
  onClick: (tab: TabOption) => void;
}

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "neutral";
}

// ============================================================================
// ATOMIC & MEMOIZED SUB-COMPONENTS
// ============================================================================

/**
 * TabButton Component
 * Renders an accessible, animated navigation control tab anchor.
 */
const TabButton = memo(function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls="transaction-grid-panel"
      id={`tab-trigger-${tab.toLowerCase()}`}
      onClick={() => onClick(tab)}
      className={cn(
        "relative px-6 py-2.5 text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        isActive ? "text-black dark:text-white" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      )}
    >
      <span className="relative z-10">{tab}</span>
      {isActive && (
        <motion.div
          layoutId="activeHistoryTabIndicator"
          className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          style={{ willChange: "transform" }}
        />
      )}
    </button>
  );
});

/**
 * StatCard Component
 * Displays decoupled individual balance summary figures with consistent layouts.
 */
const StatCard = memo(function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  return (
    <GlassCard className="p-5 rounded-[24px] border border-neutral-200/10 flex items-center gap-4 bg-gradient-to-br from-white/40 to-white/10 dark:from-neutral-900/40 dark:to-neutral-900/10 shadow-sm">
      <div 
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
          variant === "success" && "bg-green-500/10 text-green-500 border-green-500/10",
          variant === "neutral" && "bg-neutral-500/10 text-neutral-500 border-neutral-500/10",
          variant === "default" && "bg-primary/10 text-primary border-primary/10"
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider font-black text-neutral-400 select-none">{label}</p>
        <p className={cn("text-xl font-black mt-1 tracking-tight truncate", variant === "neutral" ? "text-neutral-800 dark:text-neutral-100" : "")}>
          {value}
        </p>
      </div>
    </GlassCard>
  );
});

/**
 * TransactionRow Component
 * Renders individual rows with hardware-accelerated entrance frames.
 */
const TransactionRow = memo(function TransactionRow({ transaction, index }: TransactionRowProps) {
  const isIncome = transaction.type === "income";
  
  // Format standard Indian Rupee notation values safely
  const formattedCurrency = useMemo(() => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(transaction.amount);
  }, [transaction.amount]);

  // Clean date parsing with system absolute safety fallbacks for undefined evaluations
  const formattedDate = useMemo(() => {
    if (!transaction.date) return "Recent Flow";
    try {
      return new Date(transaction.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return transaction.date || "Recent Flow";
    }
  }, [transaction.date]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.3) }}
      className="group flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all transform-gpu hover:bg-white/60 dark:hover:bg-neutral-900/60"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div 
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transform-gpu group-hover:scale-105 transition-transform",
            isIncome 
              ? "bg-green-500/10 border-green-500/20 text-green-500" 
              : "bg-orange-500/10 border-orange-500/20 text-orange-500"
          )}
          aria-hidden="true"
        >
          {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        
        <div className="min-w-0">
          <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-100 truncate tracking-tight">
            {transaction.title || "Unclassified Ledger Flow"}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              {transaction.category || "General"}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-400">
              <Clock3 size={10} aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 pl-3">
        <p className={cn("text-sm font-black tracking-tight", isIncome ? "text-green-500" : "text-neutral-800 dark:text-neutral-100")}>
          {isIncome ? "+" : "-"} {formattedCurrency}
        </p>
        {transaction.reference && (
          <p className="text-[9px] font-mono font-bold text-neutral-400 dark:text-neutral-500 mt-0.5 tracking-tighter uppercase">
            {transaction.reference}
          </p>
        )}
      </div>
    </motion.article>
  );
});

// ============================================================================
// CORE CONTROLLER PLATFORM PAGE CONTAINER
// ============================================================================

export default function HistoryPage() {
  const router = useRouter();
  
  // Extract custom hooks context values safely with dynamic structural fallback
  const contextData = useSharedTransactions();
  const rawTransactions: Transaction[] = contextData?.transactions ?? [];

  // Local Reactive State Infrastructure 
  const [activeTab, setActiveTab] = useState<TabOption>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Search Input Clean Handlers
  const handleSearchMutation = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleTabSelection = useCallback((tab: TabOption) => {
    setActiveTab(tab);
  }, []);

  // Complex Transaction Processing Pipeline Engine
  const processedTransactions = useMemo(() => {
    const canonicalSearchToken = searchQuery.trim().toLowerCase();
    
    return rawTransactions.filter((item) => {
      // 1. Tab Constraint Check
      if (activeTab === "Income" && item.type !== "income") return false;
      if (activeTab === "Expense" && item.type !== "expense") return false;

      // 2. Token Matching Pipeline
      if (canonicalSearchToken) {
        return (
          item.title?.toLowerCase().includes(canonicalSearchToken) ||
          item.category?.toLowerCase().includes(canonicalSearchToken) ||
          item.reference?.toLowerCase().includes(canonicalSearchToken)
        );
      }

      return true;
    });
  }, [rawTransactions, activeTab, searchQuery]);

  // Aggregate Performance Totals Metrics Calculation Box
  const summaryCalculations = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    processedTransactions.forEach((entry) => {
      if (entry.type === "income") {
        totalIncome += entry.amount || 0;
      } else {
        totalExpense += entry.amount || 0;
      }
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [processedTransactions]);

  // Client Data Spreadsheet Exporter Routine
  const triggerDataExportWorkflow = useCallback(async () => {
    if (processedTransactions.length === 0) {
      toast.error("No transactional records found to map export streams.");
      return;
    }

    setIsExporting(true);
    const operationToastId = toast.loading("Assembling transaction ledger matrix sheets...");

    try {
      // Simulate small task gap to decouple thread paint blocking
      await new Promise((resolve) => setTimeout(resolve, 300));

      const documentHeaders = ["Transaction ID", "Title", "Amount (INR)", "Type", "Category", "Timestamp", "Reference ID"];
      const linePayloadRows = processedTransactions.map(t => [
        t.id || "UNASSIGNED",
        `"${t.title.replace(/"/g, '""')}"`,
        t.amount,
        t.type.toUpperCase(),
        `"${t.category.replace(/"/g, '""')}"`,
        t.date || "N/A", // Added runtime safety recovery value string
        t.reference || "N/A"
      ]);

      const csvContentPayload = [
        documentHeaders.join(","),
        ...linePayloadRows.map(r => r.join(","))
      ].join("\n");

      const dynamicBlobContainer = new Blob([csvContentPayload], { type: "text/csv;charset=utf-8;" });
      const temporaryDownloadAnchor = document.createElement("a");
      const clientBlobUrl = URL.createObjectURL(dynamicBlobContainer);

      temporaryDownloadAnchor.setAttribute("href", clientBlobUrl);
      temporaryDownloadAnchor.setAttribute("download", `Ledger_Telemetry_Report_${new Date().toISOString().split('T')[0]}.csv`);
      temporaryDownloadAnchor.style.visibility = "hidden";
      
      document.body.appendChild(temporaryDownloadAnchor);
      temporaryDownloadAnchor.click();
      document.body.removeChild(temporaryDownloadAnchor);

      toast.success("Ledger document stream downloaded securely.", { id: operationToastId });
    } catch (err) {
      console.error("[System Local Output Pipeline Crash]:", err);
      toast.error("Ledger rendering pipeline failed to capture.", { id: operationToastId });
    } finally {
      setIsExporting(false);
    }
  }, [processedTransactions]);

  const navigateToLoggingPortal = useCallback(() => {
    router.push("/dashboard/transactions");
  }, [router]);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8" role="region" aria-label="Financial History Explorer Dashboard">
      
      {/* BRAND & HEADER ACTIONS MATRIX BLOCK */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/30 dark:border-neutral-800/60 pb-5">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.35em] font-black text-neutral-400 select-none">
            Ledger Telemetry
          </p>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            Transaction History
          </h1>
          <p className="text-sm text-neutral-400 font-medium leading-relaxed max-w-xl">
            Audit, isolate, and filter absolute cash velocity parameters across active accounts.
          </p>
        </div>

        {/* Global Action Acceleration Hub Row */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={triggerDataExportWorkflow}
            disabled={isExporting || processedTransactions.length === 0}
            variant="ghost"
            className="inline-flex items-center gap-2 bg-neutral-200/40 dark:bg-neutral-900/40 border border-neutral-200/20 text-neutral-800 dark:text-neutral-100 rounded-2xl px-4 py-2.5 text-xs uppercase font-black tracking-wider transition-all hover:scale-[1.02] cursor-pointer"
          >
            <FileSpreadsheet size={15} aria-hidden="true" />
            <span>{isExporting ? "Compiling..." : "Export CSV"}</span>
          </Button>

          <Button
            onClick={navigateToLoggingPortal}
            className="inline-flex items-center gap-2 bg-yellow-400 text-black rounded-2xl px-4 py-2.5 font-black text-xs uppercase tracking-[0.12em] hover:scale-105 active:scale-98 transition-all transform-gpu shadow-sm cursor-pointer"
          >
            <Plus size={15} aria-hidden="true" /> Log Flow
          </Button>
        </div>
      </header>

      {/* VALUE FLOW AGGREGATION MONITOR CARDS GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Current filtered balance totals metrics summary">
        <StatCard 
          label="Filtered Scope Balance"
          value={`₹${summaryCalculations.balance.toLocaleString("en-IN")}`}
          icon={<Wallet size={18} />}
          variant={summaryCalculations.balance >= 0 ? "default" : "neutral"}
        />
        <StatCard 
          label="Aggregate Inflow"
          value={`+ ₹${summaryCalculations.income.toLocaleString("en-IN")}`}
          icon={<TrendingUp size={18} />}
          variant="success"
        />
        <StatCard 
          label="Aggregate Outflow"
          value={`- ₹${summaryCalculations.expense.toLocaleString("en-IN")}`}
          icon={<TrendingDown size={18} />}
          variant="neutral"
        />
      </section>

      {/* FILTER CONTROL DECK HUB CONTROL PANEL CONTAINER */}
      <nav className="flex flex-col md:flex-row items-slate md:items-center justify-between gap-4 p-2 bg-neutral-200/30 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200/10">
        
        {/* Navigation Tabs List Structure */}
        <div className="flex p-1 bg-neutral-200/50 dark:bg-neutral-950/40 rounded-xl gap-1" role="tablist" aria-label="Transaction Type Filter Options Tab Group">
          {TABS.map((tabItem) => (
            <TabButton
              key={tabItem}
              tab={tabItem}
              isActive={activeTab === tabItem}
              onClick={handleTabSelection}
            />
          ))}
        </div>

        {/* Dynamic Context Multi-Search Matching Bar Module */}
        <div className="flex-1 md:max-w-md relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-neutral-400" aria-hidden="true">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchMutation}
            placeholder="Isolate items by description, category, ID tag..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/50 dark:bg-neutral-950/30 font-bold text-xs outline-none border border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-neutral-950 transition-all text-neutral-800 dark:text-neutral-100"
            aria-label="Search items through transaction description indexing input fields"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={clearSearchQuery}
                className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                aria-label="Clear active search input string content fields"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* HISTORICAL RECORDS DISPATCH DATA OUTPUT LIST ENTRY WINDOW CONTAINER */}
      <main 
        id="transaction-grid-panel" 
        role="tabpanel" 
        aria-labelledby={`tab-trigger-${activeTab.toLowerCase()}`}
        className="min-h-[350px] relative"
      >
        <AnimatePresence mode="popLayout">
          {processedTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-neutral-200/10 bg-neutral-200/5 dark:bg-neutral-900/5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-200/50 dark:bg-neutral-900 flex items-center justify-center text-2xl select-none mb-4 shadow-inner" role="presentation">
                📂
              </div>
              <h3 className="font-black text-sm text-neutral-800 dark:text-neutral-200 tracking-tight">
                No matching financial records located
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mt-1.5 font-medium leading-relaxed">
                Adjust your structural filter boundaries, modify search tokens, or log a fresh asset flow statement.
              </p>
              {searchQuery && (
                <Button
                  onClick={clearSearchQuery}
                  variant="ghost"
                  className="mt-4 text-xs font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 rounded-xl px-4 py-2 cursor-pointer"
                >
                  Reset Active Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3" role="list" aria-label="Dynamic filtered transactional ledger records block">
              {processedTransactions.map((item, index) => (
                <TransactionRow
                  key={item.id || item.reference || `ledger-entry-${index}`}
                  transaction={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
      
    </div>
  );
}