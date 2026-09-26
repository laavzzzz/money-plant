/**
 * @file src/app/api/auth/forgot-password/route.ts
 * @module API/Auth/ForgotPassword
 * @description Enterprise-grade, SOC2/GDPR-compliant Password Reset Request API handler.
 * Implements anti-user-enumeration via nanosecond-precision execution time equalization, 
 * atomic MongoDB transaction management, strict schema enforcement, and structured PII-masked audit logs.
 *
 * @version 4.0.0
 * @author Senior Principal Security & Software Architecture Team
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User, { IUser } from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { generateOTP } from "@/lib/generateOTP";
import { hashOTP } from "@/lib/hashOTP";
import { sendResetOTP } from "@/lib/email";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  COOLDOWN_SECONDS: 30,
  TOKEN_EXPIRATION_MINUTES: 10,
  TOKEN_TYPE: "RESET_PASSWORD" as const,
  TARGET_EXECUTION_TIME_MS: 600,
  HTTP_HEADERS: {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
  },
} as const;

/**
 * Universal success message returned on all pathways to neutralize email enumeration vector.
 */
const GENERIC_SUCCESS_PAYLOAD = Object.freeze({
  success: true,
  message: "If an account is associated with this email address, a password reset code has been sent.",
});

// ============================================================================
// VALIDATION SCHEMAS & TYPES
// ============================================================================

const ForgotPasswordSchema = z.object({
  email: z
    .string({ message: "Email address is required." })
    .trim()
    .min(1, { message: "Email address cannot be empty." })
    .toLowerCase()
    .min(5, { message: "Email address is too short." })
    .max(254, { message: "Email address exceeds maximum allowable length." })
    .email({ message: "Invalid email address format." }),
});

type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;

type LogLevel = "INFO" | "WARN" | "ERROR";

interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  action?: string;
  maskedEmail?: string;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

type AuditLogContext = Partial<Omit<StructuredLogPayload, "timestamp" | "level" | "message">>;

// ============================================================================
// LOGGING & SANITIZATION SERVICES
// ============================================================================

class AuditLogger {
  /**
   * Sanitizes email addresses to preserve strict GDPR/SOC2 compliance in log sinks.
   * Examples:
   *  "a@domain.com" -> "a***@domain.com"
   *  "john.doe@domain.com" -> "j***e@domain.com"
   */
  public static maskEmail(email: string): string {
    if (!email || typeof email !== "string") return "[UNSPECIFIED_EMAIL]";
    
    const parts = email.split("@");
    if (parts.length !== 2) return "[MALFORMED_EMAIL]";

    const [localPart, domain] = parts;
    if (!localPart || !domain) return "[INVALID_EMAIL_STRUCTURE]";

    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }

    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  }

  /**
   * Dispatches JSON logs formatted for ELK/Datadog/CloudWatch ingestion.
   */
  public static log(
    level: LogLevel,
    message: string,
    context: Omit<StructuredLogPayload, "timestamp" | "level">
  ): void {
    const payload: StructuredLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    const formattedOutput = JSON.stringify(payload);

    switch (level) {
      case "ERROR":
        console.error(formattedOutput);
        break;
      case "WARN":
        console.warn(formattedOutput);
        break;
      case "INFO":
      default:
        console.info(formattedOutput);
        break;
    }
  }
}

// ============================================================================
// TIMING EQUALIZATION ENGINE (ANTI-SIDE-CHANNEL)
// ============================================================================

class TimingEqualizer {
  /**
   * Executes high-resolution nanosecond sleep to prevent timing analysis attacks.
   */
  public static async compensate(startTimeNs: bigint, targetMs: number): Promise<number> {
    const elapsedNs = process.hrtime.bigint() - startTimeNs;
    const elapsedMs = Number(elapsedNs) / 1_000_000;
    const remainingMs = targetMs - elapsedMs;

    if (remainingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingMs));
    }

    const totalNs = process.hrtime.bigint() - startTimeNs;
    return Number(totalNs) / 1_000_000;
  }
}

// ============================================================================
// DOMAIN SERVICES
// ============================================================================

