"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const leaders = [
  { rank: 1, name: "MoneyMonk", aura: 34550, emoji: "🐒" },
  { rank: 2, name: "SaverGirl", aura: 18450, emoji: "🌸" },
  { rank: 3, name: "FrugalKing", aura: 15230, emoji: "👑" },
  { rank: 4, name: "BudgetBoss", aura: 13400, emoji: "💼" },
  { rank: 5, name: "SaveMaster", aura: 12450, emoji: "🧙" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"month" | "all">("month");
  const router = useRouter();

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
            Leaderboard
          </p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 grid place-items-center rounded-3xl bg-secondary/10 text-secondary">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-text-main">
                Who&apos;s winning the wealth game?
              </h1>
              <p className="text-sm text-text-light leading-relaxed max-w-2xl">
                Compare your aura with top savers and jump into the leaderboard challenge.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/profile")}
            leftIcon={<ArrowRight size={16} />}
          >
            View stats
          </Button>
          <Button
            variant="vibe"
            size="sm"
            onClick={() => router.push("/dashboard/transactions")}
            leftIcon={<ArrowRight size={16} />}
          >
            Add cash
          </Button>
        </div>
      </header>

      <div className="flex justify-center sm:justify-start gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-full w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setTab("month")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2 rounded-full text-xs font-black uppercase transition-all",
            tab === "month"
              ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
              : "text-text-light"
          )}
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2 rounded-full text-xs font-black uppercase transition-all",
            tab === "all"
              ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
              : "text-text-light"
          )}
        >
          All Time
        </button>
      </div>

      <div className="flex justify-around items-end gap-2 sm:gap-4 mb-6 sm:mb-10 min-h-[140px] sm:min-h-[160px] max-w-lg mx-auto sm:max-w-none">
        <Podium rank={2} name="SaverGirl" aura="18k" emoji="🌸" height="h-20 sm:h-24" />
        <Podium rank={1} name="MoneyMonk" aura="34k" emoji="🐒" height="h-28 sm:h-32" />
        <Podium rank={3} name="FrugalKing" aura="15k" emoji="👑" height="h-16 sm:h-20" />
      </div>

      <ul className="space-y-3 max-w-2xl mx-auto sm:max-w-none w-full">
        {leaders.map((user) => (
          <motion.button
            key={user.rank}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: user.rank * 0.04 }}
            onClick={() => router.push("/dashboard/profile")}
            className="w-full"
          >
            <div className="glass-panel p-4 flex justify-between items-center gap-3 min-w-0 hover:bg-white/80 dark:hover:bg-gray-900 transition-colors">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="font-bold text-text-light w-5 shrink-0">{user.rank}</span>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center text-xl shrink-0">
                  {user.emoji}
                </div>
                <span className="font-bold text-sm truncate">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-green-500 shrink-0">
                  +{user.aura.toLocaleString("en-IN")} Aura
                </span>
                <ArrowRight size={16} className="text-text-light" />
              </div>
            </div>
          </motion.button>
        ))}
      </ul>
    </div>
  );
}

function Podium({
  rank,
  name,
  aura,
  emoji,
  height,
}: {
  rank: number;
  name: string;
  aura: string;
  emoji: string;
  height: string;
}) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0 max-w-[120px]">
      <span className="text-2xl sm:text-3xl mb-1">{emoji}</span>
      <div
        className={cn(
          "w-full rounded-t-2xl bg-gradient-to-t from-primary/30 to-primary/10 flex items-end justify-center pb-2",
          height
        )}
      >
        <span className="text-lg sm:text-xl font-black text-primary">{rank}</span>
      </div>
      <p className="text-[10px] sm:text-xs font-black mt-2 truncate w-full text-center">{name}</p>
      <p className="text-[10px] text-text-light font-bold">{aura}</p>
    </div>
  );
}
