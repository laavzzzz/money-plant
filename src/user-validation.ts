import mongoose from "mongoose";
// 🎯 Fixed: Absolute path alias and unified model reference
import { User, type IUser } from "@/models/User";
import dbConnect from "@/lib/dbConnect";

/**
 * Custom error class for unverified or unauthorized access attempts.
 */
export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}

/**
 * Strictly validates that a user exists and is verified before allowing transactions.
 * @param userIdentifier - The unique identifier for the user (e.g., phone or _id)
 * @returns The verified user document
 * @throws VerificationError if user is not found, not verified, or mock/demo data is detected.
 */
export async function validateVerifiedUser(userIdentifier: string): Promise<IUser> {
  await dbConnect();

  // 1. Safe Query Construction to prevent Mongoose CastErrors
  let query: any = { phone: userIdentifier };
  if (mongoose.isValidObjectId(userIdentifier)) {
    query = { $or: [{ _id: userIdentifier }, { phone: userIdentifier }] };
  }

  const user = await User.findOne(query);

  // 2. Prevent unauthenticated access
  if (!user) {
    console.error(`[SECURITY] Access attempt by non-existent user: ${userIdentifier}`);
    throw new VerificationError("Access Denied: User account not found.");
  }

  // 3. Strict Verification Check
  if (!user.isVerified) {
    console.warn(`[SECURITY] Transaction attempted by unverified user: ${user.phone}`);
    throw new VerificationError("Action Forbidden: Please verify your account first.");
  }

  // 4. Anti-Mock Check
  const isMock = user.phone.startsWith("555") || user.name.toLowerCase().includes("demo");
  if (isMock) {
     throw new VerificationError("Action Forbidden: Demo accounts cannot perform real transactions.");
  }

  return user;
}