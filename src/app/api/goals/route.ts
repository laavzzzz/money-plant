import { NextResponse } from "next/server";
import { tryMongoConnect } from "@/lib/data/mongo";
import { Goal } from "@/models/Goal";
import {
  listLocalGoals,
  addLocalGoal,
  type StoreGoal,
} from "@/lib/data/local-store";

export const dynamic = "force-dynamic";

const MOCK_GOALS: StoreGoal[] = [
  {
    _id: "goal-1",
    title: "Europe Trip",
    saved: 35000,
    target: 100000,
    emoji: "✈️",
  },
  {
    _id: "goal-2",
    title: "New Laptop",
    saved: 45000,
    target: 80000,
    emoji: "💻",
  },
];

export async function GET() {
  try {
    const mongoOk = await tryMongoConnect();
    if (mongoOk) {
      const goals = await Goal.find({}).lean();
      if (goals.length > 0) {
        return NextResponse.json({ success: true, data: goals, source: "mongodb" });
      }
    }
  } catch (error) {
    console.error("Goals GET mongo error:", error);
  }

  const local = await listLocalGoals();
  return NextResponse.json({
    success: true,
    data: local.length > 0 ? local : MOCK_GOALS,
    source: "local",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, target, saved, emoji } = body;

    if (!title || target === undefined) {
      return NextResponse.json(
        { success: false, message: "title and target are required" },
        { status: 400 }
      );
    }

    const mongoOk = await tryMongoConnect();
    if (mongoOk) {
      try {
        const goal = await Goal.create(body);
        return NextResponse.json(
          { success: true, data: goal, source: "mongodb" },
          { status: 201 }
        );
      } catch (error) {
        console.error("Goals POST mongo error:", error);
      }
    }

    const goal = await addLocalGoal({
      title: String(title),
      target: Number(target),
      saved: Number(saved ?? 0),
      emoji: String(emoji ?? "🎯"),
    });

    return NextResponse.json(
      { success: true, data: goal, source: "local" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
