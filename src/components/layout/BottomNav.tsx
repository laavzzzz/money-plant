"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  ArrowLeftRight,
  Leaf,
  Heart,
  Trophy,
  User,
} from "lucide-react";

/* 🗺️ NAVIGATION CONFIG */
const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "History", icon: ArrowLeftRight, href: "/transactions" },
  { label: "Garden", icon: Leaf, href: "/garden" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
  { label: "Ranks", icon: Trophy, href: "/leaderboard" },
  { label: "Me", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-3 pointer-events-none">
      <nav className="glass-panel pointer-events-auto flex items-center justify-between gap-0.5 p-1.5 w-full max-w-2xl sm:max-w-3xl shadow-float rounded-[28px] border border-white/50 dark:border-white/10 bg-white/70 dark:bg-vibe-dark/80 backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          // Check if link is active
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="relative flex-1 min-w-0 group py-2 flex flex-col items-center justify-center outline-none"
            >
              {/* ✨ MAGNETIC SLIDING PILL (The "Lavender" Highlight) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-vibe-purple/20 dark:bg-vibe-purple/30 rounded-2xl z-0"
                    transition={{ 
                      type: "spring", 
                      stiffness: 380, 
                      damping: 30 
                    }}
                  />
                )}
              </AnimatePresence>
              
              {/* 🎨 ICON & LABEL CONTAINER */}
              <motion.div 
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                className={cn(
                  "relative z-10 flex flex-col items-center transition-all duration-300",
                  isActive 
                    ? "text-vibe-purple" 
                    : "text-text-light group-hover:text-vibe-purple/70 group-active:scale-90"
                )}
              >
                {/* ICON WITH DYNAMIC STROKE & GLOW */}
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2} 
                  className={cn(
                    "transition-all duration-300", 
                    isActive && "drop-shadow-[0_0_8px_rgba(195,172,255,0.6)]"
                  )}
                />
                
                {/* LABEL */}
                <span className={cn(
                  "text-[8px] mt-0.5 font-black uppercase tracking-tighter transition-opacity duration-300 truncate max-w-[52px]",
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </motion.div>

              {/* 🟢 THE ACTIVE DOT INDICATOR */}
              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-vibe-purple rounded-full shadow-[0_0_5px_rgba(195,172,255,1)]"
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30 
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