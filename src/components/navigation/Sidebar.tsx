/**
 * @fileoverview Enterprise Sidebar Navigation Architecture
 * @module components/navigation/Sidebar
 * @description Highly performant, accessible, and fully typed desktop sidebar navigation interface.
 * Features NextAuth session invalidation integration, animated state indicators, and WCAG AA compliance.
 */

"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
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
  LogOut,
  Loader2,
  LucideIcon,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Navigation item contract definition
 */
export interface NavItem {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly href: string;
  readonly ariaLabel?: string;
}

/**
 * Navigation item component properties
 */
interface SidebarNavItemProps {
  readonly item: NavItem;
  readonly isActive: boolean;
}

// ============================================================================
// CONSTANTS & ROUTE MAPPINGS
// ============================================================================

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", icon: Home, href: "/dashboard", ariaLabel: "Navigate to Dashboard overview" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/dashboard/transactions", ariaLabel: "View all transactions" },
  { label: "Analytics", icon: PieChart, href: "/dashboard/analytics", ariaLabel: "View financial analytics and reports" },
  { label: "Goals", icon: Target, href: "/dashboard/goals", ariaLabel: "Manage savings goals" },
  { label: "Garden", icon: Leaf, href: "/dashboard/garden", ariaLabel: "View gamified money plant garden" },
  { label: "Dream Vault", icon: Heart, href: "/dashboard/wishlist", ariaLabel: "Access dream vault wishlist" },
  { label: "Leaderboard", icon: Trophy, href: "/dashboard/leaderboard", ariaLabel: "Check global user leaderboards" },
  { label: "Profile", icon: User, href: "/dashboard/profile", ariaLabel: "View and edit user profile settings" },
] as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Sidebar Brand Header Component
 */
const SidebarHeader = memo(function SidebarHeader() {
  return (
    <header className="px-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl p-1 transition-all"
        aria-label="MoneyPlant Home Dashboard"
      >
        <div
          className="w-11 h-11 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300"
          aria-hidden="true"
        >
          <Leaf className="text-emerald-500 w-6 h-6 transition-transform group-hover:rotate-12 duration-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
            Wealth RPG
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
            MoneyPlant <span className="text-sm">🌿</span>
          </span>
        </div>
      </Link>
    </header>
  );
});

/**
 * Sidebar Navigation Item Component
 */
const SidebarNavItem = memo(function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.ariaLabel || item.label}
      aria-current={isActive ? "page" : undefined}
      className="block outline-none rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div
        className={cn(
          "relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group cursor-pointer overflow-hidden transform-gpu select-none",
          isActive
            ? "text-slate-900 dark:text-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
        )}
      >
        {/* Active Pill Indicator with Framer Motion Spring */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeSidebarIndicator"
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-l-4 border-emerald-500 z-0"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
              }}
              initial={false}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Navigation Content */}
        <motion.div
          className="relative z-10 flex items-center gap-4 w-full"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Icon
            size={20}
            aria-hidden="true"
            className={cn(
              "transition-all duration-300 shrink-0",
              isActive
                ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110"
                : "group-hover:scale-105 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
            )}
          />
          <span className="tracking-tight font-extrabold">{item.label}</span>
        </motion.div>

        {/* Hover Pill */}
        <div
          aria-hidden="true"
          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </Link>
  );
});

/**
 * Sidebar User Footer & Global Auth Invalidation Component
 */
const SidebarFooter = memo(function SidebarFooter() {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("[SidebarFooter] Logout execution failure:", error);
      setIsLoggingOut(false);
    }
  }, []);

  const userName = useMemo(() => {
    return session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  }, [session]);

  return (
    <footer className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
      {/* User Information Display */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 border border-white/20">
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
              {status === "loading" ? "Authenticating..." : userName}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
              {session?.user?.email || "Pro Tier Account"}
            </span>
          </div>
        </div>
      </div>

      {/* Explicit Global Sign Out Trigger */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoggingOut || status === "loading"}
        aria-label="Sign out of application"
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-extrabold text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <span className="flex items-center gap-2">
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <LogOut className="w-4 h-4 text-red-500" />
          )}
          <span>{isLoggingOut ? "Ending Session..." : "Sign Out"}</span>
        </span>
        <span className="text-[10px] font-black opacity-60">ESC</span>
      </button>
    </footer>
  );
});

// ============================================================================
// MAIN SIDEBAR ARCHITECTURE MODULE
// ============================================================================

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main Application Sidebar Navigation"
      className="fixed top-0 left-0 bottom-0 w-64 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 p-6 flex flex-col justify-between z-40 hidden lg:flex select-none transform-gpu"
    >
      <div className="space-y-8">
        {/* Brand Identity Header */}
        <SidebarHeader />

        {/* Primary Route Navigation */}
        <nav className="space-y-1.5" aria-label="Sidebar Routing Directory">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SidebarNavItem key={item.href} item={item} isActive={isActive} />
            );
          })}
        </nav>
      </div>

      {/* Global Authentication Control Footer */}
      <SidebarFooter />
    </aside>
  );
}