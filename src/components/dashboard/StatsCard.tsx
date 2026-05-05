import GlassCard from "../ui/GlassCard";

export default function StatsCard() {
  return (
    <GlassCard>
      <div className="grid grid-cols-2 text-center">

        <div>
          <p className="text-xs text-gray-400">Income</p>
          <p className="text-green-600 font-bold">₹12,000</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Expense</p>
          <p className="text-red-500 font-bold">₹4,500</p>
        </div>

      </div>
    </GlassCard>
  );
}