import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    await client.db("moneyplant").command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "Native MongoDB Driver Connected Successfully",
    });
  } catch (err) {
    console.error("NATIVE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}