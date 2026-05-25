"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { Bell, Leaf, Search } from "lucide-react";
import { toast } from "sonner";
import { getPageMeta } from "@/lib/page-meta";

const SHELL = "w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/50 dark:bg-black/30 backdrop-blur-xl">
      <div
        className={`${SHELL} py-3 sm:py-4 flex items-center justify-between gap-3`}
      >
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-accent rounded-2xl flex items-center justify-center shadow-vibe shrink-0">
            <Leaf className="text-vibe-dark w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-black text-text-light uppercase tracking-[0.2em] leading-none mb-0.5 truncate">
              My Garden
            </p>
            <p className="text-base sm:text-xl font-black text-text-main tracking-tight truncate">
              MoneyPlant 🌿
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-full px-3 py-1.5 gap-2 focus-within:ring-2 ring-primary/20">
            <Search size={16} className="text-text-light shrink-0" />
            <input
              type="search"
              placeholder="Search wealth..."
              className="bg-transparent border-none text-sm outline-none w-28 lg:w-40 placeholder:text-text-light/50"
            />
          </div>

          <button
            type="button"
            onClick={() => toast.info("No new alerts — you're all caught up! 🔔")}
            className="relative p-2 sm:p-2.5 rounded-full bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-white dark:border-black" />
          </button>

          <Link
            href="/profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] hover:scale-105 transition-transform"
            aria-label="Profile"
          >
            <div className="w-full h-full rounded-full bg-bg-main flex items-center justify-center text-base">
              👩‍💻
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative min-h-[100dvh] flex flex-col bg-bg-main">
      <DashboardHeader />

      <main className={`${SHELL} flex-1 pt-5 sm:pt-8 pb-28 sm:pb-32`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full min-w-0"
          >
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest mb-2 sm:mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-main tracking-tighter">
                  {meta.title}
                </h1>
                {meta.subtitle && (
                  <p className="text-xs sm:text-sm font-bold text-text-light mt-1">
                    {meta.subtitle}
                  </p>
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-text-light uppercase tracking-widest shrink-0 hidden xs:block sm:text-right">
                {today}
              </p>
            </div>

            <div className="w-full min-w-0">{children}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      <div
        className="fixed inset-0 -z-50 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="vibe-canvas absolute inset-0 opacity-40 dark:opacity-20" />
        <div className="absolute top-[-15%] left-[-10%] w-[50%] max-w-xl h-[50%] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] max-w-xl h-[50%] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-t from-bg-main via-bg-main/90 to-transparent pointer-events-none z-30" />
    </div>
  );
}
