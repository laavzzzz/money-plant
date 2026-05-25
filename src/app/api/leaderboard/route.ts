import { NextResponse } from "next/server";
import { tryMongoConnect } from "@/lib/data/mongo";
import { Leaderboard } from "@/models/Leaderboard";

const MOCK_LEADERBOARD = [
  { name: "MoneyMonk", score: 34000, emoji: "🐒", rank: 1 },
  { name: "SaverGirl", score: 18000, emoji: "🌸", rank: 2 },
  { name: "FrugalKing", score: 15000, emoji: "👑", rank: 3 },
  { name: "Ananya Sharma", score: 12450, emoji: "👩‍💻", rank: 4 },
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mongoOk = await tryMongoConnect();
    if (mongoOk) {
      const users = await Leaderboard.find().sort({ score: -1 }).limit(10).lean();
      if (users.length > 0) {
        return NextResponse.json({ success: true, leaderboard: users });
      }
    }
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
  }

  return NextResponse.json({
    success: true,
    leaderboard: MOCK_LEADERBOARD,
    source: "mock",
  });
}
