import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { verifyOTPHash } from "@/lib/hashOTP";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password, otp } = await req.json();

    // 1. Payload validation
    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { error: "Name, email, password, and OTP are all required." },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // 2. Check if user already exists (Race condition safety)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "Account already created. Please proceed to login." },
        { status: 409 }
      );
    }

    // 3. Find active verification token
    const tokenRecord = await VerificationToken.findOne({
      email: normalizedEmail,
      type: "VERIFY_EMAIL",
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // 4. Verify token expiry (Mongoose TTL handles auto-delete, but explicit check adds security)
    if (new Date() > tokenRecord.expiresAt) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 5. Compare submitted OTP against saved bcrypt hash
    const isValid = await verifyOTPHash(otp, tokenRecord.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    // 6. Hash user password for registration
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Create user record
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      provider: "credentials",
      isVerified: true,
    });

    // 8. Delete token after successful use (Single-use security)
    await VerificationToken.deleteOne({ _id: tokenRecord._id });

    // 9. Send Welcome Email asynchronously
    sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
      console.error("[WELCOME_EMAIL_ERROR]:", err)
    );

    return NextResponse.json(
      {
        message: "Account verified and created successfully!",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[VERIFY_OTP_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to verify account. Please try again later." },
      { status: 500 }
    );
  }
}