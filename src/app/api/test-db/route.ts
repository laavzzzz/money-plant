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
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}