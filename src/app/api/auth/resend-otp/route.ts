import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { VerificationToken } from "@/models/VerificationToken";

// Set OTP expiration to 10 minutes from creation
const OTP_EXPIRATION_MINUTES = 10;
// Enforce a 60-second minimum cooldown between resend requests
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
function generateSecureOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Sends the verification code email.
 * Replace or adapt this function with your email provider (Resend, Nodemailer, Postmark, etc.).
 */
async function sendOTPEmail(email: string, otp: string): Promise<void> {
  // Example using Resend (Install via: npm install resend)
  // If using Nodemailer or another service, replace this block accordingly.
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Auth System <no-reply@yourdomain.com>",
      to: [email],
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
          <p style="color: #666; font-size: 15px;">Use the verification code below to complete your registration or login:</p>
          <div style="background-color: #f4f6f8; padding: 16px; text-align: center; border-radius: 6px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 13px;">This code will expire in ${OTP_EXPIRATION_MINUTES} minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });
  } else {
    // Development fallback if RESEND_API_KEY is not set
    console.log(`[DEV EMAIL MOCK] OTP for ${email}: ${otp}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // 1. Input Validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email address is required." },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // 2. Connect to Database
    await dbConnect();

    // 3. Verify user existence and status
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return NextResponse.json(
        { message: "No account found associated with this email address." },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Account is already verified. Please sign in." },
        { status: 400 }
      );
    }

    // 4. Rate-Limiting Cooldown Check
    const existingOtp = await VerificationToken.findOne({ email: sanitizedEmail });

    if (existingOtp) {
      const now = new Date();
      const updatedAt = (existingOtp as { updatedAt?: Date }).updatedAt;
      const createdAt = new Date(updatedAt || existingOtp.createdAt);
      const timeElapsedSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

      if (timeElapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const timeRemaining = RESEND_COOLDOWN_SECONDS - timeElapsedSeconds;
        return NextResponse.json(
          {
            message: `Please wait ${timeRemaining} second${timeRemaining > 1 ? "s" : ""} before requesting a new code.`,
            retryAfter: timeRemaining,
          },
          { status: 429 }
        );
      }
    }

    // 5. Generate Cryptographically Secure OTP & Expiration
    const newOtp = generateSecureOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // 6. Upsert OTP Record (Overwrite previous code & reset attempts counter)
    await VerificationToken.findOneAndUpdate(
      { email: sanitizedEmail },
      {
        otp: newOtp,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 7. Dispatch Email
    await sendOTPEmail(sanitizedEmail, newOtp);

    // 8. Return Success Response
    return NextResponse.json(
      {
        success: true,
        message: "A new verification code has been sent to your email address.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;

    console.error("[RESEND_OTP_ROUTE_ERROR]:", {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    return NextResponse.json(
      {
        message: "An internal server error occurred while resending the verification code.",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}