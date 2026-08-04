/**
 * @file C:\Users\KIIT0001\Desktop\PLACEMENT\moneyplant\money-plant\src\app\(auth)\verify-email\page.tsx
 * @module Auth/VerifyEmailPage
 * @description Enterprise-grade, WCAG 2.1 AA compliant Email Verification UI component featuring automatic
 * token verification, Strict Mode double-mount guard, resend cooldown timer, Suspense boundary parameter extraction,
 * strict type safety, and resilient API interaction.
 * 
 * @version 3.0.0
 * @author Principal Engineer & Architecture Team
 */

"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MailCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Inbox,
  HelpCircle,
} from "lucide-react";

// ============================================================================
// TYPES & ENUMS
// ============================================================================

type VerificationState = "IDLE" | "VERIFYING" | "SUCCESS" | "ERROR";

interface ApiErrorResponse {
  message?: string;
  code?: string;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const REQUEST_TIMEOUT_MS = 10000;
const API_VERIFY_EMAIL_ENDPOINT = "/api/auth/verify-email";
const API_RESEND_VERIFICATION_ENDPOINT = "/api/auth/resend-verification";
const RESEND_COOLDOWN_SECONDS = 60;
const AUTO_REDIRECT_DELAY_MS = 4000;

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
 * Dispatches email verification token to the backend API with timeout signal handling.
 */
async function executeEmailVerification(
  token: string,
  signal?: AbortSignal
): Promise<void> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(API_VERIFY_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
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
        errorData.message || "Email verification failed. The link may be invalid or expired.",
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
        "Verification request timed out. Please check your network connection and try again.",
        408,
        "TIMEOUT"
      );
    }

    throw new AuthApiError(
      "An unexpected network error occurred while verifying your email.",
      500,
      "NETWORK_ERROR"
    );
  }
}

/**
 * Dispatches a request to resend the verification email to the user.
 */
async function executeResendVerification(
  email: string,
  signal?: AbortSignal
): Promise<void> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(API_RESEND_VERIFICATION_ENDPOINT, {
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
        // Fallback for non-JSON response bodies
      }

      throw new AuthApiError(
        errorData.message || "Unable to resend verification email at this time.",
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
        "Request timed out. Please try again.",
        408,
        "TIMEOUT"
      );
    }

    throw new AuthApiError(
      "Network error while requesting verification email resend.",
      500,
      "NETWORK_ERROR"
    );
  }
}

// ============================================================================
// INTERNAL VERIFICATION CONTENT COMPONENT
// ============================================================================

function VerifyEmailContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  // Component State
  const [status, setStatus] = useState<VerificationState>(token ? "VERIFYING" : "IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendStatusMessage, setResendStatusMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4);

  // Strict Mode Mount Guard to prevent double execution
  const hasVerifiedRef = useRef<boolean>(false);

  /**
   * Automatic Verification Processing
   */
  useEffect(() => {
    if (!token || hasVerifiedRef.current) {
      if (!token) setStatus("IDLE");
      return;
    }

    hasVerifiedRef.current = true;
    const abortController = new AbortController();

    async function verify() {
      setStatus("VERIFYING");
      setErrorMessage(null);

      try {
        await executeEmailVerification(token, abortController.signal);
        setStatus("SUCCESS");
      } catch (err: unknown) {
        if (err instanceof AuthApiError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("An unexpected error occurred during verification.");
        }
        setStatus("ERROR");
      }
    }

    verify();

    return () => {
      abortController.abort();
    };
  }, [token]);

  /**
   * Auto-Redirect Countdown Manager on Verification Success
   */
  useEffect(() => {
    if (status !== "SUCCESS") return;

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
  }, [status, router]);

  /**
   * Resend Cooldown Countdown Manager
   */
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  /**
   * Handler for requesting a new verification email
   */
  const handleResendEmail = useCallback(async () => {
    if (!emailParam || cooldownSeconds > 0 || isResending) return;

    setIsResending(true);
    setResendStatusMessage(null);

    try {
      await executeResendVerification(emailParam);
      setResendStatusMessage("A new verification link has been sent to your email.");
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        setResendStatusMessage(`Failed to resend: ${err.message}`);
      } else {
        setResendStatusMessage("Failed to resend verification email. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  }, [emailParam, cooldownSeconds, isResending]);

  return (
    <>
      {/* Dynamic ARIA Live Region for Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status === "VERIFYING" && "Verifying your email address, please wait."}
        {status === "SUCCESS" && "Your email has been successfully verified! Redirecting to login."}
        {status === "ERROR" && `Verification failed: ${errorMessage}`}
        {resendStatusMessage && resendStatusMessage}
      </div>

      {/* ================= STATE 1: VERIFYING / LOADING ================= */}
      {status === "VERIFYING" && (
        <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
            <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Verifying Your Email...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            Please hold on while we authenticate your verification token.
          </p>
        </div>
      )}

      {/* ================= STATE 2: SUCCESS ================= */}
      {status === "SUCCESS" && (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
              Email Verified Successfully!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 max-w-xs">
              Thank you for verifying your address. Your account is now fully active. Redirecting in{" "}
              <span className="font-semibold">{redirectCountdown}s</span>...
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 active:scale-[0.99]"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* ================= STATE 3: ERROR ================= */}
      {status === "ERROR" && (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 mb-3">
              <AlertCircle className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200">
              Verification Failed
            </h2>
            <p className="text-xs text-red-700 dark:text-red-400 mt-2 max-w-xs">
              {errorMessage || "The verification link is invalid, expired, or has already been used."}
            </p>
          </div>

          {emailParam && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={cooldownSeconds > 0 || isResending}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Resending Link...</span>
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Resend Available in ({cooldownSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              {resendStatusMessage && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-in fade-in duration-150">
                  {resendStatusMessage}
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 hover:underline"
            >
              Back to Login Page
            </Link>
          </div>
        </div>
      )}

      {/* ================= STATE 4: IDLE (NO TOKEN PROVIDED) ================= */}
      {status === "IDLE" && (
        <div className="space-y-6 text-center animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 mb-3">
              <Inbox className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
              Check Your Inbox
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 max-w-xs">
              We have sent a verification email to{" "}
              {emailParam ? (
                <strong className="font-semibold text-slate-900 dark:text-slate-100">{emailParam}</strong>
              ) : (
                "your registered email address"
              )}
              . Please click the link in the message to activate your account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Didn&apos;t receive an email?</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-6 list-disc">
              <li>Check your spam, promotions, or junk mail folder.</li>
              <li>Ensure your email address was typed correctly.</li>
              <li>Wait a few minutes for the email server delivery.</li>
            </ul>
          </div>

          {emailParam && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={cooldownSeconds > 0 || isResending}
                className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 active:scale-[0.99]"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <span>Sending Verification Email...</span>
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Resend Available in ({cooldownSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              {resendStatusMessage && (
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-in fade-in duration-150">
                  {resendStatusMessage}
                </p>
              )}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT WITH SUSPENSE BOUNDARY
// ============================================================================

export default function VerifyEmailPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30 transition-transform hover:scale-105 duration-200">
            <MailCheck className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Email Verification
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Secure your MoneyPlant account by verifying your primary email address.
          </p>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" aria-hidden="true" />
                <p className="text-sm text-slate-500">Loading verification context...</p>
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
            <span>Protected by MoneyPlant Security Protocol</span>
          </div>
        </div>
      </div>
    </main>
  );
}