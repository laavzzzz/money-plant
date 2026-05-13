"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { Leaf } from "lucide-react";
/* -------------------------------------------------------------------------- */
/* DASHBOARD HEADER                             */
/* -------------------------------------------------------------------------- */
const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full px-6 md:px-10 py-4 flex items-center justify-between bg-white/40 dark:bg-black/20 backdrop-blur-xl border-b border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-accent rounded-2xl flex items-center justify-center shadow-vibe transform transition-transform hover:rotate-12">
          <Leaf className="text-vibe-dark w-6 h-6" />
        </div>
        <div>
          <h1 className="text-[10px] font-black text-text-light uppercase tracking-[0.2em] leading-none mb-1">My Garden</h1>
          <p className="text-xl font-black text-text-main tracking-tight">MoneyPlant🌿</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Hidden on small mobile, visible on tablet+ */}
        <div className="hidden md:flex items-center bg-white/30 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-full px-4 py-2 gap-2 focus-within:ring-2 ring-primary/20 transition-all">
           <Search size={16} className="text-text-light" />
           <input type="text" placeholder="Search wealth..." className="bg-transparent border-none text-sm outline-none w-40 placeholder:text-text-light/50" />
        </div>

        <button className="p-2.5 rounded-full bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 text-text-main hover:scale-110 active:scale-95 transition-all shadow-sm">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-black animate-pulse" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] cursor-pointer hover:scale-105 transition-transform">
           <div className="w-full h-full rounded-full bg-bg-main flex items-center justify-center overflow-hidden">
              <img src="/avatar-placeholder.png" alt="Profile" className="w-full h-full object-cover" />
           </div>
        </div>
      </div>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN LAYOUT                                  */
/* -------------------------------------------------------------------------- */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent selection:bg-primary/30">
      {/* 1. Persistent Header */}
      <DashboardHeader />

      {/* 2. Content Area - UPGRADED ALIGNMENT 
          - Changed max-w-2xl to max-w-[1800px] to allow wide spread.
          - Added responsive padding for cleaner desktop look.
      */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 pt-8 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="w-full h-full"
          >
            {/* Page Context Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Live Status
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter capitalize">
                  {pathname.split("/").pop() || "Dashboard"}
                </h2>
              </div>
              
              {/* Optional: Add a "Quick Stats" or "Date" widget on the right for wide desktop fill */}
              <div className="hidden lg:block text-right">
                <p className="text-text-light font-bold text-sm uppercase tracking-widest">Tuesday</p>
                <p className="text-text-main font-black text-xl">May 12, 2026</p>
              </div>
            </div>

            {/* The Actual Page Content (e.g., your Bento Grid) */}
            <div className="w-full">
               {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Floating Bottom Navigation */}
      <BottomNav />

      {/* 4. Decorative Background Engine */}
      <div 
        className="fixed inset-0 -z-50 pointer-events-none overflow-hidden" 
        aria-hidden="true"
      >
        <div className="vibe-canvas absolute inset-0 opacity-40 dark:opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[140px] animation-delay-2000 animate-pulse" />
      </div>

      {/* 5. Desktop-Safe Blur (Bottom Navigation Clearance) */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-bg-main via-bg-main/80 to-transparent pointer-events-none z-30" />
    </div>
  );
}