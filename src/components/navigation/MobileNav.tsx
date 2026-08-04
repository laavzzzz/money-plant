/**
 * @fileoverview Enterprise Mobile Floating Bottom Navigation Architecture
 * @module components/navigation/MobileNav
 * @description Highly performant, accessible, and responsive mobile bottom navigation bar.
 * Features Framer Motion spring-physics pill indicators, nested route matching, and WCAG AA compliance.
 */

"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  CreditCard,
  ArrowLeftRight,
  Target,
  Leaf,
  User,
  LucideIcon,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Mobile navigation item configuration interface
 */
export interface MobileNavItemConfig {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly ariaLabel?: string;
}

/**
 * Props for individual MobileNavItem component
 */
interface MobileNavItemProps {
  readonly item: MobileNavItemConfig;
  readonly isActive: boolean;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const NAV_ITEMS: readonly MobileNavItemConfig[] = [
  { label: "Home", icon: Home, href: "/dashboard", ariaLabel: "Navigate to Dashboard Home" },
  { label: "Accounts", icon: CreditCard, href: "/dashboard/accounts", ariaLabel: "View Connected Accounts" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/dashboard/transactions", ariaLabel: "View All Transactions" },
  { label: "Goals", icon: Target, href: "/dashboard/goals", ariaLabel: "Manage Financial Goals" },
  { label: "Garden", icon: Leaf, href: "/dashboard/garden", ariaLabel: "View Money Plant Garden" },
  { label: "Profile", icon: User, href: "/dashboard/profile", ariaLabel: "View User Profile" },
] as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Isolated Navigation Item Sub-component
 * Wrapped in React.memo to prevent re-renders when other items change state.
 */
const MobileNavItem = memo(function MobileNavItem({ item, isActive }: MobileNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.ariaLabel || item.label}
      aria-current={isActive ? "page" : undefined}
      className="relative flex-1 min-w-0 group py-2 flex flex-col items-center justify-center outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      {/* Dynamic Background Sliding Pill */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activeMobileNavIndicator"
            className="absolute inset-0 bg-emerald-500/15 dark:bg-emerald-500/25 rounded-2xl z-0 transform-gpu"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32,
            }}
            initial={false}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Icon and Label Wrapper with Motion Scaling */}
      <motion.div
        animate={isActive ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative z-10 flex flex-col items-center transition-colors duration-300 transform-gpu select-none",
          isActive
            ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 group-active:scale-95 font-semibold"
        )}
      >
        <Icon
          size={20}
          aria-hidden="true"
          className={cn(
            "transition-all duration-300 shrink-0",
            isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          )}
        />
        <span className="text-[9px] mt-0.5 uppercase tracking-wider truncate max-w-[54px] text-center leading-none">
          {item.label}
        </span>
      </motion.div>

      {/* Active Indicator Micro-Dot */}
      {isActive && (
        <motion.div
          layoutId="activeMobileDot"
          className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full z-10 transform-gpu"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          aria-hidden="true"
        />
      )}
    </Link>
  );
});

// ============================================================================
// MAIN NAVIGATION ARCHITECTURE
// ============================================================================

export default function MobileNav() {
  const pathname = usePathname();

  // Helper function to calculate active status considering sub-routes
  const checkIsActive = (itemHref: string): boolean => {
    if (itemHref === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none lg:hidden transform-gpu select-none">
      <nav
        aria-label="Mobile Bottom Navigation Bar"
        className="glass-panel pointer-events-auto flex items-center justify-between gap-1 p-1.5 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[28px] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = checkIsActive(item.href);

          return (
            <MobileNavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </nav>
    </div>
  );
}