/**
 * @file lib/auth.ts
 * @description Server-side session helpers and canonical NextAuth options re-export.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export { authOptions };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isVerified: boolean;
  provider: "credentials" | "google";
  role?: string;
  onboardingCompleted: boolean;
  onboardingStep?: string | null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    return {
      id: session.user.id || session.user.email,
      name: session.user.name || "MoneyPlant User",
      email: session.user.email.toLowerCase().trim(),
      image: session.user.image || null,
      isVerified: session.user.isVerified ?? true,
      provider: session.user.provider || "credentials",
      role: session.user.role || "USER",
      onboardingCompleted: session.user.onboardingCompleted ?? false,
      onboardingStep: session.user.onboardingStep ?? null,
    };
  } catch (error) {
    console.error("[Auth] Error fetching current authenticated user:", error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Active authentication session required.");
  }

  return user;
}
