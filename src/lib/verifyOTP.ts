/**
 * @file C:\Users\KIIT0001\Desktop\PLACEMENT\moneyplant\money-plant\src\lib\verifyOTP.ts
 * @module Lib/VerifyOTP
 * @description Enterprise-grade, SOC2/GDPR-compliant OTP Verification Service Utility.
 * Features strict input validation, constant-time cryptographic verification, anti-brute-force
 * attempt tracking, lean Mongoose execution, and structured PII-masked audit logging.
 *
 * @version 2.0.0
 * @author Senior Principal Security & Software Architecture Team
 */

import crypto from "crypto";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import VerificationToken from "@/models/VerificationToken";
import { hashOTP } from "@/lib/hashOTP";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

export const DEFAULT_MAX_ATTEMPTS = 5;

export type TokenType =
  | "EMAIL_VERIFICATION"
  | "RESET_PASSWORD"
  | "TWO_FACTOR_AUTH";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VerifyOTPOptions {
  /** Target user email address */
  email: string;
  /** Plaintext OTP entered by the user */
  otp: string;
  /** Purpose of the verification token */
  type: TokenType;
  /** Maximum invalid attempts allowed before token invalidation (Default: 5) */
  maxAttempts?: number;
  /** Optional correlation ID for end-to-end trace logging */
  requestId?: string;
}

