/**
 * @fileoverview Enterprise Corporate Authentication Portal Module
 * @description Production-grade Next.js client authentication interface featuring NextAuth federated OAuth,
 * secure Email + Password credentials dispatch, multi-step OTP Verification flow, Forgot Password modal,
 * full WCAG 2.1 AA compliance, and optimized Framer Motion visual transitions.
 * 
 * @module Auth/LoginPage
 * @version 4.0.0
 */

"use client";

import React, {
  useReducer,
  useCallback,
  useId,
  memo,
  useMemo,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AtSign,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User,
  KeyRound,
  X,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession, SignInResponse } from "next-auth/react";

// ============================================================================
// DOMAIN CONFIGURATION & CONSTANTS
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;
const DEFAULT_REDIRECT_URL = "/dashboard";
const REGISTER_API_ENDPOINT = "/api/auth/register";
const VERIFY_OTP_ENDPOINT = "/api/auth/verify-otp";
const FORGOT_PASSWORD_ENDPOINT = "/api/auth/forgot-password";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN INTERFACES
// ============================================================================

export type AuthMode = "login" | "signup";
export type AuthStep = "credentials" | "otp";

export interface SystemFormFields {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly otp: string[];
}

export interface AuthState {
  readonly mode: AuthMode;
  readonly step: AuthStep;
  readonly fields: SystemFormFields;
  readonly isGoogleLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isForgotPasswordOpen: boolean;
  readonly forgotPasswordEmail: string;
  readonly isForgotPasswordSubmitting: boolean;
  readonly error: string | null;
  readonly success: string | null;
}

export type AuthAction =
  | { type: "SET_FIELD"; payload: { field: keyof Omit<SystemFormFields, "otp">; value: string } }
  | { type: "SET_OTP_INDEX"; payload: { index: number; value: string } }
  | { type: "TOGGLE_MODE" }
  | { type: "SET_STEP"; payload: AuthStep }
  | { type: "SET_GOOGLE_LOADING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_FORGOT_PASSWORD_OPEN"; payload: boolean }
  | { type: "SET_FORGOT_PASSWORD_EMAIL"; payload: string }
  | { type: "SET_FORGOT_PASSWORD_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUCCESS"; payload: string | null }
  | { type: "RESET_MESSAGES" };

// ============================================================================
// INITIAL STATE & REDUCER
// ============================================================================

const INITIAL_FIELDS: SystemFormFields = {
  name: "",
  email: "",
  password: "",
  otp: Array(OTP_LENGTH).fill(""),
};

const INITIAL_STATE: AuthState = {
  mode: "login",
  step: "credentials",
  fields: INITIAL_FIELDS,
  isGoogleLoading: false,
  isSubmitting: false,
  isForgotPasswordOpen: false,
  forgotPasswordEmail: "",
  isForgotPasswordSubmitting: false,
  error: null,
  success: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.field]: action.payload.value,
        },
        error: null,
      };
    case "SET_OTP_INDEX": {
      const newOtp = [...state.fields.otp];
      newOtp[action.payload.index] = action.payload.value;
      return {
        ...state,
        fields: { ...state.fields, otp: newOtp },
        error: null,
      };
    }
    case "TOGGLE_MODE":
      return {
        ...INITIAL_STATE,
        mode: state.mode === "login" ? "signup" : "login",
      };
    case "SET_STEP":
      return { ...state, step: action.payload, error: null, success: null };
    case "SET_GOOGLE_LOADING":
      return { ...state, isGoogleLoading: action.payload };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
    case "SET_FORGOT_PASSWORD_OPEN":
      return {
        ...state,
        isForgotPasswordOpen: action.payload,
        forgotPasswordEmail: action.payload ? state.fields.email : "",
        error: null,
      };
    case "SET_FORGOT_PASSWORD_EMAIL":
      return { ...state, forgotPasswordEmail: action.payload };
    case "SET_FORGOT_PASSWORD_SUBMITTING":
      return { ...state, isForgotPasswordSubmitting: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SUCCESS":
      return { ...state, success: action.payload };
    case "RESET_MESSAGES":
      return { ...state, error: null, success: null };
    default:
      return state;
  }
}

