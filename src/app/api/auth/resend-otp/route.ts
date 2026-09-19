import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { generateOTP } from "@/lib/generateOTP";
import { hashOTP } from "@/lib/hashOTP";
import { sendVerificationOTP } from "@/lib/email";
import { emailSchema } from "@/lib/validators/auth";
import { authJsonResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const OTP_EXPIRATION_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return authJsonResponse({ success: false, message: "Invalid JSON payload." }, 400);
    }

    const emailResult = emailSchema.safeParse(
      typeof body === "object" && body !== null && "email" in body
        ? (body as { email: string }).email
        : ""
    );

    if (!emailResult.success) {
      return authJsonResponse(
        { success: false, message: emailResult.error.issues[0]?.message || "Invalid email." },
        400
      );
    }

    const email = emailResult.data;

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return authJsonResponse(
        { success: false, message: "No account found associated with this email address." },
        404
      );
    }

    if (user.isVerified) {
      return authJsonResponse(
        { success: false, message: "Account is already verified. Please sign in." },
        400
      );
    }

    const recentToken = await VerificationToken.findOne({
      email,
      type: "VERIFY_EMAIL",
    }).sort({ createdAt: -1 });

    if (recentToken?.createdAt) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(recentToken.createdAt).getTime()) / 1000
      );
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const retryAfter = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        return authJsonResponse(
          {
            success: false,
            message: `Please wait ${retryAfter} second${retryAfter === 1 ? "" : "s"} before requesting a new code.`,
            retryAfter,
          },
          429,
          { "Retry-After": String(retryAfter) }
        );
      }
    }

    const rawOTP = generateOTP();
    const otpHash = await hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await VerificationToken.deleteMany({ email, type: "VERIFY_EMAIL" });
    await VerificationToken.create({
      email,
      type: "VERIFY_EMAIL",
      otpHash,
      expiresAt,
      attempts: 0,
    });

    await sendVerificationOTP(email, rawOTP);

    return authJsonResponse(
      {
        success: true,
        message: "A new verification code has been sent to your email address.",
      },
      200
    );
  } catch (error) {
    console.error("[RESEND_OTP_ROUTE_ERROR]:", error);
    return authJsonResponse(
      {
        success: false,
        message: "An internal server error occurred while resending the verification code.",
      },
      500
    );
  }
}
