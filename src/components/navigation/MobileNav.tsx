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
  Trophy,
  Sparkles
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "History", icon: ArrowLeftRight, href: "/dashboard/transactions" },
  { label: "Charts", icon: PieChart, href: "/dashboard/analytics" },
  { label: "Goals", icon: Target, href: "/dashboard/goals" },
  { label: "Ranks", icon: Trophy, href: "/dashboard/leaderboard" },
  { label: "AI", icon: Sparkles, href: "/dashboard/ai-buddy" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none lg:hidden">
      <nav className="glass-panel pointer-events-auto flex items-center justify-between gap-1 p-2 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[28px] border border-white/50 dark:border-white/10 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 min-w-0 group py-2 flex flex-col items-center justify-center outline-none"
            >
              {/* Sliding Background Pill */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeMobileNavIndicator"
                    className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-2xl z-0"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon and label wrapper */}
              <motion.div
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                className={cn(
                  "relative z-10 flex flex-col items-center transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-text-light group-hover:text-primary/70 group-active:scale-95"
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(195,172,255,0.6)]"
                  )}
                />
                <span className="text-[9px] mt-0.5 font-bold uppercase tracking-tight truncate max-w-[50px]">
                  {item.label}
                </span>
              </motion.div>

              {/* Little indicator dot under the pill */}
              {isActive && (
                <motion.div
                  layoutId="activeMobileDot"
                  className="absolute bottom-0 w-1 h-1 bg-primary rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
