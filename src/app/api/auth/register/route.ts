/**
 * @fileoverview Registration API Route Handler
 * @module app/api/auth/register/route
 * 
 * Provides production-ready user registration with database connection management,
 * input validation, password hashing, race-condition safeguards, and structured error responses.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { generateOTP } from "@/lib/generateOTP";
import { hashOTP } from "@/lib/hashOTP";
import { sendVerificationOTP } from "@/lib/email";
import { registerBodySchema } from "@/lib/validators/auth";
import { authJsonResponse } from "@/lib/api-response";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

export const maxDuration = 15;
export const dynamic = "force-dynamic";

const BCRYPT_SALT_ROUNDS = 12;
const IS_DEV = process.env.NODE_ENV === "development";

function getEmailDeliveryMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("sender") || normalized.includes("from")) {
    return "The email provider rejected the configured sender. Verify EMAIL_FROM_ADDRESS in Brevo and use that exact sender address.";
  }

  if (
    normalized.includes("domain") &&
    (normalized.includes("verify") || normalized.includes("not verified"))
  ) {
    return "The sender domain is not verified in Brevo. Verify the domain or sender address before sending.";
  }

  if (normalized.includes("api key") || normalized.includes("unauthorized")) {
    return "The Brevo SMTP credentials are missing, invalid, or unavailable in the deployed environment.";
  }

  return "The verification email could not be sent. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM_ADDRESS in the deployment environment.";
}

// ============================================================================
// RESPONSE & ERROR SCHEMAS / TYPES
// ============================================================================

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    correlationId?: string;
    stack?: string;
  };
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

export type RegisterInput = import("@/lib/validators/auth").RegisterBody;

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Utility to construct standardized, type-safe NextResponse JSON responses.
 */
