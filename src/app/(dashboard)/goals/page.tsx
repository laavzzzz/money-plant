"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";

type Goal = {
  _id: string;
  title: string;
  saved: number;
  target: number;
  emoji: string;
};

export default function GoalsPage() {
  const router = useRouter();
  const { openAdd } = useTransactionModal();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  const loadGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (data.success) setGoals(data.data ?? []);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleAddGoal = async () => {
    if (!title.trim() || !target) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        target: Number(target),
        saved: 0,
        emoji,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setTitle("");
      setTarget("");
      setEmoji("🎯");
      await loadGoals();
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex justify-between items-center gap-3">
        <p className="text-xs font-bold text-text-light sm:hidden">Savings targets</p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="text-2xl hover:scale-110 transition-transform ml-auto shrink-0"
          aria-label="Add goal"
        >
          ➕
        </button>
      </div>

      {showForm && (
        <div className="glass-panel p-5 rounded-[28px] space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal name"
            className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none"
          />
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target amount (₹)"
            className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none"
          />
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Emoji"
            className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none"
          />
          <button
            type="button"
            onClick={handleAddGoal}
            className="w-full py-3 bg-yellow-400 rounded-xl font-black text-sm"
          >
            Save Goal
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => openAdd("income")}
          className="flex-1 py-2.5 bg-green-500/15 text-green-700 dark:text-green-400 rounded-xl text-xs font-black uppercase"
        >
          + Log Income
        </button>
        <button
          type="button"
          onClick={() => router.push("/wishlist")}
          className="flex-1 py-2.5 bg-vibe-purple/10 text-vibe-purple rounded-xl text-xs font-black uppercase"
        >
          Wishlist
        </button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-text-light font-bold py-8">Loading goals…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="glass-panel p-5 rounded-[28px] min-w-0"
            >
              <div className="flex gap-4 mb-4">
                <div className="bg-blue-100 dark:bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  {goal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold truncate">{goal.title}</h3>
                    <span className="text-xs font-bold text-green-500 shrink-0">
                      {Math.round((goal.saved / goal.target) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-text-light">
                    ₹ {goal.saved.toLocaleString("en-IN")} / ₹{" "}
                    {goal.target.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (goal.saved / goal.target) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
