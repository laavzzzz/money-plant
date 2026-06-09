"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Link as LinkIcon, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WISHLIST_CATEGORIES,
  monthKey,
  formatMonthLabel,
} from "@/lib/constants/wishlist";

export type WishlistFormValues = {
  name: string;
  categoryType: string;
  amount: string;
  monthlySave: string;
  savedSoFar: string;
  targetMode: "month" | "months";
  targetMonth: string;
  targetMonthsCount: string;
  priority: "low" | "medium" | "high";
  status: "planned" | "saving" | "ready" | "purchased";
  purchaseUrl: string;
  notes: string;
  genZComment: string;
};

const emptyForm = (): WishlistFormValues => ({
  name: "",
  categoryType: "gaming",
  amount: "",
  monthlySave: "",
  savedSoFar: "0",
  targetMode: "month",
  targetMonth: monthKey(),
  targetMonthsCount: "3",
  priority: "medium",
  status: "planned",
  purchaseUrl: "",
  notes: "",
  genZComment: "",
});

const PRIORITIES: Array<{ value: WishlistFormValues["priority"]; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUSES: Array<{ value: WishlistFormValues["status"]; label: string }> = [
  { value: "planned", label: "Planned" },
  { value: "saving", label: "Saving" },
  { value: "ready", label: "Ready" },
  { value: "purchased", label: "Purchased" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WishlistFormValues) => Promise<void>;
  saving?: boolean;
};

function buildMonthOptions(count = 18) {
  const options: { value: string; label: string }[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const key = monthKey(d);
    options.push({ value: key, label: formatMonthLabel(key) });
    d.setMonth(d.getMonth() + 1);
  }
  return options;
}

export default function AddWishlistModal({
  open,
  onOpenChange,
  onSubmit,
  saving = false,
}: Props) {
  const [form, setForm] = useState<WishlistFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const monthOptions = useMemo(() => buildMonthOptions(), []);

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setError(null);
    }
  }, [open]);

  const resolvedTargetMonth = useMemo(() => {
    if (form.targetMode === "month") return form.targetMonth;
    const n = Math.max(1, parseInt(form.targetMonthsCount, 10) || 1);
    const d = new Date();
    d.setMonth(d.getMonth() + n);
    return monthKey(d);
  }, [form.targetMode, form.targetMonth, form.targetMonthsCount]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError("Give your dream item a name ✨");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid total amount 💸");
      return;
    }
    if (!form.monthlySave || Number(form.monthlySave) < 0) {
      setError("Set how much you'll save each month 🌱");
      return;
    }
    if (Number(form.savedSoFar) < 0 || Number(form.savedSoFar) > Number(form.amount)) {
      setError("Saved so far should be between ₹0 and the total price");
      return;
    }
    try {
      await onSubmit({ ...form, targetMonth: resolvedTargetMonth });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save item");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && onOpenChange(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] pointer-events-auto"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[111] max-h-[92dvh] overflow-y-auto bg-white dark:bg-vibe-dark rounded-t-[40px] p-6 pb-10 border-t border-white/20 pointer-events-auto max-w-lg mx-auto"
          >
            <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-text-main tracking-tighter">
                Add to Wishlist 💫
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="p-2 rounded-full bg-black/5 dark:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Item name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="PS5, Zara jacket, Claude Pro…"
                  className="mt-1 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none focus:ring-2 ring-primary/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Type
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {WISHLIST_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, categoryType: cat.id }))}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl text-left text-[11px] font-bold border transition-all",
                        form.categoryType === cat.id
                          ? "bg-primary/20 border-primary text-text-main"
                          : "bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                    Total price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="mt-1 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                    Save per month (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.monthlySave}
                    onChange={(e) => setForm((f) => ({ ...f, monthlySave: e.target.value }))}
                    className="mt-1 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Already saved (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.savedSoFar}
                  onChange={(e) => setForm((f) => ({ ...f, savedSoFar: e.target.value }))}
                  className="mt-1 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                    Priority
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, priority: priority.value }))}
                        className={cn(
                          "rounded-xl px-2 py-2 text-[10px] font-black uppercase",
                          form.priority === priority.value
                            ? "bg-primary text-white"
                            : "bg-black/5 dark:bg-white/5 text-text-light"
                        )}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as WishlistFormValues["status"],
                      }))
                    }
                    className="mt-2 w-full p-3 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Target timeline
                </label>
                <div className="flex gap-2 mt-2">
                  {(["month", "months"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, targetMode: mode }))}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-black uppercase",
                        form.targetMode === mode
                          ? "bg-vibe-purple text-white"
                          : "bg-black/5 dark:bg-white/5 opacity-60"
                      )}
                    >
                      {mode === "month" ? "By month" : "# of months"}
                    </button>
                  ))}
                </div>
                {form.targetMode === "month" ? (
                  <select
                    value={form.targetMonth}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetMonth: e.target.value }))
                    }
                    className="mt-2 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                  >
                    {monthOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={form.targetMonthsCount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetMonthsCount: e.target.value }))
                    }
                    placeholder="Months from now"
                    className="mt-2 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold outline-none"
                  />
                )}
                <p className="text-[10px] font-bold text-primary mt-2">
                  Lands by {formatMonthLabel(resolvedTargetMonth)}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Purchase link
                </label>
                <div className="relative mt-1">
                  <LinkIcon
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light"
                  />
                  <input
                    value={form.purchaseUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, purchaseUrl: e.target.value }))
                    }
                    placeholder="https://store.example/item"
                    className="w-full p-4 pl-11 rounded-2xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none focus:ring-2 ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Notes
                </label>
                <div className="relative mt-1">
                  <StickyNote size={16} className="absolute left-4 top-4 text-text-light" />
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Size, color, store, warranty, discount notes..."
                    className="w-full p-4 pl-11 rounded-2xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none resize-none focus:ring-2 ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-text-light tracking-widest">
                  Motivation comment
                </label>
                <textarea
                  value={form.genZComment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, genZComment: e.target.value }))
                  }
                  rows={3}
                  placeholder="Why this is worth the grind — main character energy only ✨"
                  className="mt-1 w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none resize-none focus:ring-2 ring-primary/30"
                />
              </div>

              {error && (
                <p className="text-center text-sm font-bold text-red-500">{error}</p>
              )}

              <motion.button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2",
                  saving ? "bg-text-light/40" : "bg-vibe-purple"
                )}
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Plant on Wishlist
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
