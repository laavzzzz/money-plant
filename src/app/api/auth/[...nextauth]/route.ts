import NextAuth from "next-auth";
import { authOptions } from "./options";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ nextauth: string[] }> | { nextauth: string[] };
}

/**
 * Advanced Execution Wrapper for NextAuth initialization.
 * Intercepts incoming HTTP requests to handle structured logging,
 * telemetry diagnostics, and production runtime error tracking.
 */
const authHandler = async (
  req: NextRequest,
  ctx: RouteContext
): Promise<Response> => {
  const { method, url } = req;
  
  // Clean extraction of active endpoint for high-signal telemetric monitoring
  const urlSegments = url.split("/api/auth/");
  const activeEndpoint = urlSegments[1] ? urlSegments[1].split("?")[0] : "session";

  console.log(
    `[NEXTAUTH_ENGINE_LOG] 🔄 Intercepting standard ${method} request routing down to: /api/auth/${activeEndpoint}`
  );

  try {
    // Pass standard Web Request and Route context safely to NextAuth engine
    const response = await NextAuth(authOptions)(req, ctx);
    
    // Ensure NextAuth returned a valid web Response element before passing downstream
    if (!(response instanceof Response)) {
      return new Response(response);
    }
    
    return response;
  } catch (error: any) {
    console.error(
      `[CRITICAL_AUTH_ROUTER_CRASH]: Security verification pipeline encountered an unhandled exception block:`,
      error
    );

    // Standardized fail-safe fallback payload preventing structural system state leaks
    return new Response(
      JSON.stringify({
        error: "Internal Authentication Pipeline Failure",
        details: error?.message || "Unknown routing anomaly context.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Pipeline-Error": "true",
        },
      }
    );
  }
};

// Export explicit Next.js App Router HTTP protocol verbs
export { authHandler as GET, authHandler as POST };