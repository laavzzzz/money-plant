"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/* 📦 TYPES */
export interface Transaction {
  _id?: string;
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date?: string;
}

interface ApiResponse {
  success: boolean;
  transactions?: Transaction[];
  transaction?: Transaction;
  message?: string;
}

/* 🧠 HOOK */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* 🔄 FETCH FUNCTION */
  const fetchTransactions = useCallback(async () => {
    try {
      abortRef.current?.abort(); // cancel previous
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const res = await fetch("/api/transactions", {
        signal: controller.signal,
      });

      let data: ApiResponse;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // If server crashed and returned HTML, capture status
        const text = await res.text();
        throw new Error(`Server error ${res.status}: ${text.slice(0, 50)}...`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      setTransactions(data.transactions ?? []);
    } catch (err: any) {
      if (err.name === "AbortError") return;

      console.error("Fetch Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🚀 INITIAL FETCH */
  useEffect(() => {
    fetchTransactions();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchTransactions]);

  /* ➕ ADD TRANSACTION (OPTIMISTIC + STREAK) */
  const addTransaction = async (
    tx: Omit<Transaction, "_id" | "id">
  ) => {
    const tempId = "temp-" + Date.now();

    const tempTx: Transaction = {
      ...tx,
      _id: tempId,
      date: tx.date || new Date().toISOString(),
    };

    try {
      setAdding(true);
      setError(null);

      /* ⚡ optimistic update */
      setTransactions((prev) => [tempTx, ...prev]);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...tx, date: tempTx.date }),
      });

      let data: ApiResponse;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Server error ${res.status}: Could not process request.`);
      }

      if (!res.ok || !data.success || !data.transaction) {
        throw new Error(data.message || "Invalid response");
      }

      /* 🔄 replace temp with real */
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === tempId ? data.transaction! : t
        )
      );

      /* 🔥 UPDATE STREAK (NON-BLOCKING) */
      fetch("/api/streak", { method: "POST" }).catch(() => {});

      return data.transaction;
    } catch (err: any) {
      console.error("Add Error:", err);
      setError(err.message || "Failed to add transaction");

      /* ❌ rollback ONLY temp */
      setTransactions((prev) =>
        prev.filter((t) => t._id !== tempId)
      );

      throw err;
    } finally {
      setAdding(false);
    }
  };

  /* ❌ DELETE TRANSACTION */
  const deleteTransaction = async (id: string) => {
    const prevState = transactions;

    try {
      /* ⚡ optimistic delete */
      setTransactions((prev) => prev.filter((t) => t._id !== id));

      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      let data: ApiResponse;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Server error ${res.status}: Could not delete.`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      /* optional: update streak if needed */
    } catch (err) {
      console.error("Delete Error:", err);

      /* 🔁 rollback */
      setTransactions(prevState);
    }
  };

  /* 🔁 REFRESH */
  const refresh = () => {
    fetchTransactions();
  };

  return {
    transactions,
    loading,
    adding,
    error,

    addTransaction,
    deleteTransaction,
    refresh,
  };
}