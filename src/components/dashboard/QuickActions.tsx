"use client";

import { useRouter } from "next/navigation";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";

export default function QuickActions() {
  const router = useRouter();
  const { openAdd } = useTransactionModal();

  return (
    <div className="flex justify-between gap-3" role="group" aria-label="Financial actions">
      <button
        type="button"
        onClick={() => openAdd("income")}
        className="flex-1 bg-green-100 text-green-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-green-200 transition-colors active:scale-95"
      >
        + Income
      </button>
      <button
        type="button"
        onClick={() => openAdd("expense")}
        className="flex-1 bg-red-100 text-red-600 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-red-200 transition-colors active:scale-95"
      >
        - Expense
      </button>
      <button
        type="button"
        onClick={() => router.push("/wishlist")}
        className="flex-1 bg-yellow-100 text-yellow-700 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-yellow-200 transition-colors active:scale-95"
      >
        Wishlist
      </button>
    </div>
  );
}
