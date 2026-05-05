import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Leaderboard } from "@/models/Leaderboard";

export async function GET() {
  await dbConnect();

  const users = await Leaderboard.find()
    .sort({ score: -1 })
    .limit(10);

  return NextResponse.json({
    success: true,
    leaderboard: users,
  });
}