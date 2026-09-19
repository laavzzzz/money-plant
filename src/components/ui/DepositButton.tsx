"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { PlusCircle } from "lucide-react";

export function DepositButton() {
  const { addTransaction, adding } = useTransactions();

  const handleDeposit = async () => {
    const amountStr = window.prompt("Enter amount to deposit (e.g., 500):");
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      window.alert("Please enter a valid positive number.");
      return;
    }

    try {
      await addTransaction({
        title: "Deposit",
        amount: amount,
        type: "income",      // This marks it as a deposit
        category: "Savings", // Default category
        date: new Date().toISOString()
      });
    } catch (err: any) {
      // The error is now caught and managed by the hook's state
      console.error("Deposit workflow failed:", err.message);
    }
  };

  return (
    <button
      onClick={handleDeposit}
      disabled={adding}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
    >
      <PlusCircle size={20} />
      {adding ? "Syncing..." : "Deposit Amount"}
    </button>
  );
}