import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully",
    });
  } catch (err) {
    console.error("MongoDB connectivity check failed:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          "Database unavailable. Confirm MongoDB Atlas Network Access and the deployed MONGODB_URI.",
      },
      { status: 503 }
    );
  }
}