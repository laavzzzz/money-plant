"use client";

import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {/* 🏷 Label */}
        {label && (
          <label className="text-sm font-medium text-gray-600">
            {label}
          </label>
        )}

        {/* 📦 Input Wrapper */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={`
              w-full bg-white border border-gray-200 rounded-2xl
              py-3 px-4 text-sm outline-none
              placeholder:text-gray-400
              focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100
              transition
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-400 focus:ring-red-100" : ""}
              ${className}
            `}
            {...props}
          />
        </div>

        {/* ❌ Error */}
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;