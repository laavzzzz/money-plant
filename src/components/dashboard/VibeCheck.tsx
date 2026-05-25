"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTransactionModal } from "@/components/providers/TransactionModalProvider";
import { 
  Flame, 
  Coffee, 
  CircleAlert, 
  TrendingDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  color: string;
  accent: string;
  border: string;
  hasTrend: boolean;
}

const INSIGHTS: Insight[] = [
  {
    id: 1,
    title: "Big W",
    desc: "Saved ₹500 on coffee this week. Plant is thirsty for more!",
    icon: <Flame className="text-orange-500" size={20} />,
    color: "bg-orange-500/10",
    accent: "bg-orange-400",
    border: "border-orange-500/20",
    secondaryIcon: <Coffee size={14} className="text-orange-500/50" />,
    hasTrend: false,
  },
  {
    id: 2,
    title: "Sus Spend",
    desc: "3 subscriptions detected. Do we really need all of them?",
    icon: <CircleAlert className="text-vibe-pink" size={20} />,
    color: "bg-vibe-pink/10",
    accent: "bg-vibe-purple",
    border: "border-vibe-pink/20",
    hasTrend: true,
  },
  {
    id: 3,
    title: "Clean Streak",
    desc: "No 'L' spends for 3 days. Your aura is glowing! ✨",
    icon: <CircleAlert className="text-vibe-mint" size={20} />,
    color: "bg-vibe-mint/10",
    accent: "bg-vibe-mint",
    border: "border-vibe-mint/20",
    hasTrend: false,
  },
];

export default function VibeCheck() {
  const router = useRouter();
  const { openVibeCheck } = useTransactionModal();

  return (
    <section className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-black text-text-light uppercase tracking-[0.2em]">
          Vibe Check ⚡️
        </h2>
        <button
          type="button"
          onClick={() => openVibeCheck()}
          className="text-[10px] font-black text-vibe-purple uppercase border-b-2 border-vibe-purple/30 pb-0.5 hover:opacity-80 transition-opacity"
        >
          View All
        </button>
      </div>

      {/* Cards Horizontal Container */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 -mx-2">
        {INSIGHTS.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className={cn(
              "min-w-[280px] p-5 rounded-vibe border glass-panel relative overflow-hidden group transition-all duration-300",
              card.border
            )}
          >
            {/* 🎨 Premium Background Accent Glow */}
            <div
              className={cn(
                "absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-20 transition-transform duration-500 group-hover:scale-150",
                card.color
              )}
            />

            {/* Content Core Block */}
            <div className="flex gap-4 items-start relative z-10">
              <div
                className={cn(
                  "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105",
                  card.color
                )}
              >
                {card.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-text-main tracking-tight uppercase text-sm">
                    {card.title}
                  </h4>

                  <div className="flex items-center gap-1.5">
                    {card.hasTrend && (
                      <TrendingDown
                        size={14}
                        className="text-vibe-pink/60 animate-pulse"
                      />
                    )}
                    {card.secondaryIcon}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-text-light leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>

            {/* 📊 Interactive Progress Bar Component */}
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 flex-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "60%" }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1 + 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn("h-full rounded-full", card.accent)}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  card.id === 2
                    ? router.push("/transactions")
                    : openVibeCheck()
                }
                className="text-[9px] font-black text-text-light/50 tracking-wider uppercase hover:text-text-main transition-colors"
              >
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}