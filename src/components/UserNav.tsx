/**
 * @fileoverview Enterprise User Navigation & Session Authorization Controller
 * @module components/navigation/UserNav
 * @description Production-ready user navigation control bar component featuring NextAuth session
 * tracking, dynamic avatar rendering, client-side state sanitization, keyboard accessibility,
 * and WCAG AA compliant interactive states.
 */

"use client";

import React, { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Interface representing sanitized user profile data extracted from session
 */
export interface NavUserSession {
  readonly name?: string | null;
  readonly email?: string | null;
  readonly image?: string | null;
}

/**
 * Component props for authenticated user navigation view
 */
interface AuthenticatedUserNavProps {
  readonly user: NavUserSession;
  readonly onSignOut: () => Promise<void>;
  readonly isLoggingOut: boolean;
}

/**
 * Component props for the top-level UserNav container
 */
export interface UserNavProps {
  readonly className?: string;
  readonly customLoginRedirectUrl?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Safely clears browser client-side storage without throwing security exceptions.
 */
const clearClientState = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.warn("[UserNav] Failed to clear client storage:", error);
  }
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Skeleton Loader State Component
 */
const UserNavSkeleton = memo(function UserNavSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading authentication status"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 animate-pulse select-none"
    >
      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" aria-hidden="true" />
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Authenticating...
      </span>
    </div>
  );
});

/**
 * Unauthenticated CTA State Component
 */
const UnauthenticatedNav = memo(function UnauthenticatedNav({
  loginUrl = "/login",
}: {
  readonly loginUrl?: string;
}) {
  return (
    <Link
      href={loginUrl}
      aria-label="Sign in to your MoneyPlant account"
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Sign In</span>
    </Link>
  );
});

/**
 * Authenticated User View & Sign Out Control Component
 */
const AuthenticatedUserNav = memo(function AuthenticatedUserNav({
  user,
  onSignOut,
  isLoggingOut,
}: AuthenticatedUserNavProps) {
  const displayName = useMemo(() => {
    if (user.name && user.name.trim().length > 0) return user.name;
    if (user.email && user.email.trim().length > 0) return user.email.split("@")[0];
    return "User";
  }, [user.name, user.email]);

  const userInitial = useMemo(() => {
    return displayName.charAt(0).toUpperCase();
  }, [displayName]);

  return (
    <div className="flex items-center gap-3">
      {/* User Information Display */}
      <div
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        aria-label={`Logged in as ${displayName}`}
      >
        <div
          aria-hidden="true"
          className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-sm border border-white/20 shrink-0"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>
        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[120px] sm:max-w-[160px]">
          {displayName}
        </span>
      </div>

      {/* Interactive Global Sign Out Trigger */}
      <button
        type="button"
        onClick={onSignOut}
        disabled={isLoggingOut}
        aria-label="Sign out of your session"
        aria-busy={isLoggingOut}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
          isLoggingOut && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" aria-hidden="true" />
        ) : (
          <LogOut className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {isLoggingOut ? "Ending..." : "Sign Out"}
        </span>
      </button>
    </div>
  );
});

// ============================================================================
// MAIN USERNAV ARCHITECTURE MODULE
// ============================================================================

export default function UserNav({
  className,
  customLoginRedirectUrl = "/login",
}: UserNavProps) {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  /**
   * Safe Global Logout Handler with state invalidation
   */
  const handleGlobalLogout = useCallback(async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Purge volatile client-side cache before auth cookie invalidation
      clearClientState();

      // Trigger NextAuth global sign-out procedure
      await signOut({
        callbackUrl: customLoginRedirectUrl,
        redirect: true,
      });
    } catch (error) {
      console.error("[UserNav] Global logout execution failed:", error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, customLoginRedirectUrl]);

  return (
    <nav
      aria-label="User Account Quick Access"
      className={cn("flex items-center select-none transform-gpu", className)}
    >
      {status === "loading" && <UserNavSkeleton />}

      {status === "unauthenticated" && (
        <UnauthenticatedNav loginUrl={customLoginRedirectUrl} />
      )}

      {status === "authenticated" && session?.user && (
        <AuthenticatedUserNav
          user={session.user}
          onSignOut={handleGlobalLogout}
          isLoggingOut={isLoggingOut}
        />
      )}
    </nav>
  );
}