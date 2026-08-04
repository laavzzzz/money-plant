import NextAuth from "next-auth";
import { authOptions } from "./options";
import { NextRequest, NextResponse } from "next/server";

/**
 * Interface representing the asynchronous Route Context for Next.js 15 App Router.
 * In Next.js 15, dynamic route parameters are delivered as an asynchronous Promise.
 */
interface DynamicRouteContext {
  params: Promise<{
    nextauth?: string[];
  }>;
}

/**
 * Singleton NextAuth Route Handler Initialization.
 * Initializing outside the request pipeline prevents re-instantiation per invocation.
 */
const nextAuthHandler = NextAuth(authOptions);

/**
 * Safely parses and sanitizes the target NextAuth endpoint action for telemetry logging.
 * Prevents Log Injection vulnerabilities and avoids logging sensitive tokens or secrets.
 * 
 * @param url - The full incoming request URL string.
 * @returns Sanitized endpoint action string.
 */
function extractSanitizedEndpoint(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    const authIdx = pathSegments.indexOf("auth");

    if (authIdx !== -1 && pathSegments[authIdx + 1]) {
      const rawEndpoint = pathSegments[authIdx + 1];
      // Strip any non-alphanumeric characters to prevent log injection exploits
      return rawEndpoint.replace(/[^a-zA-Z0-9_-]/g, "");
    }
    return "session";
  } catch {
    return "unknown";
  }
}

/**
 * Enterprise Execution Pipeline for Next.js 15 NextAuth dynamic routing.
 * 
 * Guarantees compliance with Next.js 15 async dynamic route params while ensuring
 * unbuffered response streaming, complete Set-Cookie header propagation, and zero token leakage.
 * 
 * @param req - The incoming Web API NextRequest.
 * @param context - The dynamic route context housing async params.
 * @returns Web API Standard Response object.
 */
async function handleAuthPipeline(
  req: NextRequest,
  context: DynamicRouteContext
): Promise<Response> {
  const startTime = performance.now();
  const endpoint = extractSanitizedEndpoint(req.url);

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[NEXTAUTH_PIPELINE] 🔄 Dispatching ${req.method} -> /api/auth/${endpoint}`
    );
  }

  try {
    // 1. Next.js 15 Compliance: Explicitly await asynchronous route parameters
    const resolvedParams = await context.params;

    // 2. Delegate directly to NextAuth native engine, passing resolved route params context
    const response = await nextAuthHandler(req, {
      params: resolvedParams,
    });

    // 3. Telemetry log duration for performance monitoring
    if (process.env.NODE_ENV !== "production") {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(
        `[NEXTAUTH_PIPELINE] ✅ Completed ${req.method} -> /api/auth/${endpoint} (${response.status}) in ${duration}ms`
      );
    }

    // 4. Return native Web Response directly to maintain stream headers and exact Set-Cookie directives
    return response;
  } catch (error: unknown) {
    const err = error as Error;

    console.error(
      `[NEXTAUTH_CRITICAL_ERROR] Exception caught in auth pipeline [/api/auth/${endpoint}]:`,
      {
        name: err?.name || "UnhandledError",
        message: err?.message || "An unexpected error occurred in the execution pipeline.",
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      }
    );

    // Standard security fail-safe response with strict security headers
    return NextResponse.json(
      {
        error: "Internal Authentication Error",
        message:
          process.env.NODE_ENV === "development"
            ? err?.message
            : "An unexpected error occurred during authentication processing.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Content-Security-Policy": "frame-ancestors 'none'",
          "X-Auth-Pipeline-Error": "true",
        },
      }
    );
  }
}

/**
 * Next.js App Router Standard HTTP Verb Method Exports
 */
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