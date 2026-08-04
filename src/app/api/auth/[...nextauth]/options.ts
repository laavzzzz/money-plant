import { NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User as UserModel, IUser } from "@/models/User";

/**
 * Module Augmentation for NextAuth internal contracts.
 * Modifiers (required vs optional) match NextAuth base interfaces.
 */


/**
 * Validates critical environment variables during application startup.
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn(
    "[NEXTAUTH_CONFIG_WARN] NEXTAUTH_SECRET is not defined in production environment variables."
  );
}

/**
 * Enterprise NextAuth Options Configuration.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing authentication parameters.");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. Establish database connection
        await dbConnect();

        // 2. Fetch user profile with explicit password selection
        const user = (await UserModel.findOne({
          email: normalizedEmail,
        }).select("+password")) as IUser | null;

        if (!user) {
          throw new Error("No account found with this email address.");
        }

        // 3. Prevent credentials login if account was registered via Google OAuth only
        if (user.provider === "google" && !user.password) {
          throw new Error(
            "This account uses Google Sign-In. Please continue with Google."
          );
        }

        // 4. Verify email verification status
        if (!user.isVerified) {
          throw new Error(
            "Your email address is not verified. Please verify your OTP first."
          );
        }

        // 5. Perform bcrypt password validation
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password. Please try again.");
        }

        // 6. Return standard user authorization payload
        return {
          id: (user._id as string | object).toString(),
          name: user.name || "User",
          email: user.email,
          image: user.image,
          provider: user.provider || "credentials",
          isVerified: user.isVerified ?? true,
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
    maxAge: 30 * 24 * 60 * 60, // 30 Days persistence
  },

  secret: process.env.NEXTAUTH_SECRET,

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
            console.error("[OAUTH_SIGNIN_ERROR] No email provided by Google OAuth payload.");
            return false;
          }

          // Atomic search and sync operation
          const existingUser = await UserModel.findOne({ email: normalizedEmail });

          if (!existingUser) {
            // Register new Google account
            const newUser = await UserModel.create({
              name: user.name,
              email: normalizedEmail,
              image: user.image,
              provider: "google",
              providerId: account.providerAccountId,
              isVerified: true,
            });

            // Populate user.id so it flows cleanly into the jwt callback
            user.id = (newUser._id as string | object).toString();
          } else {
            // Update existing user with latest Google details safely
            await UserModel.updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  providerId: account.providerAccountId,
                  isVerified: true,
                  image: existingUser.image || user.image,
                },
              }
            );

            // Populate user.id so it flows cleanly into the jwt callback
            user.id = (existingUser._id as string | object).toString();
          }

          user.provider = "google";
          user.isVerified = true;

          return true;
        } catch (error) {
          console.error("[NEXTAUTH_OAUTH_SYNC_ERROR] Error during Google OAuth sign-in sync:", error);
          return false;
        }
      }

      return true;
    },

    /**
     * Injects database ID, provider, and verification status into the JWT payload.
     * ZERO DB Queries executed on subsequent requests after initial login.
     */
    async jwt({ token, user, trigger, session }) {
      // Execute initial user payload assignment
      if (user) {
        token.id = user.id;
        token.provider = user.provider;
        token.isVerified = user.isVerified;
      }

      // Handle dynamic client-side session updates
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      return token;
    },

    /**
     * Exposes customized JWT attributes to the client-side session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.provider = token.provider || "credentials";
        session.user.isVerified = token.isVerified ?? true;
      }

      return session;
    },
  },
};

export default authOptions;