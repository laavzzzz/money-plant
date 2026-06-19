/**
 * @fileoverview Main Core Dashboard Gateway Page Configuration Root
 * @description Establishes the primary layout container entry point for the centralized
 * asset dashboard, handling search indexing headers, layout suspense streaming wrappers, 
 * and server-side metadata declarations.
 */

import React, { Suspense } from "react";
import type { Metadata } from "next";
import DashboardHome from "@/components/dashboard/DashboardHome";

// ============================================================================
// METADATA & CONTENT ENGINE HEADERS (SEO & OPENGRAPH)
// ============================================================================

export const metadata: Metadata = {
  title: "Dashboard Core | MoneyPlant Architecture",
  description: "Real-time enterprise asset infrastructure tracking matrix, yield analytics, and financial growth streams.",
  robots: {
    index: false, // Security precaution: Block sensitive dashboard pages from external search indexing spiders
    follow: false,
  },
};

// ============================================================================
// SYSTEM ARCHITECTURE COMPILATION HINTS
// ============================================================================

/**
 * Next.js Engine Hint: Allow layout tree parameters to intelligently decide static 
 * vs dynamic hydration passes based on nested data consumption hook patterns.
 */
export const dynamic = "auto";

// ============================================================================
// ISOLATED LOADING FRAMEWORK PERFORMANCE FALLBACK
// ============================================================================

/**
 * DashboardCompositionSkeleton Component
 * Renders an optimized structural layout representing data components during streaming passes.
 */
function DashboardCompositionSkeleton() {
  return (
    <div 
      className="w-full space-y-6 animate-pulse" 
      aria-hidden="true"
      role="status"
      aria-label="Synchronizing system matrix metrics..."
    >
      {/* Simulation Header Block */}
      <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-1/3" />
      
      {/* Simulation Grid Layout Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-[32px]" />
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-[32px]" />
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-[32px]" />
      </div>

      {/* Simulation Large Main Content Area */}
      <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-[40px] w-full" />
    </div>
  );
}

// ============================================================================
// PRIMARY CORE VIEW ENTRY LAYER
// ============================================================================

/**
 * Core Dashboard Root Page Entry Component
 * Handles the composition container for child interactive modules.
 * * @returns {JSX.Element} The performance-isolated dashboard structure tree.
 */
export default function DashboardRootPage() {
  return (
    <Suspense fallback={<DashboardCompositionSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}