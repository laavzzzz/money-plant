"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingDown, Flame, Coffee, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const INSIGHTS = [
  {
    id: 1,
    title: "Big W",
    desc: "Saved ₹500 on coffee this week. Plant is thirsty for more!",
    icon: <Flame className="text-orange-500" />,
    color: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    id: 2,
    title: "Sus Spend",
    desc: "3 subscriptions detected. Do we really need all of them?",
    icon: <AlertCircle className="text-vibe-pink" />,
    color: "bg-vibe-pink/10",
    border: "border-vibe-pink/20",
  },
  {
    id: 3,
    title: "Clean Streak",
    desc: "No 'L' spends for 3 days. Your aura is glowing! ✨",
    icon: <CheckCircle2 className="text-vibe-mint" />,
    color: "bg-vibe-mint/10",
    border: "border-vibe-mint/20",
  },
];

export default function VibeCheck() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-black text-text-light uppercase tracking-[0.2em]">
          Vibe Check ⚡️
        </h2>
        <button className="text-[10px] font-black text-vibe-purple uppercase border-b-2 border-vibe-purple/30 pb-0.5">
          View All
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 -mx-2">
        {INSIGHTS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "min-w-[280px] p-5 rounded-vibe border glass-panel relative overflow-hidden group",
              card.border
            )}
          >
            {/* 🎨 Background Accent Glow */}
            <div className={cn("absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-20", card.color)} />

            <div className="flex gap-4 items-start relative z-10">
              <div className={cn("p-3 rounded-2xl", card.color)}>
                {card.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-text-main tracking-tight uppercase text-sm">
                  {card.title}
                </h4>
                <p className="text-[11px] font-bold text-text-light leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>

            {/* 📊 Interactive Progress/Visual inside card */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 flex-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "60%" }}
                   className={cn("h-full", card.title === "Big W" ? "bg-orange-400" : "bg-vibe-purple")}
                />
              </div>
              <span className="text-[9px] font-black text-text-light/50">Details</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}