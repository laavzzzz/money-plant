import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { verifyOTPHash } from "@/lib/hashOTP";
import { verifyEmailOtpSchema } from "@/lib/validators/auth";
import { authJsonResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return authJsonResponse(
        { success: false, message: "Invalid JSON payload." },
        400
      );
    }

    const { email, otp, context = "SIGNUP" } = body as { email: string, otp: string, context?: "SIGNUP" | "FORGOT_PASSWORD" };

    if (!email || !otp) {
      return authJsonResponse({ success: false, message: "Email and OTP are required." }, 400);
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return authJsonResponse(
        {
          success: false,
          message: context === "SIGNUP" ? "No pending registration found for this email. Please sign up again." : "Account not found.",
        },
        404
      );
    }

    if (context === "SIGNUP" && user.isVerified) {
      return authJsonResponse(
        {
          success: true,
          message: "Account is already verified. You can sign in.",
        },
        200
      );
    }

    const tokenType = context === "FORGOT_PASSWORD" ? "RESET_PASSWORD" : "VERIFY_EMAIL";
    const tokenRecord = await VerificationToken.findOne({
      email,
      type: tokenType,
    }).sort({ createdAt: -1 });

    if (!tokenRecord) {
      return authJsonResponse(
        {
          success: false,
          message: "Invalid or expired verification code. Please request a new one.",
        },
        400
      );
    }

    if (new Date() > tokenRecord.expiresAt) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return authJsonResponse(
        {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        },
        400
      );
    }

    const isValid = await verifyOTPHash(otp, tokenRecord.otpHash);
    if (!isValid) {
      return authJsonResponse(
        { success: false, message: "Incorrect verification code. Please try again." },
        400
      );
    }

    if (context === "SIGNUP") {
      user.isVerified = true;
      await user.save();
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      
      return authJsonResponse(
        {
          success: true,
          message: "Email verified successfully. You can now sign in.",
        },
        200
      );
    } else {
      // For FORGOT_PASSWORD, we don't delete the token yet because it's needed for the actual password reset POST
      // We just confirm it's valid so the frontend can proceed to the new password form
      return authJsonResponse(
        {
          success: true,
          message: "OTP verified successfully. Please proceed to reset your password.",
        },
        200
      );
    }
  } catch (error) {
    console.error("[VERIFY_OTP_ERROR]:", error);
    return authJsonResponse(
      {
        success: false,
        message: "Failed to verify account. Please try again later.",
      },
      500
    );
  }
}
