"use client";

import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <p className="text-xs font-bold text-text-light uppercase tracking-widest text-center sm:text-left">
        This month
      </p>

      <div className="relative flex justify-center">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[14px] border-black/5 dark:border-white/10 flex flex-col items-center justify-center glass-panel">
          <p className="text-[10px] font-bold text-text-light uppercase">Total Spent</p>
          <p className="text-2xl font-black text-text-main">₹ 4,250</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <CategoryItem color="bg-orange-400" label="Food" percent="35%" />
        <CategoryItem color="bg-blue-400" label="Transport" percent="20%" />
        <CategoryItem color="bg-pink-400" label="Fun" percent="25%" />
        <CategoryItem color="bg-green-400" label="Other" percent="20%" />
      </div>

      <div className="glass-panel p-5 sm:p-6 rounded-[28px] flex gap-4 items-center">
        <span className="text-4xl shrink-0">🌵</span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
            <TrendingUp size={14} /> AI Planty Says
          </p>
          <p className="text-sm font-bold text-text-main mt-1 leading-relaxed">
            You&apos;re 12% under last month. Keep that food spend in check bestie 🌿
          </p>
        </div>
      </div>
    </div>
  );
}

function CategoryItem({
  color,
  label,
  percent,
}: {
  color: string;
  label: string;
  percent: string;
}) {
  return (
    <div className="glass-panel p-4 rounded-2xl text-center min-w-0">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
      <p className="text-xs font-black truncate">{label}</p>
      <p className="text-lg font-black text-text-main">{percent}</p>
    </div>
  );
}

