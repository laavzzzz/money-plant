import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { Goal } from "@/models/Goal";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please sign in again." },
    { status: 401 }
  );
}

function serializeGoal(goal: {
  _id: unknown;
  title?: string;
  targetAmount?: number;
  currentAmount?: number;
}) {
  return {
    _id: String(goal._id),
    title: goal.title || "Financial goal",
    target: Number(goal.targetAmount || 0),
    saved: Number(goal.currentAmount || 0),
    emoji: "🎯",
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return unauthorized();
    }

    await dbConnect();
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: goals.map(serializeGoal),
      source: "mongodb",
    });
  } catch (error) {
    console.error("[GET /api/goals] Failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Goals are temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return unauthorized();
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { success: false, message: "A goal payload is required." },
        { status: 400 }
      );
    }

    const payload = body as {
      title?: unknown;
      target?: unknown;
      saved?: unknown;
    };
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const target = Number(payload.target);
    const saved = Number(payload.saved ?? 0);

    if (!title || title.length > 50) {
      return NextResponse.json(
        { success: false, message: "Goal title must be between 1 and 50 characters." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(target) || target <= 0 || target > 100000000) {
      return NextResponse.json(
        { success: false, message: "Goal target must be a valid positive amount." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(saved) || saved < 0 || saved > target) {
      return NextResponse.json(
        { success: false, message: "Saved amount must be between zero and the target." },
        { status: 400 }
      );
    }

    await dbConnect();
    const goal = await Goal.create({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      targetAmount: target,
      currentAmount: saved,
    });

    return NextResponse.json(
      { success: true, data: serializeGoal(goal), source: "mongodb" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/goals] Failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not save the goal. Please try again.",
      },
      { status: 503 }
    );
  }
}
