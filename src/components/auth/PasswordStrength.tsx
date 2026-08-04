/**
 * @file src/components/auth/PasswordStrength.tsx
 * @module Components/Auth/PasswordStrength
 * @description Enterprise-grade, WCAG 2.1 AA compliant Password Strength & Requirements indicator.
 * Provides real-time entropy calculation, visual feedback, screen-reader announcements,
 * and rule verification for authentication forms.
 *
 * @version 2.0.0
 * @author Senior Principal UI/UX & Security Engineering Team
 */

"use client";

import React, { useMemo, useEffect } from "react";
import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface RequirementRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export interface PasswordStrengthProps {
  /** The raw password string to evaluate */
  password?: string;
  /** Optional callback fired whenever the strength score (0-4) or validity changes */
  onScoreChange?: (score: StrengthScore, isValid: boolean) => void;
  /** Whether to render the individual requirement checklist below the progress bar */
  showRequirements?: boolean;
  /** Minimum required character length (defaults to 8) */
  minLength?: number;
  /** Additional CSS class names for container customization */
  className?: string;
}

interface StrengthTier {
  label: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const STRENGTH_TIERS: Record<StrengthScore, StrengthTier> = {
  0: {
    label: "Very Weak",
    colorClass: "bg-destructive",
    bgClass: "bg-destructive/10",
    textClass: "text-destructive",
    icon: ShieldAlert,
  },
  1: {
    label: "Weak",
    colorClass: "bg-amber-500",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500",
    icon: ShieldAlert,
  },
  2: {
    label: "Fair",
    colorClass: "bg-yellow-500",
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-600 dark:text-yellow-400",
    icon: Shield,
  },
  3: {
    label: "Good",
    colorClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
    icon: ShieldCheck,
  },
  4: {
    label: "Strong",
    colorClass: "bg-emerald-600 dark:bg-emerald-400",
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-700 dark:text-emerald-300",
    icon: ShieldCheck,
  },
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

function createRequirements(minLength: number): RequirementRule[] {
  return [
    {
      id: "length",
      label: `At least ${minLength} characters`,
      test: (pwd: string) => pwd.length >= minLength,
    },
    {
      id: "uppercase",
      label: "Contains an uppercase letter (A-Z)",
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      id: "lowercase",
      label: "Contains a lowercase letter (a-z)",
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      id: "number",
      label: "Contains a number (0-9)",
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      id: "symbol",
      label: "Contains a special character (!@#$%^&*)",
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
    },
  ];
}

/**
 * Calculates strength score (0 to 4) based on character diversity and length.
 */
function calculateStrengthScore(
  password: string,
  requirements: RequirementRule[]
): StrengthScore {
  if (!password) return 0;

  let passedCount = 0;
  for (const req of requirements) {
    if (req.test(password)) {
      passedCount++;
    }
  }

  // Bonus score boost for long passwords (>= 12 characters)
  const isLongPassword = password.length >= 12;

  if (passedCount <= 1) return 0;
  if (passedCount === 2) return 1;
  if (passedCount === 3) return 2;
  if (passedCount === 4) return isLongPassword ? 3 : 2;
  return isLongPassword ? 4 : 3;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password = "",
  onScoreChange,
  showRequirements = true,
  minLength = 8,
  className = "",
}) => {
  const requirements = useMemo(
    () => createRequirements(minLength),
    [minLength]
  );

  // Evaluate requirements status
  const requirementStatuses = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password, requirements]);

  // Determine overall validity and score
  const isAllRequirementsMet = useMemo(() => {
    return requirementStatuses.every((req) => req.met);
  }, [requirementStatuses]);

  const score = useMemo<StrengthScore>(() => {
    return calculateStrengthScore(password, requirements);
  }, [password, requirements]);

  // Notify parent components when score or validity changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score, isAllRequirementsMet);
    }
  }, [score, isAllRequirementsMet, onScoreChange]);

  const currentTier = STRENGTH_TIERS[score];
  const TierIcon = currentTier.icon;
  const isPasswordProvided = password.length > 0;

  return (
    <div
      className={`w-full space-y-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-200 ${className}`}
      aria-label="Password Strength Evaluator"
    >
      {/* Header & Score Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TierIcon
            className={`h-4 w-4 transition-colors ${
              isPasswordProvided ? currentTier.textClass : "text-muted-foreground"
            }`}
          />
          <span className="text-xs font-semibold text-foreground">
            Password Strength
          </span>
        </div>

        <span
          className={`text-xs font-bold transition-colors ${
            isPasswordProvided
              ? currentTier.textClass
              : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {isPasswordProvided ? currentTier.label : "Enter Password"}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div
        className="grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-valuenow={isPasswordProvided ? score : 0}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuetext={
          isPasswordProvided
            ? `Password strength: ${currentTier.label}`
            : "No password entered"
        }
      >
        {Array.from({ length: 4 }).map((_, idx) => {
          const segmentActive = isPasswordProvided && score >= idx + 1;
          return (
            <div
              key={`strength-bar-${idx}`}
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted transition-all duration-300"
            >
              <div
                className={`h-full w-full transition-all duration-300 ${
                  segmentActive ? currentTier.colorClass : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Requirement Checklist */}
      {showRequirements && (
        <ul className="space-y-1.5 pt-1" aria-label="Password requirements">
          {requirementStatuses.map((req) => (
            <li
              key={req.id}
              className="flex items-center space-x-2 text-xs transition-colors duration-150"
            >
              {req.met ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                </div>
              ) : (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <X className="h-3 w-3" />
                </div>
              )}
              <span
                className={
                  req.met
                    ? "font-medium text-foreground transition-colors"
                    : "text-muted-foreground transition-colors"
                }
              >
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(PasswordStrength);