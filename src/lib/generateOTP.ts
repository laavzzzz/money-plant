import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit OTP string.
 */
export function generateOTP(): string {
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}