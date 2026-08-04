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
    console.error("FULL ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : null,
        name: err instanceof Error ? err.name : null,
      },
      { status: 500 }
    );
  }
}