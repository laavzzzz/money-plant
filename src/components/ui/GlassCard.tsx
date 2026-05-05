"use client";

import { motion, MotionProps } from "framer-motion";
import {
  HTMLAttributes,
  ReactNode,
  forwardRef,
  KeyboardEvent,
} from "react";
import clsx from "clsx";

/* 🧠 TYPES */
type Variant = "glass" | "solid" | "outline";
type Elevation = "none" | "sm" | "md" | "lg";

type GlassCardProps = {
  children: ReactNode;
  className?: string;

  variant?: Variant;
  elevation?: Elevation;

  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "onAnimationStart"> &
  MotionProps;

/* 🎨 STYLE MAPS */
const variantStyles: Record<Variant, string> = {
  glass: "glass-card",
  solid: "bg-white dark:bg-gray-900 rounded-[28px]",
  outline:
    "bg-transparent border border-gray-200 dark:border-gray-700 rounded-[28px]",
};

const elevationStyles: Record<Elevation, string> = {
  none: "",
  sm: "shadow-sm",
  md: "soft-shadow",
  lg: "shadow-xl",
};

/* 🎬 PREMIUM MOTION PRESET */
const motionPreset: MotionProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1], // 💎 premium cubic-bezier
  },
};

/* 🧊 COMPONENT */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = "glass",
      elevation = "md",
      hover = true,
      clickable = false,
      loading = false,
      onClick,
      ...rest
    },
    ref
  ) => {
    /* ⌨️ KEYBOARD SUPPORT */
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!clickable) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.(e as any);
      }
    };

    return (
      <motion.div
        ref={ref}

        /* 🎬 ENTRY */
        {...motionPreset}

        /* ✨ INTERACTION */
        whileHover={hover ? { scale: 1.02 } : undefined}
        whileTap={clickable ? { scale: 0.97 } : undefined}

        /* 🎨 STYLES */
        className={clsx(
          "relative overflow-hidden p-5 transition-all duration-300",
          variantStyles[variant],
          elevationStyles[elevation],
          hover && "card-hover",
          clickable &&
            "cursor-pointer active:scale-[0.97] focus:outline-none",
          loading && "pointer-events-none opacity-70",
          className
        )}

        /* ♿ ACCESSIBILITY */
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onClick={onClick}

        {...rest}
      >
        {/* 🌫️ LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-yellow-400 rounded-full animate-spin" />
          </div>
        )}

        {/* ✨ SHINE EFFECT */}
        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-20 transition duration-300 pointer-events-none" />

        {/* 📦 CONTENT */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;