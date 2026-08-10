import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Please define RESEND_API_KEY inside your environment variables.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback to Resend onboarding email ONLY for strict local development sandbox usage.
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

/**
 * Validates the Resend API payload and throws explicit errors if the dispatch fails.
 */
async function sendSecureEmail(payload: { from: string; to: string; subject: string; html: string }) {
  try {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("❌ [Resend API Error]:", error);
      
      // Provide actionable feedback for the common testing domain constraint
      if (payload.from === "onboarding@resend.dev") {
        console.warn(
          "⚠️  DEVELOPER NOTE: 'onboarding@resend.dev' can ONLY send emails to the primary email account used to register your Resend developer dashboard. Testing with secondary accounts will fail."
        );
      }
      
      throw new Error(`Email dispatch failed: ${error.message} (${error.name})`);
    }

    console.log(`✅ Email successfully dispatched to ${payload.to}. ID: ${data?.id}`);
    return data;
  } catch (err) {
    console.error(`❌ [Internal Mail Transport Error]: Failing to send email to ${payload.to}:`, err);
    throw err;
  }
}

/**
 * Sends a 6-digit email verification code during signup.
 */
export async function sendVerificationOTP(email: string, otp: string) {
  return await sendSecureEmail({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your MoneyPlant account 🌱",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #16a34a; margin-top: 0; font-size: 22px;">Welcome to MoneyPlant 🌱</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">Use the verification code below to complete your account registration:</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #22c55e; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #15803d; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">This code expires in 10 minutes. If you did not sign up for MoneyPlant, you can safely ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Sends a 6-digit password reset OTP code.
 */
export async function sendResetOTP(email: string, otp: string) {
  return await sendSecureEmail({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your MoneyPlant password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #dc2626; margin-top: 0; font-size: 22px;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your password. Enter the code below to proceed:</p>
        <div style="background-color: #fef2f2; border: 1px dashed #ef4444; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #b91c1c; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">This code expires in 10 minutes. If you did not request a reset, please secure your account immediately.</p>
      </div>
    `,
  });
}

/**
 * Sends an optional welcome email after successful account verification.
 */
export async function sendWelcomeEmail(email: string, name: string) {
  return await sendSecureEmail({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome aboard! Let's grow your money 🌱",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #16a34a; margin-top: 0; font-size: 22px;">Hey ${name}! 👋</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your account is officially verified and ready to go. You can now log in, track your income and expenses, set up savings goals, and watch your MoneyPlant thrive.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">Go to Dashboard</a>
      </div>
    `,
  });
}
