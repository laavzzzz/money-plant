/**
 * @fileoverview Enterprise Security, RBAC & Access Control Middleware
 * @description Edge-compatible Next.js middleware handling JWT verification, account
 * verification state enforcement, role-based access control (RBAC), open redirect prevention,
 * strict CSP nonce generation, security headers, and audit telemetry.
 * 
 * @module middleware
 * @version 3.0.0
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

export type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | "SUPPORT";

export interface ExtendedJWT {
  sub?: string;
  email?: string;
  role?: UserRole;
  isVerified?: boolean;
  [key: string]: unknown;
}

export interface RouteRule {
  path: string;
  roles?: UserRole[];
  requireVerification?: boolean;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/**
 * Fallback secret resolution prioritizing modern NextAuth v5 (AUTH_SECRET)
 * and v4 (NEXTAUTH_SECRET) standards.
 */
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

/** Standard application path targets */
const PATHS = {
  DEFAULT_AUTHENTICATED_REDIRECT: "/dashboard",
  LOGIN: "/login",
  VERIFICATION_PATH: "/verify-otp",
  UNAUTHORIZED: "/403",
  SERVER_ERROR: "/500",
} as const;

/**
 * Route Classification Rules & Access Constraints
 */
const ROUTE_RULES = {
  /** Routes accessible ONLY to unauthenticated users */
  GUEST_ONLY: ["/login", "/register", "/forgot-password", "/reset-password"],

  /** Verification path for unverified authenticated users */
  VERIFICATION_PATH: "/verify-otp",

  /** Protected routes with explicit Role-Based Access Control (RBAC) constraints */
  PROTECTED_RULES: [
    { path: "/admin", roles: ["ADMIN", "SUPERADMIN"], requireVerification: true },
    { path: "/dashboard", requireVerification: true },
    { path: "/profile", requireVerification: true },
    { path: "/settings", requireVerification: true },
    { path: "/api/protected", requireVerification: true },
  ] as RouteRule[],

  /** Static asset and public system bypass paths */
  PUBLIC_BYPASS_PREFIXES: [
    "/_next",
    "/static",
    "/favicon.ico",
    "/api/auth",
    "/api/health",
  ],
} as const;

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Edge-compatible structured logging utility.
 */
