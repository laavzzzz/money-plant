import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;

  if (!host || !user || !password) {
    throw new Error(
      "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS."
    );
  }

  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

function getSender(): string {
  const address = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_FROM;
  if (!address) {
    throw new Error(
      "Email sender is missing. Set EMAIL_FROM_ADDRESS to a verified sender address."
    );
  }

  const name = process.env.EMAIL_FROM_NAME || "MoneyPlant";
  return `${name} <${address}>`;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await getTransporter().sendMail({
    from: getSender(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}

export async function sendVerificationOTP(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: "Verify your MoneyPlant account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2>Welcome to MoneyPlant</h2>
        <p>Use this 6-digit code to verify your email address:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center">${otp}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendResetOTP(email: string, otp: string, resetLink?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = resetLink || `${baseUrl}/forgot-password`;

  return sendEmail({
    to: email,
    subject: "Reset your MoneyPlant password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2>Password reset request</h2>
        <p>Use this 6-digit code to reset your password:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;text-align:center">${otp}</p>
        <p><a href="${link}">Open the password reset page</a></p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to MoneyPlant",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2>Welcome, ${name}!</h2>
        <p>Your MoneyPlant account is verified and ready to use.</p>
      </div>
    `,
  });
}
