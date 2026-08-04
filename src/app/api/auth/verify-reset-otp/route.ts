/**
 * @file C:\Users\KIIT0001\Desktop\PLACEMENT\moneyplant\money-plant\src\app\api\auth\verify-reset-otp\route.ts
 * @module API/Auth/VerifyResetOTP
 * @description Enterprise-grade, SOC2/GDPR-compliant Password Reset OTP Verification API handler.
 * Features strict Zod validation, constant-time cryptographic token verification, anti-brute-force
 * attempt limits, lean Mongoose query execution, and structured PII-masked logging.
 *
 * @version 2.0.0
 * @author Senior Principal Security & Software Architecture Team
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import VerificationToken from "@/models/VerificationToken";
import { hashOTP } from "@/lib/hashOTP";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const TOKEN_TYPE = "RESET_PASSWORD" as const;
const MAX_VERIFICATION_ATTEMPTS = 5;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const VerifyResetOTPSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email address is required." })
    .toLowerCase()
    .min(5, { message: "Email address is too short." })
    .max(254, { message: "Email address exceeds maximum length." })
    .email({ message: "Invalid email address format." }),
  otp: z
    .string()
    .trim()
    .min(1, { message: "Verification code is required." })
    .length(6, { message: "Verification code must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "Verification code must contain digits only." }),
});

type VerifyResetOTPPayload = z.infer<typeof VerifyResetOTPSchema>;

type LeanVerificationTokenRecord = {
  _id: unknown;
  expiresAt: Date;
  otpHash: string;
  attempts?: number;
};

// ============================================================================
// LOGGING & AUDIT UTILITIES
// ============================================================================

interface LogContext {
  requestId: string;
  action: string;
  maskedEmail?: string;
  [key: string]: unknown;
}

/**
 * Obfuscates email addresses to maintain compliance with privacy standards (GDPR/SOC2).
 * Example: "johndoe@example.com" -> "j***e@example.com"
 */
function sanitizeEmailForLog(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return "[INVALID_EMAIL]";
  if (localPart.length <= 2) return `${localPart[0]}*@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

function logStructured(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  context: LogContext
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

/**
 * Compares two string hashes in constant time to eliminate timing side-channel attacks.
 */
function safeTimingCompare(a: string, b: string): boolean {
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

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // 1. Parse JSON Payload safely
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    // 2. Input Validation via Zod Schema
    const validationResult = VerifyResetOTPSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, otp }: VerifyResetOTPPayload = validationResult.data;
    const maskedEmail = sanitizeEmailForLog(email);

    // 3. Database Connection
    await dbConnect();

    // 4. Retrieve Active Verification Token
    const tokenRecord = await VerificationToken.findOne({
      email,
      type: TOKEN_TYPE,
    })
      .sort({ createdAt: -1 })
      .lean<LeanVerificationTokenRecord>();

    if (!tokenRecord) {
      logStructured("WARN", "OTP verification failed - No token found", {
        requestId,
        action: "TOKEN_NOT_FOUND",
        maskedEmail,
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // 5. Expiration Check
    const now = new Date();
    if (new Date(tokenRecord.expiresAt) < now) {
      logStructured("WARN", "OTP verification failed - Token expired", {
        requestId,
        action: "TOKEN_EXPIRED",
        maskedEmail,
        expiredAt: tokenRecord.expiresAt,
        durationMs: Date.now() - startTime,
      });

      // Cleanup expired token asynchronously
      await VerificationToken.deleteOne({ _id: tokenRecord._id });

      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 6. Anti-Brute-Force Attempts Guardrail
    const attempts = tokenRecord.attempts ?? 0;
    if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
      logStructured("WARN", "OTP verification failed - Maximum attempts exceeded", {
        requestId,
        action: "MAX_ATTEMPTS_EXCEEDED",
        maskedEmail,
        attempts,
        durationMs: Date.now() - startTime,
      });

      // Purge token to force fresh OTP request
      await VerificationToken.deleteOne({ _id: tokenRecord._id });

      return NextResponse.json(
        {
          error:
            "Too many failed attempts. This verification code has been invalidated. Please request a new one.",
        },
        { status: 429 }
      );
    }

    // 7. Hash Computed Input & Perform Constant-Time Verification
    const computedHash = await hashOTP(otp);
    const isValidMatch = safeTimingCompare(computedHash, tokenRecord.otpHash);

    if (!isValidMatch) {
      const updatedAttempts = attempts + 1;

      logStructured("WARN", "OTP verification failed - Invalid code provided", {
        requestId,
        action: "INVALID_OTP_PROVIDED",
        maskedEmail,
        attemptNumber: updatedAttempts,
        durationMs: Date.now() - startTime,
      });

      // Increment attempt counter atomically
      await VerificationToken.updateOne(
        { _id: tokenRecord._id },
        { $inc: { attempts: 1 } }
      );

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - updatedAttempts;

      if (remainingAttempts <= 0) {
        await VerificationToken.deleteOne({ _id: tokenRecord._id });
        return NextResponse.json(
          {
            error:
              "Too many failed attempts. This verification code has been invalidated. Please request a new one.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Invalid verification code. You have ${remainingAttempts} attempt${
            remainingAttempts === 1 ? "" : "s"
          } remaining.`,
        },
        { status: 400 }
      );
    }

    // 8. Successful Verification Audit & Cleanup
    logStructured("INFO", "OTP verification successful", {
      requestId,
      action: "OTP_VERIFIED_SUCCESS",
      maskedEmail,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        message: "Verification code confirmed successfully.",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown internal server error.";

    logStructured("ERROR", "Unhandled exception in verify-reset-otp API handler", {
      requestId,
      action: "HANDLED_EXCEPTION",
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: "An unexpected system error occurred. Please try again later." },
      { status: 500 }
    );
  }
}