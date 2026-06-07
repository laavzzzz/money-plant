"use client";

import React from "react";
import Sidebar from "@/components/navigation/Sidebar";
import MobileNav from "@/components/navigation/MobileNav";
import { Bell, Search, Leaf } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFC] dark:bg-[#0B0B0D] relative overflow-hidden transition-colors duration-500">
      
      {/* 🌿 SIDEBAR (Desktop) */}
      <Sidebar />

      {/* 🚀 MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* TOP NAVBAR (Header for mobile and search/notifications for desktop) */}
        <header className="sticky top-0 z-30 w-full border-b border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Brand Logo for Mobile */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="text-emerald-500 w-4.5 h-4.5" />
            </div>
            <span className="font-black text-sm tracking-tight text-text-main">
              MoneyPlant 🌿
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden sm:flex items-center bg-white/50 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-full px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-primary/20 w-64 lg:w-80">
            <Search size={16} className="text-text-light shrink-0" />
            <input
              type="search"
              placeholder="Search assets..."
              className="bg-transparent border-none text-xs outline-none w-full placeholder:text-text-light/50 font-bold"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => toast.info("Everything is green and growing! 🌱")}
              className="relative p-2.5 rounded-full bg-white/70 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:scale-105 active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-text-main" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border border-white dark:border-zinc-950 animate-pulse" />
            </button>

            {/* Profile Avatar (Mobile) */}
            <Link
              href="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] hover:scale-105 active:scale-95 transition-transform lg:hidden"
              aria-label="Profile"
            >
              <div className="w-full h-full rounded-full bg-[#FAFAFC] dark:bg-[#0B0B0D] flex items-center justify-center text-sm">
                👩‍💻
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 min-w-0 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 📱 MOBILE NAVIGATION BAR */}
      <MobileNav />

      {/* BACKGROUND GRAPHIC ORNAMENTS */}
      <div className="absolute inset-0 -z-50 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/5" />
      </div>
    </div>
  );
}