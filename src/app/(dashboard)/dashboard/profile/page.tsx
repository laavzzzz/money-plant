/**
 * @fileoverview Enterprise Gamified User Profile Configuration Console
 * @description High-performance profile portal featuring atomic input tracking, 
 * secure local storage fallback engines, validation wrappers, and zero layout hydration lag.
 */

"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { 
  Camera, User, Shield, Zap, Award, Star, Edit3, MapPin, 
  Mail, Phone, ShieldCheck, LogOut, Check, X, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// CORE SYSTEM UTILITIES
// ============================================================================

/**
 * High-performance Tailwind Class Merger
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PROFILE_STORAGE_KEY = "moneyplant-profile";
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Upload Guardrail

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  accountType: string;
  joinedDate: string;
  bio: string;
  totalSaved: string;
  monthlyAverage: string;
  goalCompletion: string;
  savingsRate: string;
  globalAura: string;
  achievements: string;
  profilePic: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Player One",
  email: "player.one@moneyplant.app",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  accountType: "Premium Saver",
  joinedDate: "June 2024",
  bio: "Building better money habits one plant at a time.",
  totalSaved: "124800",
  monthlyAverage: "12300",
  goalCompletion: "8 / 12",
  savingsRate: "64",
  globalAura: "1240",
  achievements: "12/50",
  profilePic: null,
};

interface AlertState {
  text: string;
  type: "success" | "error" | "info";
}

// ============================================================================
// CORE DATA UTILITIES
// ============================================================================

/**
 * Calculates dynamic profile completion percentages deterministically.
 */
const evaluateCompletionMetrics = (profile: UserProfile): number => {
  const mandatoryFields: (keyof UserProfile)[] = [
    "name", "email", "phone", "location", "accountType", "bio", "profilePic"
  ];
  const completedCount = mandatoryFields.filter(field => Boolean(profile[field])).length;
  return Math.min(100, Math.round((completedCount / mandatoryFields.length) * 100));
};

/**
 * Processes a string representing the savings rate percentage to map a dynamic gamified status title.
 */
const resolveAuraGamifiedTitle = (rateString: string): string => {
  const parsedRate = parseInt(rateString.replace(/[^0-9]/g, ""), 10) || 0;
  if (parsedRate < 5) return "🌱 Budget Rookie";
  if (parsedRate < 10) return "💸 Coin Collector";
  if (parsedRate < 15) return "🌿 Cash Sprout";
  if (parsedRate < 20) return "📈 Savings Explorer";
  if (parsedRate < 30) return "💎 Money Mover";
  if (parsedRate < 40) return "🚀 Wealth Builder";
  if (parsedRate < 50) return "🏆 Finance Slayer";
  if (parsedRate < 60) return "👑 Bag Secured";
  if (parsedRate < 75) return "🔥 Wealth Wizard";
  return "🌳 MoneyPlant Legend";
};

/**
 * Strips non-numeric characters and structures localization signatures safely.
 */
const formatIndianCurrency = (rawAmount: string): string => {
  const cleanlyParsedDigits = rawAmount.replace(/[^0-9]/g, "");
  if (!cleanlyParsedDigits) return "₹0";
  const numericValue = parseInt(cleanlyParsedDigits, 10);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(numericValue);
};

// ============================================================================
// ATOMIC SUB-COMPONENTS (MEMOIZED)
// ============================================================================

const StatCard = memo(function StatCard({ 
  label, value, color, icon 
}: { 
  label: string; value: string; color: string; icon?: React.ReactNode 
}) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between min-w-0 w-full overflow-hidden"
    >
      <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 mb-2 min-w-0">
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <p className="text-[10px] font-black uppercase tracking-widest truncate">{label}</p>
      </div>
      <p className={cn("text-xl md:text-2xl font-black tracking-tight leading-tight truncate block max-w-full", color)}>
        {value}
      </p>
    </motion.div>
  );
});

