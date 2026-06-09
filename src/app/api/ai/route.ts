import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { formatSnapshotForPrompt, type FinanceSnapshot } from "@/lib/vibe-check";

export const runtime = "edge";
export const maxDuration = 30;

type ChatMessage = { role: string; content: string };

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error: "missing_api_key",
          message:
            "Add OPENAI_API_KEY to .env.local to enable VibeCheck AI.",
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
      : "No live financial data — user may be on a public page.";

    const systemPrompt = `You are "VibeCheck AI", the AI financial companion inside the MoneyPlant app.

PERSONALITY:
- Friendly, concise, professional, and easy to understand.
- Supportive and honest about spending. Use ₹ for money.
- Keep answers concise (2–4 sentences) unless the user asks for detail.

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

    const chatMessages = (messages ?? [])
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.trim(),
      }));

    if (chatMessages.length === 0) {
      return Response.json(
        { error: "no_messages", message: "Send a message to start the chat." },
        { status: 400 }
      );
    }

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: chatMessages,
      temperature: 0.7,
      maxOutputTokens: 600,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("VIBECHECK_API_ERROR:", error);
    return Response.json(
      {
        error: "ai_failed",
        message:
          "VibeCheck AI hit a snag. Check your API key and try again in a moment.",
      },
      { status: 500 }
    );
  }
}
