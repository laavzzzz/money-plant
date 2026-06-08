"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, IndianRupee } from "lucide-react";
import { useSharedTransactions } from "@/components/providers/FinanceProvider";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
};

const emptyForm = (type: "income" | "expense"): FormState => ({
  title: "",
  amount: "",
  category: type === "income" ? "💰" : "☕️",
  type,
});

const QUICK_EMOJIS = ["☕️", "🍔", "🚕", "🎮", "🛍️", "🪴", "🎟️", "✨"];

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialType?: "income" | "expense";
  hideTrigger?: boolean;
};

export default function AddTransactionModal({
  open: controlledOpen,
  onOpenChange,
  initialType = "expense",
  hideTrigger = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<FormState>(emptyForm(initialType));
  const [error, setError] = useState<string | null>(null);
  const { addTransaction, adding } = useSharedTransactions();

  useEffect(() => {
    if (open) setForm(emptyForm(initialType));
  }, [open, initialType]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (adding) return;
    setOpen(false);
    setForm(emptyForm(initialType));
    setError(null);
  };

  const handleSubmit = async () => {
    if (adding) return;
    setError(null);

    const { title, amount, category, type } = form;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to log spend");
    }
  };

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Add transaction"
          className="p-4 bg-vibe-purple text-white rounded-full shadow-vibe hover:scale-110 active:scale-95 transition-all pointer-events-auto"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] pointer-events-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-vibe-dark rounded-t-[40px] p-8 pb-12 border-t border-white/20 pointer-events-auto max-w-2xl mx-auto"
            >
              <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-text-main tracking-tighter">
                  Log {form.type === "income" ? "Income" : "Expense"}
                </h2>
                <button type="button" onClick={handleClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-8">
                <div className="relative flex flex-col items-center">
                  <span className="text-vibe-purple font-black text-4xl absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
                    <IndianRupee size={32} strokeWidth={3} />
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full bg-transparent text-center text-7xl font-black text-text-main outline-none"
                    autoFocus
                  />
                </div>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full p-5 bg-black/5 dark:bg-white/5 rounded-vibe text-center font-bold text-lg outline-none"
                />
                <div className="flex gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-vibe overflow-x-auto no-scrollbar">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleChange("category", emoji)}
                      className={cn(
                        "text-2xl p-3 rounded-2xl flex-shrink-0",
                        form.category === emoji ? "bg-white dark:bg-vibe-purple shadow-vibe scale-110" : "opacity-40"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-vibe">
                  {(["expense", "income"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange("type", t)}
                      className={cn(
                        "flex-1 py-3 rounded-vibe text-xs font-black uppercase tracking-widest",
                        form.type === t ? "bg-white dark:bg-vibe-dark text-vibe-purple" : "text-text-light opacity-50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={adding}
                    className="w-full sm:w-auto px-12 py-4 rounded-3xl border border-black/10 dark:border-white/10 text-sm font-black uppercase tracking-[0.35em] text-text-main bg-white/80 dark:bg-white/5 hover:bg-white/100 transition-colors disabled:opacity-40"
                  >
                    {adding ? "Saving..." : "Done"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
