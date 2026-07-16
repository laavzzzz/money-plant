"use client";

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* 🧠 TYPES */
type InputProps = {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/* 🧊 COMPONENT */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", containerClassName, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className={cn("w-full space-y-2 group", containerClassName)}>
        {/* 🏷 LABEL (Gen Z Style: Bold & Slightly Spaced) */}
        {label && (
          <label className="block text-xs font-bold uppercase tracking-widest text-text-light/70 ml-2 transition-colors group-focus-within:text-primary">
            {label}
          </label>
        )}

        {/* 📦 INPUT WRAPPER */}
        <div className="relative">
          {/* ✨ BACKGROUND GLOW (Activated on Focus) */}
          <div 
            className={cn(
              "absolute inset-0 rounded-[22px] blur-lg transition-all duration-500 opacity-0 -z-10",
              isFocused ? "bg-primary/20 opacity-100" : "bg-transparent",
              error && "bg-danger/20"
            )} 
          />

          {/* ICON SECTION */}
          {icon && (
            <span className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-20 transition-colors duration-300",
              isFocused ? "text-primary" : "text-gray-400",
              error && "text-danger"
            )}>
              {icon}
            </span>
          )}

          {/* THE ACTUAL INPUT */}
          <input
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full bg-white/60 dark:bg-white/5 backdrop-blur-md border-2 rounded-[22px]",
              "py-4 px-5 text-sm font-medium outline-none transition-all duration-300",
              "placeholder:text-gray-400 text-text-main",
              "border-white/80 dark:border-zinc-200",
              
              /* Focus State */
              "focus:border-primary/50 focus:bg-white/90 dark:focus:bg-white/10",
              
              /* Icon Padding */
              icon ? "pl-12" : "pl-6",
              
              /* Error State */
              error && "border-danger/50 focus:border-danger text-danger placeholder:text-danger/40",
              
              className
            )}
            {...props}
          />
        </div>

        {/* ❌ ERROR MESSAGE (Animated) */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-[11px] font-bold text-danger ml-4 flex items-center gap-1"
            >
              <span className="w-1 h-1 bg-danger rounded-full animate-pulse" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;