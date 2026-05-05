/* 🧠 SCORE CALCULATOR */
export function calculateScore({
  savings,
  streak,
}: {
  savings: number;
  streak: number;
}) {
  return Math.floor(savings * 0.5 + streak * 100);
}