import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipient =
      process.env.TEST_EMAIL_RECIPIENT ||
      process.env.EMAIL_FROM_ADDRESS ||
      process.env.EMAIL_FROM;
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "TEST_EMAIL_RECIPIENT or EMAIL_FROM_ADDRESS must be configured." },
        { status: 500 }
      );
    }

    const data = await sendEmail({
      to: recipient.replace(/^.*<([^>]+)>$/, "$1"),
      subject: "MoneyPlant Direct Carrier Test 🛠️",
      html: "<p>SMTP email delivery is configured correctly.</p>",
    });

    return NextResponse.json({ 
      success: true, 
      message: "SMTP email delivery works correctly.", 
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}