const EditableField = memo(function EditableField({
  label, id, name, value, type = "text", placeholder, onChange
}: {
  label: string; id: string; name: string; value: string; type?: string; placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="font-black text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-all w-full shadow-sm"
      />
    </div>
  );
});

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ProfilePage() {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Single Consolidated Object State 
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute values dynamically derived from primary model state parameters
  const activeTitle = useMemo(() => resolveAuraGamifiedTitle(profile.savingsRate), [profile.savingsRate]);
  const currentCompletionPercentage = useMemo(() => evaluateCompletionMetrics(profile), [profile]);

  const triggerAlertMessage = useCallback((text: string, type: AlertState["type"] = "info") => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  /**
   * Dispatches network configurations to fetch profile state structures
   */
  const loadProfileDataset = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error("Fallback upstream tracking triggered.");
      const payload = await response.json();
      
      if (payload?.success && payload?.data) {
        setProfile(payload.data);
        setDraftProfile(payload.data);
        return;
      }
    } catch {
      // Local Storage Fallback Recovery Routine
      if (typeof window !== "undefined") {
        const structuralCachedData = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (structuralCachedData) {
          try {
            const parsedData = JSON.parse(structuralCachedData) as UserProfile;
            setProfile(parsedData);
            setDraftProfile(parsedData);
            return;
          } catch {
            triggerAlertMessage("Corrupted cache context dropped.", "error");
          }
        }
      }
    } finally {
      setHasHydrated(true);
    }
  }, [triggerAlertMessage]);

  useEffect(() => {
    loadProfileDataset();
  }, [loadProfileDataset]);

  // Input Field Reducer Handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDraftProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Validates payloads and synchronizes modifications upstream.
   */
  const executeProfileSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    setIsProcessing(true);

    // Baseline Input Form Sanitization Constraints
    if (!draftProfile.name.trim() || !draftProfile.email.trim()) {
      triggerAlertMessage("Identity tracking attributes cannot be blank.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftProfile),
      });

      const parsedResponse = await response.json();
      if (!parsedResponse.success) throw new Error("Cloud rejection recorded.");
      
      setProfile(draftProfile);
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draftProfile));
      triggerAlertMessage("Cloud database sync finalized successfully.", "success");
      setIsEditMode(false);
    } catch {
      // Offline Persistence Synchronization Fallback Strategy
      setProfile(draftProfile);
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draftProfile));
      triggerAlertMessage("Local cache secured; upstream persistent link delayed.", "info");
      setIsEditMode(false);
    } finally {
      setIsProcessing(false);
    }
  }, [draftProfile, triggerAlertMessage]);

  /**
   * Processes raw image streaming configurations securely.
   */
  const processImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetedFile = e.target.files?.[0];
    if (!targetedFile) return;

    if (targetedFile.size > MAX_IMAGE_SIZE_BYTES) {
      triggerAlertMessage("Payload boundary violated. Cap file dimensions to 2MB.", "error");
      return;
    }

    const standardReader = new FileReader();
    standardReader.onloadend = () => {
      const encodedString = standardReader.result as string;
      if (isEditMode) {
        setDraftProfile(prev => ({ ...prev, profilePic: encodedString }));
      } else {
        setProfile(prev => {
          const directProfileUpdate = { ...prev, profilePic: encodedString };
          if (typeof window !== "undefined") {
            window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(directProfileUpdate));
          }
          return directProfileUpdate;
        });
        triggerAlertMessage("Avatar updated dynamically.", "success");
      }
    };
    standardReader.readAsDataURL(targetedFile);
  }, [isEditMode, triggerAlertMessage]);

  const handleSessionTermination = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();

      const globalCookies = window.document.cookie.split(";");
      for (let index = 0; index < globalCookies.length; index++) {
        const targetingCookie = globalCookies[index];
        const breakpointPosition = targetingCookie.indexOf("=");
        const validatedCookieName = breakpointPosition > -1 
          ? targetingCookie.substring(0, breakpointPosition).trim() 
          : targetingCookie.trim();
        
        window.document.cookie = `${validatedCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        window.document.cookie = `${validatedCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
      }
    } finally {
      window.location.href = "/login";
    }
  }, []);

  // Hydration Blocking Prevention Guard Initializer
  if (!hasHydrated) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8 max-w-5xl mx-auto opacity-100 animate-pulse" aria-hidden="true">
        <div className="h-6 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-44 bg-neutral-200 dark:bg-neutral-800 rounded-[36px]" />
      </div>
    );
  }

  // Sanitized Dynamic Intermediary Parsing to Protect Against String Crashes
  const calculatedGlobalAura = parseInt(profile.globalAura.replace(/[^0-9]/g, ""), 10) || 0;

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 p-4 md:p-8 max-w-5xl mx-auto transform-gpu selection:bg-yellow-200 selection:text-black">
      
      {/* ACTION HEADER DESK COMPONENT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] select-none">
            Character Sheets Matrix
          </p>
          <h1 className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Monitor asset statistics parameters, secure algorithmic parameters, and audit system authentication layers.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              setDraftProfile(profile);
              setIsEditMode(prev => !prev);
            }}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-neutral-900 rounded-xl px-4 py-2.5 font-black text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer select-none"
          >
            <Edit3 size={12} />
            {isEditMode ? "Close Desk" : "Modify Framework"}
          </button>

          <button
            type="button"
            onClick={handleSessionTermination}
            className="inline-flex items-center gap-2 bg-red-500 text-white rounded-xl px-4 py-2.5 font-black text-[10px] uppercase tracking-wider hover:bg-red-600 active:scale-98 transition-all shadow-sm cursor-pointer select-none"
          >
            <LogOut size={12} />
            Purge Session
          </button>
        </div>
      </div>

      {/* ARIA ACCESSIBLE LIVE BANNERS STATUS NOTIFICATION PORT */}
      <AnimatePresence>
        {alert && (
          <motion.div 
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs font-black tracking-tight flex items-center gap-2",
              alert.type === "success" && "border-green-200 bg-green-50 text-green-800 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-400",
              alert.type === "error" && "border-red-200 bg-red-50 text-red-800 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400",
              alert.type === "info" && "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400"
            )}
          >
            <Shield size={12} className="shrink-0" />
            {alert.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE IDENTIFICATION OVERVIEW BOX */}
      <motion.div 
        layout="position"
        className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[36px] border border-neutral-100 dark:border-neutral-800/60 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.04] pointer-events-none text-neutral-900 dark:text-white" aria-hidden="true">
          <Zap size={240} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          
          {/* AVATAR HERO COMPONENT SECTOR */}
          <div className="relative shrink-0 select-none">
            <div 
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="Upload custom user identification graphic asset"
              className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] bg-neutral-50 dark:bg-neutral-950 border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer relative group outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
            >
              {(isEditMode ? draftProfile.profilePic : profile.profilePic) ? (
                <img 
                  src={isEditMode ? draftProfile.profilePic! : profile.profilePic!} 
                  alt="Identity authorization visualization matrix" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-300 dark:text-neutral-700">
                  <User size={40} />
                  <span className="text-[8px] font-black uppercase mt-1 tracking-wider">Unbound</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={22} />
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={processImageUpload} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
            />
            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-neutral-950 p-2 rounded-xl shadow-lg border-2 border-white dark:border-neutral-900" aria-hidden="true">
              <Shield size={14} />
            </div>
          </div>

          {/* ATTRIBUTE TEXT CORE RENDER SYSTEM */}
          <div className="text-center md:text-left flex-1 min-w-0 w-full">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-2 text-neutral-900 dark:text-neutral-50 break-words">
              {isEditMode ? draftProfile.name : profile.name}
            </h2>
            <div className="mb-3">
              <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase text-[10px] tracking-wider bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-100/30">
                {activeTitle}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed mb-5 break-words font-medium">
              {isEditMode ? draftProfile.bio : profile.bio}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full overflow-hidden" role="list">
              <div role="listitem" className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-green-100/20 shrink-0">
                <Star size={10} fill="currentColor" /> Tracking streak: Active continuous
              </div>
              <div role="listitem" className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-purple-100/20 shrink-0">
                <Award size={10} /> Tier Architecture Level Verified
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT INTERACTION DISPATCHER (FORM MODE) */}
        {isEditMode ? (
          <form onSubmit={executeProfileSave} className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <EditableField label="Operational Alias" id="edit-name" name="name" value={draftProfile.name} onChange={handleInputChange} />
              <EditableField label="Comms Routing Port (Email)" id="edit-email" name="email" type="email" value={draftProfile.email} onChange={handleInputChange} />
              <EditableField label="Secure Line Linkage" id="edit-phone" name="phone" value={draftProfile.phone} onChange={handleInputChange} />
              <EditableField label="Spatial Cluster Context (Location)" id="edit-location" name="location" value={draftProfile.location} onChange={handleInputChange} />
              <EditableField label="System Hierarchy Account Placement" id="edit-accountType" name="accountType" value={draftProfile.accountType} onChange={handleInputChange} />
              <EditableField label="Velocity Standard Vector (Savings %)" id="edit-savingsRate" name="savingsRate" value={draftProfile.savingsRate} onChange={handleInputChange} placeholder="e.g. 64" />
              <EditableField label="Total Pool Accrued Metrics" id="edit-totalSaved" name="totalSaved" value={draftProfile.totalSaved} onChange={handleInputChange} />
              <EditableField label="Telemetry Quantization Level (Aura)" id="edit-globalAura" name="globalAura" value={draftProfile.globalAura} onChange={handleInputChange} />
              <EditableField label="Milestone Matrices Completed" id="edit-achievements" name="achievements" value={draftProfile.achievements} onChange={handleInputChange} />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="edit-bio" className="font-black text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Bio Data Framework
              </label>
              <textarea 
                id="edit-bio"
                name="bio"
                value={draftProfile.bio} 
                onChange={handleInputChange}
                rows={3} 
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-all w-full resize-none shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 py-2.5 px-4 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition shadow-md cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                Commit Configurations
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditMode(false)} 
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 py-2.5 px-4 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-900 transition shadow-sm cursor-pointer"
              >
                <X size={12} />
                Abort Changes
              </button>
            </div>
          </form>
        ) : (
          /* READ-ONLY PORT BLOCK LAYOUT */
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Email Configuration Link" value={profile.email} color="text-neutral-900 dark:text-neutral-100 font-bold" icon={<Mail size={12} />} />
            <StatCard label="Secure Signal Line" value={profile.phone} color="text-neutral-900 dark:text-neutral-100 font-bold" icon={<Phone size={12} />} />
            <StatCard label="Spatial Core Sector" value={profile.location} color="text-neutral-900 dark:text-neutral-100 font-bold" icon={<MapPin size={12} />} />
            <StatCard label="Initialization Cluster Timestamp" value={profile.joinedDate} color="text-neutral-400 dark:text-neutral-500 font-bold" />
            <StatCard label="Ecosystem Placement Ranking" value={profile.accountType} color="text-purple-600 dark:text-purple-400 font-black" />
            <StatCard label="Calculated Net Resource Cache" value={formatIndianCurrency(profile.totalSaved)} color="text-green-600 dark:text-green-400 font-black" />
          </div>
        )}
      </motion.div>

      {/* MID-TIER MATRIX BENTO CONFIGURATIONS */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* COMPREHENSIVE FILL STATUS RUNTIME GRAPH */}
        <div className="p-6 rounded-[28px] border border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-black text-neutral-400 dark:text-neutral-500">
                  Data Structure Integrity Gauge
                </p>
                <h3 className="mt-1 text-xl font-black text-neutral-900 dark:text-neutral-50 truncate">
                  {currentCompletionPercentage}% Schema Sync
                </h3>
              </div>
              <div className="self-start sm:self-auto rounded-xl bg-purple-50 dark:bg-purple-950/40 px-3 py-1 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-wider border border-purple-100/10 shrink-0 select-none">
                Optimized Configuration
              </div>
            </div>
            
            <div className="mt-4 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden w-full border border-neutral-200/5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${currentCompletionPercentage}%` }}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed font-medium">
            Maintain high metadata completeness ratios across the storage array to unblock localized parameter overrides, priority support tiers, and target asset profiling logic.
          </p>
        </div>

        {/* SECURITY & ACCOUNT AUDITING STATUS CONTAINER */}
        <div className="p-6 rounded-[28px] border border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-sm min-w-0">
          <div className="flex items-center gap-2 mb-4 select-none">
            <ShieldCheck size={16} className="text-purple-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
              Identity Verification Logs
            </p>
          </div>
          
          <div className="space-y-2 text-xs w-full font-bold">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">Two-Factor Authentication</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">Hardware Key Enforced</p>
              </div>
              <span className="rounded-lg bg-green-100 dark:bg-green-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-green-700 dark:text-green-400 shrink-0 shadow-sm border border-green-200/10">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">Database Node Class</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">Authorization Layer</p>
              </div>
              <span className="rounded-lg bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-purple-700 dark:text-purple-400 shrink-0 shadow-sm border border-purple-200/10">
                {profile.accountType}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">Encryption Handshake</p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">Transport Tier</p>
              </div>
              <span className="rounded-lg bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-purple-700 dark:text-purple-400 shrink-0 shadow-sm border border-purple-200/10">
                SECURE SSL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER TIER PERFORMANCE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Ecosystem Telemetry (Global Aura)" value={`+${calculatedGlobalAura.toLocaleString("en-IN")}`} color="text-yellow-500 dark:text-yellow-400 font-black" />
        <StatCard label="Velocity Coefficient (Savings Rate)" value={`${profile.savingsRate}%`} color="text-green-500 dark:text-green-400 font-black" />
        <StatCard label="Milestones Converted" value={profile.achievements} color="text-purple-500 dark:text-purple-400 font-black" />
      </div>
    </div>
  );
}