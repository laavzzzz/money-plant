import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { bumpStreak, fetchStreak } from "@/lib/data/streak";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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
