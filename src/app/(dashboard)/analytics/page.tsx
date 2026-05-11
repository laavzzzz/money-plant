"use client";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="p-6 pb-24 max-w-md mx-auto">
      <header className="text-center mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase">This Month</p>
        <h1 className="text-2xl font-black">Analytics</h1>
      </header>

      {/* Donut Chart Placeholder */}
      <div className="relative flex justify-center mb-10">
        <div className="w-48 h-48 rounded-full border-[16px] border-gray-100 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Spent</p>
          <p className="text-2xl font-black">₹ 4,250</p>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <CategoryItem color="bg-orange-400" label="Food" percent="35%" />
        <CategoryItem color="bg-blue-400" label="Transport" percent="20%" />
      </div>

      {/* AI Insight Card */}
      <div className="bg-green-50 p-6 rounded-[32px] flex gap-4 items-center">
        <span className="text-4xl">🌵</span>
        <div>
          <p className="text-xs font-bold text-green-700">Al Planty Says</p>
          <p className="text-xs text-green-600 font-medium">You spend more on weekends. Try planning your meals!</p>
        </div>
      </div>
    </main>
  );
}

function CategoryItem({ color, label, percent }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <span className="text-xs font-black ml-auto">{percent}</span>
    </div>
  );
}