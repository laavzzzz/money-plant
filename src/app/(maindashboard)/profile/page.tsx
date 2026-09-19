/**
 * @fileoverview Enterprise Gamified User Profile Portal
 * @description Production-ready Next.js App Router Client Component featuring OAuth/Google
 * session auto-population, clean empty-state defaults, atomic draft state management,
 * resilient local caching, robust error boundary fallbacks, and zero layout shift.
 *
 * @module app/profile/page
 * @version 2.2.0
 */

"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
  useId,
} from "react";
import {
  Camera,
  User,
  Shield,
  Zap,
  Award,
  Star,
  Edit3,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// TYPE DEFINITIONS & SCHEMAS
// ============================================================================

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

export type AlertType = "success" | "error" | "info";

export interface AlertState {
  id: string;
  text: string;
  type: AlertType;
}

export interface AuthSessionData {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    picture?: string | null;
  };
}

export interface FormValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  savingsRate?: string;
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const PROFILE_STORAGE_KEY = "moneyplant-profile-v2";
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Limit
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const BASE_EMPTY_PROFILE: Readonly<UserProfile> = Object.freeze({
  name: "",
  email: "",
  phone: "",
  location: "",
  accountType: "Free Tier",
  joinedDate: "",
  bio: "",
  totalSaved: "",
  monthlyAverage: "",
  goalCompletion: "",
  savingsRate: "",
  globalAura: "",
  achievements: "",
  profilePic: null,
});

/**
 * Validates inputs against enterprise standard constraints.
 */
function validateProfileData(profile: UserProfile): FormValidationErrors {
  const errors: FormValidationErrors = {};

  if (!profile.name.trim()) {
    errors.name = "Name / Alias is required.";
  } else if (profile.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  }

  if (profile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Please provide a valid email address.";
  }

  if (profile.phone.trim() && !/^\+?[0-9\s\-()]{7,20}$/.test(profile.phone.trim())) {
    errors.phone = "Invalid telephone format.";
  }

  if (profile.savingsRate.trim()) {
    const parsedRate = Number(profile.savingsRate.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      errors.savingsRate = "Rate must be a percentage between 0 and 100.";
    }
  }

  return errors;
}

/**
 * Dynamic Gamified Aura Resolver.
 */
function resolveAuraGamifiedTitle(rateString: string | undefined): string {
  if (!rateString) return "🌱 Budget Rookie";
  const parsedRate = parseInt(String(rateString).replace(/[^0-9]/g, ""), 10) || 0;
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
}

/**
 * Formats standard Indian Currency representations gracefully with strict fallback.
 */
function formatIndianCurrency(rawAmount: string | undefined): string {
  if (!rawAmount || !String(rawAmount).trim()) return "₹0";
  const cleanlyParsedDigits = String(rawAmount).replace(/[^0-9]/g, "");
  if (!cleanlyParsedDigits) return "₹0";
  const numericValue = parseInt(cleanlyParsedDigits, 10);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch {
    return `₹${numericValue.toLocaleString("en-IN")}`;
  }
}

/**
 * Computes profile completion metric safely.
 */
function evaluateCompletionMetrics(profile: UserProfile): number {
  const mandatoryFields: (keyof UserProfile)[] = [
    "name",
    "email",
    "phone",
    "location",
    "bio",
    "profilePic",
  ];
  const completedCount = mandatoryFields.filter((field) => {
    const val = profile[field];
    return val !== null && val !== undefined && String(val).trim().length > 0;
  }).length;

  return Math.min(100, Math.round((completedCount / mandatoryFields.length) * 100));
}

// ============================================================================
// MEMOIZED ATOMIC SUB-COMPONENTS
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
  fallbackText?: string;
  color?: string;
  icon?: React.ReactNode;
}

const StatCard = memo(function StatCard({
  label,
  value,
  fallbackText = "Not provided",
  color,
  icon,
}: StatCardProps) {
  const isFallback = !value || value.trim().length === 0;
  const displayValue = isFallback ? fallbackText : value;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/60 shadow-sm flex flex-col justify-between min-w-0 w-full overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400"
    >
      <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 mb-2 min-w-0">
        {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
        <p className="text-[10px] font-black uppercase tracking-widest truncate">{label}</p>
      </div>
      <p
        className={cn(
          "text-xl md:text-2xl font-black tracking-tight leading-tight truncate block max-w-full",
          isFallback ? "text-neutral-400 dark:text-neutral-600 font-normal italic text-sm" : color
        )}
      >
        {displayValue}
      </p>
    </motion.div>
  );
});

