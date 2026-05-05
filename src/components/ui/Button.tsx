"use client";

import {
  ButtonHTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";
import clsx from "clsx";

/* 🧠 TYPES */
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;

  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/* 🎨 VARIANT STYLES */
const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md",

  secondary:
    "bg-white/60 backdrop-blur border border-gray-200 text-gray-800",

  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100",

  danger:
    "bg-red-500 text-white shadow-md",
};

/* 📏 SIZE STYLES */
const sizeStyles: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-5 py-3",
  lg: "text-base px-6 py-4",
};

/* 🔘 COMPONENT */
const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97]",
          
          fullWidth && "w-full",
          
          variantStyles[variant],
          sizeStyles[size],

          isDisabled && "opacity-60 cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-yellow-300",

          className
        )}
        {...props}
      >
        {/* ⏳ LOADING */}
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {/* ⬅️ LEFT ICON */}
            {leftIcon && <span>{leftIcon}</span>}

            {/* TEXT */}
            <span>{children}</span>

            {/* ➡️ RIGHT ICON */}
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;