"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, RotateCcw, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OTPInput } from "@/components/auth/OTPInput";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Countdown timer effect for Resend OTP button
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Submit OTP to API backend
  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const targetOtp = codeToVerify || otp;

      if (targetOtp.length !== 6) {
        setErrorMessage("Please enter all 6 digits of your verification code.");
        return;
      }

      if (!email) {
        setErrorMessage("Invalid verification session. Missing email context.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: targetOtp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify security code.");
        }

        setSuccessMessage("Email verified successfully! Redirecting...");
        
        // Brief delay before navigation for user feedback
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 1500);
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMessage(error.message || "Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, email, router]
  );

  // Auto-submit when 6 digits are completely filled
  const handleOtpComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    handleVerify(completedOtp);
  };

  // Handle Resend OTP payload dispatch
  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    if (!email) {
      setErrorMessage("Missing email query parameter.");
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not resend verification code.");
      }

      setSuccessMessage("A new verification code has been sent to your email.");
      setTimer(RESEND_COOLDOWN_SECONDS);
      setCanResend(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Failed to trigger resend. Try again shortly.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Verify Your Account
          </h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-700">
              {email || "your registered email"}
            </span>
          </p>
        </div>

        {/* Dynamic Alert Status Messages */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* 6-Digit OTP Box Component */}
        <div className="py-2">
          <OTPInput
            length={6}
            onChange={(val) => {
              setOtp(val);
              if (errorMessage) setErrorMessage(null);
            }}
            onComplete={handleOtpComplete}
            isDisabled={isSubmitting}
            hasError={Boolean(errorMessage)}
          />
        </div>

        {/* Action Button & Resend Control */}
        <div className="space-y-4">
          <button
            onClick={() => handleVerify()}
            disabled={isSubmitting || otp.length !== 6}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
              isSubmitting || otp.length !== 6
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] hover:shadow-indigo-200"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend Timer Logic */}
          <div className="text-center text-sm text-slate-500">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
            ) : (
              <p>
                Didn't receive code? Resend in{" "}
                <span className="font-semibold text-indigo-600">{timer}s</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
}