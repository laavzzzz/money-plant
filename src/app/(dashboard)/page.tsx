/**
 * @fileoverview Route Group Composition Entry Point
 * @description Serves as a zero-overhead server-side gateway to handle redirection matrix
 * parameters for the root segment layout configuration tree.
 */
"use client";
import { redirect, RedirectType } from "next/navigation";

// ============================================================================
// SYSTEM ARCHITECTURE & STATIC ROUTING CONFIGURATIONS
// ============================================================================

/**
 * Enterprise Application Routing Manifest Schema
 * Centralized immutable configuration directory to handle internal destination links.
 */
const ROUTES_MANIFEST = {
  dashboard: {
    root: "/dashboard",
  },
} as const;

// ============================================================================
// FRAMEWORK COMPILATION OPTIMIZATION FLAGS
// ============================================================================

/**
 * Guarantees this file compiles down to a purely static asset route block.
 * If any dynamic runtime functions slip in during upstream updates, the production build
 * pipeline breaks explicitly instead of serving slow, unoptimized dynamic responses.
 */
export const dynamic = "error";

// ============================================================================
// MAIN PRODUCTION GATEWAY INFRASTRUCTURE
// ============================================================================

/**
 * DashboardGroupRoot Gateway Controller
 * * Intercepts incoming client request loops reaching the parent directory structure and instantly
 * routes them forward toward the optimized primary application layout interface tree.
 * * @throws {Redirect} Next.js native platform exception token to cancel current component execution
 * and immediately pass an optimized tracking header status down to the client connection pool.
 */
export default function DashboardGroupRoot(): never {
  // Production Telemetry Log Event
  if (process.env.NODE_ENV !== "production") {
    console.info("[Routing Engine] Handing structural interceptor redirection down to targeting manifest:", ROUTES_MANIFEST.dashboard.root);
  }

  /**
   * Execute explicit server replacement redirection tracking.
   * RedirectType.replace prevents layout layout shifting and prevents browser historic stack loops
   * from breaking back button functionalities for corporate system users.
   */
  redirect(ROUTES_MANIFEST.dashboard.root, RedirectType.replace);
}