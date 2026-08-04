import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export type TokenType = "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface IVerificationToken extends Document {
  email: string;
  type: TokenType;
  otpHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationTokenSchema: Schema<IVerificationToken> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["VERIFY_EMAIL", "RESET_PASSWORD"],
      required: [true, "Token type is required"],
    },
    otpHash: {
      type: String,
      required: [true, "OTP hash is required"],
    },
    expiresAt: {
      type: Date,
      required: true,
      // Automatically removes document from collection when expiresAt date is reached
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for fast queries when checking active tokens by email + type
VerificationTokenSchema.index({ email: 1, type: 1 });

export const VerificationToken: Model<IVerificationToken> =
  models.VerificationToken ||
  model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;