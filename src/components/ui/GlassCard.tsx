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

/* 🎨 EXACT IMAGE STYLE MAPS (image_b6fb47.jpg Design Tokens) */
const variantStyles: Record<Variant, string> = {
  // Matches the ultra-clean, white frost-refracted layout seen in image_b6fb47.jpg
  glass: "bg-white/45 backdrop-blur-[24px] border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] dark:bg-white/5 dark:border-zinc-200",
  solid: "bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800",
  outline: "bg-transparent border-2 border-primary/20 dark:border-primary/10",
  // Upgraded to a bright luminous cyan matching the active glowing targets in the reference picture
  neon: "bg-white/60 backdrop-blur-md border border-[#35D6FF]/40 shadow-[0_0_25px_rgba(53,214,255,0.15),inset_0_1px_2px_rgba(255,255,255,0.7)]",
};

const elevationStyles: Record<Elevation, string> = {
  none: "",
  sm: "shadow-sm",
  // Perfectly mimics the soft, deep volumetric dispersion under the bottom tray
  md: "shadow-[0_12px_40px_rgba(14,45,104,0.04)]",
  lg: "shadow-[0_20px_50px_rgba(14,45,104,0.07)]",
  vibe: "shadow-[0_30px_60px_rgba(14,45,104,0.09)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
};

/* 🎬 PREMIUM MOTION PRESET */
const motionPreset: MotionProps = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 22,
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
          y: -4, 
          scale: 1.005,
          transition: { type: "spring", stiffness: 400, damping: 15 }
        } : undefined}
        whileTap={clickable ? { scale: 0.98 } : undefined}

        /* 🎨 DYNAMIC STYLING */
        className={cn(
          "relative overflow-hidden p-6 rounded-[24px] transition-all duration-500", // Smooth rounded corners matching the bottom dock tray
          variantStyles[variant],
          elevationStyles[elevation],
          clickable && "cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2EE6D6]",
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
              className="absolute inset-0 bg-white/50 backdrop-blur-md flex items-center justify-center z-30"
            >
              <div className="w-8 h-8 border-3 border-[#2EE6D6]/30 border-t-[#2EE6D6] rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✨ DYNAMIC LIGHT REFLECTION (Matches the luminous angle on image_b6fb47.jpg layout edges) */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/30 opacity-60 pointer-events-none z-10" 
          aria-hidden="true"
        />

        {/* 📦 CONTENT CONTAINER */}
        <div className="relative z-20 w-full h-full">
          {children}
        </div>

        {/* 🪄 BACKGROUND ORNAMENT (Soft Radiant Core Ambient Backlight) */}
        {variant === 'neon' && (
           <div 
            className="absolute -right-6 -top-6 w-32 h-32 blur-2xl opacity-25 pointer-events-none rounded-full"
            style={{ backgroundColor: glowColor || '#35D6FF' }}
           />
        )}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;