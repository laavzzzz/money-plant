"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Target, ArrowRight } from "lucide-react";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 p-5 shadow-sm transition ${
        accent ? "bg-gradient-to-r from-primary/80 to-secondary/80 text-white" : "bg-white/90 dark:bg-white/5"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.35em] font-black opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

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

  const totals = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.target, 0);
    const saved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const remaining = Math.max(0, target - saved);
    const progressAvg = goals.length
      ? Math.round(
          goals.reduce(
            (sum, goal) => sum + (goal.target ? (goal.saved / goal.target) * 100 : 0),
            0
          ) / goals.length
        )
      : 0;

    return { count: goals.length, target, saved, remaining, progressAvg };
  }, [goals]);

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
            Goals
          </p>
          <h1 className="text-3xl font-black text-text-main">Set your money missions</h1>
          <p className="text-sm text-text-light mt-2 max-w-2xl">
            Create goals, track progress, and turn savings into the rewards you actually care about.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 bg-yellow-400 text-black rounded-3xl px-4 py-3 font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform"
            >
              <Plus size={16} /> Add goal
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/wishlist")}
              className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-black/5 px-4 py-3 text-xs uppercase font-black tracking-[0.2em] text-text-main hover:bg-white/10 transition"
            >
              Wishlist
            </button>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-secondary/10 px-4 py-3 text-xs uppercase font-black tracking-[0.2em] text-secondary">
            <Sparkles size={16} /> Power plan
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatPill label="Goals" value={`${totals.count}`} accent />
        <StatPill label="Saved" value={`₹${totals.saved.toLocaleString("en-IN")}`} />
        <StatPill label="Remaining" value={`₹${totals.remaining.toLocaleString("en-IN")}`} />
        <StatPill label="Avg progress" value={`${totals.progressAvg}%`} />
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
          onClick={() => router.push("/dashboard/wishlist")}
          className="flex-1 py-2.5 bg-vibe-purple/10 text-vibe-purple rounded-xl text-xs font-black uppercase"
        >
          Wishlist
        </button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-text-light font-bold py-8">Loading goals…</p>
      ) : goals.length === 0 ? (
        <div className="glass-panel p-10 rounded-[32px] text-center border-dashed border-2 border-primary/20">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-black text-text-main">No goals yet</p>
          <p className="text-xs text-text-light mt-2 font-bold">
            Add a goal and start the habit of saving for something meaningful.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-6 px-6 py-3 bg-yellow-400 text-black rounded-full font-black text-sm"
          >
            Add first goal
          </button>
        </div>
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
