import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { generateOTP } from "@/lib/generateOTP";
import { hashOTP } from "@/lib/hashOTP";
import { sendVerificationOTP } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Basic validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 3. Rate-limiting check (Prevent spam: 1 OTP request per 30 seconds)
    const recentToken = await VerificationToken.findOne({
      email: normalizedEmail,
      type: "VERIFY_EMAIL",
    }).sort({ createdAt: -1 });

    if (recentToken) {
      const timeElapsed = Date.now() - new Date(recentToken.createdAt).getTime();
      const COOLDOWN_MS = 30 * 1000; // 30 seconds

      if (timeElapsed < COOLDOWN_MS) {
        const secondsRemaining = Math.ceil((COOLDOWN_MS - timeElapsed) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${secondsRemaining} seconds before requesting another code.`,
          },
          { status: 429 }
        );
      }
    }

    // 4. Delete existing pending verification tokens for this email
    await VerificationToken.deleteMany({
      email: normalizedEmail,
      type: "VERIFY_EMAIL",
    });

    // 5. Generate and hash OTP
    const rawOTP = generateOTP();
    const otpHash = await hashOTP(rawOTP);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

    // 6. Save token to Database
    await VerificationToken.create({
      email: normalizedEmail,
      type: "VERIFY_EMAIL",
      otpHash,
      expiresAt,
    });

    // 7. Dispatch Email via Resend
    await sendVerificationOTP(normalizedEmail, rawOTP);

    return NextResponse.json(
      { message: "Verification code sent to your email." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SEND_OTP_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }
}