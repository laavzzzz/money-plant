/**
 * @file src/app/api/auth/[...nextauth]/options.ts
 * @module AuthOptions
 * @description Enterprise-grade NextAuth configuration for MoneyPlant.
 * Manages Credentials and Google OAuth authentication providers, MongoDB database synchronization,
 * JWT token payload enrichment (including onboarding flags), and secure session hydration.
 *
 * @version 3.1.0
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User as UserModel, IUser } from "@/models/User";
import { AuthProviderType } from "@/types/next-auth";

type IUserWithId = IUser & { _id: unknown };

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION & CONFIGURATION
// ============================================================================

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

/** Dummy bcrypt hash used to prevent timing attacks on email non-existence */
const DUMMY_BCRYPT_HASH =
  "$2a$12$e883m6c5/H3uJ6aW5B7/1.OQ8O3X/WpE0pL3Z0e/K7Y2pM7L5Y3G.";

if (!NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "[FATAL_AUTH_CONFIG] NEXTAUTH_SECRET or AUTH_SECRET must be defined in production environment."
  );
}

if ((!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) && process.env.NODE_ENV === "production") {
  console.warn(
    "[NEXTAUTH_CONFIG_WARN] Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing."
  );
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Safely converts MongoDB ObjectId or string types to a standardized string representation.
 */
function toObjectIdString(id: unknown): string {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && "toString" in id && typeof id.toString === "function") {
    return id.toString();
  }
  return String(id);
}

/**
 * Structured logger for authentication options events.
 */
function logAuthEvent(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  meta?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "test") return;

  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    scope: "NextAuthOptions",
    level,
    message,
    ...meta,
  });

  if (level === "ERROR") {
    console.error(payload);
  } else if (level === "WARN") {
    console.warn(payload);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(payload);
  }
}

// ============================================================================
// NEXTAUTH OPTIONS CONFIGURATION
// ============================================================================

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. Establish database connection
        await dbConnect();

        // 2. Fetch user profile with explicit password selection
        const user = (await UserModel.findOne({
          email: normalizedEmail,
        }).select("+password")) as IUserWithId | null;

        // 3. Mitigate timing attacks if user does not exist
        if (!user) {
          await bcrypt.compare(credentials.password, DUMMY_BCRYPT_HASH);
          throw new Error("Invalid email or password.");
        }

        // 4. Prevent credentials login if account was registered via Google OAuth without password
        if (user.provider === "google" && !user.password) {
          throw new Error(
            "This account was created using Google Sign-In. Please sign in with Google."
          );
        }

        // 5. Verify email verification status
        if (!user.isVerified) {
          throw new Error(
            "Your email address is not verified. Please verify your OTP to continue."
          );
        }

        // 6. Perform bcrypt password validation
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password.");
        }

        const userIdStr = toObjectIdString(user._id);
        const onboardingStep =
          user.onboardingStep !== undefined && user.onboardingStep !== null
            ? String(user.onboardingStep)
            : null;

        // 7. Return standard user authorization payload
        return {
          id: userIdStr,
          name: user.name || "MoneyPlant User",
          email: user.email,
          image: user.image || null,
          provider: (user.provider as AuthProviderType) || "credentials",
          isVerified: user.isVerified ?? true,
          onboardingCompleted: user.onboardingCompleted ?? false,
          onboardingStep,
        };
      },
    }),

    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
    maxAge: 30 * 24 * 60 * 60, // 30 Days session duration
  },

  secret: NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * Handles account lookup and atomic synchronization during OAuth sign-in flow.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          const normalizedEmail = user.email?.toLowerCase().trim();

          if (!normalizedEmail) {
            logAuthEvent("ERROR", "No email provided by Google OAuth payload.");
            return false;
          }

          // Atomic search and sync operation using MongoDB findOneAndUpdate to prevent race conditions
          const existingUser = (await UserModel.findOne({
            email: normalizedEmail,
          })) as IUserWithId | null;

          if (!existingUser) {
            // Register new Google account
            const newUser = await UserModel.create({
              name: user.name || "MoneyPlant User",
              email: normalizedEmail,
              image: user.image || null,
              provider: "google",
              providerId: account.providerAccountId,
              isVerified: true,
              onboardingCompleted: false,
              onboardingStep: "PROFILE_SETUP",
            });

            const newUserIdStr = toObjectIdString(newUser._id);
            user.id = newUserIdStr;
            user.onboardingCompleted = false;
            user.onboardingStep = "PROFILE_SETUP";
          } else {
            // Safe update of existing account (Account linking support)
            const updatedUser = (await UserModel.findOneAndUpdate(
              { _id: existingUser._id },
              {
                $set: {
                  providerId: account.providerAccountId,
                  isVerified: true,
                  image: existingUser.image || user.image || null,
                },
              },
              { new: true }
            )) as IUserWithId;

            const existingUserIdStr = toObjectIdString(updatedUser._id);
            user.id = existingUserIdStr;
            user.onboardingCompleted = updatedUser.onboardingCompleted ?? false;
            user.onboardingStep =
              updatedUser.onboardingStep != null ? String(updatedUser.onboardingStep) : null;
          }

          user.provider = "google";
          user.isVerified = true;

          logAuthEvent("INFO", "Google OAuth synchronization completed successfully.", {
            email: normalizedEmail,
            userId: user.id,
          });

          return true;
        } catch (error) {
          logAuthEvent("ERROR", "Error during Google OAuth sign-in synchronization.", {
            error: error instanceof Error ? error.message : String(error),
          });
          return false;
        }
      }

      return true;
    },

    /**
     * Injects database ID, provider, verification status, and onboarding metadata into JWT.
     * ZERO DB Queries executed on subsequent requests after initial login.
     */
    async jwt({ token, user, trigger, session }) {
      // Execute initial user payload assignment
      if (user) {
        token.id = user.id;
        token.provider = user.provider || "credentials";
        token.isVerified = user.isVerified ?? true;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
        token.onboardingStep = user.onboardingStep || null;
      }

      // Handle dynamic client-side session updates via update()
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (typeof session.image === "string") token.picture = session.image;
        if (typeof session.onboardingCompleted === "boolean") {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        if (typeof session.onboardingStep === "string" || session.onboardingStep === null) {
          token.onboardingStep = session.onboardingStep;
        }
        if (typeof session.isVerified === "boolean") {
          token.isVerified = session.isVerified;
        }
      }

      return token;
    },

    /**
     * Exposes customized JWT attributes to the client-side session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.id,
          provider: token.provider || "credentials",
          isVerified: token.isVerified ?? true,
          onboardingCompleted: Boolean(token.onboardingCompleted),
          onboardingStep: token.onboardingStep || null,
        };
      }

      return session;
    },
  },
};

export default authOptions;