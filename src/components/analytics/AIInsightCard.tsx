"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { cn } from "@/lib/utils";

/* 🧠 TYPES */
type Props = {
  message: string;
  tone?: "good" | "warning" | "danger";
};

/* 🎨 HELPER: METADATA, STYLES & GLOWS FOR DARK/GEN-Z THEME */
function getToneConfig(tone: Props["tone"]) {
  switch (tone) {
    case "good":
      return {
        text: "text-emerald-400",
        glow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
        border: "border-emerald-500/20",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        icon: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />,
        label: "Aura Clean 🌿",
      };
    case "danger":
      return {
        text: "text-rose-400",
        glow: "from-rose-500/15 via-rose-500/5 to-transparent",
        border: "border-rose-500/20",
        badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        icon: <Flame className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />,
        label: "Spending Emergency 🔥",
      };
    default:
      return {
        text: "text-amber-300",
        glow: "from-amber-400/10 via-amber-400/5 to-transparent",
        border: "border-amber-400/20",
        badge: "bg-amber-400/10 border-amber-400/20 text-amber-300",
        icon: <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0" />,
        label: "Vibe Check ⚠️",
      };
  }
}

/* 🧪 INLINE MARKDOWN PARSER (Bold/Code syntax) */
function parseInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 mx-0.5 bg-white/10 rounded font-mono text-xs text-yellow-300 border border-white/5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/* 🤖 COMPONENT */
export default function InsightCard({
  message,
  tone = "warning",
}: Props) {
  const config = getToneConfig(tone);

  return (
    <GlassCard className={cn("relative overflow-hidden border transition-all duration-300", config.border)}>
      
      {/* 🌟 GLOW BACKGROUND */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br blur-2xl opacity-60 pointer-events-none",
          config.glow
        )}
      />

      <motion.div
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 space-y-3"
      >
        {/* 🤖 LABEL HEADER & BADGE */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <Sparkles className="h-3 w-3 text-yellow-400" />
            <span>AI Insight Engine</span>
          </div>
          
          <div className={cn("flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider", config.badge)}>
            {config.icon}
            <span>{config.label}</span>
          </div>
        </div>

        {/* 💬 MESSAGE CELL */}
        <p className={cn("text-sm font-medium leading-relaxed tracking-wide", config.text)}>
          {parseInlineMarkdown(message)}
        </p>
      </motion.div>
    </GlassCard>
  );
}