function logAuditEvent(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  meta: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "test") return;

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    scope: "EdgeMiddleware",
    message,
    ...meta,
  };

  if (level === "ERROR") {
    console.error(JSON.stringify(logData));
  } else if (level === "WARN") {
    console.warn(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
}

/**
 * Sanitizes and validates callback URLs to strictly prevent Open Redirect vulnerabilities.
 * Disallows protocol-relative URLs (e.g. //evil.com) and off-origin redirects.
 */
function getSafeCallbackUrl(targetUrl: string | null, requestOrigin: string): string | null {
  if (!targetUrl) return null;

  // Reject protocol-relative URLs immediately
  if (targetUrl.startsWith("//") || targetUrl.startsWith("/\\")) {
    return null;
  }

  try {
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
 * Determines whether a given pathname matches any prefix in a target array.
 */
function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Evaluates route-specific security rules against current path.
 */
function findMatchingRouteRule(pathname: string): RouteRule | undefined {
  return ROUTE_RULES.PROTECTED_RULES.find(
    (rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`)
  );
}

/**
 * Generates OWASP L3 Compliant Security Headers with Dynamic CSP Nonce.
 */
function generateSecurityHeaders(nonce: string, requestId: string): Headers {
  const headers = new Headers();

  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join("; ");

  headers.set("Content-Security-Policy", cspHeader);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  headers.set("x-request-id", requestId);
  headers.set("x-nonce", nonce);

  return headers;
}

// ============================================================================
// MAIN MIDDLEWARE PIPELINE
// ============================================================================

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = req.nextUrl;
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 1. Bypass static assets and system routes
  if (matchesPrefix(pathname, ROUTE_RULES.PUBLIC_BYPASS_PREFIXES)) {
    return NextResponse.next();
  }

  // 2. Validate Auth Secret Availability
  if (!AUTH_SECRET) {
    logAuditEvent("ERROR", "Missing authentication secret in environment configuration", {
      requestId,
      pathname,
    });

    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Internal Security Error", {
        status: 500,
        headers: generateSecurityHeaders(nonce, requestId),
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
  const isVerified = Boolean(token?.isVerified);
  const userRole = token?.role || "USER";

  const isGuestOnlyPath = matchesPrefix(pathname, ROUTE_RULES.GUEST_ONLY);
  const isVerificationPath = pathname === ROUTE_RULES.VERIFICATION_PATH;
  const matchedProtectedRule = findMatchingRouteRule(pathname);
  const isProtectedPath = Boolean(matchedProtectedRule);

  // Initialize downstream request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-nonce", nonce);

  if (isAuthenticated) {
    requestHeaders.set("x-user-id", token?.sub || "");
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-user-verified", String(isVerified));
  }

  // 4. RULE A: Protected Route Guard (Unauthenticated -> Login)
  if (isProtectedPath && !isAuthenticated) {
    logAuditEvent("WARN", "Unauthorized access attempt blocked", {
      requestId,
      pathname,
      clientIp: req.headers.get("x-forwarded-for") || "unknown",
    });

    const loginUrl = new URL(PATHS.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);

    return NextResponse.redirect(loginUrl, {
      headers: generateSecurityHeaders(nonce, requestId),
    });
  }

  // 5. RULE B: Unverified Account Guard (Authenticated + Unverified -> Verify OTP)
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
      verifyUrl.searchParams.set("email", encodeURIComponent(token.email));
    }

    return NextResponse.redirect(verifyUrl, {
      headers: generateSecurityHeaders(nonce, requestId),
    });
  }

  // 6. RULE C: Already Verified Redirect away from /verify-otp
  if (isAuthenticated && isVerified && isVerificationPath) {
    const dashboardUrl = new URL(PATHS.DEFAULT_AUTHENTICATED_REDIRECT, req.url);
    return NextResponse.redirect(dashboardUrl, {
      headers: generateSecurityHeaders(nonce, requestId),
    });
  }

  // 7. RULE D: Role-Based Access Control (RBAC Verification)
  if (isAuthenticated && matchedProtectedRule?.roles) {
    const hasRequiredRole = matchedProtectedRule.roles.includes(userRole);

    if (!hasRequiredRole) {
      logAuditEvent("WARN", "Forbidden role access attempt blocked", {
        requestId,
        pathname,
        userId: token?.sub,
        userRole,
        requiredRoles: matchedProtectedRule.roles,
      });

      const unauthorizedUrl = new URL(PATHS.UNAUTHORIZED, req.url);
      return NextResponse.redirect(unauthorizedUrl, {
        headers: generateSecurityHeaders(nonce, requestId),
      });
    }
  }

  // 8. RULE E: Guest-Only Route Guard (Authenticated -> App Dashboard or Safe Callback)
  if (isGuestOnlyPath && isAuthenticated) {
    logAuditEvent("INFO", "Authenticated user redirected away from guest route", {
      requestId,
      pathname,
      userId: token?.sub,
    });

    const requestedCallback = searchParams.get("callbackUrl");
    const safeCallback = getSafeCallbackUrl(requestedCallback, req.nextUrl.origin);

    const targetPath = !isVerified
      ? `${PATHS.VERIFICATION_PATH}?email=${encodeURIComponent(token?.email || "")}`
      : safeCallback || PATHS.DEFAULT_AUTHENTICATED_REDIRECT;

    const redirectUrl = new URL(targetPath, req.url);

    return NextResponse.redirect(redirectUrl, {
      headers: generateSecurityHeaders(nonce, requestId),
    });
  }

  // 9. Proceed Request with Injected Context and Security Headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const securityHeaders = generateSecurityHeaders(nonce, requestId);
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
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
     * - favicon.ico (favicon file)
     * - public assets (.png, .svg, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};