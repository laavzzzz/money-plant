/**
 * @file src/middleware.ts
 * @description Enterprise Security, RBAC & Access Control Middleware
 * Edge-compatible Next.js middleware handling JWT verification, account verification state
 * enforcement, role-based access control (RBAC), open redirect prevention, OWASP security headers,
 * and structured audit telemetry.
 * * @module middleware
 * @version 3.6.0
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ============================================================================
// TYPE DEFINITIONS & DOMAIN INTERFACES
// ============================================================================

export type UserRole = "USER" | "SUPPORT" | "ADMIN" | "SUPERADMIN";

export interface ExtendedJWT {
  sub?: string;
  email?: string;
  role?: UserRole;
  isVerified?: boolean;
  provider?: "credentials" | "google" | string;
  [key: string]: unknown;
}

export interface RouteRule {
  readonly path: string;
  readonly roles?: readonly UserRole[];
  readonly requireVerification?: boolean;
}

export type AuditLogLevel = "INFO" | "WARN" | "ERROR";

export interface AuditLogMeta {
  readonly requestId: string;
  readonly pathname: string;
  readonly clientIp?: string;
  readonly userId?: string;
  readonly userRole?: string;
  readonly requiredRoles?: readonly string[];
  readonly error?: string;
  readonly [key: string]: unknown;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Fallback secret resolution prioritizing modern v5 (AUTH_SECRET) and v4 (NEXTAUTH_SECRET) standards. */
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

/** Standard application path targets */
const PATHS = {
  DEFAULT_AUTHENTICATED_REDIRECT: "/dashboard",
  LOGIN: "/login",
  VERIFICATION_PATH: "/verify-otp",
  UNAUTHORIZED: "/403",
  SERVER_ERROR: "/500",
} as const;

/**
 * Role hierarchy levels for permission inheritance.
 * Higher integer values inherit lower level rights.
 */
const ROLE_HIERARCHY: Readonly<Record<UserRole, number>> = Object.freeze({
  USER: 1,
  SUPPORT: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
});

/** Static asset and public bypass prefix targets including web manifests */
const PUBLIC_BYPASS_SET = new Set([
  "/_next",
  "/static",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/manifest.json",
  "/icons",
  "/api/auth",
  "/api/health",
]);

