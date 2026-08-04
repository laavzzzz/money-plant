import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { verifyOTPHash } from "@/lib/hashOTP";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    // 1. Payload validation
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required." },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "Reset code must be 6 digits." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await dbConnect();

    // 2. Fetch reset token from DB
    const tokenRecord = await VerificationToken.findOne({
      email: normalizedEmail,
      type: "RESET_PASSWORD",
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset code. Please request a new one." },
        { status: 400 }
      );
    }

    // 3. Expiration check
    if (new Date() > tokenRecord.expiresAt) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 4. Compare OTP against stored hash
    const isValid = await verifyOTPHash(otp, tokenRecord.otpHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect reset code. Please try again." },
        { status: 400 }
      );
    }

    // 5. Verify user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 440 }
      );
    }

    // 6. Hash new password and update user record
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    // 7. Delete token after successful update (Single-use safety)
    await VerificationToken.deleteOne({ _id: tokenRecord._id });

    return NextResponse.json(
      { message: "Password updated successfully! You can now log in with your new password." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[RESET_PASSWORD_ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again later." },
      { status: 500 }
    );
  }
}