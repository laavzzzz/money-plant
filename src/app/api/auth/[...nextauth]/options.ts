import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import { User, IUser } from "@/models/User"; // Ensure your IUser interface is exported here
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing authentication credentials parameters.");
        }

        // 1. Initialize persistent database channel
        await dbConnect();
        
        // 2. Fetch the user profile and explicitly cast to IUser to clear TS compile blocks
        const user = (await User.findOne({ 
          email: credentials.email.toLowerCase() 
        })) as IUser | null;

        if (!user) {
          throw new Error("No user record mapped to this identity profile.");
        }

        // 3. Perform a secure cryptographic passphrase comparison
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid decryption criteria passphrase.");
        }

        // 4. Return complete profile context to fuel the downstream encryption pipelines
        return { 
          id: (user as any)._id.toString(), 
          name: user.name || "Legend", 
          email: user.email 
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // ⏳ Keep users logged in safely for 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login" // Redirects auth failures cleanly back to your Gen Z login desk
  },
  
  // ⚡ CRITICAL UPGRADES FOR THE AI CHATBOT SYSTEM
  callbacks: {
    /**
     * The JWT callback runs whenever a JSON Web Token is created or updated.
     * We grab the user id from the database extraction and inject it into the encrypted token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * The Session callback makes data accessible to your frontend components and AI routes.
     * We pull the user id out of our secure token and attach it directly to the active session object.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};