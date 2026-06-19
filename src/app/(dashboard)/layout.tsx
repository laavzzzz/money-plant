/**
 * @fileoverview Main Enterprise Asset Management Dashboard Layout Framework
 * @description Architecture Composition Root defining semantic shell landmarks, responsive
 * tracking matrices, structural navigation layouts, and isolated low-overhead state sub-components.
 */
"use client";
import React from "react";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNav from "@/components/navigation/MobileNav";
import { Bell, Search, Leaf, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface DashboardGroupLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// ISOLATED SEARCH INTERACTIVE SUB-COMPONENT
// ============================================================================

/**
 * Isolated Asset Search Bar Component
 * Encapsulates input field mutations to eliminate global layout container cascading re-renders.
 */
function DashboardSearchBar() {
  return (
    <form 
      role="search" 
      onSubmit={(e) => e.preventDefault()}
      className="hidden sm:flex items-center bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-full px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-primary/20 w-64 lg:w-80 transition-all duration-200"
    >
      <label htmlFor="dashboard-asset-search" className="sr-only">
        Search financial assets and plants
      </label>
      <Search size={16} className="text-text-light shrink-0" aria-hidden="true" />
      <input
        id="dashboard-asset-search"
        type="search"
        placeholder="Search assets..."
        autoComplete="off"
        className="bg-transparent border-none text-xs outline-none w-full placeholder:text-text-light/50 font-bold text-text-main focus:ring-0"
      />
    </form>
  );
}

// ============================================================================
// ISOLATED NOTIFICATION INTERACTIVE SUB-COMPONENT
// ============================================================================

/**
 * Action Notification Trigger Component
 * Isolates transient toast events and interactive touch animations.
 */
function NotificationTriggerButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Everything is green and growing! 🌱")}
      className="relative p-2.5 rounded-full bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 outline-none transition-all transform-gpu"
      aria-label="View active updates and plant notification feeds"
    >
      <Bell size={18} className="text-text-main" aria-hidden="true" />
      <span 
        className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border border-white dark:border-zinc-950 animate-pulse" 
        style={{ animationDuration: '2s' }}
      />
    </button>
  );
}

// ============================================================================
// MAIN SYSTEM SERVER COMPOSITION LAYER
// ============================================================================

/**
 * DashboardGroupLayout Framework Shell Component
 * Runs as a highly performant Server Component, ensuring the global structure is layout-locked,
 * while isolating interactive components to minimize client-side bundle size.
 * * @param {DashboardGroupLayoutProps} props - Layout wrapper configurations containing views.
 */
export default function DashboardGroupLayout({ children }: DashboardGroupLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFC] dark:bg-[#0B0B0D] relative overflow-hidden transition-colors duration-500">
      
      {/* Structural Skip-Link Layer for Accessible Keyboard Screen Readers */}
      <a 
        href="#dashboard-main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip straight to primary asset content
      </a>

      {/* 🌿 FIXED PERSISTENT SIDEBAR VIEWPORT LAYER (Desktop Navigation) */}
      <Sidebar />

      {/* PRIMARY CENTRAL INFRASTRUCTURE AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        
        {/* SEMANTIC HEADER NAVIGATION SHELL AREA */}
        <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Reactive Brand Identity Trigger (Visible strictly on Mobile breakpoints) */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 lg:hidden rounded-xl focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
            aria-label="MoneyPlant Dashboard Home Identity Hub"
          >
            <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center shadow-sm" aria-hidden="true">
              <Leaf className="text-emerald-500 w-4.5 h-4.5" />
            </div>
            <span className="font-black text-sm tracking-tight text-text-main select-none">
              MoneyPlant <span aria-hidden="true">🌿</span>
            </span>
          </Link>

          {/* Encapsulated Performance Isolated Asset Search Module */}
          <DashboardSearchBar />

          {/* Action Row Utilities Block */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            
            {/* Encapsulated Performance Notification Module */}
            <NotificationTriggerButton />

            {/* Profile Matrix Shortcut Portal (Visible strictly on Mobile Viewports) */}
            <Link
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 outline-none transition-all transform-gpu lg:hidden"
              aria-label="Navigate to secure user settings profile matrix page"
            >
              <div className="w-full h-full rounded-full bg-[#FAFAFC] dark:bg-[#0B0B0D] flex items-center justify-center text-sm select-none">
                👩‍💻
              </div>
            </Link>
          </div>
        </header>

        {/* METRIC REINFORCED MAIN COMPONENT INTERFACE DISPLAY */}
        <main 
          id="dashboard-main-content"
          className="flex-grow p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 min-w-0 max-w-6xl w-full mx-auto outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* 📱 MOBILE VIEWPORT DEVICE FIXED FOOTER NAVIGATION GRID */}
      <MobileNav />

      {/* ACCELERATED HARDWARE GRADIENT BACKGROUND ACCESSORIES */}
      <div className="absolute inset-0 -z-50 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5 transform-gpu" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/5 transform-gpu" />
      </div>
    </div>
  );
}