"use client";

import React, { memo, forwardRef, useMemo } from "react";
import { HTMLMotionProps, motion, useReducedMotion, Variants } from "framer-motion";
import { Sparkles, Command } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

/**
 * Size variants available for the FloatingButton component.
 */
export type FloatingButtonSize = "sm" | "md" | "lg";

/**
 * Props for the FloatingButton component.
 * Extends standard HTML button attributes for full accessibility and event handling flexibility.
 */
export interface FloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Click handler triggered when the floating button is pressed or activated via keyboard.
   */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Indicates whether the target panel/modal is currently open.
   * Used to drive ARIA attributes and visual transformation states.
   * @default false
   */
  isPanelOpen?: boolean;

  /**
   * Displays a visual unread/status indicator dot over the button icon.
   * @default false
   */
  hasUnread?: boolean;

  /**
   * Optional numerical badge count to display over the trigger.
   */
  badgeCount?: number;

  /**
   * Size variant of the floating trigger.
   * @default "md"
   */
  size?: FloatingButtonSize;

  /**
   * Custom CSS classes to merge with the default button styling.
   */
  className?: string;

  /**
   * ID of the panel element controlled by this trigger button for ARIA mapping.
   * @default "vibecheck-assistant-panel"
   */
  ariaControlsId?: string;

  /**
   * Optional visible keyboard shortcut hint badge.
   * @default true
   */
  showKeyHint?: boolean;
}

// ============================================================================
// ANIMATION VARIANTS & CONFIGURATIONS
// ============================================================================

const BUTTON_VARIANTS: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
  },
  hidden: {
    scale: 0,
    opacity: 0,
    y: 30,
    pointerEvents: "none",
    transition: {
      type: "spring",
      damping: 22,
      stiffness: 350,
    },
  },
};

const REDUCED_MOTION_VARIANTS: Variants = {
  initial: { opacity: 0 },
  visible: { opacity: 1, pointerEvents: "auto" },
  hidden: { opacity: 0, pointerEvents: "none" },
};

const SIZE_STYLES: Record<FloatingButtonSize, { button: string; icon: number }> = {
  sm: {
    button: "h-12 w-12 sm:h-14 sm:w-14",
    icon: 20,
  },
  md: {
    button: "h-14 w-14 sm:h-16 sm:w-16",
    icon: 26,
  },
  lg: {
    button: "h-16 w-16 sm:h-20 sm:w-20",
    icon: 30,
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Status indicator badge component for unread AI responses or action items.
 */
const StatusBadge = memo(({ count }: { count?: number }) => {
  if (count !== undefined && count > 0) {
    return (
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-red-500 px-1 text-[10px] font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="absolute right-0.5 top-0.5 flex h-4 w-4"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-zinc-950 bg-red-500" />
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FloatingButton Component
 *
 * An enterprise-grade, accessible, interactive trigger button designed for floating drawer interfaces
 * and AI copilot panels. Built with Neo-brutalist styling tokens and Framer Motion spring dynamics.
 */
const FloatingButton = memo(
  forwardRef<HTMLButtonElement, FloatingButtonProps>(
    (
      {
        onClick,
        isPanelOpen = false,
        hasUnread = false,
        badgeCount,
        size = "md",
        className,
        ariaControlsId = "vibecheck-assistant-panel",
        showKeyHint = true,
        disabled = false,
        type = "button",
        ...restProps
      },
      ref
    ) => {
      const shouldReduceMotion = useReducedMotion();

      // Dynamic accessible label reflects active status to screen readers
      const accessibleLabel = useMemo(() => {
        if (isPanelOpen) {
          return "Close VibeCheck AI Terminal";
        }
        if (badgeCount && badgeCount > 0) {
          return `Open VibeCheck AI Terminal (${badgeCount} unread notifications)`;
        }
        if (hasUnread) {
          return "Open VibeCheck AI Terminal (New insights available)";
        }
        return "Open VibeCheck AI Terminal";
      }, [isPanelOpen, badgeCount, hasUnread]);

      // Active animation variant map based on reduced motion user preferences
      const activeVariants = shouldReduceMotion
        ? REDUCED_MOTION_VARIANTS
        : BUTTON_VARIANTS;

      const sizeConfig = SIZE_STYLES[size] ?? SIZE_STYLES.md;

      return (
        <motion.button
          ref={ref}
          type={type}
          id="vibecheck-trigger-fab"
          aria-label={accessibleLabel}
          aria-haspopup="dialog"
          aria-expanded={isPanelOpen}
          aria-controls={ariaControlsId}
          aria-keyshortcuts="Control+k Meta+k"
          disabled={disabled}
          initial="initial"
          animate={isPanelOpen ? "hidden" : "visible"}
          exit="initial"
          variants={activeVariants}
          whileHover={
            shouldReduceMotion || disabled
              ? undefined
              : {
                  scale: 1.08,
                  rotate: 6,
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                }
          }
          whileTap={
            shouldReduceMotion || disabled
              ? undefined
              : {
                  scale: 0.92,
                }
          }
          onClick={onClick}
          className={cn(
            "fixed bottom-28 right-4 z-[100] flex items-center justify-center rounded-full sm:right-6 lg:bottom-8",
            sizeConfig.button,
            "border-2 border-zinc-950 bg-amber-400 text-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            "hover:bg-amber-300 active:bg-amber-500",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "select-none transform-gpu transition-colors duration-200 will-change-transform",
            disabled && "cursor-not-allowed opacity-50 shadow-none hover:bg-amber-400",
            className
          )}
          {...(restProps as unknown as HTMLMotionProps<"button">)}
        >
          {/* Main Icon */}
          <Sparkles
            size={sizeConfig.icon}
            className="pointer-events-none stroke-[2.2] text-zinc-950"
            aria-hidden="true"
          />

          {/* Unread / Notification Badge */}
          {(hasUnread || (badgeCount !== undefined && badgeCount > 0)) && (
            <StatusBadge count={badgeCount} />
          )}

          {/* Keybinding Tooltip Hint Badge */}
          {showKeyHint && !isPanelOpen && (
            <span
              aria-hidden="true"
              className="absolute -bottom-2 hidden items-center gap-0.5 rounded border border-zinc-950 bg-white px-1.5 py-0.2 text-[9px] font-black text-zinc-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:flex"
            >
              <Command size={9} />K
            </span>
          )}
        </motion.button>
      );
    }
  )
);

FloatingButton.displayName = "FloatingButton";

export default FloatingButton;