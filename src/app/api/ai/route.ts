import { formatSnapshotForPrompt, type FinanceSnapshot } from "@/lib/vibe-check";

export const runtime = "edge";
export const maxDuration = 30;

type ChatMessage = { role: string; content: string };

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: "missing_api_key",
          message:
            "Add GEMINI_API_KEY to .env.local to enable VibeCheck AI in your workspace.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages, context } = body as {
      messages?: ChatMessage[];
      context?: FinanceSnapshot;
    };

    const contextBlock = context
      ? formatSnapshotForPrompt(context)
      : "No live financial data synchronized yet — user may be on a public landing page.";

    // Styled system instructions matching the premium light theme
    const systemPrompt = `You are "VibeCheck AI" 🪴, the ultra-smart, zero-filter AI financial companion inside the MoneyPlant app.

THEME WORKSPACE ACCENT:
You operate inside a clean, high-contrast light-mode workspace. Keep the energy bright, clear, and highly visible. Use sunny and refreshing references (like "clear sunlit portfolios," "clean workspace panels," "emerald garden metrics," and "crisp ledger layouts") instead of dark, neon, or shadowy aesthetics.

PERSONALITY:
- Friendly, concise, professional, and easy to understand.
- Supportive, deeply authentic, and brutally honest about spending habits. Use ₹ for all currency values.
- Keep answers ultra-concise (2–4 sentences) unless the user specifically asks for detailed breakdowns.

YOUR JOB:
1. Answer questions about THIS user's profile, income, expenses, savings, categories, streak, and plant stage using ONLY the live data below.
2. Help them navigate the app. When relevant, name the page and path, such as "Open Transactions at /dashboard/transactions."
3. Give actionable money advice based on their numbers (safe to spend, overspending categories, streak motivation).
4. If they have no transactions, encourage adding their first log at /dashboard/transactions.

RULES:
- Never invent transactions or amounts not in the data.
- If asked something outside finance or this app, briefly redirect to money/profile/nav help.
- For navigation, prefer exact paths from APP NAVIGATION.
- Do not use markdown tables unless the user asks.

LIVE USER DATA:
${contextBlock}`;

    // Map message history cleanly into the raw Gemini JSON API format
    const chatMessages: GeminiContent[] = (messages ?? [])
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.trim() }],
      }));

    if (chatMessages.length === 0) {
      return Response.json(
        { error: "no_messages", message: "Send a message to start the chat." },
        { status: 400 }
      );
    }

    // Hit the official Google Gemini Server SSE endpoint directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: chatMessages,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("Gemini API HTTP Error:", errorText);
      throw new Error(`Gemini server responded with status ${response.status}`);
    }

    // Stream transformation parsing the incoming text/event-stream down to clean client fragments
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    
    let buffer = "";

    const customReadableStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Look for standard SSE or stream chunk arrays returned by Gemini
            // Gemini streams return arrays or chunks wrapped in structures like `,\n{ ... }` or `[ ... ]`
            let match;
            while ((match = buffer.match(/("text"\s*:\s*"([^"\\]|\\.)*")/g))) {
              // Extract text cleanly by locating actual candidate values out of tokens
              const firstMatch = match[0];
              const textValue = JSON.parse(`{${firstMatch}}`).text;
              
              if (textValue) {
                controller.enqueue(encoder.encode(textValue));
              }
              
              // Evict processed text matching segment from our buffer safely
              const index = buffer.indexOf(firstMatch);
              buffer = buffer.substring(index + firstMatch.length);
            }
          }
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(customReadableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("VIBECHECK_API_ERROR:", error);
    return Response.json(
      {
        error: "ai_failed",
        message:
          "VibeCheck AI hit a brief snag in the direct Gemini link. Check your API key and try again in a moment.",
      },
      { status: 500 }
    );
  }
}