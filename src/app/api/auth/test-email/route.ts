import { NextResponse } from "next/server";
import { resend } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // HARD ERROR TEST: Verifies the environment variable exists
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY is not set in your environment variables!" }, { status: 500 });
    }

    console.log("Attempting direct test mail dispatch...");

    // DIRECT DISPATCH BYPASSING DATABASE VALIDATIONS
    // IMPORTANT: Swap the 'to' field with the exact email address you used to register your Resend account!
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "laveezazafar1910@gmail.com", 
      subject: "MoneyPlant Direct Carrier Test 🛠️",
      html: "<p>If you see this, your Resend API configurations are 100% correct!</p>",
    });

    if (error) {
      console.error("Resend Core Error:", error);
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "The raw API key works perfectly!", 
      data 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}