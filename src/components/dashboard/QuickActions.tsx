"use client";

export default function QuickActions() {
  return (
    <div className="flex justify-between gap-3" role="group" aria-label="Financial actions">

      <button className="flex-1 bg-green-100 text-green-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-green-200 transition-colors">
        + Income
      </button>

      <button className="flex-1 bg-red-100 text-red-600 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-red-200 transition-colors">
        - Expense
      </button>

      <button className="flex-1 bg-yellow-100 text-yellow-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-yellow-200 transition-colors">
        Goals
      </button>

    </div>
  );
}