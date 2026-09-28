type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const address = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_FROM;

  if (!apiKey || !address) {
    throw new Error(
      "Brevo configuration is incomplete. Set BREVO_API_KEY and EMAIL_FROM_ADDRESS."
    );
  }

  return {
    apiKey,
    sender: {
      email: address.match(/<([^>]+)>/)?.[1]?.trim() || address.trim(),
      name: process.env.EMAIL_FROM_NAME || "MoneyPlant",
    },
  };
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ messageId?: string }> {
  const config = getBrevoConfig();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: config.sender,
      to: [{ email: payload.to.trim() }],
      subject: payload.subject,
      htmlContent: payload.html,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { message?: string; code?: string };
      detail = [body.code, body.message].filter(Boolean).join(": ");
    } catch {
      detail = await response.text().catch(() => "");
    }
    throw new Error(
      `Brevo email API returned ${response.status}${detail ? `: ${detail}` : ""}`
    );
  }

  const result = (await response.json().catch(() => ({}))) as {
    messageId?: string;
  };
  return { messageId: result.messageId };
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
