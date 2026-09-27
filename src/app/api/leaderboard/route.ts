import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { Leaderboard } from "@/models/Leaderboard";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const users = await Leaderboard.find().sort({ score: -1 }).limit(10).lean();
    const userIds = users.map((entry) => entry.userId);
    const profiles = await User.find({ _id: { $in: userIds } })
      .select({ _id: 1, name: 1, image: 1 })
      .lean();
    const profileById = new Map(
      profiles.map((profile) => [String(profile._id), profile])
    );

    return NextResponse.json({
      success: true,
      leaderboard: users.map((entry, index) => ({
        rank: index + 1,
        name: profileById.get(entry.userId)?.name || "MoneyPlant member",
        aura: entry.score,
        emoji: "🌱",
        userId: entry.userId,
        isCurrentUser: entry.userId === session.user.id,
      })),
      source: "mongodb",
    });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Leaderboard is temporarily unavailable." },
      { status: 503 }
    );
  }
}
