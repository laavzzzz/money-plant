"use client";

export default function SafeToSpendCard() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-md relative overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-transparent opacity-40 blur-xl" />

      <div className="relative z-10">
        <p className="text-gray-500 text-sm">Safe to Spend</p>

        <h2 className="text-2xl font-bold text-green-600 mt-1">
          ₹1,250
        </h2>

        <p className="text-xs text-gray-400">
          this week
        </p>
      </div>
    </div>
  );
}