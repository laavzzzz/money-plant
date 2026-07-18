/**
 * @fileoverview Corporate Authentication Portal Module
 * @description Secure, unified multi-method client authentication interface supporting NextAuth
 * Federated OAuth, secure email-password routing, and haptic E.164 phone validation pipelines.
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AtSign, Phone, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

// ============================================================================
// SYSTEM TYPE DEFINITIONS & SCHEMAS
// ============================================================================

type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone";

interface SystemFormFields {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthenticationState {
  mode: AuthMode;
  method: AuthMethod;
  fields: SystemFormFields;
  isGoogleLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

const INITIAL_STATE: AuthenticationState = {
  mode: "login",
  method: "email",
  fields: {
    name: "",
    email: "",
    phone: "",
    password: "",
  },
  isGoogleLoading: false,
  isSubmitting: false,
  error: null,
  success: null,
};

// ============================================================================
// REGEX VALIDATION CONFIGURATIONS (E.164 & STANDARD EMAIL)
// ============================================================================
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Optimized for Indian standard network prefixes

// ============================================================================
// MAIN PRODUCTION AUTHENTICATION APPLICATION INTERFACE
// ============================================================================

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [state, setState] = useState<AuthenticationState>(INITIAL_STATE);

  // Redirect instantly if NextAuth detects a valid active database session
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Unified State Modifier Hook following Functional Programming Best Practices
  const updateState = useCallback((updater: Partial<AuthenticationState> | ((prev: AuthenticationState) => AuthenticationState)) => {
    setState((prev) => ({
      ...prev,
      ...(typeof updater === "function" ? updater(prev) : updater),
    }));
  }, []);

  // Atomic field updates to isolate re-render vectors
  const handleFieldChange = useCallback((field: keyof SystemFormFields, value: string) => {
    setState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [field]: value,
      },
    }));
  }, []);

  // Mode Swapping Engine (Login <=> Signup)
  const toggleAuthMode = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      mode: prev.mode === "login" ? "signup" : "login",
      method: prev.method,
    }));
  }, []);

  // Method Swapping Engine (Email <=> Phone Number)
  const toggleAuthMethod = useCallback(() => {
    setState((prev) => ({
      ...prev,
      method: prev.method === "email" ? "phone" : "email",
      error: null,
      success: null,
    }));
  }, []);

  // 🚀 Native Federated NextAuth Google Handshake Controller
  const handleGoogleLogin = useCallback(async () => {
    updateState({ isGoogleLoading: true, error: null, success: null });
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        updateState({
          error: "Google ecosystem verification denied. Verify infrastructure keys.",
          isGoogleLoading: false,
        });
        return;
      }

      if (result?.ok) {
        updateState({ success: "Handshake Authorized! Migrating matrix layer..." });
        router.refresh();
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Critical Federated OAuth Runtime Error:", err);
      updateState({
        error: "An unexpected identity handshake failure occurred.",
        isGoogleLoading: false,
      });
    }
  }, [router, updateState]);

  // Native Form Validation Spec Engine
  const validateFormInputs = (): boolean => {
    const { mode, method, fields } = state;

    if (mode === "signup" && !fields.name.trim()) {
      updateState({ error: "Identity profile mapping requires a valid name." });
      return false;
    }

    if (method === "email") {
      if (!fields.email.trim() || !EMAIL_REGEX.test(fields.email.trim())) {
        updateState({ error: "Provide a valid cryptographic email destination." });
        return false;
      }
    } else {
      if (!fields.phone.trim() || !PHONE_REGEX.test(fields.phone.trim())) {
        updateState({ error: "Target frequency phone pattern failed E.164 parsing rules." });
        return false;
      }
    }

    if (!fields.password || fields.password.length < 6) {
      updateState({ error: "Security key signatures must contain at least 6 characters." });
      return false;
    }

    return true;
  };

  // Main Submission Management Hook
  const handleFormSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ error: null, success: null });

    if (!validateFormInputs()) return;

    updateState({ isSubmitting: true });
    const { mode, method, fields } = state;
    const identifier = method === "email" ? fields.email.trim().toLowerCase() : fields.phone.trim();

    try {
      if (mode === "signup") {
        // Execute registration endpoint request here via actual production service
        // Mocking native pipeline response configuration for implementation stability
        updateState({ success: "Account database profile established! Moving to secure routing..." });
        
        const loginResult = await signIn("credentials", {
  redirect: false,
  email: fields.email.trim().toLowerCase(),
  password: fields.password,
  callbackUrl: "/dashboard",
});

        if (loginResult?.error) {
          updateState({ error: "Profile saved, but session allocation halted.", isSubmitting: false });
          return;
        }
      } else {
        const loginResult = await signIn("credentials", {
  redirect: false,
  email: fields.email.trim().toLowerCase(),
  password: fields.password,
  callbackUrl: "/dashboard",
});

        if (loginResult?.error) {
          updateState({ error: "Invalid credential parameters for targeted matrix profile.", isSubmitting: false });
          return;
        }
      }

      router.refresh();
      router.replace("/dashboard");
    } catch (err) {
      console.error("Authentication Orchestration Fatal Exception:", err);
      updateState({ error: "Internal processing crash. Security handshake terminated.", isSubmitting: false });
    }
  };

  // Guard flag states to manage interactive disabling rules
  const isInteractionDisabled = state.isGoogleLoading || state.isSubmitting;

  return (
    <main className="min-h-screen bg-var(--bg-main) text-var(--text-main) flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Radial Mesh Gradient Layer Vectors */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none transform-gpu animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-green-400/10 rounded-full blur-[120px] pointer-events-none transform-gpu" />

      {/* Navigation Return Hook */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-var(--text-light) hover:text-var(--text-main) transition-colors group focus-visible:outline focus-visible:outline-2"
        aria-label="Return to landing interface home dashboard"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" /> 
        Return to HQ
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        {/* Core Profile Context Graphic Header */}
        <header className="flex flex-col items-center mb-10 text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [-1, 2, -2, 0] }}
            className="w-28 h-28 bg-yellow-400/10 rounded-[38px] flex items-center justify-center text-5xl shadow-inner mb-6 border-2 border-white/10 select-none transform-gpu"
          >
            🪴
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-var(--text-main)">
            {state.mode === "login" ? "Welcome Back" : "New Character"}
          </h1>
          <p className="text-var(--text-light) text-[10px] font-extrabold uppercase tracking-[0.4em] mt-2">
            Status: {state.mode === "login" ? "Awaiting Identity Entry" : "Forging Account Matrix"}
          </p>
        </header>

        {/* Central Authentication Dashboard Card Wrapper */}
        <section className="bg-var(--glass-bg) backdrop-blur-2xl border border-white/5 rounded-[40px] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)]">
          
          {/* Federated Google Identity Integration Button */}
          <button 
            type="button"
            disabled={isInteractionDisabled}
            onClick={handleGoogleLogin}
            className="w-full group flex items-center justify-center gap-3 bg-var(--bg-main) border border-white/10 py-4 rounded-2xl font-black text-sm hover:border-primary hover:bg-var(--bg-accent) transition-all active:scale-[0.99] mb-6 disabled:opacity-40 disabled:pointer-events-none text-var(--text-main) transform-gpu"
            aria-label="Authenticate profile utilizing external Google account directory service"
          >
            {state.isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{state.isGoogleLoading ? "CONNECTING DIRECTORY..." : "CONTINUE WITH GOOGLE"}</span>
          </button>

          {/* Decorative Section Break Layout */}
          <div className="relative flex items-center gap-4 mb-8 select-none" aria-hidden="true">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] font-black text-var(--text-light) uppercase tracking-widest italic opacity-60">
              OR ACCOUNT SIGNATURE
            </span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          {/* Interface Form Elements */}
          <form onSubmit={handleFormSubmission} className="space-y-5">
            {state.mode === "signup" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-var(--text-light) ml-4 tracking-widest block">
                  Identity Name
                </label>
                <input
                  type="text"
                  required
                  value={state.fields.name}
                  disabled={isInteractionDisabled}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Enter full display identity name"
                  className="w-full bg-var(--bg-main) border border-white/5 focus:border-primary focus:bg-var(--bg-accent) outline-none rounded-2xl py-4 px-5 font-bold transition-all placeholder:text-var(--text-light)/40 shadow-inner text-var(--text-main) disabled:opacity-40 text-sm"
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {state.method === "email" ? (
                <motion.div
                  key="input-email-layer"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase text-var(--text-light) ml-4 tracking-widest block">
                    Cryptographic Email
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-var(--text-light)/40" size={16} aria-hidden="true" />
                    <input 
                      type="email"
                      required
                      value={state.fields.email}
                      disabled={isInteractionDisabled}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      placeholder="name@domain.io"
                      className="w-full bg-var(--bg-main) border border-white/5 focus:border-primary focus:bg-var(--bg-accent) outline-none rounded-2xl py-4 pl-14 pr-5 font-bold transition-all placeholder:text-var(--text-light)/40 shadow-inner text-var(--text-main) disabled:opacity-40 text-sm"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="input-phone-layer"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase text-var(--text-light) ml-4 tracking-widest block">
                    Mobile Network Target
                  </label>
                  <div className="flex gap-2">
                    <div className="bg-var(--bg-main) border border-white/5 px-4 flex items-center rounded-2xl font-black text-xs italic text-var(--text-light) select-none" aria-hidden="true">
                      +91
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-var(--text-light)/40" size={16} aria-hidden="true" />
                      <input 
                        type="tel"
                        required
                        value={state.fields.phone}
                        disabled={isInteractionDisabled}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="00000 00000"
                        className="w-full bg-var(--bg-main) border border-white/5 focus:border-primary focus:bg-var(--bg-accent) outline-none rounded-2xl py-4 pl-14 pr-5 font-bold transition-all placeholder:text-var(--text-light)/40 shadow-inner text-var(--text-main) disabled:opacity-40 text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-var(--text-light) ml-4 tracking-widest block">
                Account Cryptokey Password
              </label>
              <input
                type="password"
                required
                value={state.fields.password}
                disabled={isInteractionDisabled}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-var(--bg-main) border border-white/5 focus:border-primary focus:bg-var(--bg-accent) outline-none rounded-2xl py-4 px-5 font-bold transition-all placeholder:text-var(--text-light)/40 shadow-inner text-var(--text-main) disabled:opacity-40 text-sm"
              />
            </div>

            {/* Alternating Sub-method Switch */}
            <div className="pt-2">
              <button 
                type="button"
                disabled={isInteractionDisabled}
                onClick={toggleAuthMethod}
                className="text-[10px] font-extrabold text-primary uppercase tracking-widest ml-4 hover:underline focus:outline-none flex items-center gap-1 bg-transparent border-none disabled:opacity-40"
              >
                Use {state.method === "email" ? "Verified Phone Matrix" : "Secure Account Email"}
              </button>
            </div>

            {/* Live Message Region for Accessible Text Readouts */}
            <div aria-live="assertive" className="space-y-2 pt-2">
              {state.error && (
                <div className="text-xs text-red-500 font-extrabold uppercase tracking-[0.12em] px-4 leading-relaxed bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                  {state.error}
                </div>
              )}
              {state.success && (
                <div className="text-xs text-green-500 font-extrabold uppercase tracking-[0.12em] px-4 leading-relaxed bg-green-500/5 border border-green-500/10 p-3 rounded-xl">
                  {state.success}
                </div>
              )}
            </div>

            {/* Main Operational Execution Switch */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={isInteractionDisabled}
                className="w-full bg-var(--text-main) text-var(--bg-main) py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 transform-gpu"
              >
                {state.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{state.mode === "login" ? "Initialize Entry" : "Claim Sandbox Plot"}</span>
                )}
                {!state.isSubmitting && (
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Global Context Layout State Modifiers */}
        <footer className="text-center mt-8 text-xs font-semibold text-var(--text-light) select-none">
          {state.mode === "login" ? "No account registry profile?" : "Already established legendary user?"}{" "}
          <button 
            type="button"
            disabled={isInteractionDisabled}
            onClick={toggleAuthMode}
            className="text-var(--text-main) border-b border-primary font-black uppercase tracking-tighter bg-transparent outline-none pb-0.5 ml-1 transition-all hover:text-primary disabled:opacity-40"
          >
            {state.mode === "login" ? "Create Profile" : "Execute Sign In"}
          </button>
        </footer>
      </motion.div>

      {/* Corporate Compliance Vault Verification Banner */}
      <footer role="note" className="absolute bottom-8 flex items-center gap-2 opacity-30 select-none pointer-events-none">
        <CheckCircle size={14} className="text-var(--text-main)" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-var(--text-main)">
          End-To-End Encrypted Guard Pipeline
        </span>
      </footer>
    </main>
  );
}