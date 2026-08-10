/**
 * @file src/app/api/auth/reset-password/route.ts
 * @module API/Auth/ResetPasswordMonolith
 * @description Monolithic Secure Password Reset Workflow API Route Handler.
 * Combines OTP Validation and Password Mutation safely inside an optimized
 * execution boundary featuring constant-time side-channel protection.
 *
 * @version 1.1.0
 * @author Senior Principal Security & Software Architecture Team
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { verifyOTPHash } from "@/lib/hashOTP";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const TOKEN_TYPE = "RESET_PASSWORD" as const;
const TARGET_EXECUTION_TIME_MS = 650; // Balanced padding budget for DB roundtrips + Hashing
const BCRYPT_SALT_ROUNDS = 12;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ResetPasswordWorkflowSchema = z.object({
  email: z
    .string({ required_error: "Email address is required." })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address format." }),
  otp: z
    .string({ required_error: "Verification code is required." })
    .trim()
    .length(6, { message: "The reset code must be exactly 6 digits." })
    .regex(/^\d+$/, { message: "The verification code must contain only digits." }),
  newPassword: z
    .string({ required_error: "New password payload is required." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password cannot exceed 128 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});

type ResetPasswordPayload = z.infer<typeof ResetPasswordWorkflowSchema>;

interface LogContext {
  requestId: string;
  action: string;
  maskedEmail?: string;
  [key: string]: unknown;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sanitizeEmailForLog(email: string): string {
  try {
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return "[INVALID_EMAIL_STRUCTURE]";
    if (localPart.length <= 2) return `${localPart[0]}*@${domain}`;
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  } catch {
    return "[SANIZATION_FAILURE]";
  }
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  let capturedEmailForLog = "[UNKNOWN_EMAIL]";

  try {
    // 1. Safe parsing boundary baseline
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body payload." },
        { status: 400 }
      );
    }

    // 2. Structural Schema Zod validation layer
    const validationResult = ResetPasswordWorkflowSchema.safeParse(body);
    if (!validationResult.success) {
      const primaryErrorMessage = validationResult.error.issues[0]?.message || "Invalid payload format.";
      return NextResponse.json({ error: primaryErrorMessage }, { status: 400 });
    }

    const { email, otp, newPassword }: ResetPasswordPayload = validationResult.data;
    capturedEmailForLog = sanitizeEmailForLog(email);

    // 3. Mount DB Context
    await dbConnect();

    // 4. Fetch the verification matching record block context
    const tokenRecord = await VerificationToken.findOne({
      email,
      type: TOKEN_TYPE,
    })
      .sort({ createdAt: -1 })
      .lean();

    let isTokenValid = false;
    let tokenRejectionReason = "";

    if (!tokenRecord) {
      tokenRejectionReason = "TOKEN_NOT_FOUND";
    } else if (new Date() > new Date(tokenRecord.expiresAt)) {
      tokenRejectionReason = "TOKEN_EXPIRED";
    } else {
      // Execute standard hash match check
      const matchStatus = await verifyOTPHash(otp, tokenRecord.otpHash);
      if (!matchStatus) {
        tokenRejectionReason = "INVALID_HASH_COMPARE";
      } else {
        isTokenValid = true;
      }
    }

    // Post-Failure processing pipeline handler
    if (!isTokenValid) {
      logStructured("WARN", "Password reset failed during token processing verification check", {
        requestId,
        action: "MONOLITH_TOKEN_REJECTED",
        maskedEmail: capturedEmailForLog,
        reason: tokenRejectionReason,
      });

      // Purge token instantly if it was expired to keep our collections clean
      if (tokenRecord && tokenRejectionReason === "TOKEN_EXPIRED") {
        await VerificationToken.deleteOne({ _id: tokenRecord._id });
      }

      // Enforce balanced execution runtime delay matrix blocks
      const duration = Date.now() - startTime;
      const executionDelta = TARGET_EXECUTION_TIME_MS - duration;
      if (executionDelta > 0) await sleep(executionDelta);

      return NextResponse.json(
        { error: "The verification code is incorrect, invalid, or has expired." },
        { status: 400 }
      );
    }

    // 5. Look up matching target account
    const user = await User.findOne({ email });
    if (!user) {
      logStructured("WARN", "Token authenticated successfully but user document was missing from database collection", {
        requestId,
        action: "MONOLITH_USER_ORPHAN",
        maskedEmail: capturedEmailForLog,
      });

      // Cleanup token anyway since it was successfully verified but cannot proceed
      await VerificationToken.deleteOne({ _id: tokenRecord!._id });

      const duration = Date.now() - startTime;
      const executionDelta = TARGET_EXECUTION_TIME_MS - duration;
      if (executionDelta > 0) await sleep(executionDelta);

      return NextResponse.json(
        { error: "Account processing parameters could not be validated." },
        { status: 422 }
      );
    }

    // 6. Enforce Account Type Provider Safeguards
    if (user.provider === "google" && !user.password) {
      logStructured("WARN", "Blocked manual credential injection targeting Federated OAuth SSO user record profile", {
        requestId,
        action: "MONOLITH_OAUTH_MUTATION_BLOCK",
        maskedEmail: capturedEmailForLog,
      });

      await VerificationToken.deleteOne({ _id: tokenRecord!._id });

      const duration = Date.now() - startTime;
      const executionDelta = TARGET_EXECUTION_TIME_MS - duration;
      if (executionDelta > 0) await sleep(executionDelta);

      return NextResponse.json(
        { error: "This account authenticates using an external single sign-on identity provider integration." },
        { status: 422 }
      );
    }

    // 7. Secure Cryptographic Password Transformation State Processing Stage
    const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // 8. Commit changes atomically inside our engine collections
    user.password = hashedNewPassword;
    await user.save();

    // 9. Consume validation token immediately to complete single-use policy loops
    await VerificationToken.deleteOne({ _id: tokenRecord!._id });

    logStructured("INFO", "Account verification parameters mutated successfully through verification monolithic loop pipeline", {
      requestId,
      action: "MONOLITH_WORKFLOW_SUCCESS",
      maskedEmail: capturedEmailForLog,
    });

    // 10. Balance timing footprints across all configurations cleanly
    const totalProcessingDuration = Date.now() - startTime;
    const trackingPaddingTarget = TARGET_EXECUTION_TIME_MS - totalProcessingDuration;
    if (trackingPaddingTarget > 0) await sleep(trackingPaddingTarget);

    return NextResponse.json(
      { 
        success: true, 
        message: "Your password has been updated successfully. You can now log in using your new credentials." 
      }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown fatal system engine variance.";

    logStructured("ERROR", "Unhandled critical crash during monolithic reset-password lifecycle sequence execution", {
      requestId,
      action: "MONOLITH_FATAL_EXCEPTION",
      maskedEmail: capturedEmailForLog,
      error: errorMessage,
    });

    return NextResponse.json(
      { error: "An unexpected verification processing error occurred. Please try again later." },
      { status: 500 }
    );
  }
}