interface EditableFieldProps {
  label: string;
  id: string;
  name: keyof UserProfile;
  value: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditableField = memo(function EditableField({
  label,
  id,
  name,
  value,
  type = "text",
  placeholder,
  readOnly = false,
  error,
  onChange,
}: EditableFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="font-black text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex justify-between"
      >
        <span>{label}</span>
        {error && <span className="text-red-500 lowercase font-medium text-[10px]">{error}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value ?? ""}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}...`}
        onChange={onChange}
        className={cn(
          "rounded-xl border bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none transition-all w-full shadow-sm",
          error
            ? "border-red-400 focus:border-red-500 dark:border-red-900/60"
            : "border-neutral-200 dark:border-neutral-800 focus:border-yellow-400 dark:focus:border-yellow-500",
          readOnly && "opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900"
        )}
      />
      {error && (
        <span id={`${id}-error`} className="sr-only">
          {error}
        </span>
      )}
    </div>
  );
});

// ============================================================================
// MAIN PROFILE PAGE COMPONENT
// ============================================================================

export default function ProfilePage() {
  const alertId = useId();
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(BASE_EMPTY_PROFILE);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(BASE_EMPTY_PROFILE);
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  const [alert, setAlert] = useState<AlertState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed Derived States
  const activeTitle = useMemo(
    () => resolveAuraGamifiedTitle(profile.savingsRate),
    [profile.savingsRate]
  );
  const currentCompletionPercentage = useMemo(
    () => evaluateCompletionMetrics(profile),
    [profile]
  );
  const calculatedGlobalAura = useMemo(
    () => parseInt(String(profile.globalAura || "0").replace(/[^0-9]/g, ""), 10) || 0,
    [profile.globalAura]
  );

  const triggerAlertMessage = useCallback((text: string, type: AlertType = "info") => {
    const id = `${alertId}-${Date.now()}`;
    setAlert({ id, text, type });
    const timer = setTimeout(() => {
      setAlert((current) => (current?.id === id ? null : current));
    }, 4500);
    return () => clearTimeout(timer);
  }, [alertId]);

  /**
   * Primary Hydration and Data Pre-fetching logic.
   */
  const initializeProfileData = useCallback(async () => {
    let localData: Partial<UserProfile> = {};

    if (typeof window !== "undefined") {
      try {
        const cached = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (cached) {
          localData = JSON.parse(cached);
        }
      } catch (err) {
        console.warn("[Profile] Unable to parse cached local profile storage:", err);
      }
    }

    let googleSessionUser: AuthSessionData["user"] = undefined;
    try {
      const authRes = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (authRes.ok) {
        const sessionData: AuthSessionData = await authRes.json();
        if (sessionData?.user) {
          googleSessionUser = sessionData.user;
        }
      }
    } catch {
      // Offline or dynamic Auth route omitted gracefully
    }

    let serverData: Partial<UserProfile> = {};
    try {
      const apiRes = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (apiRes.ok) {
        const payload = await apiRes.json();
        if (payload?.success && payload?.data) {
          serverData = payload.data;
        }
      }
    } catch {
      // Downstream server endpoint unreachable
    }

    const synthesizedProfile: UserProfile = {
      ...BASE_EMPTY_PROFILE,
      ...localData,
      ...serverData,
      name: googleSessionUser?.name || serverData.name || localData.name || "",
      email: googleSessionUser?.email || serverData.email || localData.email || "",
      profilePic:
        googleSessionUser?.image ||
        googleSessionUser?.picture ||
        serverData.profilePic ||
        localData.profilePic ||
        null,
      joinedDate: serverData.joinedDate || localData.joinedDate || "Recent Member",
    };

    setProfile(synthesizedProfile);
    setDraftProfile(synthesizedProfile);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(synthesizedProfile));
      } catch (err) {
        console.warn("[Profile] Storage quotas exceeded or local storage restricted:", err);
      }
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    initializeProfileData();
  }, [initializeProfileData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setDraftProfile((prev) => ({ ...prev, [name]: value }));
      if (validationErrors[name as keyof FormValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [validationErrors]
  );

  const executeProfileSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (typeof window === "undefined") return;

      const errors = validateProfileData(draftProfile);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        triggerAlertMessage("Please correct highlighted errors before saving.", "error");
        return;
      }

      setIsProcessing(true);

      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftProfile),
        });

        const parsedResponse = await response.json();
        if (!response.ok || !parsedResponse.success) {
          throw new Error(parsedResponse?.message || "Server sync failed.");
        }

        setProfile(draftProfile);
        window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draftProfile));
        triggerAlertMessage("Profile synced successfully.", "success");
        setIsEditMode(false);
      } catch (error) {
        // Local persistence fallback execution
        setProfile(draftProfile);
        try {
          window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draftProfile));
          triggerAlertMessage("Saved locally to device (Offline mode).", "info");
        } catch {
          triggerAlertMessage("Failed to write updates to storage.", "error");
        }
        setIsEditMode(false);
      } finally {
        setIsProcessing(false);
      }
    },
    [draftProfile, triggerAlertMessage]
  );

  const processImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetedFile = e.target.files?.[0];
      if (!targetedFile) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(targetedFile.type)) {
        triggerAlertMessage("Invalid format. Please upload PNG, JPEG, or WebP.", "error");
        return;
      }

      if (targetedFile.size > MAX_IMAGE_SIZE_BYTES) {
        triggerAlertMessage("Image size exceeds limit. Maximum allowed size is 2MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const encodedString = reader.result as string;
        if (isEditMode) {
          setDraftProfile((prev) => ({ ...prev, profilePic: encodedString }));
        } else {
          setProfile((prev) => {
            const updated = { ...prev, profilePic: encodedString };
            if (typeof window !== "undefined") {
              try {
                window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
              } catch (err) {
                console.warn("Storage exception during avatar save:", err);
              }
            }
            return updated;
          });
          triggerAlertMessage("Avatar updated successfully.", "success");
        }
      };
      reader.onerror = () => {
        triggerAlertMessage("Failed to process local image file.", "error");
      };
      reader.readAsDataURL(targetedFile);
    },
    [isEditMode, triggerAlertMessage]
  );

  if (!hasHydrated) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8 max-w-5xl mx-auto animate-pulse" aria-hidden="true">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-[36px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentDisplayProfile = isEditMode ? draftProfile : profile;

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 p-4 md:p-8 max-w-5xl mx-auto transform-gpu selection:bg-yellow-200 selection:text-black">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] select-none">
            Character Sheet
          </p>
          <h1 className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Monitor asset statistics, adjust profile parameters, and view account details.
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              setValidationErrors({});
              setDraftProfile(profile);
              setIsEditMode((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-neutral-900 rounded-xl px-4 py-2.5 font-black text-[10px] uppercase tracking-wider transition-all shadow-sm cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
          >
            <Edit3 size={12} />
            {isEditMode ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* ARIA ACCESSIBLE ALERT BANNER */}
      <AnimatePresence mode="wait">
        {alert && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "rounded-2xl border px-4 py-3 text-xs font-black tracking-tight flex items-center gap-2 overflow-hidden",
              alert.type === "success" &&
                "border-green-200 bg-green-50 text-green-800 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-400",
              alert.type === "error" &&
                "border-red-200 bg-red-50 text-red-800 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400",
              alert.type === "info" &&
                "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400"
            )}
          >
            {alert.type === "error" ? (
              <AlertCircle size={14} className="shrink-0" />
            ) : (
              <Shield size={14} className="shrink-0" />
            )}
            <span>{alert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY PROFILE CARD */}
      <motion.div
        layout="position"
        className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-[36px] border border-neutral-100 dark:border-neutral-800/60 shadow-sm relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.04] pointer-events-none text-neutral-900 dark:text-white"
          aria-hidden="true"
        >
          <Zap size={240} />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          {/* AVATAR CONTAINER */}
          <div className="relative shrink-0 select-none">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload custom user avatar"
              className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] bg-neutral-50 dark:bg-neutral-950 border-4 border-white dark:border-neutral-900 shadow-xl overflow-hidden flex items-center justify-center cursor-pointer relative group outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
            >
              {currentDisplayProfile.profilePic ? (
                <img
                  src={currentDisplayProfile.profilePic}
                  alt={`${currentDisplayProfile.name || "User"}'s profile avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-300 dark:text-neutral-700">
                  <User size={40} />
                  <span className="text-[8px] font-black uppercase mt-1 tracking-wider">
                    No Avatar
                  </span>
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
            <div
              className="absolute -bottom-1 -right-1 bg-yellow-500 text-neutral-950 p-2 rounded-xl shadow-lg border-2 border-white dark:border-neutral-900"
              aria-hidden="true"
            >
              <Shield size={14} />
            </div>
          </div>

          {/* USER INFO HEADER */}
          <div className="text-center md:text-left flex-1 min-w-0 w-full">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-2 text-neutral-900 dark:text-neutral-50 break-words">
              {currentDisplayProfile.name || "Unnamed User"}
            </h2>
            <div className="mb-3">
              <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase text-[10px] tracking-wider bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-100/30">
                {activeTitle}
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed mb-5 break-words font-medium">
              {currentDisplayProfile.bio || (
                <span className="italic text-neutral-400 dark:text-neutral-600">
                  No bio added yet. Click &quot;Edit Profile&quot; to customize.
                </span>
              )}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full overflow-hidden" role="list">
              <div
                role="listitem"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-green-100/20 shrink-0"
              >
                <Star size={10} fill="currentColor" /> Active Streak
              </div>
              <div
                role="listitem"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-purple-100/20 shrink-0"
              >
                <Award size={10} /> Verified Tier
              </div>
            </div>
          </div>
        </div>

        {/* EDIT FORM MODE OR READ-ONLY VIEW */}
        {isEditMode ? (
          <form
            onSubmit={executeProfileSave}
            noValidate
            className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <EditableField
                label="Name / Alias"
                id="edit-name"
                name="name"
                value={draftProfile.name}
                error={validationErrors.name}
                onChange={handleInputChange}
              />
              <EditableField
                label="Email Address"
                id="edit-email"
                name="email"
                type="email"
                value={draftProfile.email}
                error={validationErrors.email}
                onChange={handleInputChange}
                placeholder="Synced via Auth"
              />
              <EditableField
                label="Phone Line"
                id="edit-phone"
                name="phone"
                value={draftProfile.phone}
                error={validationErrors.phone}
                onChange={handleInputChange}
                placeholder="e.g. +91 98765 43210"
              />
              <EditableField
                label="Location"
                id="edit-location"
                name="location"
                value={draftProfile.location}
                onChange={handleInputChange}
                placeholder="e.g. Bengaluru, India"
              />
              <EditableField
                label="Account Type"
                id="edit-accountType"
                name="accountType"
                value={draftProfile.accountType}
                onChange={handleInputChange}
                placeholder="e.g. Premium Saver"
              />
              <EditableField
                label="Savings Rate (%)"
                id="edit-savingsRate"
                name="savingsRate"
                value={draftProfile.savingsRate}
                error={validationErrors.savingsRate}
                onChange={handleInputChange}
                placeholder="e.g. 64"
              />
              <EditableField
                label="Total Saved"
                id="edit-totalSaved"
                name="totalSaved"
                value={draftProfile.totalSaved}
                onChange={handleInputChange}
                placeholder="e.g. 10000"
              />
              <EditableField
                label="Global Aura"
                id="edit-globalAura"
                name="globalAura"
                value={draftProfile.globalAura}
                onChange={handleInputChange}
                placeholder="e.g. 1200"
              />
              <EditableField
                label="Achievements"
                id="edit-achievements"
                name="achievements"
                value={draftProfile.achievements}
                onChange={handleInputChange}
                placeholder="e.g. 5/20"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="edit-bio"
                className="font-black text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                Bio Data
              </label>
              <textarea
                id="edit-bio"
                name="bio"
                value={draftProfile.bio ?? ""}
                onChange={handleInputChange}
                placeholder="Tell us about your financial goals..."
                rows={3}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 outline-none focus:border-yellow-400 dark:focus:border-yellow-500 transition-all w-full resize-none shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 py-2.5 px-4 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
              >
                {isProcessing ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setValidationErrors({});
                  setIsEditMode(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 py-2.5 px-4 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-900 transition shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none"
              >
                <X size={12} />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Email Contact"
              value={profile.email}
              fallbackText="No email linked"
              color="text-neutral-900 dark:text-neutral-100 font-bold"
              icon={<Mail size={12} />}
            />
            <StatCard
              label="Secure Phone"
              value={profile.phone}
              fallbackText="Not provided"
              color="text-neutral-900 dark:text-neutral-100 font-bold"
              icon={<Phone size={12} />}
            />
            <StatCard
              label="Location"
              value={profile.location}
              fallbackText="Not set"
              color="text-neutral-900 dark:text-neutral-100 font-bold"
              icon={<MapPin size={12} />}
            />
            <StatCard
              label="Member Since"
              value={profile.joinedDate}
              fallbackText="Recent"
              color="text-neutral-400 dark:text-neutral-500 font-bold"
            />
            <StatCard
              label="Account Tier"
              value={profile.accountType}
              fallbackText="Free Tier"
              color="text-purple-600 dark:text-purple-400 font-black"
            />
            <StatCard
              label="Total Saved"
              value={formatIndianCurrency(profile.totalSaved)}
              color="text-green-600 dark:text-green-400 font-black"
            />
          </div>
        )}
      </motion.div>

      {/* METRICS & SECURITY BENTO GRID */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* COMPLETION PROGRESS GAUGE */}
        <div className="p-6 rounded-[28px] border border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-black text-neutral-400 dark:text-neutral-500">
                  Profile Completion
                </p>
                <h3 className="mt-1 text-xl font-black text-neutral-900 dark:text-neutral-50 truncate">
                  {currentCompletionPercentage}% Completed
                </h3>
              </div>
              <div className="self-start sm:self-auto rounded-xl bg-purple-50 dark:bg-purple-950/40 px-3 py-1 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-wider border border-purple-100/10 shrink-0 select-none">
                {currentCompletionPercentage > 75 ? "Optimal Status" : "Pending Details"}
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
            Complete your profile details to unlock automated goal recommendations and personalized analytics.
          </p>
        </div>

        {/* SECURITY AUDIT LOGS */}
        <div className="p-6 rounded-[28px] border border-neutral-100 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 shadow-sm min-w-0">
          <div className="flex items-center gap-2 mb-4 select-none">
            <ShieldCheck size={16} className="text-purple-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-neutral-50">
              Security Verification
            </p>
          </div>

          <div className="space-y-2 text-xs w-full font-bold">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">
                  Google OAuth Session
                </p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">
                  SSO Authenticated
                </p>
              </div>
              <span className="rounded-lg bg-green-100 dark:bg-green-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-green-700 dark:text-green-400 shrink-0 shadow-sm border border-green-200/10">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">
                  Database Access Role
                </p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Authorization Tier
                </p>
              </div>
              <span className="rounded-lg bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-purple-700 dark:text-purple-400 shrink-0 shadow-sm border border-purple-200/10">
                {profile.accountType || "Free Tier"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 px-4 py-2.5 min-w-0 border border-neutral-100/20">
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-neutral-100 text-xs truncate">
                  Transport Encryption
                </p>
                <p className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-0.5">
                  TLS / SSL Protocol
                </p>
              </div>
              <span className="rounded-lg bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 text-[8px] font-black uppercase text-purple-700 dark:text-purple-400 shrink-0 shadow-sm border border-purple-200/10">
                SECURE SSL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Global Aura"
          value={
            calculatedGlobalAura > 0
              ? `+${calculatedGlobalAura.toLocaleString("en-IN")}`
              : ""
          }
          fallbackText="0 Points"
          color="text-yellow-500 dark:text-yellow-400 font-black"
        />
        <StatCard
          label="Savings Rate"
          value={profile.savingsRate ? `${profile.savingsRate}%` : ""}
          fallbackText="0%"
          color="text-green-500 dark:text-green-400 font-black"
        />
        <StatCard
          label="Achievements Unlocked"
          value={profile.achievements}
          fallbackText="0 Unlocked"
          color="text-purple-500 dark:text-purple-400 font-black"
        />
      </div>
    </div>
  );
}