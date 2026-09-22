/**
 * @file src/components/dashboard/QuickActions.tsx
 * @module Components/Dashboard/QuickActions
 * @description Enterprise quick action toolbar providing rapid shortcuts to add income,
 * record expenses, and navigate to the user wishlist page.
 * 
 * @version 3.1.0
 * @author Senior Principal UI/UX Engineering Team
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";

export default function QuickActions(): React.ReactElement {
  const router = useRouter();
  const { openAdd } = useTransactionModal();

  return (
    <div className="flex justify-between gap-3" role="group" aria-label="Financial actions">
      <button
        type="button"
        onClick={() => openAdd("income")}
        aria-label="Record new income transaction"
        className="flex-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors active:scale-95 cursor-pointer shadow-sm"
      >
        + Income
      </button>
      <button
        type="button"
        onClick={() => openAdd("expense")}
        aria-label="Record new expense transaction"
        className="flex-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors active:scale-95 cursor-pointer shadow-sm"
      >
        - Expense
      </button>
      <button
        type="button"
        onClick={() => router.push("/dashboard/wishlist")}
        aria-label="View financial wishlist and goals"
        className="flex-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-yellow-200 dark:hover:bg-yellow-500/30 transition-colors active:scale-95 cursor-pointer shadow-sm"
      >
        Wishlist
      </button>
    </div>
  );
}