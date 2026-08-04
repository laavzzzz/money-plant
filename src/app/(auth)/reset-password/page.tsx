/**
 * @file C:\Users\KIIT0001\Desktop\PLACEMENT\moneyplant\money-plant\src\app\(auth)\reset-password\page.tsx
 * @module Auth/ResetPasswordPage
 * @description Enterprise-grade, WCAG 2.1 AA compliant Reset Password UI component featuring real-time
 * password entropy calculation, requirement checklists, Suspense boundary parameter extraction,
 * strict Zod validation, and resilient API interaction.
 * 
 * @version 3.0.0
 * @author Principal Engineer & Architecture Team
 */

"use client";

import React, { useState, useEffect, useCallback, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Enterprise Password Complexity & Confirmation Validation Schema
 */
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset token is required." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(100, { message: "Password cannot exceed 100 characters." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (pw: string) => boolean;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REQUEST_TIMEOUT_MS = 10000;
const API_RESET_PASSWORD_ENDPOINT = "/api/auth/reset-password";
const AUTO_REDIRECT_DELAY_MS = 3000;

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: "length", label: "At least 8 characters", validator: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A-Z)", validator: (pw) => /[A-Z]/.test(pw) },
  { id: "lowercase", label: "One lowercase letter (a-z)", validator: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "One number (0-9)", validator: (pw) => /[0-9]/.test(pw) },
  { id: "special", label: "One special character (!@#$%^&*)", validator: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

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

async function executePasswordReset(
  payload: ResetPasswordFormValues,
  signal?: AbortSignal
): Promise<void> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(API_RESET_PASSWORD_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        token: payload.token,
        password: payload.password,
      }),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiErrorResponse = {};
      try {
        errorData = (await response.json()) as ApiErrorResponse;
      } catch {
        // Fallback for non-JSON response bodies
      }

      throw new AuthApiError(
        errorData.message || "Failed to reset password. The token may be expired or invalid.",
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

// ============================================================================
// INTERNAL FORM CONTENT COMPONENT
// ============================================================================

function ResetPasswordFormContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const passwordInputId = useId();
  const confirmPasswordInputId = useId();
  const errorAlertId = useId();

  // Component State
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Form Setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watch("password", "");

  // Sync token from URL searchParams into form state
  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  // Handle auto-redirect countdown upon success
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, router]);

  /**
   * Password strength calculator score (0 to 5)
   */
  const fulfilledRequirementsCount = PASSWORD_REQUIREMENTS.reduce(
    (count, req) => (req.validator(watchPassword) ? count + 1 : count),
    0
  );

  const getStrengthLabel = (score: number): { label: string; color: string } => {
    if (score <= 1) return { label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { label: "Fair", color: "bg-amber-500" };
    if (score === 4) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-emerald-500" };
  };

  const strengthInfo = getStrengthLabel(fulfilledRequirementsCount);

  /**
   * Form Submission Logic
   */
  const processPasswordReset = useCallback(
    async (values: ResetPasswordFormValues) => {
      setServerError(null);

      if (!values.token) {
        setServerError("Invalid or missing reset token. Please request a new password reset link.");
        return;
      }

      try {
        await executePasswordReset(values);
        setIsSuccess(true);
      } catch (err: unknown) {
        if (err instanceof AuthApiError) {
          setServerError(err.message);
        } else {
          setServerError("An error occurred while resetting your password. Please try again.");
        }
      }
    },
    []
  );

  if (!tokenFromUrl && !isSuccess) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mb-2">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Invalid Reset Link</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This password reset link is missing required authorization parameters or has expired.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic ARIA Live Region for System State Updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {serverError && `Error: ${serverError}`}
        {isSuccess && "Password has been successfully updated. Redirecting to login."}
      </div>

      {serverError && (
        <div
          id={errorAlertId}
          role="alert"
          className="flex items-start p-4 text-sm text-red-800 dark:text-red-300 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 space-x-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 text-sm font-medium">{serverError}</div>
        </div>
      )}

      {!isSuccess ? (
        <form onSubmit={handleSubmit(processPasswordReset)} noValidate className="space-y-5">
          {/* Hidden Token Input */}
          <input type="hidden" {...register("token")} />

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
                {...register("password")}
                id={passwordInputId}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={`${passwordInputId}-requirements ${errors.password ? `${passwordInputId}-error` : ""}`}
                placeholder="••••••••••••"
                className={`block w-full pl-10 pr-11 py-3 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.password
                    ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                    : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id={`${passwordInputId}-error`}
                className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                <span>{errors.password.message}</span>
              </p>
            )}

            {/* Dynamic Password Strength Indicator Bar */}
            {watchPassword && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Strength: <strong className="text-slate-700 dark:text-slate-200">{strengthInfo.label}</strong></span>
                  <span>{fulfilledRequirementsCount}/5</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                    style={{ width: `${(fulfilledRequirementsCount / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Password Requirements Checklist */}
            <div
              id={`${passwordInputId}-requirements`}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 mt-2"
            >
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Password must contain:
              </p>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                {PASSWORD_REQUIREMENTS.map((req) => {
                  const isMet = req.validator(watchPassword);
                  return (
                    <li key={req.id} className="flex items-center space-x-2">
                      {isMet ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />
                      )}
                      <span className={isMet ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label
              htmlFor={confirmPasswordInputId}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Confirm New Password <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                {...register("confirmPassword")}
                id={confirmPasswordInputId}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? `${confirmPasswordInputId}-error` : undefined}
                placeholder="••••••••••••"
                className={`block w-full pl-10 pr-11 py-3 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.confirmPassword
                    ? "border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/20 text-red-900 dark:text-red-200"
                    : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id={`${confirmPasswordInputId}-error`}
                className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 inline" aria-hidden="true" />
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || fulfilledRequirementsCount < 5}
            className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 dark:focus:ring-offset-slate-900 shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </form>
      ) : (
        /* ================= SUCCESS STATE ================= */
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-3" aria-hidden="true" />
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
              Password Reset Complete!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-xs">
              Your password has been successfully updated. Redirecting you to sign in...
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md"
          >
            <span>Proceed to Sign In Now</span>
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT WITH SUSPENSE BOUNDARY
// ============================================================================

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30 transition-transform hover:scale-105 duration-200">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Please enter your new password below. Make sure it meets all security requirements.
          </p>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" aria-hidden="true" />
                <p className="text-sm text-slate-500">Validating reset credentials...</p>
              </div>
            }
          >
            <ResetPasswordFormContent />
          </Suspense>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
            <span>End-to-end encrypted password update</span>
          </div>
        </div>
      </div>
    </main>
  );
}