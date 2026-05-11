"use client";

import {
  ButtonHTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* 🧠 TYPES */
type Variant = "primary" | "secondary" | "vibe" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

type ButtonProps = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> & 
  MotionProps;

/* 🎨 STYLE MAPS */
const variantStyles: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] text-white shadow-[0_8px_20px_rgba(195,172,255,0.35)] hover:bg-right",
  
  vibe: "bg-accent text-vibe-dark shadow-[0_8px_20px_rgba(178,242,187,0.3)] border border-white/20",
  
  secondary: "glass-panel bg-white/60 dark:bg-white/10 border-white/40 text-text-main hover:bg-white/80",
  
  outline: "bg-transparent border-2 border-primary/40 text-primary hover:bg-primary/5",
  
  ghost: "bg-transparent text-text-light hover:bg-black/5 dark:hover:bg-white/5",
  
  danger: "bg-danger text-white shadow-[0_8px_20px_rgba(255,155,155,0.3)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-xs px-4 py-2 h-9",
  md: "text-sm px-6 py-3 h-12",
  lg: "text-base px-8 py-4 h-14 font-bold",
  icon: "p-3 h-12 w-12",
};

/* 🔘 COMPONENT */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref as any}
        disabled={isDisabled}
        
        /* ✨ HAPTIC MOTION */
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}

        className={cn(
          "relative flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-500 overflow-hidden select-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
          
          fullWidth && "w-full",
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && "opacity-50 cursor-not-allowed grayscale-[0.5]",
          className
        )}
        {...props}
      >
        {/* 🪄 SHIMMER EFFECT FOR PRIMARY BUTTON */}
        {variant === 'primary' && !isDisabled && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
        )}

        {/* ⏳ LOADING STATE */}
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {size !== 'icon' && <span>Loading...</span>}
          </div>
        ) : (
          <>
            {/* ⬅️ LEFT ICON */}
            {leftIcon && (
              <motion.span 
                initial={{ x: -5, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                className="flex shrink-0"
              >
                {leftIcon}
              </motion.span>
            )}

            {/* TEXT */}
            <span className="relative z-10 truncate">{children}</span>

            {/* ➡️ RIGHT ICON */}
            {rightIcon && (
              <motion.span 
                initial={{ x: 5, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                className="flex shrink-0"
              >
                {rightIcon}
              </motion.span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;