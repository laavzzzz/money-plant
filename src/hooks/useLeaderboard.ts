"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/* 🧠 TYPES */
export interface LeaderboardUser {
  _id?: string;
  userId?: string;
  name?: string;
  score: number;
  savings?: number;
  streak?: number;
}

interface ApiResponse {
  success: boolean;
  leaderboard?: LeaderboardUser[];
  message?: string;
}

/* 🏆 HOOK */
export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* 🔄 FETCH FUNCTION */
  const fetchLeaderboard = useCallback(async () => {
    try {
      abortRef.current?.abort(); // cancel previous request
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const res = await fetch("/api/leaderboard", {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch leaderboard");

      const result: ApiResponse = await res.json();

      if (!result.success) {
        throw new Error(result.message || "API error");
      }

      setData(result.leaderboard ?? []);
    } catch (err: any) {
      if (err.name === "AbortError") return;

      console.error("Leaderboard Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🚀 INITIAL LOAD */
  useEffect(() => {
    fetchLeaderboard();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchLeaderboard]);

  /* 🔁 MANUAL REFRESH */
  const refresh = () => {
    fetchLeaderboard();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}