/** Public guest-only route list */
const GUEST_ONLY_ROUTES: readonly string[] = Object.freeze([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

/** Protected route mapping rule registry */
const PROTECTED_RULES: readonly RouteRule[] = Object.freeze([
  { path: "/admin", roles: ["ADMIN", "SUPERADMIN"], requireVerification: true },
  { path: "/dashboard", requireVerification: true },
  { path: "/profile", requireVerification: true },
  { path: "/settings", requireVerification: true },
  { path: "/analytics", requireVerification: true },
  { path: "/garden", requireVerification: true },
  { path: "/goals", requireVerification: true },
  { path: "/history", requireVerification: true },
  { path: "/leaderboard", requireVerification: true },
  { path: "/transactions", requireVerification: true },
  { path: "/wishlist", requireVerification: true },
  { path: "/api/protected", requireVerification: true },
]);

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Normalizes a URL pathname by stripping trailing slashes and coercing to lowercase.
 */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname.toLowerCase();
}

/**
 * Sanitizes and validates callback URLs to strictly prevent Open Redirect vulnerabilities.
 */
function getSafeCallbackUrl(targetUrl: string | null, requestOrigin: string): string | null {
  if (!targetUrl) return null;

  try {
    const decodedUrl = decodeURIComponent(targetUrl).trim();

    // Reject protocol-relative or dangerous backslash bypass URLs
    if (
      decodedUrl.startsWith("//") ||
      decodedUrl.startsWith("/\\") ||
      decodedUrl.startsWith("\\\\") ||
      decodedUrl.includes("\r") ||
      decodedUrl.includes("\n")
    ) {
      return null;
    }

    const parsed = targetUrl.startsWith("/")
      ? new URL(targetUrl, requestOrigin)
      : new URL(targetUrl);

    if (parsed.origin === requestOrigin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Fast-path prefix evaluation for system bypasses and guest routes.
 */
function matchesPrefixSet(pathname: string, prefixes: ReadonlySet<string>): boolean {
  const normalized = normalizePathname(pathname);
  for (const prefix of prefixes) {
    const normPrefix = normalizePathname(prefix);
    if (normalized === normPrefix || normalized.startsWith(`${normPrefix}/`)) {
      return true;
    }
  }
  return false;
}

function matchesPrefixArray(pathname: string, prefixes: readonly string[]): boolean {
  const normalized = normalizePathname(pathname);
  return prefixes.some((prefix) => {
    const normPrefix = normalizePathname(prefix);
    return normalized === normPrefix || normalized.startsWith(`${normPrefix}/`);
  });
}

/**
 * Evaluates route-specific security rules against the current normalized path.
 */
function findMatchingRouteRule(pathname: string): RouteRule | undefined {
  const normalized = normalizePathname(pathname);
  return PROTECTED_RULES.find((rule) => {
    const normRulePath = normalizePathname(rule.path);
    return normalized === normRulePath || normalized.startsWith(`${normRulePath}/`);
  });
}

/**
 * Verifies if a user's role satisfies route role constraints using role hierarchy.
 */
function isRoleAuthorized(userRole: UserRole, requiredRoles?: readonly UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;

  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  return requiredRoles.some((reqRole) => {
    const requiredLevel = ROLE_HIERARCHY[reqRole] ?? Infinity;
    return userLevel >= requiredLevel;
  });
}

/**
 * Edge-compatible structured logging utility.
 */
function logAuditEvent(
  level: AuditLogLevel,
  message: string,
  meta: AuditLogMeta
): void {
  if (process.env.NODE_ENV === "test") return;

  const logData = {
    timestamp: new Date().toISOString(),
    level,
    scope: "EdgeMiddleware",
    message,
    ...meta,
  };

  const formattedLog = JSON.stringify(logData);

  switch (level) {
    case "ERROR":
      console.error(formattedLog);
      break;
    case "WARN":
      console.warn(formattedLog);
      break;
    default:
      console.log(formattedLog);
      break;
  }
}

/**
 * Generates OWASP Compliant Security Headers tailored for Next.js App Router asset loading.
 */
function generateSecurityHeaders(requestId: string): Headers {
  const headers = new Headers();

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `manifest-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join("; ");

  headers.set("Content-Security-Policy", cspHeader);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("x-request-id", requestId);

  return headers;
}

// ============================================================================
// MAIN MIDDLEWARE PIPELINE
// ============================================================================

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const { pathname, searchParams, origin } = req.nextUrl;

  try {
    // 1. Fast-path bypass for static assets and public system endpoints
    if (matchesPrefixSet(pathname, PUBLIC_BYPASS_SET)) {
      return NextResponse.next();
    }

    // 2. Secret Availability Guard
    if (!AUTH_SECRET) {
      logAuditEvent("ERROR", "Missing authentication secret in environment configuration", {
        requestId,
        pathname,
      });

      if (process.env.NODE_ENV === "production") {
        return new NextResponse("Internal Security Error", {
          status: 500,
          headers: generateSecurityHeaders(requestId),
        });
      }
    }

    // 3. Resolve JWT Token from Request
    let token: ExtendedJWT | null = null;
    try {
      token = (await getToken({
        req,
        secret: AUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
      })) as ExtendedJWT | null;
    } catch (error) {
      logAuditEvent("ERROR", "JWT Token resolution exception", {
        requestId,
        pathname,
        error: error instanceof Error ? error.message : "Unknown token error",
      });
    }

    const isAuthenticated = Boolean(token);
    const isGoogleAccount = token?.provider === "google";
    
    // Google OAuth sign-ins default to verified unless explicitly overridden
    const isVerified = token?.isVerified !== undefined ? Boolean(token.isVerified) : isGoogleAccount;
    const userRole: UserRole = token?.role || "USER";

    const isGuestOnlyPath = matchesPrefixArray(pathname, GUEST_ONLY_ROUTES);
    const isVerificationPath = normalizePathname(pathname) === normalizePathname(PATHS.VERIFICATION_PATH);
    const matchedProtectedRule = findMatchingRouteRule(pathname);
    const isProtectedPath = Boolean(matchedProtectedRule);

    // Initialize downstream context headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    if (isAuthenticated) {
      requestHeaders.set("x-user-id", token?.sub || "");
      requestHeaders.set("x-user-role", userRole);
      requestHeaders.set("x-user-verified", String(isVerified));
    }

    /** Helper to construct response with full security headers */
    const createRedirectResponse = (url: URL): NextResponse => {
      const response = NextResponse.redirect(url);
      const securityHeaders = generateSecurityHeaders(requestId);
      securityHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    };

    // 4. RULE A: Unauthenticated access to protected route -> Redirect to Login
    if (isProtectedPath && !isAuthenticated) {
      logAuditEvent("WARN", "Unauthorized access attempt blocked", {
        requestId,
        pathname,
        clientIp: req.headers.get("x-forwarded-for") || "unknown",
      });

      const loginUrl = new URL(PATHS.LOGIN, req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);

      return createRedirectResponse(loginUrl);
    }

    // 5. RULE B: Unverified authenticated access to protected route -> Redirect to OTP
    if (
      isAuthenticated &&
      !isVerified &&
      matchedProtectedRule?.requireVerification &&
      !isVerificationPath
    ) {
      logAuditEvent("INFO", "Unverified user redirected to OTP verification page", {
        requestId,
        pathname,
        userId: token?.sub,
      });

      const verifyUrl = new URL(PATHS.VERIFICATION_PATH, req.url);
      if (token?.email) {
        verifyUrl.searchParams.set("email", token.email);
      }

      return createRedirectResponse(verifyUrl);
    }

    // 6. RULE C: Verified authenticated access to OTP path -> Redirect to Dashboard
    if (isAuthenticated && isVerified && isVerificationPath) {
      const dashboardUrl = new URL(PATHS.DEFAULT_AUTHENTICATED_REDIRECT, req.url);
      return createRedirectResponse(dashboardUrl);
    }

    // 7. RULE D: Role-Based Access Control Evaluation
    if (isAuthenticated && matchedProtectedRule?.roles) {
      const hasRequiredRole = isRoleAuthorized(userRole, matchedProtectedRule.roles);

      if (!hasRequiredRole) {
        logAuditEvent("WARN", "Forbidden role access attempt blocked", {
          requestId,
          pathname,
          userId: token?.sub,
          userRole,
          requiredRoles: matchedProtectedRule.roles,
        });

        const unauthorizedUrl = new URL(PATHS.UNAUTHORIZED, req.url);
        return createRedirectResponse(unauthorizedUrl);
      }
    }

    // 8. RULE E: Authenticated access to Guest-Only route -> Redirect to Dashboard / Safe Callback
    if (isGuestOnlyPath && isAuthenticated) {
      logAuditEvent("INFO", "Authenticated user redirected away from guest route", {
        requestId,
        pathname,
        userId: token?.sub,
      });

      const requestedCallback = searchParams.get("callbackUrl");
      const safeCallback = getSafeCallbackUrl(requestedCallback, origin);

      let redirectUrl: URL;
      if (!isVerified) {
        redirectUrl = new URL(PATHS.VERIFICATION_PATH, req.url);
        if (token?.email) {
          redirectUrl.searchParams.set("email", token.email);
        }
      } else {
        redirectUrl = new URL(safeCallback || PATHS.DEFAULT_AUTHENTICATED_REDIRECT, req.url);
      }

      return createRedirectResponse(redirectUrl);
    }

    // 9. Proceed with injected context headers and security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    const securityHeaders = generateSecurityHeaders(requestId);
    securityHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (fatalError: unknown) {
    const errMessage = fatalError instanceof Error ? fatalError.message : "Fatal Edge Failure";
    logAuditEvent("ERROR", "Unhandled exception in Edge middleware pipeline", {
      requestId,
      pathname,
      error: errMessage,
    });

    return new NextResponse("Internal Security Error", {
      status: 500,
      headers: generateSecurityHeaders(requestId),
    });
  }
}

// ============================================================================
// EDGE MATCHING CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico & icons
     * - manifest.webmanifest & manifest.json
     * - public image assets (.png, .svg, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|manifest\\.json|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};