import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { totalSpent, limit } = await req.json();

  // Basic logic to determine the "Planty" response
  let message = "";
  let mood = "Happy";

  if (totalSpent > limit) {
    message = "Yikes! You're over budget. My leaves are wilting... 🥀";
    mood = "Sad";
  } else if (totalSpent > limit * 0.8) {
    message = "Easy there! We're getting close to the limit. 💧";
    mood = "Thirsty";
  } else {
    message = "You're doing great! Look at me grow! ✨";
    mood = "Glowing";
  }

  return NextResponse.json({ message, mood });
}