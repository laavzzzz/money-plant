import { NextResponse } from "next/server";
import { bumpStreak, fetchStreak } from "@/lib/data/streak";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const streak = await fetchStreak();
    return NextResponse.json({ success: true, streak });
  } catch (error: unknown) {
    console.error("GET Streak Error:", error);
    return NextResponse.json(
      {
        success: true,
        streak: { userId: "demo-user", count: 0, lastActiveDate: null },
      },
      { status: 200 }
    );
  }
}

export async function POST() {
  try {
    const streak = await bumpStreak();
    return NextResponse.json({ success: true, streak });
  } catch (error: unknown) {
    console.error("POST Streak Error:", error);
    return NextResponse.json(
      {
        success: true,
        streak: { userId: "demo-user", count: 1, lastActiveDate: new Date().toISOString().slice(0, 10) },
      },
      { status: 200 }
    );
  }
}
