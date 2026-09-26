"use client";

import { signOut, useSession } from "next-auth/react";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  isVerified?: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "MoneyPlant User",
        email: session.user.email || "",
        image: session.user.image,
        role: session.user.role,
        isVerified: session.user.isVerified,
      }
    : null;

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    user,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
  };
}