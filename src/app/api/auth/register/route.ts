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
          dbConnError instanceof Error
            ? dbConnError.message
            : String(dbConnError),
        stack: dbConnError instanceof Error ? dbConnError.stack : undefined,
      },
    },
    { status: 500 }
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

      const primaryErrorMessage = formattedErrors[0]?.message || "Invalid registration input data.";

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

    // 4. Duplicate Check (Optimized query targeting indexed email field)
    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
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

    // 6. User Creation with MongoDB Duplicate Key Safeguard
    let newUser;
    try {
      newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        provider: "credentials",
        isVerified: false,
      });
    } catch (dbError: unknown) {
      // Handle MongoDB duplicate key error code (11000) for edge-case race conditions
      if (
        typeof dbError === "object" &&
        dbError !== null &&
        "code" in dbError &&
        (dbError as { code: number }).code === 11000
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
      throw dbError;
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
      await User.deleteOne({ _id: newUser._id });
      await VerificationToken.deleteMany({ email, type: "VERIFY_EMAIL" });
      throw emailError;
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