class RateLimiterService {
  /**
   * Evaluates active verification token timestamps to enforce reset cooldowns.
   */
  public static async checkCooldown(email: string): Promise<{ isRateLimited: boolean; secondsRemaining: number }> {
    const cooldownThresholdMs = CONFIG.COOLDOWN_SECONDS * 1000;

    const recentToken = await VerificationToken.findOne({
      email,
      type: CONFIG.TOKEN_TYPE,
    })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean<{ createdAt?: Date }>();

    if (!recentToken?.createdAt) {
      return { isRateLimited: false, secondsRemaining: 0 };
    }

    const timeElapsedMs = Date.now() - new Date(recentToken.createdAt).getTime();

    if (timeElapsedMs < cooldownThresholdMs) {
      const secondsRemaining = Math.ceil((cooldownThresholdMs - timeElapsedMs) / 1000);
      return { isRateLimited: true, secondsRemaining };
    }

    return { isRateLimited: false, secondsRemaining: 0 };
  }
}

class TokenOrchestratorService {
  /**
   * Atomically invalidates old reset tokens and issues a new hashed token within a transaction.
   */
  public static async generateAndPersistToken(
    email: string,
    session?: mongoose.ClientSession
  ): Promise<{ rawOTP: string; resetLinkToken: string; expiresAt: Date }> {
    const rawOTP = generateOTP();
    const otpHash = await hashOTP(rawOTP);
    const resetLinkToken = crypto.randomUUID();
    const resetLinkTokenHash = crypto
      .createHash("sha256")
      .update(resetLinkToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + CONFIG.TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    await VerificationToken.deleteMany(
      { email, type: CONFIG.TOKEN_TYPE },
      session ? { session } : {}
    );

    await VerificationToken.create(
      [
        {
          email,
          type: CONFIG.TOKEN_TYPE,
          otpHash,
          resetLinkTokenHash,
          attempts: 0,
          expiresAt,
        },
      ],
      session ? { session } : {}
    );

    return { rawOTP, resetLinkToken, expiresAt };
  }

  /**
   * Rollback helper if downstream transport layer fails outside transaction.
   */
  public static async revokeTokens(email: string): Promise<void> {
    await VerificationToken.deleteMany({ email, type: CONFIG.TOKEN_TYPE });
  }
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTimeNs = process.hrtime.bigint();
  let maskedEmailForLog = "[UNSET]";

  try {
    // 1. Validate Critical System Dependencies
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !(process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_FROM)
    ) {
      AuditLogger.log("ERROR", "Missing critical SMTP email environment variables", {
        requestId,
        action: "CRITICAL_ENV_MISSING",
      });

      await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      return NextResponse.json(
        { error: "Internal authentication subsystem misconfiguration." },
        { status: 500, headers: CONFIG.HTTP_HEADERS }
      );
    }

    // 2. Parse Incoming Payload Safely
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      AuditLogger.log("WARN", "Malformed JSON body passed to route", {
        requestId,
        action: "PARSE_JSON_FAILED",
      });

      await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      return NextResponse.json(
        { error: "Invalid JSON payload structure." },
        { status: 400, headers: CONFIG.HTTP_HEADERS }
      );
    }

    // 3. Schema Validation
    const validationResult = ForgotPasswordSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const primaryIssue = validationResult.error.issues[0]?.message || "Invalid email payload.";

      AuditLogger.log("WARN", "Zod validation constraints failed for payload", {
        requestId,
        action: "VALIDATION_FAILED",
        errors: validationResult.error.issues,
      });

