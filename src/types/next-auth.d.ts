/**
 * @file types/next-auth.d.ts
 * @module types/next-auth
 * @description Enterprise-grade NextAuth TypeScript module augmentation and custom auth type definitions
 * for the MoneyPlant ecosystem. Standardizes JWT claims, session structures, and user profiles.
 */

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * Supported Authentication Providers within the MoneyPlant ecosystem.
 */
export type AuthProviderType = "credentials" | "google";

/**
 * Fundamental user profile attributes maintained throughout authentication,
 * token signatures, and active sessions.
 */
export interface MoneyPlantUserProfile {
  /** Unique database identifier for the user */
  readonly id: string;
  /** Full display name of the user */
  readonly name?: string | null;
  /** Primary user email address */
  readonly email?: string | null;
  /** Avatar or profile picture URL */
  readonly image?: string | null;
  /** Indicates whether the user's primary email address has been verified */
  readonly isVerified: boolean;
  /** Primary authentication provider used for initial authentication */
  readonly provider: AuthProviderType;
  /** Indicates whether the user has fully completed their onboarding setup */
  readonly onboardingCompleted: boolean;
  /** Tracks the specific step in the onboarding flow (if pending) */
  readonly onboardingStep?: string | null;
}

/**
 * Extended properties for the NextAuth User entity passed to `authorize()` and OAuth callbacks.
 */
export interface MoneyPlantUserEntity extends DefaultUser {
  id: string;
  isVerified?: boolean;
  provider?: AuthProviderType;
  onboardingCompleted?: boolean;
  onboardingStep?: string | null;
}

// ============================================================================
// Module Augmentation for NextAuth Core
// ============================================================================

declare module "next-auth" {
  /**
   * Extends NextAuth's built-in `User` interface.
   * Represents the payload returned by `authorize()` or initial OAuth login profile callbacks.
   */
  interface User extends MoneyPlantUserEntity {}

  /**
   * Extends NextAuth's built-in `Session` interface.
   * Defines the payload returned by `useSession()`, `auth()`, and `getServerSession()`.
   */
  interface Session {
    user: MoneyPlantUserProfile & DefaultSession["user"];
    /** Optional token error state (e.g. RefreshAccessTokenError) */
    error?: string;
    /** Absolute ISO timestamp when the current session expires */
    expires: string;
  }
}

// ============================================================================
// Module Augmentation for NextAuth JWT
// ============================================================================

declare module "next-auth/jwt" {
  /**
   * Extends NextAuth's built-in `JWT` interface.
   * Defines the encrypted payload decoded by NextAuth middleware, server actions, and API routes.
   */
  interface JWT extends DefaultJWT {
    /** Unique user identifier mapped from token `sub` */
    id: string;
    /** User's primary email address */
    email?: string | null;
    /** User's display name */
    name?: string | null;
    /** Avatar / profile picture URL (mapped to standard JWT `picture`) */
    picture?: string | null;
    /** Email verification flag */
    isVerified: boolean;
    /** Authentication provider used during authentication */
    provider: AuthProviderType;
    /** Onboarding completion flag */
    onboardingCompleted: boolean;
    /** Current step in the onboarding flow */
    onboardingStep?: string | null;
    /** Optional provider access token (for OAuth integrations) */
    accessToken?: string;
    /** Optional provider refresh token */
    refreshToken?: string;
    /** Optional access token expiration epoch seconds */
    accessTokenExpires?: number;
    /** Operational error code associated with token refreshing */
    error?: string;
  }
}

// ============================================================================
// Standalone Operational Type Helpers & Guard Utilities
// ============================================================================

/**
 * Strict Session type alias for API middleware and Server Components.
 */
export type MoneyPlantUserSession = {
  user: MoneyPlantUserProfile;
  expires: string;
  error?: string;
};

/**
 * Strict JWT payload type alias for internal middleware and API verification handlers.
 */
export type MoneyPlantJWT = {
  id: string;
  sub?: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  isVerified: boolean;
  provider: AuthProviderType;
  onboardingCompleted: boolean;
  onboardingStep?: string | null;
  iat?: number;
  exp?: number;
  jti?: string;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
};

/**
 * Type Guard to check if an unknown object is a valid `MoneyPlantUserSession`.
 *
 * @param session - The unknown session object to validate.
 * @returns Boolean indicating whether the object strictly matches `MoneyPlantUserSession`.
 */
export function isMoneyPlantSession(session: unknown): session is MoneyPlantUserSession {
  return (
    typeof session === "object" &&
    session !== null &&
    "user" in session &&
    typeof (session as MoneyPlantUserSession).user === "object" &&
    (session as MoneyPlantUserSession).user !== null &&
    typeof (session as MoneyPlantUserSession).user.id === "string" &&
    typeof (session as MoneyPlantUserSession).user.onboardingCompleted === "boolean"
  );
}

/**
 * Type Guard to check if an unknown token payload is a valid `MoneyPlantJWT`.
 *
 * @param token - The unknown JWT object to validate.
 * @returns Boolean indicating whether the object strictly matches `MoneyPlantJWT`.
 */
export function isMoneyPlantJWT(token: unknown): token is MoneyPlantJWT {
  return (
    typeof token === "object" &&
    token !== null &&
    "id" in token &&
    typeof (token as MoneyPlantJWT).id === "string" &&
    "onboardingCompleted" in token &&
    typeof (token as MoneyPlantJWT).onboardingCompleted === "boolean" &&
    "provider" in token
  );
}