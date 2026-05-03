"use client";

import { useEffect, useState } from "react";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 fetch transactions
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();

        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ➕ add transaction
  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(tx),
      });

      const newTx = await res.json();

      setTransactions((prev) => [newTx, ...prev]);
    } catch (err) {
      console.error("Error adding transaction", err);
    }
  };

  return {
    transactions,
    loading,
    addTransaction,
  };
}