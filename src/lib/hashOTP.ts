import bcrypt from "bcryptjs";

/**
 * Hashes an OTP string before saving to database.
 */
export async function hashOTP(otp: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
}

/**
 * Verifies a raw OTP against a stored hash.
 */
export async function verifyOTPHash(otp: string, hashedOtp: string): Promise<boolean> {
  return await bcrypt.compare(otp, hashedOtp);
}