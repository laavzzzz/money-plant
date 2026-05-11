"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";
import { Bell, Leaf, Search } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               DASHBOARD HEADER                              */
/* -------------------------------------------------------------------------- */
const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between bg-white/40 dark:bg-black/20 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shadow-vibe">
          <Leaf className="text-vibe-dark w-6 h-6" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-text-light uppercase tracking-tighter">My Garden</h1>
          <p className="text-lg font-black text-text-main -mt-1">MoneyPlant🌿</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 text-text-main hover:scale-110 transition-transform">
          <Search size={20} />
        </button>
        <button className="relative p-2 rounded-full bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 text-text-main hover:scale-110 transition-transform">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-black" />
        </button>
      </div>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN LAYOUT                                  */
/* -------------------------------------------------------------------------- */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* 1. Persistent Header */}
      <DashboardHeader />

      {/* 2. Content Area with Framer Motion Page Transitions */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Injecting a "Vibe" Breadcrumb or Date header automatically */}
            <div className="mb-8">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                Live Status
              </span>
              <h2 className="text-3xl font-black text-text-main mt-3 capitalize">
                {pathname.split("/").pop() || "Dashboard"}
              </h2>
            </div>

            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Floating Bottom Navigation */}
      <BottomNav />

      {/* 4. Decorative Mesh Background (Isolated to Dashboard) */}
      <div 
        className="fixed inset-0 -z-50 pointer-events-none overflow-hidden" 
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] animation-delay-2000 animate-pulse" />
      </div>

      {/* 5. Mobile Optimization Overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent pointer-events-none z-40" />
    </div>
  );
}