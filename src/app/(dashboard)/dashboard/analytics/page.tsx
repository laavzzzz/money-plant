"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, Sparkles, RefreshCcw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
            Analytics
          </p>
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-primary/10 px-4 py-3 text-primary">
              <TrendingUp size={18} />
              <span className="font-black">Money moves decoded</span>
            </div>
            <p className="max-w-2xl text-sm text-text-light leading-relaxed">
              Track your spending rhythm, compare months, and turn insights into smarter saving energy.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/goals")}
            leftIcon={<Sparkles size={16} />}
          >
            Set goal
          </Button>
          <Button
            variant="vibe"
            size="sm"
            onClick={() => router.push("/dashboard/transactions")}
            leftIcon={<RefreshCcw size={16} />}
          >
            Review spend
          </Button>
        </div>
      </section>

      <div className="relative flex justify-center">
        <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[14px] border-black/5 dark:border-white/10 flex flex-col items-center justify-center glass-panel">
          <p className="text-[10px] font-bold text-text-light uppercase">Total Spent</p>
          <p className="text-2xl font-black text-text-main">₹ 4,250</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <CategoryItem
          color="bg-orange-400"
          label="Food"
          percent="35%"
          onClick={() => router.push("/dashboard/transactions")}
        />
        <CategoryItem
          color="bg-blue-400"
          label="Transport"
          percent="20%"
          onClick={() => router.push("/dashboard/transactions")}
        />
        <CategoryItem
          color="bg-pink-400"
          label="Fun"
          percent="25%"
          onClick={() => router.push("/dashboard/transactions")}
        />
        <CategoryItem
          color="bg-green-400"
          label="Other"
          percent="20%"
          onClick={() => router.push("/dashboard/transactions")}
        />
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
  onClick,
}: {
  color: string;
  label: string;
  percent: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel p-4 rounded-2xl text-center min-w-0 hover:scale-[1.01] transition-transform"
    >
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
      <p className="text-xs font-black truncate">{label}</p>
      <p className="text-lg font-black text-text-main">{percent}</p>
    </button>
  );
}

