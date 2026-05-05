import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Streak } from "@/models/Streak";
import { getToday, getYesterday } from "@/utils/dateHelpers";

/* 🧠 TYPES */
type ApiResponse = {
  success: boolean;
  streak?: any;
  message?: string;
};

/* 🔐 TEMP USER (replace with auth later) */
const getUserId = () => "demo-user";

/* 🔍 GET STREAK */
export async function GET() {
  try {
    await dbConnect();

    const userId = getUserId();

    let streak = await Streak.findOne({ userId });

    if (!streak) {
      streak = await Streak.create({
        userId,
        count: 0,
        lastActiveDate: null,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      streak,
    });
  } catch (error: any) {
    console.error("GET Streak Error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Failed to fetch streak",
      },
      { status: 500 }
    );
  }
}

/* 🔥 UPDATE STREAK */
export async function POST() {
  try {
    await dbConnect();

    const userId = getUserId();

    let streak = await Streak.findOne({ userId });

    const today = getToday();
    const yesterday = getYesterday();

    /* 🆕 FIRST TIME USER */
    if (!streak) {
      streak = await Streak.create({
        userId,
        count: 1,
        lastActiveDate: today,
      });

      return NextResponse.json<ApiResponse>({
        success: true,
        streak,
      });
    }

    /* 🛑 ALREADY UPDATED TODAY */
    if (streak.lastActiveDate === today) {
      return NextResponse.json<ApiResponse>({
        success: true,
        streak,
      });
    }

    /* 🔥 CONTINUE OR RESET */
    if (streak.lastActiveDate === yesterday) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }

    streak.lastActiveDate = today;

    await streak.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      streak,
    });
  } catch (error: any) {
    console.error("POST Streak Error:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Failed to update streak",
      },
      { status: 500 }
    );
  }
}