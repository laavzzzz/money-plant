"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  ArrowLeftRight,
  PieChart,
  Target,
  Leaf,
  Heart,
  Trophy,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/dashboard/transactions" },
  { label: "Analytics", icon: PieChart, href: "/dashboard/analytics" },
  { label: "Goals", icon: Target, href: "/dashboard/goals" },
  { label: "Garden", icon: Leaf, href: "/dashboard/garden" },
  { label: "Dream Vault", icon: Heart, href: "/dashboard/wishlist" },
  { label: "Leaderboard", icon: Trophy, href: "/dashboard/leaderboard" },
  { label: "Profile", icon: User, href: "/dashboard/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white/60 dark:bg-black/30 backdrop-blur-xl border-r border-white/20 p-6 flex flex-col justify-between z-40 hidden lg:flex">
      <div className="space-y-8">
        {/* Brand Logo Header */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/25 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(178,242,187,0.6)]">
            <Leaf className="text-emerald-500 w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-text-light uppercase tracking-widest leading-none mb-1">
              Wealth RPG
            </p>
            <p className="text-xl font-black text-text-main tracking-tight">
              MoneyPlant 🌿
            </p>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group cursor-pointer overflow-hidden",
                    isActive
                      ? "text-text-main shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                      : "text-text-light hover:text-text-main"
                  )}
                >
                  {/* Sliding active pastel capsule */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border-l-4 border-primary z-0"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon & Label */}
                  <motion.div
                    className="relative z-10 flex items-center gap-4 w-full"
                    whileHover={{ x: 3 }}
                  >
                    <Icon
                      size={20}
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? "text-primary drop-shadow-[0_0_8px_rgba(195,172,255,0.8)] scale-110"
                          : "group-hover:scale-105"
                      )}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </motion.div>

                  {/* Cute hover indicator pill on the right */}
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  )}