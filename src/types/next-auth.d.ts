import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * Supported Authentication Providers within the MoneyPlant ecosystem.
 */
export type AuthProviderType = "credentials" | "google";

/**
 * Core User Profile fields extended across NextAuth JWT, Session, and User objects.
 */
export interface MoneyPlantUserProfile {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isVerified?: boolean;
    provider?: AuthProviderType;
}

/**
 * Global NextAuth Module Augmentation
 */
declare module "next-auth" {
  /**
   * Extends the base NextAuth User object returned by authorize() or OAuth profile callbacks.
   */
 interface User extends DefaultUser {
    id?: string;
    isVerified?: boolean;
    provider?: AuthProviderType;
}

  /**
   * Extends the shape of `session.user` returned by `useSession()` and `getServerSession()`.
   */
  interface Session {
    user: MoneyPlantUserProfile & DefaultSession["user"];
  }
}

/**
 * Global NextAuth JWT Module Augmentation
 */
declare module "next-auth/jwt" {
  /**
   * Extends the shape of the encrypted JWT token managed by NextAuth middleware and callbacks.
   */
  interface JWT extends DefaultJWT {
    id?: string;
    isVerified?: boolean;
    provider?: AuthProviderType;
}
}

/**
 * Standalone TypeScript type helpers for API middleware and React components.
 */
export type MoneyPlantUserSession = {
  user: MoneyPlantUserProfile;
  expires: string;
};

export type MoneyPlantJWT = {
  id: string;
  name?: string;
  email?: string;
  picture?: string;
  isVerified: boolean;
  provider: AuthProviderType;
  iat?: number;
  exp?: number;
  jti?: string;
};