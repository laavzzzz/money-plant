"use client";

export default function QuickActions() {
  return (
    <div className="flex justify-between gap-3">

      <button className="flex-1 bg-green-100 text-green-700 py-3 rounded-2xl font-medium">
        + Income
      </button>

      <button className="flex-1 bg-red-100 text-red-600 py-3 rounded-2xl font-medium">
        - Expense
      </button>

      <button className="flex-1 bg-yellow-100 text-yellow-700 py-3 rounded-2xl font-medium">
        Goals
      </button>

    </div>
  );
}