export interface VerifyOTPResult {
  /** Indicates whether the OTP was successfully verified */
  success: boolean;
  /** Standardized error message if verification fails */
  error?: string;
  /** Number of remaining attempts allowed for this token */
  remainingAttempts?: number;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const VerifyOTPSchema = z.object({
  email: z
    .string({ error: "Email is required." })
    .trim()
    .toLowerCase()
    .min(5, "Email address is too short.")
    .max(254, "Email address exceeds maximum length.")
    .email("Invalid email address format."),
  otp: z
    .string({ error: "OTP is required." })
    .trim()
    .length(6, "OTP must be exactly 6 digits.")
    .regex(/^\d+$/, "OTP must contain numeric digits only."),
  type: z.enum(["EMAIL_VERIFICATION", "RESET_PASSWORD", "TWO_FACTOR_AUTH"], {
    error: "Valid token type is required.",
  }),
  maxAttempts: z.number().int().positive().default(DEFAULT_MAX_ATTEMPTS),
  requestId: z.string().optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Obfuscates email addresses for GDPR/SOC2 log privacy compliance.
 * Example: "johndoe@example.com" -> "j***e@example.com"
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return "[INVALID_EMAIL]";
  if (localPart.length <= 2) return `${localPart[0]}*@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Executes constant-time string comparison to prevent timing side-channel attacks.
 */
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf-8");
    const bufB = Buffer.from(b, "utf-8");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function logAudit(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  context: Record<string, unknown>
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "ERROR") {
    console.error(JSON.stringify(payload));
  } else if (level === "WARN") {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}

// ============================================================================
// CORE SERVICE UTILITY
// ============================================================================

/**
 * Verifies a submitted OTP code against stored token hashes with anti-brute-force guardrails.
 *
 * @param options - Verification parameters including email, OTP, and token type.
 * @returns Object indicating success status, remaining attempts, or specific error feedback.
 */
export async function verifyOTP(
  options: VerifyOTPOptions
): Promise<VerifyOTPResult> {
  const startTime = Date.now();

  // 1. Validate Input Payload
  const parseResult = VerifyOTPSchema.safeParse(options);
  if (!parseResult.success) {
    const firstError =
      parseResult.error.issues[0]?.message || "Invalid input parameters.";
    return { success: false, error: firstError };
  }

  const { email, otp, type, maxAttempts, requestId } = parseResult.data;
  const traceId = requestId || crypto.randomUUID();
  const maskedEmail = maskEmail(email);

  try {
    // 2. Establish Database Connection
    await dbConnect();

    // 3. Fetch Active Verification Token
    const tokenRecord = (await VerificationToken.findOne({
      email,
      type,
    })
      .sort({ createdAt: -1 })
      .lean()) as
      | {
          _id: unknown;
          email: string;
          type: TokenType;
          expiresAt: string | Date;
          otpHash: string;
          attempts?: number;
        }
      | null;

    if (!tokenRecord) {
      logAudit("WARN", "OTP verification failed - Token record not found", {
        traceId,
        action: "TOKEN_NOT_FOUND",
        maskedEmail,
        type,
        durationMs: Date.now() - startTime,
      });

      return {
        success: false,
        error: "Invalid or expired verification code.",
      };
    }

    // 4. Verify Expiration Timestamp
    const now = new Date();
    if (new Date(tokenRecord.expiresAt) < now) {
      logAudit("WARN", "OTP verification failed - Token expired", {
        traceId,
        action: "TOKEN_EXPIRED",
        maskedEmail,
        type,
        expiredAt: tokenRecord.expiresAt,
        durationMs: Date.now() - startTime,
      });

      // Cleanup expired token record asynchronously
      await VerificationToken.deleteOne({ _id: tokenRecord._id });

      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      };
    }

    // 5. Anti-Brute-Force Attempts Guardrail
    const currentAttempts = tokenRecord.attempts ?? 0;
    if (currentAttempts >= maxAttempts) {
      logAudit("WARN", "OTP verification failed - Maximum attempts exceeded", {
        traceId,
        action: "MAX_ATTEMPTS_EXCEEDED",
        maskedEmail,
        type,
        attempts: currentAttempts,
        durationMs: Date.now() - startTime,
      });

      // Revoke token record completely upon max failed attempts
      await VerificationToken.deleteOne({ _id: tokenRecord._id });

      return {
        success: false,
        error:
          "Too many invalid attempts. This verification code has been invalidated. Please request a new code.",
        remainingAttempts: 0,
      };
    }

    // 6. Compute Hash and Compare in Constant Time
    const computedHash = await hashOTP(otp);
    const isValid = timingSafeCompare(computedHash, tokenRecord.otpHash);

    if (!isValid) {
      const updatedAttempts = currentAttempts + 1;
      const remainingAttempts = Math.max(0, maxAttempts - updatedAttempts);

      logAudit("WARN", "OTP verification failed - Invalid code submitted", {
        traceId,
        action: "INVALID_OTP",
        maskedEmail,
        type,
        attemptNumber: updatedAttempts,
        remainingAttempts,
        durationMs: Date.now() - startTime,
      });

      if (remainingAttempts === 0) {
        await VerificationToken.deleteOne({ _id: tokenRecord._id });
        return {
          success: false,
          error:
            "Too many invalid attempts. This verification code has been invalidated. Please request a new code.",
          remainingAttempts: 0,
        };
      }

      // Increment attempt counter atomically
      await VerificationToken.updateOne(
        { _id: tokenRecord._id },
        { $inc: { attempts: 1 } }
      );

      return {
        success: false,
        error: `Invalid verification code. You have ${remainingAttempts} attempt${
          remainingAttempts === 1 ? "" : "s"
        } remaining.`,
        remainingAttempts,
      };
    }

    // 7. Successful Verification Audit & Single-Use Cleanup
    await VerificationToken.deleteOne({ _id: tokenRecord._id });

    logAudit("INFO", "OTP verification completed successfully", {
      traceId,
      action: "OTP_VERIFIED",
      maskedEmail,
      type,
      durationMs: Date.now() - startTime,
    });

    return {
      success: true,
      remainingAttempts: maxAttempts - currentAttempts,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error encountered.";

    logAudit("ERROR", "Unhandled exception during OTP verification", {
      traceId,
      action: "VERIFY_OTP_EXCEPTION",
      maskedEmail,
      type,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      error: "An error occurred while verifying the code. Please try again.",
    };
  }
}