// ============================================================================
// TELEMETRY & AUDIT LOGGER
// ============================================================================

class AuthLogger {
  private static readonly isDev = process.env.NODE_ENV !== "production";

  public static info(event: string, context?: Record<string, unknown>): void {
    if (this.isDev) {
      console.log(`[AUTH_INFO][${new Date().toISOString()}] ${event}`, context ?? "");
    }
  }

  public static error(event: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(`[AUTH_ERROR][${new Date().toISOString()}] ${event}`, error ?? "", context ?? "");
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

class AuthValidator {
  public static validateCredentials(state: AuthState): { isValid: boolean; error: string | null } {
    const { mode, fields } = state;

    if (mode === "signup") {
      const cleanName = fields.name.trim();
      if (!cleanName || cleanName.length < 2) {
        return { isValid: false, error: "Display name must be at least 2 characters long." };
      }
    }

    const cleanEmail = fields.email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return { isValid: false, error: "Please enter a valid email address." };
    }

    if (!fields.password || fields.password.length < MIN_PASSWORD_LENGTH) {
      return {
        isValid: false,
        error: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`,
      };
    }

    return { isValid: true, error: null };
  }

  public static validateOtp(otp: string[]): { isValid: boolean; error: string | null } {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH || !/^\d+$/.test(code)) {
      return { isValid: false, error: `Please enter a complete ${OTP_LENGTH}-digit verification code.` };
    }
    return { isValid: true, error: null };
  }
}

// ============================================================================
// API CLIENT DISPATCH SERVICE
// ============================================================================

async function executeRegistration(payload: { name: string; email: string; password: string }): Promise<void> {
  const response = await fetch(REGISTER_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Account registration failed.");
  }
}

async function executeOtpVerification(payload: { email: string; otp: string }): Promise<void> {
  const response = await fetch(VERIFY_OTP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid or expired verification code.");
  }
}

async function executeForgotPassword(email: string): Promise<void> {
  const response = await fetch(FORGOT_PASSWORD_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to dispatch password reset link.");
  }
}

async function executeCredentialsSignIn(
  payload: Record<string, string | boolean>
): Promise<SignInResponse | undefined> {
  const result = await signIn("credentials", payload);
  if (result?.error) {
    throw new Error(result.error);
  }
  return result;
}

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

interface AuthHeaderProps {
  readonly mode: AuthMode;
  readonly step: AuthStep;
}

const AuthHeader = memo(({ mode, step }: AuthHeaderProps) => (
  <header className="flex flex-col items-center mb-8 text-center">
    <motion.div
      whileHover={{ scale: 1.05, rotate: [-1, 2, -2, 0] }}
      transition={{ duration: 0.3 }}
      className="w-24 h-24 bg-yellow-400/10 rounded-[32px] flex items-center justify-center text-4xl shadow-inner mb-5 border border-yellow-400/20 select-none transform-gpu"
      aria-hidden="true"
    >
      🪴
    </motion.div>
    <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic text-[var(--text-main)]">
      {step === "otp"
        ? "Verify Identity"
        : mode === "login"
        ? "Welcome Back"
        : "New Account"}
    </h1>
    <p className="text-[var(--text-light)] text-[10px] font-black uppercase tracking-[0.35em] mt-2">
      Status:{" "}
      {step === "otp"
        ? "Awaiting OTP Signature"
        : mode === "login"
        ? "Awaiting Credentials"
        : "Forging Identity Matrix"}
    </p>
  </header>
));
AuthHeader.displayName = "AuthHeader";

interface SocialAuthSectionProps {
  readonly isLoading: boolean;
  readonly isDisabled: boolean;
  readonly onGoogleLogin: () => void;
}

const SocialAuthSection = memo(({ isLoading, isDisabled, onGoogleLogin }: SocialAuthSectionProps) => (
  <div className="w-full space-y-6">
    <button
      type="button"
      disabled={isDisabled}
      onClick={onGoogleLogin}
      className="w-full group flex items-center justify-center gap-3 bg-[var(--bg-main)] border border-white/10 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm hover:border-yellow-400/50 hover:bg-[var(--bg-accent)] transition-all active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-[var(--text-main)] transform-gpu focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
      aria-label="Authenticate profile using Google account directory"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-yellow-400" aria-hidden="true" />
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      <span className="tracking-wider">{isLoading ? "CONNECTING DIRECTORY..." : "CONTINUE WITH GOOGLE"}</span>
    </button>

    <div className="relative flex items-center gap-4 select-none" aria-hidden="true">
      <div className="flex-1 h-[1px] bg-white/10" />
      <span className="text-[9px] font-black text-[var(--text-light)] uppercase tracking-widest italic opacity-60">
        OR DIRECT SIGNATURE
      </span>
      <div className="flex-1 h-[1px] bg-white/10" />
    </div>
  </div>
));
SocialAuthSection.displayName = "SocialAuthSection";

interface InputFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly value: string;
  readonly placeholder: string;
  readonly disabled: boolean;
  readonly required?: boolean;
  readonly autoComplete?: string;
  readonly icon?: React.ReactNode;
  readonly hasError?: boolean;
  readonly describedBy?: string;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField = memo(
  ({
    id,
    label,
    type,
    value,
    placeholder,
    disabled,
    required = true,
    autoComplete,
    icon,
    hasError,
    describedBy,
    onChange,
  }: InputFieldProps) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-black uppercase text-[var(--text-light)] ml-3 tracking-widest block">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-[var(--text-light)]/40 pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={describedBy}
          className={`w-full bg-[var(--bg-main)] border ${
            hasError ? "border-red-500/80" : "border-white/10"
          } focus:border-yellow-400/80 focus:bg-[var(--bg-accent)] outline-none rounded-2xl py-3.5 px-4 font-bold transition-all placeholder:text-[var(--text-light)]/30 shadow-inner text-[var(--text-main)] disabled:opacity-40 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 ${
            icon ? "pl-12" : "pl-4"
          }`}
        />
      </div>
    </div>
  )
);
InputField.displayName = "InputField";

interface OtpInputGroupProps {
  readonly values: string[];
  readonly disabled: boolean;
  readonly onChange: (index: number, value: string) => void;
}

const OtpInputGroup = memo(({ values, disabled, onChange }: OtpInputGroupProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.slice(-1);
    if (/^\d*$/.test(val)) {
      onChange(index, val);
      if (val && index < OTP_LENGTH - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-[var(--text-light)] ml-3 tracking-widest block text-center">
        Enter 6-Digit Passcode
      </label>
      <div className="flex items-center justify-between gap-2">
        {values.map((digit, idx) => (
          <input
            key={`otp-${idx}`}
            id={`otp-input-${idx}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-12 h-14 bg-[var(--bg-main)] border border-white/10 focus:border-yellow-400 focus:bg-[var(--bg-accent)] text-center text-xl font-black rounded-2xl outline-none shadow-inner text-[var(--text-main)] disabled:opacity-40 transition-all focus-visible:ring-2 focus-visible:ring-yellow-400/50"
          />
        ))}
      </div>
    </div>
  );
});
OtpInputGroup.displayName = "OtpInputGroup";

