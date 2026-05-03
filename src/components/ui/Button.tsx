"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-full font-semibold shadow-md hover:scale-[1.03] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}