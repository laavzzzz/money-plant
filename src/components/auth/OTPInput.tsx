"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  isDisabled?: boolean;
  hasError?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  isDisabled = false,
  hasError = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !isDisabled) {
      inputRefs.current[0].focus();
    }
  }, [isDisabled]);

  // Propagate OTP changes upward
  const updateOtpState = (newOtp: string[]) => {
    setOtp(newOtp);
    const combinedOtp = newOtp.join("");
    
    if (onChange) {
      onChange(combinedOtp);
    }

    if (combinedOtp.length === length && !newOtp.includes("")) {
      if (onComplete) {
        onComplete(combinedOtp);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    // Allow only numeric input
    const sanitizedValue = value.replace(/[^0-9]/g, "");

    if (!sanitizedValue) return;

    const newOtp = [...otp];
    // Take the last entered character if typing over an existing char
    newOtp[index] = sanitizedValue.substring(sanitizedValue.length - 1);
    updateOtpState(newOtp);

    // Auto-advance to next input field
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current field
        newOtp[index] = "";
        updateOtpState(newOtp);
      } else if (index > 0) {
        // Move focus back and clear previous field
        newOtp[index - 1] = "";
        updateOtpState(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isDisabled) return;

    const pastedData = e.clipboardData.getData("text").trim();
    const sanitizedData = pastedData.replace(/[^0-9]/g, "").slice(0, length);

    if (!sanitizedData) return;

    const newOtp = Array(length).fill("");
    for (let i = 0; i < sanitizedData.length; i++) {
      newOtp[i] = sanitizedData[i];
    }

    updateOtpState(newOtp);

    // Focus the box immediately after the last pasted digit, or the last box
    const focusIndex = Math.min(sanitizedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={isDisabled}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 text-center text-xl sm:text-2xl font-bold transition-all duration-200 outline-none
            ${
              isDisabled
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : hasError
                ? "border-red-500 text-red-600 bg-red-50/30 focus:border-red-600 focus:ring-4 focus:ring-red-100"
                : digit
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/20"
                : "border-slate-300 text-slate-900 bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            }
          `}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;