"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type StreakState = {
  count: number;
  lastActiveDate: string | null;
};

export function useStreak() {
  const { status } = useSession();
  const [streak, setStreak] = useState<StreakState>({ count: 0, lastActiveDate: null });
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    if (status !== "authenticated") {
      setStreak({ count: 0, lastActiveDate: null });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/streak");
      const data = await res.json();
      if (data.success && data.streak) {
        setStreak({
          count: data.streak.count ?? 0,
          lastActiveDate: data.streak.lastActiveDate ?? null,
        });
      } else {
        setStreak({ count: 0, lastActiveDate: null });
      }
    } catch {
      setStreak({ count: 0, lastActiveDate: null });
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const res = await fetch("/api/streak", { method: "POST" });
      const data = await res.json();
      if (data.success && data.streak) {
        setStreak({
          count: data.streak.count ?? 0,
          lastActiveDate: data.streak.lastActiveDate ?? null,
        });
      }
    } catch {
      /* non-blocking */
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [status]);

  return {
    streak: streak.count,
    loading,
    updateStreak,
  };
}
