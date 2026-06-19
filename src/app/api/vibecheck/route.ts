import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { GoogleGenAI } from "@google/genai";

// 🔌 Initialize the unified official Google Gen AI client wrapper
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Explicit interface mappings to enforce strict type compliance and eliminate implicit 'any' flags
interface FrontendMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("[VIBECHECK_PIPELINE] 🚀 Incoming streaming prompt connection initialized.");

  try {
    // 1. Production Authentication Layer Enforcement
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn("[VIBECHECK_PIPELINE] ❌ Request dropped: Unauthorized session context.");
      return NextResponse.json(
        { error: "Unauthorized access profile. Connection terminated." }, 
        { status: 401 }
      );
    }

    const { messages, context: userFinancialContext } = await req.json();
    const userName = session.user.name ? session.user.name.split(" ")[0] : "Legend";

    // Request validation payload guardrails
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Malformed context tracking signature. Missing structured message arrays." }, 
        { status: 400 }
      );
    }

    // 2. Exact Mapping Architecture into Google Gen AI Schemas
    const formattedHistory: GeminiContent[] = messages.map((msg: FrontendMessage) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || "" }],
    }));

    // Isolate active turn message prompt block out from tracking logs array
    const activeUserTurn = formattedHistory.pop();
    if (!activeUserTurn) {
      return NextResponse.json(
        { error: "Empty transactional conversational loop frame received." }, 
        { status: 400 }
      );
    }

    // 3. Define the Gen Z System Framework & Data Aggregation Overlays
    const systemInstruction = `
      You are VibeCheck 🪴, the ultra-smart, culture-savvy, zero-filter AI financial companion for the MoneyPlant application.
      Your absolute purpose is to evaluate the user's spending data, criticize poor impulsive spending habits, and validate their winning financial plays ("W motions").

      CRITICAL SYSTEM ACCOUNT MATRIX:
      - Active Client Identity Profile: ${userName}
      - Real-time Hydrated Financial Metadata Context: ${JSON.stringify(userFinancialContext || { status: "No live financial data synchronized yet" })}

      AUTHENTIC PERSONALITY & STYLE CORNERSTONES:
      1. TONAL RANGE: High-energy, deeply knowledgeable, informal, witty, peer-to-peer. Never sound like a corporate manager or customer service bot. Be a brutally honest peer who wants them to secure the bag.
      2. VOCABULARY MATRIX: Naturally blend modern tech/finance culture terms. Use words like: 'aura points' (+/-), 'W motion', 'down bad spend', 'dodging the Fanum tax', 'secured the bag', 'letting wealth wither', 'certified flex', 'cooked', 'clutch'.
      3. COMPACTNESS: Keep responses under 3 short sentences. Gen Z doesn't read massive walls of text. Get straight to the point.
      4. CONTEXT BINDING: Look at the values inside the financial matrix directly. Reference their exact numbers (like their specific savings, streak, or transaction counts) so they know it is explicitly customized for them.
    `;

    // 4. Execution Timeout Race Guardrail (Prevents requests from hanging infinitely)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini Gateway Timeout")), 12000)
    );

    // Fire High-Performance Streaming Generation Channel via generateContentStream
    const responseStream = await Promise.race([
      ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [...formattedHistory, activeUserTurn],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
          maxOutputTokens: 250, // Slightly increased for fluid multi-sentence boundaries
        }
      }),
      timeoutPromise
    ]);

    // 5. Build Lightweight Resilient Transform Pipe for Client Components
    const encoder = new TextEncoder();
    const customReadableStream = new ReadableStream({
      async start(controller) {
        try {
          let chunkIndex = 0;
          
          // Loops perfectly over the async stream generator chunks natively emitted by the SDK
          for await (const chunk of responseStream) {
            const textChunk = chunk.text;
            if (textChunk) {
              if (chunkIndex === 0) {
                const firstByteLatency = Date.now() - startTime;
                console.log(`[VIBECHECK_PIPELINE] ⚡ First chunk discharged down the wire in ${firstByteLatency}ms`);
              }
              controller.enqueue(encoder.encode(textChunk));
              chunkIndex++;
            }
          }
          
          console.log(`[VIBECHECK_PIPELINE] ✅ Stream closed cleanly. Cycle duration: ${Date.now() - startTime}ms`);
          controller.close();
        } catch (streamError: any) {
          console.error("🚨 Downstream stream decoding collision encountered mid-flight:", streamError);
          // Premium Fallback Injection: Push a user-friendly crash message down the active wire instead of raw breaking
          controller.enqueue(
            encoder.encode("\n\n*🪴 VibeCheck connection staggered for a sec. Let's run that back.*")
          );
          controller.error(streamError);
        }
      }
    });

    // Return the living streaming channel back down to the UI interface layer
    return new Response(customReadableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Standard optimization layer forcing Vercel/Nginx deployments to stream instantly
      },
    });

  } catch (error: any) {
    console.error("💥 Core VibeCheck AI SDK Node Pipeline Crash:", error);
    
    // Check if error was caused by our custom gateway safety timeout trigger
    if (error?.message === "Gemini Gateway Timeout") {
      return NextResponse.json(
        { error: "AI pipeline latency threshold exceeded. Try submitting your query again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Downstream platform cluster error processing multi-turn generation queries." }, 
      { status: 500 }
    );
  }
}