/**
 * @fileoverview Enterprise Corporate Authentication Portal Module
 * @description Production-grade Next.js client authentication interface featuring NextAuth federated OAuth,
 * secure dual-routing credentials dispatch (Email/E.164 Phone), full WCAG 2.1 AA compliance, and 
 * highly optimized Framer Motion visual transitions.
 * 
 * @module Auth/LoginPage
 * @version 3.0.0
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
  Phone,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession, SignInResponse } from "next-auth/react";

// ============================================================================
// DOMAIN CONFIGURATION & CONSTANTS
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Standard 10-digit Indian mobile format
const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_REDIRECT_URL = "/dashboard";
const REGISTER_API_ENDPOINT = "/api/auth/register";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN INTERFACES
// ============================================================================

export type AuthMode = "login" | "signup";
export type AuthMethod = "email" | "phone";

export interface SystemFormFields {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly password: string;
}

export interface AuthState {
  readonly mode: AuthMode;
  readonly method: AuthMethod;
  readonly fields: SystemFormFields;
  readonly isGoogleLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly success: string | null;
}

export type AuthAction =
  | { type: "SET_FIELD"; payload: { field: keyof SystemFormFields; value: string } }
  | { type: "TOGGLE_MODE" }
  | { type: "TOGGLE_METHOD" }
  | { type: "SET_GOOGLE_LOADING"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUCCESS"; payload: string | null }
  | { type: "RESET_MESSAGES" };

// ============================================================================
// INITIAL STATE & REDUCER
// ============================================================================

const INITIAL_FIELDS: SystemFormFields = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const INITIAL_STATE: AuthState = {
  mode: "login",
  method: "email",
  fields: INITIAL_FIELDS,
  isGoogleLoading: false,
  isSubmitting: false,
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
    case "TOGGLE_MODE":
      return {
        ...INITIAL_STATE,
        mode: state.mode === "login" ? "signup" : "login",
        method: state.method,
      };
    case "TOGGLE_METHOD":
      return {
        ...state,
        method: state.method === "email" ? "phone" : "email",
        error: null,
        success: null,
      };
    case "SET_GOOGLE_LOADING":
      return { ...state, isGoogleLoading: action.payload };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };
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
  public static validate(state: AuthState): { isValid: boolean; error: string | null } {
    const { mode, method, fields } = state;

    if (mode === "signup") {
      const cleanName = fields.name.trim();
      if (!cleanName || cleanName.length < 2) {
        return { isValid: false, error: "Display name must be at least 2 characters long." };
      }
    }

    if (method === "email") {
      const cleanEmail = fields.email.trim();
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return { isValid: false, error: "Please enter a valid email address." };
      }
    } else {
      const cleanPhone = fields.phone.trim();
      if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
        return { isValid: false, error: "Invalid mobile number. Please enter 10 valid digits." };
      }
    }

    if (!fields.password || fields.password.length < MIN_PASSWORD_LENGTH) {
      return {
        isValid: false,
        error: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`,
      };
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
}

const AuthHeader = memo(({ mode }: AuthHeaderProps) => (
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
      {mode === "login" ? "Welcome Back" : "New Account"}
    </h1>
    <p className="text-[var(--text-light)] text-[10px] font-black uppercase tracking-[0.35em] mt-2">
      Status: {mode === "login" ? "Awaiting Credentials" : "Forging Identity Matrix"}
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
  readonly prefix?: string;
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
    prefix,
    hasError,
    describedBy,
    onChange,
  }: InputFieldProps) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-black uppercase text-[var(--text-light)] ml-3 tracking-widest block">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <div
            className="absolute left-3.5 z-10 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl font-black text-xs italic text-[var(--text-light)] select-none pointer-events-none"
            aria-hidden="true"
          >
            {prefix}
          </div>
        )}
        {icon && !prefix && (
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
            prefix ? "pl-16" : icon ? "pl-12" : "pl-4"
          }`}
        />
      </div>
    </div>
  )
);
InputField.displayName = "InputField";

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
  const phoneInputId = useId();
  const passwordInputId = useId();
  const alertRegionId = useId();

  // Reducer-driven centralized auth state
  const [state, dispatch] = useReducer(authReducer, INITIAL_STATE);

  // Field updates dispatcher
  const handleFieldChange = useCallback((field: keyof SystemFormFields, value: string) => {
    dispatch({ type: "SET_FIELD", payload: { field, value } });
  }, []);

  // Auth Mode Switcher (Login <-> Signup)
  const toggleAuthMode = useCallback(() => {
    dispatch({ type: "TOGGLE_MODE" });
  }, []);

  // Method Switcher (Email <-> Phone)
  const toggleAuthMethod = useCallback(() => {
    dispatch({ type: "TOGGLE_METHOD" });
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

  // Unified Form Submission Handler
  const handleFormSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch({ type: "RESET_MESSAGES" });

    const validation = AuthValidator.validate(state);
    if (!validation.isValid) {
      dispatch({ type: "SET_ERROR", payload: validation.error });
      return;
    }

    dispatch({ type: "SET_SUBMITTING", payload: true });
    const { mode, method, fields } = state;

    const name = fields.name.trim();
    const email = fields.email.trim().toLowerCase();
    const phone = fields.phone.trim();
    const password = fields.password;

    try {
      if (mode === "signup") {
        AuthLogger.info("Executing registration API request");

        await executeRegistration({ name, email, password });

        AuthLogger.info("Registration successful. Executing auto-login credentials handshake.");

        await executeCredentialsSignIn({ email, password, redirect: false });

        dispatch({ type: "SET_SUCCESS", payload: "Profile created! Initializing session..." });
        router.push(DEFAULT_REDIRECT_URL);
        router.refresh();
        return;
      }

      // Login Flow
      AuthLogger.info("Executing primary credentials login authentication");

      const credentialsPayload: Record<string, string | boolean> = {
        redirect: false,
        password,
        callbackUrl: DEFAULT_REDIRECT_URL,
        ...(method === "email" ? { email } : { phone: `+91${phone}` }),
      };

      await executeCredentialsSignIn(credentialsPayload);

      dispatch({ type: "SET_SUCCESS", payload: "Session authenticated! Loading dashboard..." });
      router.push(DEFAULT_REDIRECT_URL);
      router.refresh();
    } catch (err: unknown) {
      AuthLogger.error("Authentication Exception Encountered", err);
      const message =
        err instanceof Error ? err.message : "Internal runtime failure. Session terminated.";
      dispatch({ type: "SET_ERROR", payload: message });
      dispatch({ type: "SET_SUBMITTING", payload: false });
    }
  };

  // Immediate redirect for active sessions
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(DEFAULT_REDIRECT_URL);
    }
  }, [status, router]);

  const isInteractionDisabled = useMemo(
    () => state.isGoogleLoading || state.isSubmitting,
    [state.isGoogleLoading, state.isSubmitting]
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
        <AuthHeader mode={state.mode} />

        {/* Card Container */}
        <section className="bg-[var(--glass-bg)] backdrop-blur-2xl border border-white/10 rounded-[36px] p-6 sm:p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
          <SocialAuthSection
            isLoading={state.isGoogleLoading}
            isDisabled={isInteractionDisabled}
            onGoogleLogin={handleGoogleLogin}
          />

          {/* Core Authenticated Input Form */}
          <form onSubmit={handleFormSubmission} className="space-y-4 mt-6" noValidate>
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

            <AnimatePresence mode="wait">
              {state.method === "email" ? (
                <motion.div
                  key="input-email-layer"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.15 }}
                >
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
                </motion.div>
              ) : (
                <motion.div
                  key="input-phone-layer"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.15 }}
                >
                  <InputField
                    id={phoneInputId}
                    label="Mobile Network Target"
                    type="tel"
                    value={state.fields.phone}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    disabled={isInteractionDisabled}
                    prefix="+91"
                    icon={<Phone size={16} />}
                    hasError={Boolean(state.error && !PHONE_REGEX.test(state.fields.phone.trim()))}
                    describedBy={state.error ? alertRegionId : undefined}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Alternating Sub-method Switcher */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isInteractionDisabled}
                onClick={toggleAuthMethod}
                className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-widest ml-3 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 rounded bg-transparent border-none disabled:opacity-40"
              >
                Use {state.method === "email" ? "Verified Phone Target" : "Secure Account Email"}
              </button>
            </div>

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
                  <span>{state.mode === "login" ? "Initialize Entry" : "Establish Profile"}</span>
                )}
                {!state.isSubmitting && (
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Auth Mode Toggle Footer Link */}
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
      </motion.div>

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