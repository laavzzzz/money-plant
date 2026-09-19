import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { verifyOTPHash } from "@/lib/hashOTP";
import {
  resetPasswordOtpSchema,
  resetPasswordTokenSchema,
} from "@/lib/validators/auth";
import { authJsonResponse } from "@/lib/api-response";

const TOKEN_TYPE = "RESET_PASSWORD" as const;
const BCRYPT_SALT_ROUNDS = 12;

const ResetPasswordBodySchema = z.union([resetPasswordOtpSchema, resetPasswordTokenSchema]);

function hashLinkToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function applyNewPassword(email: string, newPassword: string): Promise<void> {
  const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await User.updateOne({ email }, { $set: { password: hashedNewPassword } });
  await VerificationToken.deleteMany({ email, type: TOKEN_TYPE });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return authJsonResponse(
      { success: false, message: "Reset token is required.", valid: false },
      400
    );
  }

  try {
    await dbConnect();
    const tokenHash = hashLinkToken(token);
    const record = await VerificationToken.findOne({
      type: TOKEN_TYPE,
      resetLinkTokenHash: tokenHash,
    }).lean();

    if (!record || new Date() > new Date(record.expiresAt)) {
      if (record?._id) {
        await VerificationToken.deleteOne({ _id: record._id });
      }
      return authJsonResponse(
        {
          success: false,
          valid: false,
          message: "This reset link is invalid or has expired.",
        },
        400
      );
    }

    return authJsonResponse(
      {
        success: true,
        valid: true,
        message: "Reset token is valid.",
        emailMasked: record.email.replace(/(.{1}).*(@.*)/, "$1***$2"),
      },
      200
    );
  } catch (error) {
    console.error("[RESET_PASSWORD_VALIDATE_ERROR]:", error);
    return authJsonResponse(
      { success: false, valid: false, message: "Unable to validate reset token." },
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return authJsonResponse({ success: false, message: "Invalid JSON request body." }, 400);
    }

    const parsed = ResetPasswordBodySchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid payload format.";
      return authJsonResponse({ success: false, message }, 422);
    }

    await dbConnect();

    if ("token" in parsed.data) {
      const { token, password } = parsed.data;
      const tokenHash = hashLinkToken(token);
      const record = await VerificationToken.findOne({
        type: TOKEN_TYPE,
        resetLinkTokenHash: tokenHash,
      });

      if (!record || new Date() > new Date(record.expiresAt)) {
        if (record?._id) {
          await VerificationToken.deleteOne({ _id: record._id });
        }
        return authJsonResponse(
          {
            success: false,
            message: "This reset link is invalid or has expired.",
          },
          400
        );
      }

      const user = await User.findOne({ email: record.email });
      if (!user) {
        await VerificationToken.deleteOne({ _id: record._id });
        return authJsonResponse(
          { success: false, message: "Account could not be validated." },
          422
        );
      }

      if (user.provider === "google" && !user.password) {
        await VerificationToken.deleteOne({ _id: record._id });
        return authJsonResponse(
          {
            success: false,
            message: "This account uses Google Sign-In. Reset your password through Google.",
          },
          422
        );
      }

      await applyNewPassword(record.email, password);

      return authJsonResponse(
        {
          success: true,
          message: "Your password has been updated successfully. You can now sign in.",
        },
        200
      );
    }

    const { email, otp, newPassword } = parsed.data;
    const tokenRecord = await VerificationToken.findOne({
      email,
      type: TOKEN_TYPE,
    }).sort({ createdAt: -1 });

    if (!tokenRecord || new Date() > new Date(tokenRecord.expiresAt)) {
      if (tokenRecord?._id) {
        await VerificationToken.deleteOne({ _id: tokenRecord._id });
      }
      return authJsonResponse(
        {
          success: false,
          message: "The verification code is incorrect, invalid, or has expired.",
        },
        400
      );
    }

    const isValidOtp = await verifyOTPHash(otp, tokenRecord.otpHash);
    if (!isValidOtp) {
      return authJsonResponse(
        {
          success: false,
          message: "The verification code is incorrect, invalid, or has expired.",
        },
        400
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return authJsonResponse(
        { success: false, message: "Account could not be validated." },
        422
      );
    }

    if (user.provider === "google" && !user.password) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return authJsonResponse(
        {
          success: false,
          message: "This account uses Google Sign-In. Reset your password through Google.",
        },
        422
      );
    }

    await applyNewPassword(email, newPassword);

    return authJsonResponse(
      {
        success: true,
        message: "Your password has been updated successfully. You can now sign in.",
      },
      200
    );
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]:", error);
    return authJsonResponse(
      {
        success: false,
        message: "An unexpected error occurred while resetting your password.",
      },
      500
    );
  }
}
