import { NextResponse } from "next/server";

const AUTH_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "frame-ancestors 'none'",
} as const;

export function authJsonResponse(
  body: Record<string, unknown>,
  status: number,
  extraHeaders?: Record<string, string>
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { ...AUTH_CACHE_HEADERS, ...extraHeaders },
  });
}

export function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;
  const record = payload as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  if (typeof record.error === "string" && record.error.trim()) return record.error;
  return fallback;
}
