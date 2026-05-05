"use client";

import { useEffect, useState } from "react";

type Streak = {
  count: number;
  lastActiveDate: string;
};

export function useStreak() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔄 FETCH */
  const fetchStreak = async () => {
    const res = await fetch("/api/streak");
    const data = await res.json();
    setStreak(data.streak);
    setLoading(false);
  };

  /* 🔥 UPDATE (call on user action) */
  const updateStreak = async () => {
    const res = await fetch("/api/streak", {
      method: "POST",
    });
    const data = await res.json();
    setStreak(data.streak);
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  return {
    streak: streak?.count ?? 0,
    loading,
    updateStreak,
  };
}