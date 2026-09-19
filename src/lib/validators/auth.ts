import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Please enter a valid email address.")
  .transform((val) => val.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password cannot exceed 128 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

export const registerBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(50, "Name cannot exceed 50 characters."),
  email: emailSchema,
  password: passwordSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits.")
    .regex(/^\d+$/, "Verification code must contain digits only."),
});

export const resetPasswordOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .length(6, "The reset code must be exactly 6 digits.")
    .regex(/^\d+$/, "The verification code must contain only digits."),
  newPassword: passwordSchema,
});

export const resetPasswordTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: passwordSchema,
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type VerifyEmailOtpBody = z.infer<typeof verifyEmailOtpSchema>;
