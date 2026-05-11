"use client";

import { motion, MotionProps, AnimatePresence } from "framer-motion";
import {
  HTMLAttributes,
  ReactNode,
  forwardRef,
  KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

/* 🧠 TYPES */
type Variant = "glass" | "solid" | "outline" | "neon";
type Elevation = "none" | "sm" | "md" | "lg" | "vibe";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  elevation?: Elevation;
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  glowColor?: string; // For the neon variant
} & Omit<HTMLAttributes<HTMLDivElement>, "onAnimationStart"> &
  MotionProps;

/* 🎨 STYLE MAPS */
const variantStyles: Record<Variant, string> = {
  glass: "glass-panel bg-white/65 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10",
  solid: "bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800",
  outline: "bg-transparent border-2 border-primary/20 dark:border-primary/10",
  neon: "bg-white/80 dark:bg-black/80 border-2 border-primary/30 shadow-[0_0_20px_rgba(195,172,255,0.2)]",
};

const elevationStyles: Record<Elevation, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-vibe",
  lg: "shadow-float",
  vibe: "shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
};

/* 🎬 PREMIUM MOTION PRESET */
const motionPreset: MotionProps = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
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
      glowColor,
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
        {...motionPreset}
        
        /* ✨ INTERACTION PHYSICS */
        whileHover={hover ? { 
          y: -6, 
          scale: 1.01,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        } : undefined}
        whileTap={clickable ? { scale: 0.97 } : undefined}

        /* 🎨 DYNAMIC STYLING */
        className={cn(
          "relative overflow-hidden p-6 rounded-vibe transition-all duration-500",
          variantStyles[variant],
          elevationStyles[elevation],
          clickable && "cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          loading && "pointer-events-none",
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
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-center z-30"
            >
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✨ DYNAMIC LIGHT REFLECTION (The "Lovable" look) */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" 
          aria-hidden="true"
        />

        {/* 📦 CONTENT CONTAINER */}
        <div className="relative z-20 w-full h-full">
          {children}
        </div>

        {/* 🪄 BACKGROUND ORNAMENT (Subtle Glow) */}
        {variant === 'neon' && (
           <div 
            className="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 pointer-events-none rounded-full"
            style={{ backgroundColor: glowColor || 'var(--primary)' }}
           />
        )}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;