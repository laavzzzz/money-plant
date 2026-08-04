import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Interface representing the authenticated session user
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/**
 * NextAuth Configuration Options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as SessionUser).id =
          (token.id as string) || (token.sub as string);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Retrieves the currently authenticated user from the active NextAuth server session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    return {
      id: (session.user as SessionUser).id || session.user.email,
      name: session.user.name || "App User",
      email: session.user.email.toLowerCase(),
      image: session.user.image || null,
    };
  } catch (error) {
    console.error("Error fetching current authenticated user:", error);
    return null;
  }
}

/**
 * Enforces active authentication in server components, actions, or route handlers.
 * Throws an explicit error if no authenticated session exists.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}