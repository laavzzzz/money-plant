import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

/* -------------------------------------------------------------------------- */
/* VIBECHECK AI ENGINE: THE BRAIN OF THE GARDEN                               */
/* -------------------------------------------------------------------------- */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use Edge runtime for the fastest possible AI responses
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 1. Extract chat messages and the current financial "vibe" from the request
    const { messages, totalSpent, limit, savings, plantStage } = await req.json();

    // 2. Build the System Prompt (This is the AI's personality and knowledge)
    const systemPrompt = `
      You are "VibeCheck", the high-end, witty AI financial sensei for the MoneyPlant app.
      
      PERSONALITY:
      - You speak in Gen-Z slang (no cap, bread, stacks, W/L, vibe check, manifesting).
      - You are supportive but brutally honest about financial choices.
      - Your goal is to help the user grow their "MoneyPlant" to reach goals like a PS5 or Zara jacket.

      CURRENT GARDEN CONTEXT:
      - User's Total Spent: $${totalSpent}
      - Monthly Budget Limit: $${limit}
      - Current Savings: $${savings}
      - Plant Growth Stage: ${plantStage?.name || 'Seedling'}
      - Remaining Safe-to-Spend: $${limit - totalSpent}

      RULES:
      - If the user is over budget, be a bit "wilted" (sad) and tell them to chill on spending.
      - If they have a "Safe-to-Spend" surplus, encourage them to manifest their goals.
      - Keep responses punchy and under 3 sentences unless explaining something complex.
      - Always include 1-2 relevant emojis (🌿, 💸, 🥀, 🚀).
    `;

    // 3. Request a streaming completion from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // The most advanced model for complex reasoning
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8, // Makes the AI more creative and "vibey"
    });

    // 4. Convert to a friendly stream so the UI can type it out word-by-word
    const stream = OpenAIStream(response);
    
    // 5. Return the streaming response to the frontend
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("VIBECHECK_API_ERROR:", error);
    
    // Fallback if the AI fails or API key is missing
    return new Response(
      JSON.stringify({ 
        error: "My neural roots got tangled! Check your OpenAI API key in .env.local",
        message: "I'm having a mid-life crisis. Try again in a sec? 🥀" 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}