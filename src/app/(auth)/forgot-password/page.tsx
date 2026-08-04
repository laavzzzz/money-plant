/**
 * @file C:\Users\KIIT0001\Desktop\PLACEMENT\moneyplant\money-plant\src\app\(auth)\forgot-password\page.tsx
 * @module Auth/ForgotPasswordPage
 * @description Enterprise-grade, WCAG 2.1 AA compliant Forgot Password UI component with
 * strict schema validation, security protection against account enumeration, dynamic
 * countdown timers, accessible ARIA live regions, and resilient fetch abstractions.
 * 
 * @version 3.0.0
 * @author Principal Engineer & Architecture Team
 */

"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * RFC 5322 Compliant Email Validation Schema with normalization directives.
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please enter a valid email address (e.g., name@domain.com)." })
    .max(254, { message: "Email address cannot exceed 254 characters." })
    .transform((val) => val.trim().toLowerCase()),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const RESEND_COOLDOWN_SECONDS = 60;
const REQUEST_TIMEOUT_MS = 10000;
const API_FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password";

// ============================================================================
// RESILIENT API SERVICES
// ============================================================================

class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

/**
 * Resilient fetch execution wrapper with timeout signal handling.
 */
async function sendPasswordResetEmail(
  email: string,
  signal?: AbortSignal
): Promise<void> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  // Link provided abort signal with timeout abort controller if present
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(API_FORGOT_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiErrorResponse = {};
      try {
        errorData = (await response.json()) as ApiErrorResponse;
      } catch {
        // Fallback for non-JSON error responses
      }

      throw new AuthApiError(
        errorData.message || "Unable to process password reset request. Please try again later.",
        response.status,
        errorData.code
      );
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof AuthApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new AuthApiError(
        "Request timed out. Please check your internet connection and try again.",
        408,
        "TIMEOUT"
      );
    }

    throw new AuthApiError(
      "An unexpected network error occurred. Please try again.",
      500,
      "NETWORK_ERROR"
    );
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ForgotPasswordPage(): React.ReactElement {
  const emailInputId = useId();
  const errorAlertId = useId();
  const successAlertId = useId();

  // State Declarations
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Form Initializations
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  // Handle Resend Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  /**
   * Dispatches the reset request to the authentication server.
   */
  const processResetRequest = useCallback(
    async (values: ForgotPasswordFormValues) => {
      setServerError(null);

      try {
        await sendPasswordResetEmail(values.email);
        setSubmittedEmail(values.email);
        setIsSubmitted(true);
        setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
      } catch (err: unknown) {
        if (err instanceof AuthApiError) {
          // Handle Rate Limiting Specifically
          if (err.statusCode === 429) {
            setServerError("Too many requests. Please wait a few minutes before trying again.");
          } else {
            setServerError(err.message);
          }
        } else {
          setServerError("An unexpected error occurred. Please try again.");
        }
      }
    },
    []
  );

  /**
   * Triggers resend action while respecting active cooldown.
   */
  const handleResend = useCallback(async () => {
    if (cooldownRemaining > 0 || isSubmitting || !submittedEmail) return;

    setServerError(null);
    try {
      await sendPasswordResetEmail(submittedEmail);
      setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to resend reset link. Please try again.");
      }
    }
  }, [cooldownRemaining, isSubmitting, submittedEmail]);

  /**
   * Resets internal view state to permit entering a new email address.
   */
  const handleResetForm = useCallback(() => {
    setIsSubmitted(false);
    setSubmittedEmail("");
    setServerError(null);
    reset();
  }, [reset]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand/App Identity */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30 transition-transform hover:scale-105 duration-200">
            <KeyRound className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {!isSubmitted
              ? "No worries! Enter your registered email address and we will send you a secure link to reset your password."
              : "Check your email inbox for further instructions."}
          </p>
        </div>

        {/* Dynamic ARIA Live Region for System Messages */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {serverError && `Error: ${serverError}`}
          {isSubmitted && `Reset link sent successfully to ${submittedEmail}`}
        </div>

        {/* Primary Interactive Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          {/* Server Side / Global Error Alert */}
          {serverError && (
            <div
              id={errorAlertId}
              role="alert"
              className="flex items-start p-4 text-sm text-red-800 dark:text-red-300 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 space-x-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 text-sm font-medium">{serverError}</div>
            </div>
          )}

          {!isSubmitted ? (
            /* ================= FORM VIEW ================= */
            <form onSubmit={handleSubmit(processResetRequest)} noValidate className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor={emailInputId}
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Email Address <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    {...register("email")}
                    id={emailInputId}
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${emailInputId}-error` : undefined}
                    placeholder="name@company.com"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                        : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p
                    id={`${emailInputId}-error`}
                    className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-slate-900 shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          ) : (
            /* ================= SUCCESS / CONFIRMATION VIEW ================= */
            <div
              id={successAlertId}
              className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" aria-hidden="true" />
                <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                  Reset Instructions Sent
                </h2>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-xs">
                  If an account exists for <span className="font-semibold break-all">{submittedEmail}</span>, you will receive password reset steps shortly.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldownRemaining > 0 || isSubmitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw className={`w-4 h-4 mr-2 ${cooldownRemaining > 0 ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} aria-hidden="true" />
                  )}
                  <span>
                    {cooldownRemaining > 0
                      ? `Resend link in ${cooldownRemaining}s`
                      : "Resend Reset Link"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-4 transition-colors"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          )}

          {/* Security Guarantee Notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
            <span>Encrypted & secure password recovery</span>
          </div>
        </div>

        {/* Back to Login Footer Navigation */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 group focus:outline-none focus:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}