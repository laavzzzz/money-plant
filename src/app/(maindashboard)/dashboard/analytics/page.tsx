/**
 * @fileoverview High-Performance Financial Analytics View Segment Component
 * @description Renders the main dashboard analytics tracking module. Integrates deep state
 * isolation boundaries, accessible structural HTML markup, and optimized data presentation matrices.
 */

"use client";

import React, { memo, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Sparkles, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/Button";

// ============================================================================
// DATA CONFIGURATIONS & INTERFACES
// ============================================================================

interface CategoryItemProps {
  color: string;
  label: string;
  percent: string;
  onClick: () => void;
}

interface MetricDefinition {
  id: string;
  color: string;
  label: string;
  percent: string;
  path: string;
}

/**
 * Immutable Enterprise Analytics Configuration Directory
 */
const ANALYTICS_METRICS_REGISTRY: readonly MetricDefinition[] = [
  { id: "food", color: "bg-orange-400", label: "Food", percent: "35%", path: "/dashboard/transactions" },
  { id: "transport", color: "bg-blue-400", label: "Transport", percent: "20%", path: "/dashboard/transactions" },
  { id: "fun", color: "bg-pink-400", label: "Fun", percent: "25%", path: "/dashboard/transactions" },
  { id: "other", color: "bg-green-400", label: "Other", percent: "20%", path: "/dashboard/transactions" },
] as const;

// ============================================================================
// PERFORMANCE OPTIMIZED PERFORMANCE SUB-COMPONENTS
// ============================================================================

/**
 * CategoryItem Component
 * Renders an isolated transaction summary metric cell. Utilizes functional memoization 
 * checkpoints to limit cascading paint refreshes during layout invalidations.
 */
const CategoryItem = memo(function CategoryItem({
  color,
  label,
  percent,
  onClick,
}: CategoryItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel p-4 rounded-2xl text-center min-w-0 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-white/10 outline-none transition-all transform-gpu cursor-pointer group"
      aria-label={`View full statement log metrics for ${label}. Current ratio: ${percent}`}
    >
      <div 
        className={`w-3 h-3 rounded-full ${color} mx-auto mb-2 shadow-sm group-hover:scale-110 transition-transform`} 
        aria-hidden="true" 
      />
      <p className="text-xs font-black truncate text-text-light group-hover:text-text-main transition-colors">
        {label}
      </p>
      <p className="text-lg font-black text-text-main mt-0.5">
        {percent}
      </p>
    </button>
  );
});

// ============================================================================
// PRIMARY ANALYTICS VIEW CONTEXT PORTAL
// ============================================================================

export default function AnalyticsPage() {
  const router = useRouter();

  // Centralized Navigation Dispatcher Matrix Component
  const handleNavigationTransition = useCallback((destinationPath: string) => {
    router.push(destinationPath);
  }, [router]);

  // Read-only static layout computation references
  const trackingTotalSpentFormatted = "4,250";
  const currencySymbolDisplay = "₹";

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8" role="region" aria-label="Financial Spend Analytics Matrix">
      
      {/* SECTION HEADER MODULE */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.35em] font-black text-text-light select-none">
            Analytics Overview
          </p>
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-primary/10 px-4 py-2.5 text-primary w-fit select-none">
              <TrendingUp size={16} aria-hidden="true" />
              <span className="font-black text-xs uppercase tracking-wider">Money moves decoded</span>
            </div>
            <p className="max-w-2xl text-sm text-text-light font-medium leading-relaxed">
              Track your spending rhythm, compare months, and turn insights into smarter saving energy.
            </p>
          </div>
        </div>

        {/* Action Button Controls Row */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleNavigationTransition("/dashboard/goals")}
            leftIcon={<Sparkles size={16} aria-hidden="true" />}
            aria-label="Navigate forward to configure system asset optimization targets"
          >
            Set goal
          </Button>
          <Button
            variant="vibe"
            size="sm"
            onClick={() => handleNavigationTransition("/dashboard/transactions")}
            leftIcon={<RefreshCcw size={16} aria-hidden="true" />}
            aria-label="Review historic ledger transaction statements log"
          >
            Review spend
          </Button>
        </div>
      </section>

      {/* CORE RADIAL CHART GRAPHIC ELEMENT COMPOSITION */}
      <section 
        className="relative flex justify-center py-4"
        role="progressbar"
        aria-valuenow={100}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Total spent monitoring gauge. Calculated sum: ${currencySymbolDisplay} ${trackingTotalSpentFormatted}`}
      >
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[14px] border-black/5 dark:border-white/10 flex flex-col items-center justify-center glass-panel relative shadow-xl transform-gpu select-none">
          <p className="text-[9px] font-black text-text-light uppercase tracking-widest">
            Total Spent
          </p>
          <p className="text-3xl font-black text-text-main tracking-tight mt-1">
            {currencySymbolDisplay} {trackingTotalSpentFormatted}
          </p>
        </div>
      </section>

      {/* METRIC CARD GRID STRUCTURE */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {ANALYTICS_METRICS_REGISTRY.map((metric) => (
          <CategoryItem
            key={metric.id}
            color={metric.color}
            label={metric.label}
            percent={metric.percent}
            onClick={() => handleNavigationTransition(metric.path)}
          />
        ))}
      </section>

      {/* INTELLIGENT AI INSIGHT FEEDBACK CONTAINER LAYOUT */}
      <footer className="glass-panel p-5 sm:p-6 rounded-[28px] flex gap-4 items-center border border-white/5 bg-gradient-to-r from-green-500/5 to-transparent">
        <span className="text-4xl shrink-0 select-none" role="img" aria-label="Cactus plant mascot graphic symbol">🌵</span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5 select-none">
            <TrendingUp size={14} aria-hidden="true" /> 
            AI Planty Says
          </p>
          <p className="text-sm font-bold text-text-main mt-1 leading-relaxed">
            You&apos;re 12% under last month. Keep that food spend in check bestie <span className="text-emerald-500" aria-hidden="true">🌿</span>
          </p>
        </div>
      </footer>

    </div>
  );
}