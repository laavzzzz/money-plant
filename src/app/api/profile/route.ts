import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { tryMongoConnect } from "@/lib/data/mongo";
import { User, IUser } from "@/models/User";
import { getLocalProfile, saveLocalProfile } from "@/lib/data/profile-store";

// Try importing authOptions dynamically, or fall back to route auth configuration
let authOptions: any;
try {
  // Common paths for auth options in Next.js projects
  authOptions = require("@/app/api/auth/[...nextauth]/route").authOptions;
} catch {
  try {
    authOptions = require("@/lib/auth").authOptions;
  } catch {
    // Basic fallback configuration object if imported file doesn't export authOptions directly
    authOptions = { secret: process.env.NEXTAUTH_SECRET };
  }
}

export const dynamic = "force-dynamic";

/**
 * Helper to compute dynamic user progression, level badges, and frontend UI values
 */
function enrichProfileData(userDoc: Record<string, any>) {
  const totalSaved = Number(userDoc.totalSaved || 0);
  const totalIncome = Number(userDoc.totalIncome || 0);
  const totalExpense = Number(userDoc.totalExpense || 0);
  const streak = Number(userDoc.streak || 0);

  const calculatedLevel = Math.max(
    1,
    Math.floor(totalSaved / 10000) + Math.floor(streak / 5) + 1
  );

  const savingsRate =
    totalIncome > 0
      ? Math.min(
          100,
          Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        )
      : 0;

  const globalAura = 1000 + streak * 15 + Math.floor(totalSaved / 1000) * 5;

  return {
    ...userDoc,

    // Progression values
    level: calculatedLevel,
    title: `Level ${calculatedLevel} Wealth Guardian`,

    // UI contract fields guaranteed to be strings (prevents frontend runtime crashes)
    savingsRate: String(savingsRate),
    globalAura: String(globalAura),
    accountType:
      userDoc.provider === "google" ? "Google Member" : "MoneyPlant Member",
    achievements: `${streak}/50`,
    profilePic: userDoc.profilePic || userDoc.image || null,

    // Display-formatted values for UI dashboard components
    formattedTotalSaved: `₹${totalSaved.toLocaleString("en-IN")}`,
    formattedMonthlyAverage: `₹${Number(
      userDoc.monthlyAverage || 0
    ).toLocaleString("en-IN")}`,
    joinedDate: userDoc.createdAt
      ? new Date(userDoc.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recently Joined",
  };
}

/**
 * GET Handler - Retrieves active authenticated user profile
 */
export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userEmail = session?.user?.email?.toLowerCase();

    // Enforce real user identity - reject unauthenticated calls
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Active user session required." },
        { status: 401 }
      );
    }

    const mongoOk = await tryMongoConnect();

    if (mongoOk) {
      let userDoc = (await User.findOne({ email: userEmail }).lean()) as Record<
        string,
        any
      > | null;

      // Auto-provision profile from active session if document does not exist yet
      if (!userDoc) {
        const newUser = await User.create({
          name: session?.user?.name || "App User",
          email: userEmail,
          image: session?.user?.image || null,
          provider: "google",
          isVerified: true,
          bio: "Building better money habits one plant at a time.",
        });
        userDoc = newUser.toObject() as Record<string, any>;
      }

      const enrichedProfile = enrichProfileData(userDoc);

      return NextResponse.json(
        { success: true, data: enrichedProfile, source: "mongodb" },
        { status: 200 }
      );
    }

    // Local Store Fallback scoped to user session
    const localProfile = await getLocalProfile();
    if (localProfile) {
      return NextResponse.json(
        { success: true, data: enrichProfileData(localProfile), source: "local" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "User profile data unavailable." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching user profile." },
      { status: 500 }
    );
  }
}

/**
 * PUT Handler - Updates profile attributes for the authenticated user
 */
export async function PUT(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userEmail = session?.user?.email?.toLowerCase();

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Active user session required." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Destructure out system-managed identity fields and calculated UI properties
    // so Mongoose doesn't attempt to write unmapped schema fields.
    const {
      _id,
      email,
      password,
      createdAt,
      updatedAt,
      provider,
      providerId,
      // Stripping presentation-only & computed fields
      accountType,
      joinedDate,
      globalAura,
      achievements,
      savingsRate,
      level,
      title,
      formattedTotalSaved,
      formattedMonthlyAverage,
      profilePic,
      ...rawUpdateData
    } = body;

    // Standardize `profilePic` mapping to MongoDB schema `image` property if present
    const updateData: Record<string, any> = { ...rawUpdateData };
    if (profilePic !== undefined) {
      updateData.image = profilePic;
    }

    const mongoOk = await tryMongoConnect();

    if (mongoOk) {
      const updatedUser = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      ).lean();

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "User profile record not found." },
          { status: 404 }
        );
      }

      const enrichedProfile = enrichProfileData(updatedUser as Record<string, any>);

      return NextResponse.json(
        { success: true, data: enrichedProfile, source: "mongodb" },
        { status: 200 }
      );
    }

    // Local storage persistence fallback
    const savedLocal = await saveLocalProfile({ email: userEmail, ...updateData });
    return NextResponse.json(
      { success: true, data: enrichProfileData(savedLocal), source: "local" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile PUT error:", error);

    // Schema Validation error handling
    if (error?.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message || "Invalid profile data payload." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to update profile settings." },
      { status: 500 }
    );
  }
}