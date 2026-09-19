/**
 * @file src/app/(auth)/forgot-password/page.tsx
 * @module Auth/ForgotPasswordPage
 * @description Enterprise-grade, WCAG 2.1 AA compliant Forgot Password UI component with
 * 2-step OTP validation, new password submission, strict schema validation, dynamic
 * countdown timers, accessible ARIA live regions, and resilient fetch abstractions.
 * 
 * @version 3.2.0
 */

"use client";

import React, { useState, useEffect, useCallback, useId, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Lock,
  Hash,
  Eye,
  EyeOff,
} from "lucide-react";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Step 1: Request OTP Validation Schema
 */
const requestOtpSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please enter a valid email address (e.g., name@domain.com)." })
    .max(254, { message: "Email address cannot exceed 254 characters." })
    .transform((val) => val.trim().toLowerCase()),
});

/**
 * Step 2: Verify OTP & Reset Password Schema
 */
const resetPasswordSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "OTP must be exactly 6 digits." })
    .max(6, { message: "OTP must be exactly 6 digits." })
    .regex(/^\d{6}$/, { message: "OTP must contain numbers only." }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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
const API_RESET_PASSWORD_ENDPOINT = "/api/auth/reset-password";

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
 * Helper to wrap API calls with explicit timeout controls.
 */
async function fetchWithTimeout(
  endpoint: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  const combinedSignal = options.signal
    ? AbortSignal.any([options.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: combinedSignal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new AuthApiError(
        "Request timed out. Please check your network connection and try again.",
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

/**
 * Dispatches request to send password reset OTP email.
 */
async function sendPasswordResetEmail(email: string): Promise<void> {
  const response = await fetchWithTimeout(API_FORGOT_PASSWORD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Fallback for non-JSON response
    }

    const message =
      (typeof errorData.message === "string" && errorData.message) ||
      (typeof (errorData as { error?: string }).error === "string"
        ? (errorData as { error: string }).error
        : "") ||
      "Unable to process request. Please try again later.";
    throw new AuthApiError(message, response.status, errorData.code);
  }
}

/**
 * Dispatches OTP and new password for verification and password reset.
 */
async function verifyOtpAndResetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<void> {
  const response = await fetchWithTimeout(API_RESET_PASSWORD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse = {};
    try {
      errorData = (await response.json()) as ApiErrorResponse;
    } catch {
      // Fallback for non-JSON response
    }

    const message =
      (typeof errorData.message === "string" && errorData.message) ||
      (typeof (errorData as { error?: string }).error === "string"
        ? (errorData as { error: string }).error
        : "") ||
      "Invalid or expired OTP code. Please try again.";
    throw new AuthApiError(message, response.status, errorData.code);
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ForgotPasswordPage(): React.ReactElement {
  const router = useRouter();
  const mountedRef = useRef<boolean>(true);

  // Accessibility Unique IDs
  const emailInputId = useId();
  const otpInputId = useId();
  const passwordInputId = useId();
  const errorAlertId = useId();
  const successAlertId = useId();

  // State Declarations
  const [step, setStep] = useState<"request" | "verify">("request");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Mount tracking cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Form Initializations: Step 1 (Request OTP)
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors, isSubmitting: isSubmittingRequest },
    reset: resetRequestForm,
  } = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  // Form Initializations: Step 2 (Verify OTP & Set Password)
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors, isSubmitting: isSubmittingReset },
    reset: resetResetForm,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { otp: "", newPassword: "" },
  });

  // Handle Resend Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  /**
   * Step 1: Process OTP Generation Request
   */
  const processResetRequest = useCallback(
    async (values: RequestOtpFormValues) => {
      setServerError(null);
      const cleanEmail = values.email.trim().toLowerCase();

      try {
        await sendPasswordResetEmail(cleanEmail);
        
        if (mountedRef.current) {
          setSubmittedEmail(cleanEmail);
          setStep("verify");
          setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
        }
      } catch (err: unknown) {
        if (!mountedRef.current) return;

        if (err instanceof AuthApiError) {
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
   * Step 2: Process OTP Verification & Password Reset
   */
  const processPasswordReset = useCallback(
    async (values: ResetPasswordFormValues) => {
      setServerError(null);

      try {
        await verifyOtpAndResetPassword(
          submittedEmail,
          values.otp.trim(),
          values.newPassword
        );
        
        if (mountedRef.current) {
          setResetSuccess(true);
        }
      } catch (err: unknown) {
        if (!mountedRef.current) return;

        if (err instanceof AuthApiError) {
          setServerError(err.message);
        } else {
          setServerError("Failed to reset password. Please check your OTP and try again.");
        }
      }
    },
    [submittedEmail]
  );

  /**
   * Triggers OTP resend action with cooldown protection.
   */
  const handleResend = useCallback(async () => {
    if (cooldownRemaining > 0 || isSubmittingRequest || isSubmittingReset || !submittedEmail) return;

    setServerError(null);
    try {
      await sendPasswordResetEmail(submittedEmail);
      
      if (mountedRef.current) {
        setCooldownRemaining(RESEND_COOLDOWN_SECONDS);
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;

      if (err instanceof AuthApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to resend OTP code. Please try again.");
      }
    }
  }, [cooldownRemaining, isSubmittingRequest, isSubmittingReset, submittedEmail]);

  /**
   * Resets form to enter a different email address.
   */
  const handleResetForm = useCallback(() => {
    setStep("request");
    setSubmittedEmail("");
    setServerError(null);
    setResetSuccess(false);
    resetRequestForm();
    resetResetForm();
  }, [resetRequestForm, resetResetForm]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Brand / Header Identity */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30 transition-transform hover:scale-105 duration-200">
            <KeyRound className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {resetSuccess
              ? "Password Reset Complete"
              : step === "request"
              ? "Forgot Password?"
              : "Verify OTP Code"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            {resetSuccess
              ? "Your password has been successfully reset. You can now log in with your new password."
              : step === "request"
              ? "Enter your registered email address and we will send a 6-digit OTP code to reset your password."
              : `We sent a 6-digit OTP code to ${submittedEmail}. Enter it below along with your new password.`}
          </p>
        </div>

        {/* Dynamic ARIA Live Region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {serverError && `Error: ${serverError}`}
          {step === "verify" && `OTP sent successfully to ${submittedEmail}`}
          {resetSuccess && "Password has been successfully updated."}
        </div>

        {/* Primary Interactive Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          {/* Server Side Error Banner */}
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

          {resetSuccess ? (
            /* ================= SUCCESS STATE ================= */
            <div id={successAlertId} className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2" aria-hidden="true" />
                <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">
                  Password Reset Successful
                </h2>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  You can now log into your MoneyPlant account using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all duration-200"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : step === "request" ? (
            /* ================= STEP 1: REQUEST OTP FORM ================= */
            <form onSubmit={handleSubmitRequest(processResetRequest)} noValidate className="space-y-5">
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
                    {...registerRequest("email")}
                    id={emailInputId}
                    type="email"
                    autoComplete="email"
                    disabled={isSubmittingRequest}
                    aria-invalid={Boolean(requestErrors.email)}
                    aria-describedby={requestErrors.email ? `${emailInputId}-error` : undefined}
                    placeholder="name@company.com"
                    className={`block w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      requestErrors.email
                        ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                        : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    }`}
                  />
                </div>
                {requestErrors.email && (
                  <p
                    id={`${emailInputId}-error`}
                    className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                    <span>{requestErrors.email.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingRequest}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-slate-900 shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmittingRequest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP Code</span>
                )}
              </button>
            </form>
          ) : (
            /* ================= STEP 2: VERIFY OTP & RESET FORM ================= */
            <form onSubmit={handleSubmitReset(processPasswordReset)} noValidate className="space-y-5">
              {/* 6-Digit OTP Field */}
              <div className="space-y-2">
                <label
                  htmlFor={otpInputId}
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  6-Digit OTP Code <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Hash className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    {...registerReset("otp")}
                    id={otpInputId}
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="\d*"
                    disabled={isSubmittingReset}
                    aria-invalid={Boolean(resetErrors.otp)}
                    aria-describedby={resetErrors.otp ? `${otpInputId}-error` : undefined}
                    placeholder="123456"
                    className={`block w-full pl-10 pr-4 py-3 text-sm font-mono tracking-widest rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      resetErrors.otp
                        ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                        : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    }`}
                  />
                </div>
                {resetErrors.otp && (
                  <p
                    id={`${otpInputId}-error`}
                    className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                    <span>{resetErrors.otp.message}</span>
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor={passwordInputId}
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  New Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    {...registerReset("newPassword")}
                    id={passwordInputId}
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmittingReset}
                    aria-invalid={Boolean(resetErrors.newPassword)}
                    aria-describedby={resetErrors.newPassword ? `${passwordInputId}-error` : undefined}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-3 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      resetErrors.newPassword
                        ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                        : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {resetErrors.newPassword && (
                  <p
                    id={`${passwordInputId}-error`}
                    className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                    <span>{resetErrors.newPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Reset Button */}
              <button
                type="submit"
                disabled={isSubmittingReset}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-slate-900 shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmittingReset ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              {/* Resend & Change Email Controls */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldownRemaining > 0 || isSubmittingReset}
                  className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${cooldownRemaining > 0 ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} aria-hidden="true" />
                  <span>
                    {cooldownRemaining > 0
                      ? `Resend OTP in ${cooldownRemaining}s`
                      : "Resend OTP Code"}
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-4 transition-colors"
                  >
                    Use a different email address
                  </button>
                </div>
              </div>
            </form>
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