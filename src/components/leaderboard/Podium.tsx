"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const TOP_THREE = [
  { name: "Aarav", amount: "₹85k", rank: 2, height: "h-32", color: "bg-vibe-blue" },
  { name: "You", amount: "₹120k", rank: 1, height: "h-44", color: "bg-vibe-purple" },
  { name: "Sanya", amount: "₹72k", rank: 3, height: "h-24", color: "bg-vibe-pink" },
];

export default function Podium() {
  return (
    <div className="flex items-end justify-center gap-4 pt-12 pb-8">
      {TOP_THREE.map((user, i) => (
        <motion.div
          key={user.name}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, type: "spring" }}
          className="flex flex-col items-center group"
        >
          {/* Avatar / Icon */}
          <div className="mb-4 relative">
             {user.rank === 1 && (
               <motion.div 
                 animate={{ rotate: [0, 15, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute -top-6 left-1/2 -translate-x-1/2 text-vibe-yellow"
               >
                 <Crown fill="currentColor" />
               </motion.div>
             )}
             <div className="w-14 h-14 rounded-full bg-white border-4 border-vibe-purple/20 flex items-center justify-center font-black text-xl shadow-vibe">
               {user.name[0]}
             </div>
          </div>

          {/* Podium Pillar */}
          <div className={cn(
            "w-24 rounded-t-vibe flex flex-col items-center justify-start pt-4 gap-1 relative overflow-hidden",
            user.color,
            user.height
          )}>
            <div className="absolute inset-0 bg-white/20" />
            <span className="relative z-10 text-white font-black text-xl">#{user.rank}</span>
            <span className="relative z-10 text-white/80 font-bold text-[10px] uppercase">{user.amount}</span>
          </div>
          <p className="mt-2 font-black text-text-main text-sm">{user.name}</p>
        </motion.div>
      ))}
    </div>
  );
}