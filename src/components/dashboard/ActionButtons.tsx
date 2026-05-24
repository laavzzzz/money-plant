"use client";

import { motion } from "framer-motion";
import { Plus, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActionButtons() {
  const actions = [
    { label: "Add", icon: <Plus size={18} />, color: "text-vibe-mint", bg: "bg-vibe-mint/10" },
    { label: "Goals", icon: <Target size={18} />, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "AI", icon: <Sparkles size={18} />, color: "text-vibe-purple", bg: "bg-vibe-purple/10" },
  ];

  return (
    <section className="grid grid-cols-3 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "glass-panel border-white/20 p-4 flex flex-col items-center justify-center gap-2 transition-all",
            "hover:bg-white/10 group"
          )}
        >
          <div className={cn(
            "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110",
            action.bg,
            action.color
          )}>
            {action.icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-light group-hover:text-text-main transition-colors">
            {action.label}
          </span>
        </motion.button>
      ))}
    </section>
  );
}