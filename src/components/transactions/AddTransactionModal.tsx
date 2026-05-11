"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, IndianRupee } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";

/* 🧠 TYPES & CONFIG */
type FormState = {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
};

const initialForm: FormState = {
  title: "",
  amount: "",
  category: "☕️", // Default emoji category
  type: "expense",
};

const QUICK_EMOJIS = ["☕️", "🍔", "🚕", "🎮", "🛍️", "🪴", "🎟️", "✨"];

export default function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const { addTransaction, adding } = useTransactions();

  /* 🔄 HANDLERS */
  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (adding) return;
    setOpen(false);
    setForm(initialForm);
    setError(null);
  };

  const handleSubmit = async () => {
    if (adding) return;
    setError(null);

    const { title, amount, category, type } = form;

    // Validation
    if (!title.trim() || !amount || !category.trim()) {
      setError("Fill all fields, bestie! ✨");
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount 💸");
      return;
    }

    try {
      await addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim(),
        type,
        date: new Date().toISOString(),
      });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to log spend");
    }
  };

  return (
    <>
      {/* 🚀 TRIGGER BUTTON (Styled for your BottomNav center) */}
      <button
        onClick={() => setOpen(true)}
        className="p-4 bg-vibe-purple text-white rounded-full shadow-vibe hover:scale-110 active:scale-95 transition-all pointer-events-auto"
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 🌑 BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-auto"
            />

            {/* 📤 BOTTOM SHEET */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-vibe-dark rounded-t-[40px] p-8 pb-12 border-t border-white/20 pointer-events-auto max-w-2xl mx-auto"
            >
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-8" />

              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-text-main tracking-tighter">Log Vibe Check</h2>
                <button onClick={handleClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                {/* 💰 AMOUNT INPUT */}
                <div className="relative flex flex-col items-center">
                  <span className="text-vibe-purple font-black text-4xl absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
                    <IndianRupee size={32} strokeWidth={3} />
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full bg-transparent text-center text-7xl font-black text-text-main outline-none placeholder:text-black/5 dark:placeholder:text-white/5"
                    autoFocus
                  />
                </div>

                {/* 📝 TITLE INPUT */}
                <input
                  type="text"
                  placeholder="What did you spend on?"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-5 bg-black/5 dark:bg-white/5 rounded-vibe text-center font-bold text-lg outline-none border-2 border-transparent focus:border-vibe-purple/30 transition-all"
                />

                {/* 🎭 EMOJI / CATEGORY SELECTOR */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em] text-center">Category Vibe</p>
                  <div className="flex justify-between gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-vibe border border-white/10 overflow-x-auto no-scrollbar">
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleChange("category", emoji)}
                        className={cn(
                          "text-2xl p-3 rounded-2xl transition-all flex-shrink-0",
                          form.category === emoji 
                            ? "bg-white dark:bg-vibe-purple shadow-vibe scale-110" 
                            : "grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🔄 TYPE TOGGLE */}
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-vibe">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleChange("type", t)}
                      className={cn(
                        "flex-1 py-3 rounded-vibe text-xs font-black uppercase tracking-widest transition-all",
                        form.type === t 
                          ? "bg-white dark:bg-vibe-dark shadow-vibe-soft text-vibe-purple" 
                          : "text-text-light opacity-50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* ❌ ERROR MESSAGE */}
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm font-bold text-danger"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* 🚀 SUBMIT BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={adding}
                  onClick={handleSubmit}
                  className={cn(
                    "w-full p-6 rounded-vibe text-white font-black text-lg shadow-vibe flex items-center justify-center gap-3 transition-all",
                    adding ? "bg-text-light opacity-50" : "bg-vibe-purple hover:bg-primary-dark"
                  )}
                >
                  {adding ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={20} />
                      LOG TO GARDEN
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}