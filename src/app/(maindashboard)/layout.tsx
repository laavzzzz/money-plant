/**
 * @file src/app/(maindashboard)/layout.tsx
 * @module MainDashboardLayout
 * @description Enterprise Asset Management Dashboard Layout Framework for MoneyPlant.
 * Defines semantic shell landmarks, responsive tracking matrices, structural navigation layouts,
 * and isolated low-overhead client sub-components with WCAG 2.1 AA compliance.
 *
 * @version 4.0.0
 * @author Senior Principal Full-Stack Architecture Team
 */

"use client";

import React, { memo, useState, useCallback, FormEvent, ChangeEvent } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNav from "@/components/navigation/MobileNav";
import { Bell, Search, Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface DashboardGroupLayoutProps {
  readonly children: React.ReactNode;
}

// ============================================================================
// ISOLATED SEARCH INTERACTIVE SUB-COMPONENT
// ============================================================================

/**
 * Isolated Asset Search Bar Component
 * Encapsulates input field mutations and routes queries to the transactions ledger.
 */
const DashboardSearchBar = memo(function DashboardSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const query = searchQuery.trim();
      if (!query) return;

      toast.info(`Filtering assets for: "${query}"`);
      router.push(`/transactions?search=${encodeURIComponent(query)}`);
    },
    [searchQuery, router]
  );

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <form
      role="search"
      onSubmit={handleSearchSubmit}
      className="hidden sm:flex items-center bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-full px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-emerald-500/30 w-64 lg:w-80 transition-all duration-200"
    >
      <label htmlFor="dashboard-asset-search" className="sr-only">
        Search financial assets and transactions
      </label>
      <Search size={16} className="text-[var(--text-light)] shrink-0" aria-hidden="true" />
      <input
        id="dashboard-asset-search"
        type="search"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search assets..."
        autoComplete="off"
        className="bg-transparent border-none text-xs outline-none w-full placeholder:text-[var(--text-light)]/50 font-bold text-[var(--text-main)] focus:ring-0"
      />
    </form>
  );
});
DashboardSearchBar.displayName = "DashboardSearchBar";

// ============================================================================
// ISOLATED NOTIFICATION INTERACTIVE SUB-COMPONENT
// ============================================================================

/**
 * Action Notification Trigger Component
 * Isolates transient toast events and interactive touch animations.
 */
const NotificationTriggerButton = memo(function NotificationTriggerButton() {
  const [hasUnread, setHasUnread] = useState(true);

  const handleNotificationClick = useCallback(() => {
    setHasUnread(false);
    toast.info("Everything is green and growing! 🌱 All financial systems optimal.");
  }, []);

  return (
    <button
      type="button"
      onClick={handleNotificationClick}
      className="relative p-2.5 rounded-full bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500/40 outline-none transition-all transform-gpu"
      aria-label="View active updates and plant notification feeds"
      aria-haspopup="true"
    >
      <Bell size={18} className="text-[var(--text-main)]" aria-hidden="true" />
      {hasUnread && (
        <span
          className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-950 animate-pulse"
          style={{ animationDuration: "2s" }}
          aria-hidden="true"
        />
      )}
    </button>
  );
});
NotificationTriggerButton.displayName = "NotificationTriggerButton";

// ============================================================================
// MAIN SYSTEM LAYOUT COMPOSITION LAYER
// ============================================================================

/**
 * DashboardGroupLayout Framework Shell Component
 * Serves as the primary layout wrapper for all main dashboard routes in MoneyPlant.
 */
export default function DashboardGroupLayout({ children }: DashboardGroupLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFC] dark:bg-[#0B0B0D] relative overflow-hidden transition-colors duration-500">
      {/* Accessibility Skip Link */}
      <a
        href="#dashboard-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-xl focus:font-black focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip straight to primary asset content
      </a>

      {/* Persistent Sidebar Navigation (Desktop Viewport) */}
      <Sidebar />

      {/* Primary Infrastructure Body */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Semantic Header Navigation Shell */}
        <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Mobile Brand Identity Shortcut */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 lg:hidden rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/40 outline-none"
            aria-label="MoneyPlant Dashboard Home Identity Hub"
          >
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center shadow-sm" aria-hidden="true">
              <Leaf className="text-emerald-500 w-4 h-4" />
            </div>
            <span className="font-black text-sm tracking-tight text-[var(--text-main)] select-none">
              MoneyPlant <span aria-hidden="true">🌿</span>
            </span>
          </Link>

          {/* Encapsulated Search Bar */}
          <DashboardSearchBar />

          {/* Action Row Utilities */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Encapsulated Notification Trigger */}
            <NotificationTriggerButton />

            {/* Profile Portal Shortcut (Mobile Viewport) */}
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-emerald-500 p-[2px] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500/40 outline-none transition-all transform-gpu lg:hidden"
              aria-label="Navigate to user settings profile page"
            >
              <div className="w-full h-full rounded-full bg-[#FAFAFC] dark:bg-[#0B0B0D] flex items-center justify-center text-sm select-none">
                👩‍💻
              </div>
            </Link>
          </div>
        </header>

        {/* Main Dashboard Content Area */}
        <main
          id="dashboard-main-content"
          className="flex-grow p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 min-w-0 max-w-6xl w-full mx-auto outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* Mobile Device Fixed Bottom Navigation */}
      <MobileNav />

      {/* Hardware Accelerated Background Accessories */}
      <div className="absolute inset-0 -z-50 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5 transform-gpu" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-yellow-400/10 blur-[120px] dark:bg-yellow-400/5 transform-gpu" />
      </div>
    </div>
  );
}