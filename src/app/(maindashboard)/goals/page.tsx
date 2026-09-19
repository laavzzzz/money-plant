/**
 * @fileoverview High-Performance Financial Missions & Saving Goals Dashboard Core
 * @description Operational financial objective control portal featuring memoized atomic sub-nodes,
 * robust client-side validation logic, telemetry hooks, and fully compliant WCAG accessibility layers.
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Target, Trophy } from "lucide-react";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { toast } from "sonner";

// ============================================================================
// SYSTEM TYPE DEFINITIONS & SCHEMAS
// ============================================================================

export interface Goal {
  _id: string;
  title: string;
  saved: number;
  target: number;
  emoji: string;
}

interface StatPillProps {
  label: string;
  value: string;
  accent?: boolean;
}

interface GoalCardProps {
  goal: Goal;
}

interface GoalCreationFormProps {
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

// ============================================================================
// ATOMIC ARCHITECTURE PERFORMANCE-ISOLATED COMPONENTS
// ============================================================================

/**
 * StatPill Component
 * Displays structural account summary totals with optimized static paint classes.
 */
const StatPill = memo(function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div
      className={`rounded-[28px] border border-neutral-200/10 p-5 shadow-sm transition-all transform-gpu select-none ${
        accent 
          ? "bg-gradient-to-r from-primary via-primary/90 to-secondary text-white border-none shadow-[0_8px_20px_-6px_rgba(195,172,255,0.3)]" 
          : "bg-white/90 dark:bg-white/5 border-white/10"
      }`}
    >
      <p className={`text-[9px] uppercase tracking-[0.25em] font-black ${accent ? "text-white/80" : "text-text-light"}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
});

/**
 * GoalCard Component
 * Displays individual goals with safe progress calculations and GPU-accelerated styling.
 */
const GoalCard = memo(function GoalCard({ goal }: GoalCardProps) {
  // Prevent division-by-zero errors when calculating progress
  const progressRatio = useMemo(() => {
    if (!goal.target || goal.target <= 0) return 0;
    return Math.min(Math.round((goal.saved / goal.target) * 100), 100);
  }, [goal.saved, goal.target]);

  return (
    <div 
      className="glass-panel p-5 rounded-[28px] border border-white/10 bg-white/40 dark:bg-white/5 hover:scale-[1.02] transition-transform duration-300 transform-gpu flex flex-col justify-between"
      role="region"
      aria-label={`Saving mission tracking container for ${goal.title}`}
    >
      <div className="flex gap-4 mb-4 items-start">
        <div 
          className="bg-primary/10 dark:bg-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 select-none border border-primary/10"
          aria-hidden="true"
        >
          {goal.emoji || "🎯"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-black text-sm text-text-main truncate tracking-tight">{goal.title}</h3>
            <span 
              className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                progressRatio >= 100 ? "bg-emerald-500/20 text-emerald-500 animate-pulse" : "text-primary bg-primary/10"
              }`}
            >
              {progressRatio}%
            </span>
          </div>
          <p className="text-xs font-bold text-text-light mt-1">
            ₹{goal.saved.toLocaleString("en-IN")} <span className="font-medium opacity-60">/</span> ₹{goal.target.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div 
        className="w-full h-3 bg-neutral-200/40 dark:bg-white/10 rounded-full overflow-hidden p-0.5"
        role="progressbar"
        aria-valuenow={progressRatio}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress tracking gauge metrics path line for ${goal.title}`}
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out will-change-[width]"
          style={{ width: `${progressRatio}%` }}
        />
      </div>
    </div>
  );
});

/**
 * GoalCreationForm Component
 * Fully isolated form wrapper. Protects the parent page layout from unnecessary re-renders during input typing states.
 */
const GoalCreationForm = memo(function GoalCreationForm({ onSuccess, onCancel }: GoalCreationFormProps) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitActionHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const cleanTitle = title.trim();
    const numericTarget = Number(target);

    // Business Logic Constraints Validation Matrix
    if (!cleanTitle) {
      toast.error("Please provide a valid mission name.");
      return;
    }
    if (isNaN(numericTarget) || numericTarget <= 0) {
      toast.error("Target objective must be a valid positive financial sum.");
      return;
    }
    if (numericTarget > 100000000) {
      toast.error("Target threshold exceeds maximum permitted system configuration limits.");
      return;
    }

    setIsSubmitting(true);
    const apiSignalController = new AbortController();
    const runtimeTimeoutId = setTimeout(() => apiSignalController.abort(), 7000);

    try {
      const responseStream = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle, target: numericTarget, saved: 0, emoji }),
        signal: apiSignalController.signal
      });

      const parsedPayload = await responseStream.json();
      if (parsedPayload.success) {
        toast.success("New milestone unlocked — saving mission activated 🚀");
        await onSuccess();
      } else {
        throw new Error(parsedPayload.message || "Backend storage allocation processing failure.");
      }
    } catch (err) {
      console.error("[System Goal Allocation Ingestion Incident]:", err);
      toast.error("Failed to commit goal data matrix. Try again.");
    } finally {
      clearTimeout(runtimeTimeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={submitActionHandler}
      className="glass-panel p-5 rounded-[28px] space-y-3 bg-white/70 dark:bg-white/5 border border-white/10 shadow-xl"
      aria-label="Create a new financial saving mission goal"
    >
      <div className="space-y-1">
        <label htmlFor="goal-title-input" className="text-[10px] font-black uppercase text-text-light tracking-wider block px-1 select-none">Mission Identifier</label>
        <input
          id="goal-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Japanese Matcha Fund"
          maxLength={50}
          required
          disabled={isSubmitting}
          className="w-full p-3.5 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-neutral-900 transition-all text-text-main"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="goal-target-input" className="text-[10px] font-black uppercase text-text-light tracking-wider block px-1 select-none">Target Amount (₹)</label>
          <input
            id="goal-target-input"
            type="number"
            min="1"
            step="1"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Amount in ₹"
            required
            disabled={isSubmitting}
            className="w-full p-3.5 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-neutral-900 transition-all text-text-main"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="goal-emoji-input" className="text-[10px] font-black uppercase text-text-light tracking-wider block px-1 select-none">Mascot Emoji Identifier</label>
          <input
            id="goal-emoji-input"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🎯"
            maxLength={4}
            disabled={isSubmitting}
            className="w-full p-3.5 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-neutral-900 transition-all text-center text-text-main"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-black/5 dark:bg-white/5 text-text-main hover:bg-neutral-200/50 dark:hover:bg-white/10 rounded-xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-40 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          {isSubmitting ? "Deploying Mission..." : "Confirm & Save Mission"}
        </button>
      </div>
    </form>
  );
});

// ============================================================================
// PRIMARY PARENT CONTAINER ARCHITECTURE GATEWAY VIEW INTERFACE
// ============================================================================

export default function GoalsPage() {
  const router = useRouter();
  const { openAdd } = useTransactionModal();

  // Primary Hydration States
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Core Async Retrieval Pipeline
  const loadGoals = useCallback(async () => {
    const lifecycleController = new AbortController();
    const frameworkTimeoutId = setTimeout(() => lifecycleController.abort(), 8000);

    try {
      const responseStream = await fetch("/api/goals", { signal: lifecycleController.signal });
      if (!responseStream.ok) throw new Error("Server engine invalid route state response.");
      
      const payload = await responseStream.json();
      if (payload.success) {
        setGoals(payload.data ?? []);
      } else {
        setGoals([]);
      }
    } catch (err) {
      console.error("[System Async Operations Framework Connection Pipeline Intercept]:", err);
      setGoals([]);
    } finally {
      clearTimeout(frameworkTimeoutId);
      setLoading(false);
    }
  }, []);

  // Structural Component Mount Hydration Triggers
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Enterprise Calculations Layer Aggregations Matrix Block
  const totals = useMemo(() => {
    if (!goals.length) {
      return { count: 0, target: 0, saved: 0, remaining: 0, progressAvg: 0 };
    }

    const aggregatedTarget = goals.reduce((accumulator, entity) => accumulator + (entity.target || 0), 0);
    const aggregatedSaved = goals.reduce((accumulator, entity) => accumulator + (entity.saved || 0), 0);
    const calculatedRemaining = Math.max(0, aggregatedTarget - aggregatedSaved);
    
    const computedProgressTotal = goals.reduce((accumulator, entity) => {
      if (!entity.target || entity.target <= 0) return accumulator;
      return accumulator + ((entity.saved / entity.target) * 100);
    }, 0);

    return {
      count: goals.length,
      target: aggregatedTarget,
      saved: aggregatedSaved,
      remaining: calculatedRemaining,
      progressAvg: Math.min(Math.round(computedProgressTotal / goals.length), 100),
    };
  }, [goals]);

  // Safe State Mutation Wrappers
  const toggleFormVisibility = useCallback(() => {
    setShowForm((currentValue) => !currentValue);
  }, []);

  const deactivateFormComplete = useCallback(async () => {
    setShowForm(false);
    setLoading(true);
    await loadGoals();
  }, [loadGoals]);

  const closeFormDirect = useCallback(() => {
    setShowForm(false);
  }, []);

  const dispatchNavigationTarget = useCallback((routeDestination: string) => {
    router.push(routeDestination);
  }, [router]);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8" role="region" aria-label="Financial Management System Missions Core">
      
      {/* HEADER MATRIX BRAND SECTION */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-5">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light select-none">
            Missions Registry
          </p>
          <h1 className="text-3xl font-black text-text-main tracking-tight">Set your money missions</h1>
          <p className="text-sm text-text-light font-medium leading-relaxed max-w-2xl mt-1">
            Create goals, track progress, and turn savings into the rewards you actually care about.
          </p>
        </div>

        {/* Dashboard Navigation Interaction Controls Cluster */}
        <div className="flex flex-col gap-3 sm:items-end shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleFormVisibility}
              aria-expanded={showForm}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black rounded-3xl px-4 py-2.5 font-black text-xs uppercase tracking-[0.15em] hover:scale-105 active:scale-98 transition-all transform-gpu shadow-sm cursor-pointer"
            >
              <Plus size={15} aria-hidden="true" /> Add Goal
            </button>
            <button
              type="button"
              onClick={() => dispatchNavigationTarget("/dashboard/wishlist")}
              className="inline-flex items-center gap-2 rounded-3xl border border-neutral-200 dark:border-white/10 bg-black/5 px-4 py-2.5 text-xs uppercase font-black tracking-[0.15em] text-text-main hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Wishlist
            </button>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-secondary/10 px-4 py-2 text-[10px] uppercase font-black tracking-[0.2em] text-secondary w-fit select-none border border-secondary/5">
            <Sparkles size={14} aria-hidden="true" /> Power plan active
          </div>
        </div>
      </header>

      {/* COMPILATION AGGREGATION METRIC CARDS PILLS GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatPill label="Active Missions" value={`${totals.count}`} accent />
        <StatPill label="Total Saved" value={`₹${totals.saved.toLocaleString("en-IN")}`} />
        <StatPill label="Remaining Sum" value={`₹${totals.remaining.toLocaleString("en-IN")}`} />
        <StatPill label="Avg Progress" value={`${totals.progressAvg}%`} />
      </section>

      {/* COMPOSITE FORM ENTRY LAYER SLAT INTERCEPTOR */}
      {showForm && (
        <section aria-label="Inline Target Configuration Form Block">
          <GoalCreationForm onSuccess={deactivateFormComplete} onCancel={closeFormDirect} />
        </section>
      )}

      {/* QUICK LOG ACCELERATION ACTIONS PANEL ROW */}
      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openAdd("income")}
          className="py-3 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/15 border border-green-500/10 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          + Log Income Stream
        </button>
        <button
          type="button"
          onClick={() => dispatchNavigationTarget("/dashboard/wishlist")}
          className="py-3 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/10 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
        >
          View Wishlist Matrix
        </button>
      </section>

      {/* RUNTIME DATA STREAM CONTENT PIPELINE SWITCH ENTRY POINTS */}
      <main className="pt-2" role="main">
        {loading ? (
          <div className="text-center py-12" role="status">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-light font-bold uppercase tracking-widest select-none">Synchronizing Account Mission States…</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="glass-panel p-10 rounded-[32px] text-center border-dashed border-2 border-primary/20 bg-white/10 dark:bg-neutral-900/10 max-w-xl mx-auto">
            <p className="text-4xl mb-3 select-none" role="presentation">🎯</p>
            <h2 className="font-black text-base text-text-main tracking-tight">No active missions running</h2>
            <p className="text-xs text-text-light mt-2 font-semibold max-w-md mx-auto leading-relaxed">
              Add your first dynamic financial saving goal target to initialize tracking metrics and feed your progress metrics.
            </p>
            <button
              type="button"
              onClick={toggleFormVisibility}
              className="mt-6 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black rounded-full font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transform-gpu transition-all cursor-pointer"
            >
              Initialize First Mission
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 select-none text-text-main">
              <Trophy size={16} className="text-yellow-500" />
              <h2 className="text-sm font-black uppercase tracking-wider">Active Missions Index</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Financial savings goals listings grid">
              {goals.map((goalItem) => (
                <GoalCard key={goalItem._id} goal={goalItem} />
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}