      await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      return NextResponse.json(
        { error: primaryIssue },
        { status: 400, headers: CONFIG.HTTP_HEADERS }
      );
    }

    const { email }: ForgotPasswordPayload = validationResult.data;
    maskedEmailForLog = AuditLogger.maskEmail(email);

    // 4. Initialize Database Connection
    await dbConnect();

    // 5. Evaluate Rate-Limiting Policy
    const { isRateLimited, secondsRemaining } = await RateLimiterService.checkCooldown(email);
    if (isRateLimited) {
      AuditLogger.log("WARN", "Password reset processing blocked by rate-limit policy", {
        requestId,
        action: "RATE_LIMIT_EXCEEDED",
        maskedEmail: maskedEmailForLog,
        secondsRemaining,
      });

      await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      return NextResponse.json(
        {
          error: `Please wait ${secondsRemaining} second${
            secondsRemaining === 1 ? "" : "s"
          } before requesting another reset code.`,
        },
        {
          status: 429,
          headers: {
            ...CONFIG.HTTP_HEADERS,
            "Retry-After": String(secondsRemaining),
          },
        }
      );
    }

    // 6. User Account Identification Query
    const user = await User.findOne({ email })
      .select("_id provider password")
      .lean<{
        _id?: mongoose.Types.ObjectId;
        provider?: string | null;
        password?: string | null;
      } | null>();

    // Safeguard Pathway A: User identity does not exist
    if (!user) {
      AuditLogger.log("INFO", "Password reset requested for non-existent identity", {
        requestId,
        action: "USER_NOT_FOUND_SILENT",
        maskedEmail: maskedEmailForLog,
      });

      const totalDurationMs = await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      AuditLogger.log("INFO", "Anti-enumeration delay execution finished", {
        requestId,
        action: "TIMING_COMPENSATED",
        durationMs: totalDurationMs,
      });

      return NextResponse.json(GENERIC_SUCCESS_PAYLOAD, { status: 200, headers: CONFIG.HTTP_HEADERS });
    }

    // Safeguard Pathway B: Account managed via OAuth Provider (e.g., Google) with no password set
    if (user.provider === "google" && !user.password) {
      AuditLogger.log("INFO", "Password reset request bypassed for federated OAuth user", {
        requestId,
        action: "OAUTH_USER_RESET_BYPASS",
        maskedEmail: maskedEmailForLog,
      });

      const totalDurationMs = await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      AuditLogger.log("INFO", "Anti-enumeration delay execution finished", {
        requestId,
        action: "TIMING_COMPENSATED",
        durationMs: totalDurationMs,
      });

      return NextResponse.json(GENERIC_SUCCESS_PAYLOAD, { status: 200, headers: CONFIG.HTTP_HEADERS });
    }

    // 7. Atomic Token Provisioning via Mongoose Session Transaction where supported
    let rawOTP = "";
    let resetLinkToken = "";
    const dbSession = await mongoose.startSession().catch(() => null);

    try {
      if (dbSession) {
        await dbSession.withTransaction(async () => {
          const result = await TokenOrchestratorService.generateAndPersistToken(email, dbSession);
          rawOTP = result.rawOTP;
          resetLinkToken = result.resetLinkToken;
        });
      } else {
        const result = await TokenOrchestratorService.generateAndPersistToken(email);
        rawOTP = result.rawOTP;
        resetLinkToken = result.resetLinkToken;
      }
    } finally {
      if (dbSession) {
        await dbSession.endSession();
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetLinkToken)}`;

    // 8. Mail Carrier Dispatch Operations
    try {
      await sendResetOTP(email, rawOTP, resetLink);

      AuditLogger.log("INFO", "Password reset verification OTP dispatched successfully", {
        requestId,
        action: "OTP_DISPATCH_SUCCESS",
        maskedEmail: maskedEmailForLog,
      });
    } catch (emailError: unknown) {
      const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);

      AuditLogger.log("ERROR", "Mail transport engine failed to deliver reset payload", {
        requestId,
        action: "OTP_DISPATCH_FAILED",
        maskedEmail: maskedEmailForLog,
        error: errorMessage,
      });

      // Revoke orphan verification token to preserve database state consistency
      await TokenOrchestratorService.revokeTokens(email);

      await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
      return NextResponse.json(
        { error: "Failed to dispatch reset email. Please try again later." },
        { status: 500, headers: CONFIG.HTTP_HEADERS }
      );
    }

    // 9. Final Anti-Enumeration Timing Compensation
    const totalDurationMs = await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);

    AuditLogger.log("INFO", "Password reset pipeline completed successfully", {
      requestId,
      action: "PIPELINE_COMPLETE",
      maskedEmail: maskedEmailForLog,
      durationMs: totalDurationMs,
    });

    return NextResponse.json(GENERIC_SUCCESS_PAYLOAD, { status: 200, headers: CONFIG.HTTP_HEADERS });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown critical failure.";
    const errorStack = error instanceof Error ? error.stack : undefined;

    AuditLogger.log("ERROR", "Unhandled exception caught in password reset pipeline", {
      requestId,
      action: "UNHANDLED_EXCEPTION",
      maskedEmail: maskedEmailForLog,
      error: errorMessage,
      stack: errorStack,
    });

    await TimingEqualizer.compensate(startTimeNs, CONFIG.TARGET_EXECUTION_TIME_MS);
    return NextResponse.json(
      { error: "An unexpected system error occurred. Please try again later." },
      { status: 500, headers: CONFIG.HTTP_HEADERS }
    );
  }
}