function createJsonResponse<T>(
  body: ApiResponse<T>,
  status: number
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

/**
 * Standardized Logger utility for structured APM logging.
 */
class Logger {
  static info(event: string, meta: Record<string, unknown>) {
    console.log(
      JSON.stringify({
        level: "INFO",
        event,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  }

  static error(event: string, meta: Record<string, unknown>) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        event,
        timestamp: new Date().toISOString(),
        ...meta,
      })
    );
  }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  Logger.info("AUTH_REGISTER_INIT", { correlationId });

  try {
    // 1. Establish Database Connection
    try {
      await dbConnect();
    } catch (dbConnError) {
  console.error("========== REGISTER DB ERROR ==========");
  console.error(dbConnError);
  console.error("=======================================");

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "DB_CONN_ERROR",
        message:
          "Database unavailable. Confirm MongoDB Atlas Network Access and the deployed MONGODB_URI, then try again.",
      },
    },
    { status: 503 }
  );
}

    // 2. Parse Payload Body with Strict Validation
    let body: unknown;
    try {
      const text = await req.text();
      if (!text || text.trim().length === 0) {
        return createJsonResponse(
          {
            success: false,
            message: "Payload cannot be empty.",
            error: {
              code: "EMPTY_PAYLOAD",
              message: "Request body cannot be empty.",
            },
          },
          400
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return createJsonResponse(
        {
          success: false,
          message: "Malformed JSON payload provided.",
          error: {
            code: "INVALID_JSON",
            message: IS_DEV && parseError instanceof Error ? parseError.message : "Malformed JSON payload provided.",
          },
        },
        400
      );
    }

    // 3. Input Schema Validation via Zod
    const validationResult = registerBodySchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors: ApiErrorDetail[] = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      const primaryErrorMessage =
        formattedErrors.map((detail) => detail.message).filter(Boolean).join(" ") ||
        "Invalid registration input data.";

      return createJsonResponse(
        {
          success: false,
          message: primaryErrorMessage,
          error: {
            code: "VALIDATION_ERROR",
            message: primaryErrorMessage,
            details: formattedErrors,
          },
        },
        422
      );
    }

    const { name, email, password } = validationResult.data;

    // 4. Reuse an unverified credentials account so a failed email delivery
    // can be retried from the signup form without creating duplicate users.
    const existingUser = await User.findOne({ email }).select("_id isVerified provider");
    if (existingUser?.isVerified || existingUser?.provider === "google") {
      return createJsonResponse(
        {
          success: false,
          message: "An account with this email address already exists.",
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "An account with this email address already exists.",
          },
        },
        409
      );
    }

    // 5. Password Hashing
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 6. Create or refresh the pending credentials account.
    let newUser;
    if (existingUser) {
      newUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          $set: {
            name,
            password: hashedPassword,
            provider: "credentials",
            isVerified: false,
          },
        },
        { new: true, runValidators: true }
      );
    } else {
      try {
        newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          provider: "credentials",
          isVerified: false,
        });
      } catch (dbError: unknown) {
        if (
          typeof dbError === "object" &&
          dbError !== null &&
          "code" in dbError &&
          (dbError as { code: number }).code === 11000
        ) {
          // Another request may have created the account between findOne and
          // create. Re-read it and continue the same pending-account flow.
          const concurrentUser = await User.findOne({ email }).select(
            "_id isVerified provider"
          );

          if (
            !concurrentUser ||
            concurrentUser.isVerified ||
            concurrentUser.provider === "google"
          ) {
            return createJsonResponse(
              {
                success: false,
                message: "An account with this email address already exists.",
                error: {
                  code: "USER_ALREADY_EXISTS",
                  message: "An account with this email address already exists.",
                },
              },
              409
            );
          }

          newUser = await User.findByIdAndUpdate(
            concurrentUser._id,
            {
              $set: {
                name,
                password: hashedPassword,
                provider: "credentials",
                isVerified: false,
              },
            },
            { new: true, runValidators: true }
          );
        }
        if (!newUser) throw dbError;
      }
    }

    if (!newUser) {
      throw new Error("Unable to create or update the pending user account.");
    }

    const rawOTP = generateOTP();
    const otpHash = await hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationToken.deleteMany({ email, type: "VERIFY_EMAIL" });
    await VerificationToken.create({
      email,
      type: "VERIFY_EMAIL",
      otpHash,
      expiresAt,
      attempts: 0,
    });

    try {
      await sendVerificationOTP(email, rawOTP);
    } catch (emailError) {
      const emailMessage =
        emailError instanceof Error ? emailError.message : "Email delivery failed.";
      const userFacingEmailMessage = getEmailDeliveryMessage(emailError);
      Logger.error("AUTH_REGISTER_EMAIL_FAILURE", {
        correlationId,
        email: email.replace(/(^.).*(@.*$)/, "$1***$2"),
        error: emailMessage,
      });

      return createJsonResponse(
        {
          success: false,
          message:
            IS_DEV ? `Verification email could not be sent: ${emailMessage}` : userFacingEmailMessage,
          error: {
            code: "EMAIL_DELIVERY_FAILED",
            message:
              IS_DEV ? emailMessage : userFacingEmailMessage,
            correlationId,
          },
        },
        502
      );
    }

    Logger.info("AUTH_REGISTER_SUCCESS", {
      correlationId,
      userId: newUser._id.toString(),
      durationMs: Date.now() - startTime,
    });

    return createJsonResponse(
      {
        success: true,
        message: "Account created. Check your email for a 6-digit verification code.",
        data: {
          user: {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
          },
          requiresVerification: true,
        },
      },
      201
    );
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Explicit logging for server logs/terminal debugging
    console.error("REGISTER ERROR:", error);

    Logger.error("AUTH_REGISTER_FAILURE", {
      correlationId,
      durationMs,
      error: errorMessage,
      stack: errorStack,
    });

    return createJsonResponse(
      {
        success: false,
        message: IS_DEV ? errorMessage : "An unexpected error occurred during registration. Please try again later.",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: IS_DEV ? errorMessage : "An unexpected error occurred during registration. Please try again later.",
          correlationId,
          stack: IS_DEV ? errorStack : undefined,
        },
      },
      500
    );
  }
}