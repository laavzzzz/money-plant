import NextAuth from "next-auth";
import { authOptions } from "./options";
import { NextRequest } from "next/server";

/**
 * Advanced Execution Wrapper for NextAuth initialization.
 * This wrapper intercepts incoming HTTP requests to handle logging,
 * telemetry diagnostics, and runtime error tracking.
 */
const authHandler = async (req: NextRequest, ctx: { params: any }) => {
  // 1. Production Diagnostics Tracking Logger
  const { method, url } = req;
  const urlSegments = url.split("/api/auth/");
  const activeEndpoint = urlSegments[1] ? urlSegments[1].split("?")[0] : "session";

  console.log(
    `[NEXTAUTH_ENGINE_LOG] 🔄 Intercepting standard ${method} request routing down to: /api/auth/${activeEndpoint}`
  );

  try {
    // 2. Pass execution context and dynamic parameters down to NextAuth core runtime
    return await NextAuth(authOptions)(req, ctx);
  } catch (error: any) {
    console.error(
      `[CRITICAL_AUTH_ROUTER_CRASH]: Security verification pipeline encountered an unhandled exception block:`,
      error
    );
    
    // Provide a standardized error traceback fallback payload
    return new Response(
      JSON.stringify({
        error: "Internal Authentication Pipeline Failure",
        details: error?.message || "Unknown routing anomaly context."
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};

// 3. Export the unified handler under explicit HTTP protocol verbs
export { authHandler as GET, authHandler as POST };