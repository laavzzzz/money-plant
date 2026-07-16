import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { formatSnapshotForPrompt, type FinanceSnapshot } from "@/lib/vibe-check";

export const runtime = "edge";
export const maxDuration = 30;

type ChatMessage = { role: string; content: string };

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
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

    // Filter and map incoming messages to Gemini Content schema
    // Note: Gemini API requires 'model' instead of 'assistant'
    const chatMessages: Content[] = (messages ?? [])
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

    // Initialize the official Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    // Request stream directly from Gemini
    const resultStream = await model.generateContentStream({
      contents: chatMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    // Pipe the response stream chunk-by-chunk back to your VibeCheck front-end
    const encoder = new TextEncoder();
    const customReadableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
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
          "VibeCheck AI hit a brief snag in the Gemini system. Check your API key and try again in a moment.",
      },
      { status: 500 }
    );
  }
}