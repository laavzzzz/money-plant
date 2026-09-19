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

    const parsed = verifyEmailOtpSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid verification payload.";
      return authJsonResponse({ success: false, message }, 422);
    }

    const { email, otp } = parsed.data;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return authJsonResponse(
        {
          success: false,
          message: "No pending registration found for this email. Please sign up again.",
        },
        404
      );
    }

    if (user.isVerified) {
      return authJsonResponse(
        {
          success: true,
          message: "Account is already verified. You can sign in.",
        },
        200
      );
    }

    const tokenRecord = await VerificationToken.findOne({
      email,
      type: "VERIFY_EMAIL",
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
