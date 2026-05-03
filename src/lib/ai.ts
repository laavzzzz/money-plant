export function generateAIInsight({
  income,
  expense,
}: {
  income: number;
  expense: number;
}) {
  const ratio = expense / income;

  if (ratio > 0.8) {
    return "Bro 😭 you’re spending like crazy. Chill a bit.";
  }

  if (ratio > 0.5) {
    return "Not bad… but you can save more 👀";
  }

  if (ratio < 0.3) {
    return "Damn 💅 you’re saving like a pro!";
  }

  return "You’re doing okay 👍";
}