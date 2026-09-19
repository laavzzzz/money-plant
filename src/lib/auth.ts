/**
 * @file lib/auth.ts
 * @module AuthConfig
 * @description Production-grade NextAuth configuration and server-side authentication utilities.
 * Handles OAuth provider integration, JWT session management, cookie security, and typed session helpers.
 * 
 * @version 3.2.0
 */

import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProviderOptions from "next-auth/providers/google";

// ============================================================================
// MODULE TYPE AUGMENTATION
// ============================================================================

declare module "next-auth" {
  // Extend DefaultSession to preserve any existing user shape from other augmentations
  

  // Ensure User includes an id while keeping any other existing properties
  interface User {
    // id may be present on the User object; keep optional to avoid
    // conflicting declarations elsewhere in the codebase.
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
  }
}

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

/**
 * Interface representing a strictly sanitized authenticated session user.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[AuthOptions] CRITICAL: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be defined."
    );
  } else {
    console.warn(
      "[AuthOptions] WARNING: Missing Google OAuth environment variables. Authentication will fail at runtime."
    );
  }
}

if (!nextAuthSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "[AuthOptions] CRITICAL: NEXTAUTH_SECRET environment variable must be defined in production."
  );
}

// ============================================================================
// NEXTAUTH CONFIGURATION OPTIONS
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProviderOptions({
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
    updateAge: 24 * 60 * 60, // Update session age every 24 Hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },

  // Custom page routing prevents NextAuth fallback 404s
  pages: {
    signIn: "/login",
    error: "/auth/error",
    newUser: "/dashboard",
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.sub || "";
        token.email = user.email?.toLowerCase().trim();
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // session.user may have readonly properties from DefaultSession; avoid direct mutation
        session.user = {
          ...session.user,
          id: (token.id as string | undefined) || (token.sub as string | undefined) || "",
          ...(token.email ? { email: token.email } : {}),
        } as typeof session.user;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callbacks to the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },

  secret: nextAuthSecret,
  debug: process.env.NODE_ENV === "development",
};

// ============================================================================
// SERVER-SIDE SESSION HELPERS
// ============================================================================

/**
 * Retrieves the currently authenticated user from the active NextAuth server session.
 * Safely sanitizes user metadata and returns null if no valid session exists.
 * 
 * @returns Promise resolving to SessionUser or null
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    return {
      id: session.user.id || session.user.email,
      name: session.user.name || "App User",
      email: session.user.email.toLowerCase().trim(),
      image: session.user.image || null,
    };
  } catch (error) {
    console.error("[Auth] Error fetching current authenticated user:", error);
    return null;
  }
}

/**
 * Enforces active authentication in server components, server actions, or route handlers.
 * Throws an explicit error if no authenticated session exists.
 * 
 * @returns Promise resolving to authenticated SessionUser
 * @throws Error if unauthenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: Active authentication session required.");
  }

  return user;
}