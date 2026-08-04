import { formatSnapshotForPrompt, type FinanceSnapshot } from "@/lib/vibe-check";

/**
 * Edge Runtime Configuration
 * Optimized for low latency stream proxying near client regions.
 */
export const runtime = "edge";
export const maxDuration = 30;

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_TIMEOUT_MS = 25000;
const MAX_MESSAGES_COUNT = 50;
const MAX_CONTENT_LENGTH = 4000;

// Standardized HTTP Headers for Secure Streaming
const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-transform, private",
  "X-Content-Type-Options": "nosniff",
  "Connection": "keep-alive",
} as const;

// ============================================================================
// TYPE DEFINITIONS & DOMAIN SCHEMAS
// ============================================================================

type SupportedRole = "user" | "assistant";

export interface IncomingChatMessage {
  role: SupportedRole | string;
  content: string;
}

export interface RequestPayload {
  messages?: IncomingChatMessage[];
  context?: FinanceSnapshot;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiStreamCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
    role?: string;
  };
  finishReason?: string;
}

interface GeminiStreamChunk {
  candidates?: GeminiStreamCandidate[];
  promptFeedback?: Record<string, unknown>;
}

// ============================================================================
// UTILITY FUNCTIONS & BUILDERS
// ============================================================================

/**
 * Builds the customized system prompt combining Gen Z tone, app context, and theme.
 */
function buildSystemInstruction(context?: FinanceSnapshot): string {
  const contextBlock = context
    ? formatSnapshotForPrompt(context)
    : "No live financial data synchronized yet — user may be on a public landing page.";

  return `You are "VibeCheck AI" 🪴, the ultra-smart, zero-filter AI financial companion inside the MoneyPlant app.

THEME WORKSPACE ACCENT:
You operate inside a clean, high-contrast light-mode workspace. Keep the energy bright, clear, and highly visible. Use sunny and refreshing references (like "clear sunlit portfolios," "clean workspace panels," "emerald garden metrics," and "crisp ledger layouts") instead of dark, neon, or shadowy aesthetics.

PERSONALITY & TONE:
- Friendly, concise, authentic, and brutally honest about spending habits.
- Seamlessly blend professional financial insight with natural Gen Z slang (e.g., 'no cap', 'real', 'slay', 'main character energy', 'vibes', 'ate and left no crumbs', 'fr fr').
- Always use the Indian Rupee symbol (₹) for currency values.
- Keep answers ultra-concise (2–4 sentences) unless explicitly asked for deep breakdowns.

YOUR JOB:
1. Answer questions about THIS user's profile, income, expenses, savings, categories, streak, and plant stage using ONLY the live data below.
2. Help them navigate the app. When relevant, name exact page paths like "Open Transactions at /dashboard/transactions."
3. Give actionable money advice based on their numbers (safe to spend, overspending categories, streak motivation).
4. If they have no transactions, encourage logging their first entry at /dashboard/transactions.

RULES:
- Never invent transactions, balances, or user metrics not in the data.
- If asked about topics outside finance or this app, briefly redirect back to money, profile, or app navigation.
- For navigation, strictly prefer valid application routes.
- Do not output markdown tables unless explicitly requested.

LIVE USER DATA:
${contextBlock}`;
}

/**
 * Validates and transforms incoming chat messages into official Gemini API payload format.
 */
function sanitizeAndFormatMessages(rawMessages: unknown): GeminiContent[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .slice(-MAX_MESSAGES_COUNT)
    .filter((m): m is IncomingChatMessage => {
      return (
        typeof m === "object" &&
        m !== null &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        (m.role === "user" || m.role === "assistant")
      );
    })
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.trim().slice(0, MAX_CONTENT_LENGTH) }],
    }));
}

/**
 * Generates structured JSON responses for API error scenarios.
 */
function createErrorResponse(
  error: string,
  message: string,
  status: number
): Response {
  return Response.json(
    {
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Creates a TransformStream that parses SSE chunks safely and outputs continuous plain text.
 */
function createGeminiTransformStream(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });

      // Split lines based on standard SSE boundary formatting
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // Save unfinished fragment to buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(":")) continue; // Skip comments/empty lines

        // Handle SSE data payloads
        let jsonStr = trimmedLine;
        if (trimmedLine.startsWith("data:")) {
          jsonStr = trimmedLine.slice(5).trim();
        }

        // Clean trailing comma if array stream structure is returned
        if (jsonStr.startsWith(",")) jsonStr = jsonStr.slice(1).trim();
        if (jsonStr === "[" || jsonStr === "]") continue;

        try {
          const parsed: GeminiStreamChunk = JSON.parse(jsonStr);
          const candidate = parsed.candidates?.[0];
          const textChunk = candidate?.content?.parts?.[0]?.text;

          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
        } catch {
          // Ignore incomplete JSON buffers until next chunk arrives
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        let jsonStr = buffer.trim();
        if (jsonStr.startsWith("data:")) jsonStr = jsonStr.slice(5).trim();
        if (jsonStr.startsWith(",")) jsonStr = jsonStr.slice(1).trim();

        try {
          const parsed: GeminiStreamChunk = JSON.parse(jsonStr);
          const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
        } catch {
          // Final buffer cleanup
        }
      }
    },
  });
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. API Key Guard Verification
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return createErrorResponse(
        "missing_api_key",
        "Add GEMINI_API_KEY to .env.local to enable VibeCheck AI in your workspace.",
        503
      );
    }

    // 2. Request Body Parsing & Payload Validation
    let body: RequestPayload;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse(
        "invalid_json",
        "The request body must be a valid JSON object.",
        400
      );
    }

    const { messages, context } = body;
    const chatMessages = sanitizeAndFormatMessages(messages);

    if (chatMessages.length === 0) {
      return createErrorResponse(
        "no_messages",
        "Provide at least one valid message to start the conversation.",
        400
      );
    }

    // 3. System Prompt & Payload Construction
    const systemPrompt = buildSystemInstruction(context);
    const geminiPayload = {
      contents: chatMessages,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
      },
    };

    // 4. Setup Timeout & Abort Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    // Relays client disconnect signal to Gemini upstream fetch
    if (req.signal) {
      req.signal.addEventListener("abort", () => controller.abort());
    }

    // 5. Upstream Gemini API Execution
    const upstreamUrl = `${GEMINI_API_BASE_URL}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
    
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error(`Upstream Gemini API error (${upstreamResponse.status}):`, errorText);

      return Response.json(
        {
          status: upstreamResponse.status,
          error: errorText,
        },
        {
          status: upstreamResponse.status,
        }
      );
    }

    if (!upstreamResponse.body) {
      return createErrorResponse(
        "empty_stream",
        "No streamable response body received from upstream AI engine.",
        500
      );
    }

    // 6. Pipe Upstream Stream through Stream Transformer
    const transformedStream = upstreamResponse.body.pipeThrough(
      createGeminiTransformStream()
    );

    // 7. Return Clean SSE Stream Response
    return new Response(transformedStream, {
      headers: STREAM_HEADERS,
      status: 200,
    });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return createErrorResponse(
        "request_timeout",
        "The request to VibeCheck AI timed out.",
        540
      );
    }

    console.error("VIBECHECK_AI_ROUTE_ERROR:", error);

    return createErrorResponse(
      "ai_failed",
      "VibeCheck AI encountered an unexpected operational failure.",
      500
    );
  }
}