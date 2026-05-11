"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, ArrowDownLeft, ArrowUpRight, Coffee, Car, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import Input from "@/components/ui/Input";
import  Button  from "@/components/ui/Button";

/* 🧠 TYPES & DATA */
const CATEGORIES = ["All", "Income", "Expense"];

const TRANSACTIONS = [
  { 
    id: 1, 
    title: "Salary Credit", 
    category: "Income", 
    amount: 10000, 
    type: "plus", 
    date: "Today", 
    icon: <Banknote className="text-green-500" />,
    color: "bg-green-500/10" 
  },
  { 
    id: 2, 
    title: "Lunch Break", 
    category: "Food", 
    amount: 250, 
    type: "minus", 
    date: "Today", 
    icon: <Coffee className="text-orange-500" />,
    color: "bg-orange-500/10" 
  },
  { 
    id: 3, 
    title: "Metro Recharge", 
    category: "Transport", 
    amount: 120, 
    type: "minus", 
    date: "Today", 
    icon: <Car className="text-primary" />,
    color: "bg-primary/10" 
  },
];

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <main className="space-y-8 pb-32">
      {/* 🔍 STICKY SEARCH HEADER */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-text-main tracking-tighter">History 📜</h1>
            <p className="text-xs font-bold text-text-light uppercase tracking-widest mt-1">Track your vibes</p>
          </div>
          <Button variant="secondary" size="icon" className="rounded-2xl">
            <Filter size={20} />
          </Button>
        </div>

        <Input 
          placeholder="Search transactions..." 
          icon={<Search size={20} className="text-text-light" />}
          className="border-none shadow-vibe bg-white/40 dark:bg-white/5"
        />
      </section>

      {/* 🏷️ FILTER TABS */}
      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-full w-fit">
        {CATEGORIES.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter transition-all duration-300",
              activeTab === tab 
                ? "bg-white dark:bg-gray-800 text-primary shadow-sm scale-105" 
                : "text-text-light hover:text-text-main"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 📜 TRANSACTION LIST */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black text-text-light uppercase tracking-widest">Today</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent" />
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {TRANSACTIONS.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              >
                <GlassCard clickable className="p-4 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:rotate-12 duration-300",
                        t.color
                      )}>
                        {t.icon}
                      </div>
                      <div>
                        <p className="font-bold text-text-main group-hover:text-primary transition-colors">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-text-light font-black uppercase tracking-widest">
                          {t.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "font-black text-lg tracking-tighter",
                        t.type === 'plus' ? 'text-green-500' : 'text-text-main'
                      )}>
                        {t.type === 'plus' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-text-light font-bold">SUCCESS</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ➕ FLOATING ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-8 z-50 bg-primary text-white p-5 rounded-[24px] shadow-float shadow-primary/40 flex items-center justify-center border-4 border-white/20"
      >
        <Plus size={28} strokeWidth={3} />
      </motion.button>
    </main>
  );
}