/**
 * @file app/api/auth/[...nextauth]/route.ts
 * @module AuthRouteHandler
 * @description Enterprise-grade NextAuth Route Handler for Next.js 15 App Router.
 * Implements async params resolution, zero-leak telemetry logging, strict security header enforcement,
 * and robust fail-safe error boundaries.
 * 
 * @version 3.1.0
 */

import NextAuth from "next-auth";
import { authOptions } from "./options";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

/**
 * Async dynamic route parameters context compliant with Next.js 15 App Router specifications.
 */
export interface DynamicRouteContext {
  params: Promise<{
    nextauth?: string[];
  }>;
}

/** Supported NextAuth Endpoint Actions */
export type NextAuthAction =
  | "signin"
  | "signout"
  | "callback"
  | "csrf"
  | "session"
  | "providers"
  | "verify-request"
  | "error"
  | "unknown";

/** Structured Audit Telemetry Payload */
export interface AuthTelemetryPayload {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  method: string;
  endpoint: NextAuthAction;
  status?: number;
  durationMs?: number;
  requestId?: string;
  errorName?: string;
  errorMessage?: string;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Allowed explicit NextAuth action targets for sanitization */
const ALLOWED_NEXTAUTH_ACTIONS: ReadonlySet<string> = new Set([
  "signin",
  "signout",
  "callback",
  "csrf",
  "session",
  "providers",
  "verify-request",
  "error",
]);

/**
 * Singleton NextAuth Route Handler initialization.
 * Initializing once at module load time avoids per-request initialization overhead.
 */
const nextAuthHandler = NextAuth(authOptions);

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Safely extracts and sanitizes the target NextAuth action endpoint from the incoming URL.
 * Prevents log injection exploits and sanitizes sensitive path segments.
 * 
 * @param url - The full request URL string.
 * @returns Validated NextAuthAction string.
 */
function extractSanitizedEndpoint(url: string): NextAuthAction {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const authIdx = pathSegments.indexOf("auth");

    if (authIdx !== -1 && pathSegments[authIdx + 1]) {
      const rawEndpoint = pathSegments[authIdx + 1].toLowerCase().trim();
      const sanitized = rawEndpoint.replace(/[^a-z0-9_-]/g, "");
      
      if (ALLOWED_NEXTAUTH_ACTIONS.has(sanitized)) {
        return sanitized as NextAuthAction;
      }
    }
    return "session";
  } catch {
    return "unknown";
  }
}

/**
 * Structured audit logging function for authentication telemetry.
 */
function logAuthTelemetry(payload: AuthTelemetryPayload): void {
  if (process.env.NODE_ENV === "test") return;

  const formattedLog = JSON.stringify({
    scope: "NextAuthPipeline",
    ...payload,
  });

  if (payload.level === "ERROR") {
    console.error(formattedLog);
  } else if (payload.level === "WARN") {
    console.warn(formattedLog);
  } else if (process.env.NODE_ENV !== "production") {
    console.log(formattedLog);
  }
}

/**
 * Applies strict security and cache-control headers onto outgoing authentication responses.
 * 
 * @param headers - Mutable Headers object to apply security policies to.
 */
function applySecurityHeaders(headers: Headers): void {
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Content-Security-Policy", "frame-ancestors 'none'");
}

// ============================================================================
// MAIN PIPELINE HANDLER
// ============================================================================

/**
 * Enterprise Execution Pipeline for Next.js 15 NextAuth dynamic routing.
 * Delegates execution to NextAuth while guaranteeing compliance with async route params,
 * preserving cookie headers, and generating structured telemetry logs.
 * 
 * @param req - Web API NextRequest.
 * @param context - Dynamic route context housing async params.
 * @returns Web API Standard Response object.
 */
async function handleAuthPipeline(
  req: NextRequest,
  context: DynamicRouteContext
): Promise<Response> {
  const startTime = performance.now();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const endpoint = extractSanitizedEndpoint(req.url);

  logAuthTelemetry({
    timestamp: new Date().toISOString(),
    level: "INFO",
    method: req.method,
    endpoint,
    requestId,
  });

  try {
    // 1. Next.js 15 Compliance: Explicitly await asynchronous route parameters
    const resolvedParams = await context.params;

    // 2. Delegate to NextAuth native handler passing resolved route parameters
    const response = await nextAuthHandler(req, {
      params: resolvedParams,
    });

    // 3. Ensure essential security and anti-caching headers exist on successful responses
    applySecurityHeaders(response.headers);

    // 4. Record telemetry duration
    const durationMs = Number((performance.now() - startTime).toFixed(2));
    logAuthTelemetry({
      timestamp: new Date().toISOString(),
      level: "INFO",
      method: req.method,
      endpoint,
      status: response.status,
      durationMs,
      requestId,
    });

    return response;
  } catch (error: unknown) {
    const durationMs = Number((performance.now() - startTime).toFixed(2));
    const err = error as Error;

    logAuthTelemetry({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      method: req.method,
      endpoint,
      durationMs,
      requestId,
      errorName: err?.name || "UnhandledAuthError",
      errorMessage: err?.message || "An unexpected error occurred in the execution pipeline.",
    });

    // Construct security-hardened fail-safe response
    const errorResponse = NextResponse.json(
      {
        error: "Internal Authentication Error",
        message:
          process.env.NODE_ENV === "development"
            ? err?.message
            : "An unexpected error occurred during authentication processing.",
        requestId,
      },
      {
        status: 500,
      }
    );

    applySecurityHeaders(errorResponse.headers);
    errorResponse.headers.set("X-Auth-Pipeline-Error", "true");

    return errorResponse;
  }
}

// ============================================================================
// ROUTE HANDLER EXPORTS
// ============================================================================

export async function GET(
  req: NextRequest,
  context: DynamicRouteContext
): Promise<Response> {
  return handleAuthPipeline(req, context);
}

export async function POST(
  req: NextRequest,
  context: DynamicRouteContext
): Promise<Response> {
  return handleAuthPipeline(req, context);
}