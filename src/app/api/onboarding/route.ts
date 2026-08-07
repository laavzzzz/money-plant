import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isFinalStep, stepData, currentStep } = body;

    await dbConnect();

    const updateData: Record<string, unknown> = {
      onboardingStep: currentStep,
    };

    if (stepData) {
      for (const [key, value] of Object.entries(stepData)) {
        updateData[`profile.${key}`] = value;
      }
    }

    if (isFinalStep) {
      updateData.onboardingCompleted = true;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      onboardingCompleted: updatedUser?.onboardingCompleted,
      nextStep: updatedUser?.onboardingStep,
    });
  } catch (error) {
    console.error("Onboarding API Error:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding progress" },
      { status: 500 }
    );
  }
}