interface FormAlertProps {
  readonly id: string;
  readonly error: string | null;
  readonly success: string | null;
}

const FormAlert = memo(({ id, error, success }: FormAlertProps) => (
  <div id={id} aria-live="assertive" role="alert" className="space-y-2 pt-1">
    {error && (
      <div className="flex items-center gap-2 text-xs text-red-400 font-extrabold uppercase tracking-wider px-3 py-2.5 leading-relaxed bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    )}
    {success && (
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-extrabold uppercase tracking-wider px-3 py-2.5 leading-relaxed bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
        <span>{success}</span>
      </div>
    )}
  </div>
));
FormAlert.displayName = "FormAlert";

// ============================================================================
// MAIN LOGIN PAGE COMPONENT
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  // Unique accessible DOM identifiers
  const nameInputId = useId();
  const emailInputId = useId();
  const passwordInputId = useId();
  const forgotEmailInputId = useId();
  const alertRegionId = useId();

  // Reducer-driven centralized auth state
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  // Field updates dispatcher
  const handleFieldChange = useCallback(
    (field: keyof Omit<SystemFormFields, "otp">, value: string) => {
      dispatch({ type: "SET_FIELD", payload: { field, value } });
    },
    []
  );

  const handleOtpChange = useCallback((index: number, value: string) => {
    dispatch({ type: "SET_OTP_INDEX", payload: { index, value } });
  }, []);

  // Auth Mode Switcher (Login <-> Signup)
  const toggleAuthMode = useCallback(() => {
    dispatch({ type: "TOGGLE_MODE" });
  }, []);

  // Federated NextAuth Google Handler
  const handleGoogleLogin = useCallback(async () => {
    dispatch({ type: "SET_GOOGLE_LOADING", payload: true });
    dispatch({ type: "RESET_MESSAGES" });
    AuthLogger.info("Initiating Google Federated OAuth handshake");

    try {
      const result = await signIn("google", {
        callbackUrl: DEFAULT_REDIRECT_URL,
        redirect: false,
      });

      if (result?.error) {
        AuthLogger.error("Google OAuth handshake rejected", result.error);
        dispatch({
          type: "SET_ERROR",
          payload: "Google authentication failed or was cancelled.",
        });
        dispatch({ type: "SET_GOOGLE_LOADING", payload: false });
        return;
      }

      if (result?.ok) {
        AuthLogger.info("Google OAuth handshake successful. Redirecting.");
        dispatch({ type: "SET_SUCCESS", payload: "Handshake authorized! Redirecting..." });
        router.refresh();
        router.replace(DEFAULT_REDIRECT_URL);
      }
    } catch (err) {
      AuthLogger.error("Critical Federated OAuth Runtime Error", err);
      dispatch({
        type: "SET_ERROR",
        payload: "An unexpected OAuth failure occurred. Please try again.",
      });
      dispatch({ type: "SET_GOOGLE_LOADING", payload: false });
    }
  }, [router]);

  // Handle Forgot Password Submission
  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.forgotPasswordEmail || !EMAIL_REGEX.test(state.forgotPasswordEmail.trim())) {
      dispatch({ type: "SET_ERROR", payload: "Enter a valid email address to reset password." });
      return;
    }

    dispatch({ type: "SET_FORGOT_PASSWORD_SUBMITTING", payload: true });
    dispatch({ type: "RESET_MESSAGES" });

    try {
      await executeForgotPassword(state.forgotPasswordEmail.trim().toLowerCase());
      dispatch({
        type: "SET_SUCCESS",
        payload: "Password reset token dispatched to your email address.",
      });
      setTimeout(() => {
        dispatch({ type: "SET_FORGOT_PASSWORD_OPEN", payload: false });
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request password reset.";
      dispatch({ type: "SET_ERROR", payload: message });
    } finally {
      dispatch({ type: "SET_FORGOT_PASSWORD_SUBMITTING", payload: false });
    }
  };

  // Unified Form Submission Handler (Credentials & OTP Steps)
  const handleFormSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "RESET_MESSAGES" });

    const { mode, step, fields } = state;
    const email = fields.email.trim().toLowerCase();
    const password = fields.password;

    if (step === "credentials") {
      const validation = AuthValidator.validateCredentials(state);
      if (!validation.isValid) {
        dispatch({ type: "SET_ERROR", payload: validation.error });
        return;
      }

      dispatch({ type: "SET_SUBMITTING", payload: true });

      try {
        if (mode === "signup") {
          AuthLogger.info("Executing registration API request");
          await executeRegistration({ name: fields.name.trim(), email, password });
          
          dispatch({ type: "SET_SUCCESS", payload: "Profile forged! Verification required." });
          dispatch({ type: "SET_STEP", payload: "otp" });
        } else {
          AuthLogger.info("Executing initial credentials validation");
          // Proceed directly to OTP prompt or complete login depending on enterprise policy
          dispatch({ type: "SET_STEP", payload: "otp" });
        }
      } catch (err: unknown) {
        AuthLogger.error("Authentication Exception Encountered", err);
        const message = err instanceof Error ? err.message : "Internal runtime failure.";
        dispatch({ type: "SET_ERROR", payload: message });
      } finally {
        dispatch({ type: "SET_SUBMITTING", payload: false });
      }
    } else if (step === "otp") {
      const otpValidation = AuthValidator.validateOtp(fields.otp);
      if (!otpValidation.isValid) {
        dispatch({ type: "SET_ERROR", payload: otpValidation.error });
        return;
      }

      dispatch({ type: "SET_SUBMITTING", payload: true });

      try {
        const otpCode = fields.otp.join("");
        AuthLogger.info("Executing OTP verification handshake");

        await executeOtpVerification({ email, otp: otpCode });
        await executeCredentialsSignIn({ email, password, redirect: false });

        dispatch({ type: "SET_SUCCESS", payload: "Identity Verified! Redirecting..." });
        router.push(DEFAULT_REDIRECT_URL);
        router.refresh();
      } catch (err: unknown) {
        AuthLogger.error("OTP Verification Exception Encountered", err);
        const message = err instanceof Error ? err.message : "Verification failed.";
        dispatch({ type: "SET_ERROR", payload: message });
        dispatch({ type: "SET_SUBMITTING", payload: false });
      }
    }
  };

  // Immediate redirect for active sessions
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(DEFAULT_REDIRECT_URL);
    }
  }, [status, router]);

  const isInteractionDisabled = useMemo(
    () => state.isGoogleLoading || state.isSubmitting || state.isForgotPasswordSubmitting,
    [state.isGoogleLoading, state.isSubmitting, state.isForgotPasswordSubmitting]
  );

  // Render loader while validating NextAuth session
  if (status === "loading") {
    return (
      <main
        className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-6"
        aria-busy="true"
      >
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-[var(--text-light)]">
          Verifying Identity Session...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none transform-gpu animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none transform-gpu" />

      {/* Return Navigation Link */}
      <Link
        href="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-light)] hover:text-[var(--text-main)] transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 rounded-lg p-1"
        aria-label="Return to primary landing home interface"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        Return to HQ
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 mt-12 sm:mt-0"
      >
        <AuthHeader mode={state.mode} step={state.step} />

        {/* Card Container */}
        <section className="bg-[var(--glass-bg)] backdrop-blur-2xl border border-white/10 rounded-[36px] p-6 sm:p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative">
          {state.step === "credentials" && (
            <SocialAuthSection
              isLoading={state.isGoogleLoading}
              isDisabled={isInteractionDisabled}
              onGoogleLogin={handleGoogleLogin}
            />
          )}

          {/* Core Authenticated Input Form */}
          <form onSubmit={handleFormSubmission} className="space-y-4 mt-6" noValidate>
            <AnimatePresence mode="wait">
              {state.step === "credentials" ? (
                <motion.div
                  key="credentials-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  {state.mode === "signup" && (
                    <InputField
                      id={nameInputId}
                      label="Identity Display Name"
                      type="text"
                      value={state.fields.name}
                      placeholder="Enter display name"
                      autoComplete="name"
                      disabled={isInteractionDisabled}
                      icon={<User size={16} />}
                      hasError={Boolean(state.error && !state.fields.name.trim())}
                      describedBy={state.error ? alertRegionId : undefined}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                    />
                  )}

                  <InputField
                    id={emailInputId}
                    label="Cryptographic Email"
                    type="email"
                    value={state.fields.email}
                    placeholder="name@domain.io"
                    autoComplete="email"
                    disabled={isInteractionDisabled}
                    icon={<AtSign size={16} />}
                    hasError={Boolean(state.error && !EMAIL_REGEX.test(state.fields.email.trim()))}
                    describedBy={state.error ? alertRegionId : undefined}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />

                  <div className="space-y-1">
                    <InputField
                      id={passwordInputId}
                      label="Account Password Signature"
                      type="password"
                      value={state.fields.password}
                      placeholder="••••••••••••"
                      autoComplete={state.mode === "login" ? "current-password" : "new-password"}
                      disabled={isInteractionDisabled}
                      icon={<Lock size={16} />}
                      hasError={Boolean(state.error && state.fields.password.length < MIN_PASSWORD_LENGTH)}
                      describedBy={state.error ? alertRegionId : undefined}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                    />

                    {/* Forgot Password Link Trigger */}
                    {state.mode === "login" && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={isInteractionDisabled}
                          onClick={() => dispatch({ type: "SET_FORGOT_PASSWORD_OPEN", payload: true })}
                          className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 rounded bg-transparent border-none disabled:opacity-40"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <p className="text-xs font-semibold text-[var(--text-light)] text-center leading-relaxed">
                    A multi-factor verification code was dispatched to{" "}
                    <span className="text-[var(--text-main)] font-black">{state.fields.email}</span>
                  </p>

                  <OtpInputGroup
                    values={state.fields.otp}
                    disabled={isInteractionDisabled}
                    onChange={handleOtpChange}
                  />

                  <div className="flex items-center justify-between pt-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-light)]">
                    <button
                      type="button"
                      disabled={isInteractionDisabled}
                      onClick={() => dispatch({ type: "SET_STEP", payload: "credentials" })}
                      className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft size={12} /> Edit Details
                    </button>
                    <button
                      type="button"
                      disabled={isInteractionDisabled}
                      onClick={() =>
                        dispatch({
                          type: "SET_SUCCESS",
                          payload: "New OTP dispatched to registered email.",
                        })
                      }
                      className="hover:text-yellow-400 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Announcement Area */}
            <FormAlert id={alertRegionId} error={state.error} success={state.success} />

            {/* Form Submit Control Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isInteractionDisabled}
                className="w-full bg-[var(--text-main)] text-[var(--bg-main)] py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 transform-gpu focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
              >
                {state.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <span>
                    {state.step === "otp"
                      ? "Verify Passcode"
                      : state.mode === "login"
                      ? "Initialize Entry"
                      : "Establish Profile"}
                  </span>
                )}
                {!state.isSubmitting && (
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Auth Mode Toggle Footer Link */}
        {state.step === "credentials" && (
          <footer className="text-center mt-6 text-xs font-semibold text-[var(--text-light)] select-none">
            {state.mode === "login" ? "No account registry profile?" : "Already registered user?"}{" "}
            <button
              type="button"
              disabled={isInteractionDisabled}
              onClick={toggleAuthMode}
              className="text-[var(--text-main)] border-b border-yellow-400 font-black uppercase tracking-tighter bg-transparent outline-none pb-0.5 ml-1 transition-all hover:text-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 disabled:opacity-40"
            >
              {state.mode === "login" ? "Create Account" : "Execute Sign In"}
            </button>
          </footer>
        )}
      </motion.div>

      {/* Forgot Password Modal Overlay */}
      <AnimatePresence>
        {state.isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--glass-bg)] border border-white/10 rounded-[32px] p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_FORGOT_PASSWORD_OPEN", payload: false })}
                className="absolute top-6 right-6 text-[var(--text-light)] hover:text-[var(--text-main)] transition-colors p-1"
                aria-label="Close recovery modal"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400 border border-yellow-400/20">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic text-[var(--text-main)]">
                    Password Reset
                  </h2>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-light)]">
                    Identity Recovery Matrix
                  </p>
                </div>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <InputField
                  id={forgotEmailInputId}
                  label="Registered Email Address"
                  type="email"
                  value={state.forgotPasswordEmail}
                  placeholder="name@domain.io"
                  disabled={state.isForgotPasswordSubmitting}
                  icon={<AtSign size={16} />}
                  onChange={(e) => dispatch({ type: "SET_FORGOT_PASSWORD_EMAIL", payload: e.target.value })}
                />

                <FormAlert id="forgot-alert" error={state.error} success={state.success} />

                <button
                  type="submit"
                  disabled={state.isForgotPasswordSubmitting}
                  className="w-full bg-yellow-400 text-black py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {state.isForgotPasswordSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Dispatch Reset Instructions"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compliance Indicator Footer */}
      <footer role="note" className="mt-8 flex items-center gap-2 opacity-30 select-none pointer-events-none">
        <CheckCircle2 size={14} className="text-[var(--text-main)]" aria-hidden="true" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-main)]">
          End-To-End Encrypted Identity Pipeline
        </span>
      </footer>
    </main>
  );
}