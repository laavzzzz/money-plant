export default function LeaderboardList() {
  return (
    <div className="space-y-3">

      <div className="flex justify-between items-center bg-yellow-100 p-4 rounded-xl">
        <span>🥇 MoneyMonk</span>
        <span>₹24,560</span>
      </div>

      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl">
        <span>🥈 SaverPro</span>
        <span>₹16,450</span>
      </div>

      <div className="flex justify-between items-center bg-orange-100 p-4 rounded-xl">
        <span>🥉 BudgetBoss</span>
        <span>₹13,400</span>
      </div>

    </div>
  );
}