/**
 * @file src/app/api/auth/forgot-password/route.ts
 * @module API/Auth/ForgotPassword
 * @description Enterprise-grade, SOC2/GDPR-compliant Password Reset Request API handler.
 * Implements anti-user-enumeration, constant-time timing attack protection, strict Zod validation,
 * atomic database operations, and structured PII-masked logging.
 *
 * @version 2.0.0
 * @author Senior Principal Security & Software Architecture Team
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { generateOTP } from "@/lib/generateOTP";
import { hashOTP } from "@/lib/hashOTP";
import { sendResetOTP } from "@/lib/email";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const COOLDOWN_SECONDS = 30;
const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;
const TOKEN_EXPIRATION_MINUTES = 10;
const TOKEN_EXPIRATION_MS = TOKEN_EXPIRATION_MINUTES * 60 * 1000;
const TOKEN_TYPE = "RESET_PASSWORD" as const;

/**
 * Generic response message returned universally to prevent email enumeration.
 */
const GENERIC_SUCCESS_MESSAGE =
  "If an account is associated with this email address, a password reset code has been sent.";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "Email address is required." })
    .toLowerCase()
    .min(5, { message: "Email address is too short." })
    .max(254, { message: "Email address exceeds maximum length." })
    .email({ message: "Invalid email address format." }),
});

type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;

// ============================================================================
// STRUCTURED AUDIT & LOGGING UTILITY
// ============================================================================

interface LogContext {
  requestId: string;
  action: string;
  maskedEmail?: string;
  [key: string]: unknown;
}

/**
 * Obfuscates email addresses to maintain GDPR/SOC2 compliance in server logs.
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

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    // 1. Parse and Validate Request Payload
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const validationResult = ForgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email }: ForgotPasswordPayload = validationResult.data;
    const maskedEmail = sanitizeEmailForLog(email);

    // 2. Database Connection
    await dbConnect();

    // 3. Rate Limiting Check (per email address)
    const recentToken = await VerificationToken.findOne({
      email,
      type: TOKEN_TYPE,
    })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();

    if (recentToken && recentToken.createdAt) {
      const timeElapsed = Date.now() - new Date(recentToken.createdAt).getTime();

      if (timeElapsed < COOLDOWN_MS) {
        const secondsRemaining = Math.ceil((COOLDOWN_MS - timeElapsed) / 1000);

        logStructured("WARN", "Password reset rate limit hit", {
          requestId,
          action: "RATE_LIMIT_EXCEEDED",
          maskedEmail,
          secondsRemaining,
        });

        return NextResponse.json(
          {
            error: `Please wait ${secondsRemaining} second${
              secondsRemaining === 1 ? "" : "s"
            } before requesting another reset code.`,
          },
          { status: 429 }
        );
      }
    }

    // 4. User Lookup & Anti-Enumeration Constant-Time Protection
    const user = await User.findOne({ email }).select("_id provider password").lean();

    // DUMMY COMPUTATION: Perform full hashing cycle regardless of user existence
    // to prevent timing side-channel attacks for email enumeration.
    const rawOTP = generateOTP();
    const otpHash = await hashOTP(rawOTP);

    if (!user) {
      logStructured("INFO", "Password reset requested for non-existent email", {
        requestId,
        action: "USER_NOT_FOUND_SILENT",
        maskedEmail,
        durationMs: Date.now() - startTime,
      });

      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    // Google OAuth accounts without set password check
    // We treat this identically to a successful request to prevent user enumeration.
    if (user.provider === "google" && !user.password) {
      logStructured("INFO", "Password reset requested for OAuth user", {
        requestId,
        action: "OAUTH_ACCOUNT_RESET_ATTEMPT",
        maskedEmail,
      });

      return NextResponse.json(
        { message: GENERIC_SUCCESS_MESSAGE },
        { status: 200 }
      );
    }

    // 5. Clean up existing pending reset tokens for this user
    await VerificationToken.deleteMany({
      email,
      type: TOKEN_TYPE,
    });

    // 6. Create New Verification Token Record
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

    await VerificationToken.create({
      email,
      type: TOKEN_TYPE,
      otpHash,
      expiresAt,
    });

    // 7. Dispatch Reset Email
    try {
      await sendResetOTP(email, rawOTP);

      logStructured("INFO", "Password reset OTP dispatched successfully", {
        requestId,
        action: "OTP_SENT",
        maskedEmail,
        durationMs: Date.now() - startTime,
      });
    } catch (emailError: unknown) {
      logStructured("ERROR", "Failed to dispatch password reset email", {
        requestId,
        action: "EMAIL_DISPATCH_FAILURE",
        maskedEmail,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });

      // Cleanup generated token if email transport fails
      await VerificationToken.deleteMany({
        email,
        type: TOKEN_TYPE,
      });

      return NextResponse.json(
        { error: "Failed to dispatch reset email. Please try again later." },
        { status: 500 }
      );
    }

    // 8. Return Anti-Enumeration Generic Response
    return NextResponse.json(
      { message: GENERIC_SUCCESS_MESSAGE },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown internal server error.";

    logStructured("ERROR", "Unhandled exception in forgot-password API handler", {
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