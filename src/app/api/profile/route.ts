import { NextResponse } from "next/server";
import { tryMongoConnect } from "@/lib/data/mongo";
import { User } from "@/models/User";
import { getLocalProfile, saveLocalProfile } from "@/lib/data/profile-store";

export const dynamic = "force-dynamic";

const DEFAULT_PROFILE = {
  name: "Player One",
  title: "Level 12 Wealth Guardian",
  email: "player.one@moneyplant.app",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  accountType: "Premium Saver",
  joinedDate: "June 2024",
  bio: "Building better money habits one plant at a time.",
  totalSaved: "₹1,24,800",
  monthlyAverage: "₹12,300",
  goalCompletion: "8 / 12",
  profilePic: null,
};

export async function GET() {
  try {
    const mongoOk = await tryMongoConnect();
    if (mongoOk) {
      const profile = await User.findOne({}).lean();
      if (profile) {
        return NextResponse.json({ success: true, data: profile, source: "mongodb" });
      }
    }
  } catch (error) {
    console.error("Profile GET mongo error:", error);
  }

  const localProfile = await getLocalProfile();
  return NextResponse.json({ success: true, data: localProfile, source: "local" });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const mongoOk = await tryMongoConnect();

    if (mongoOk) {
      const profile = await User.findOneAndUpdate({}, body, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }).lean();
      return NextResponse.json({ success: true, data: profile, source: "mongodb" }, { status: 200 });
    }

    const profile = await saveLocalProfile(body);
    return NextResponse.json({ success: true, data: profile, source: "local" }, { status: 200 });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ success: false, message: "Unable to save profile." }, { status: 500 });
  }
}
