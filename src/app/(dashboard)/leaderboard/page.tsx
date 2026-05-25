"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const leaders = [
  { rank: 1, name: "MoneyMonk", aura: 34550, emoji: "🐒", trophy: "🥇" },
  { rank: 2, name: "SaverGirl", aura: 18450, emoji: "🌸", trophy: "🥈" },
  { rank: 3, name: "FrugalKing", aura: 15230, emoji: "👑", trophy: "🥉" },
  { rank: 4, name: "BudgetBoss", aura: 13400, emoji: "💼" },
  { rank: 5, name: "SaveMaster", aura: 12450, emoji: "🧙" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"month" | "all">("month");

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
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
          <motion.li
            key={user.rank}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: user.rank * 0.04 }}
          >
            <div className="glass-panel p-4 flex justify-between items-center gap-3 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="font-bold text-text-light w-5 shrink-0">{user.rank}</span>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center text-xl shrink-0">
                  {user.emoji}
                </div>
                <span className="font-bold text-sm truncate">{user.name}</span>
              </div>
              <span className="text-xs font-black text-green-500 shrink-0">
                +{user.aura.toLocaleString("en-IN")} Aura
              </span>
            </div>
          </motion.li>
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
