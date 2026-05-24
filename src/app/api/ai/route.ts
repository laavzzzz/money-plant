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
            "Add OPENAI_API_KEY to .env.local to enable VibeCheck AI. Get a key at platform.openai.com",
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

    const systemPrompt = `You are "VibeCheck", the AI financial companion inside the MoneyPlant app.

PERSONALITY:
- Gen-Z friendly (bread, stacks, W/L, vibe check) but clear and helpful.
- Supportive and honest about spending. Use ₹ for money.
- Keep answers concise (2–4 sentences) unless the user asks for detail.

YOUR JOB:
1. Answer questions about THIS user's profile, income, expenses, savings, categories, streak, and plant stage using ONLY the live data below.
2. Help them navigate the app — when relevant, name the page and path (e.g. "Head to History at /transactions to log spending").
3. Give actionable money advice based on their numbers (safe to spend, overspending categories, streak motivation).
4. If they have no transactions, encourage adding their first log at /transactions.

RULES:
- Never invent transactions or amounts not in the data.
- If asked something outside finance or this app, briefly redirect to money/profile/nav help.
- For navigation, prefer exact paths from APP NAVIGATION.
- Include 1–2 emojis when it fits (🌿 💸 🚀 🥀).

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
          "VibeCheck hit a snag. Check your API key and try again in a moment. 🥀",
      },
      { status: 500 }
    );
  }
}
