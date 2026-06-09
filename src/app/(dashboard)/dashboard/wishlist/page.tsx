"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  IndianRupee,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AddWishlistModal, {
  type WishlistFormValues,
} from "@/components/wishlist/AddWishlistModal";
import {
  buildMotivation,
  formatMonthLabel,
  getCategoryMeta,
  monthKey,
  MOTIVATION_BANNERS,
} from "@/lib/constants/wishlist";

export type WishlistItem = {
  _id: string;
  name: string;
  categoryType: string;
  amount: number;
  monthlySave: number;
  savedSoFar: number;
  targetMonth: string;
  genZComment: string;
  priority?: "low" | "medium" | "high";
  status?: "planned" | "saving" | "ready" | "purchased";
  purchaseUrl?: string;
  notes?: string;
};

const STATUS_LABELS: Record<NonNullable<WishlistItem["status"]>, string> = {
  planned: "Planned",
  saving: "Saving",
  ready: "Ready",
  purchased: "Purchased",
};

const PRIORITY_LABELS: Record<NonNullable<WishlistItem["priority"]>, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<Record<string, string>>({});

  const banner = useMemo(
    () => MOTIVATION_BANNERS[Math.floor(Date.now() / 60000) % MOTIVATION_BANNERS.length],
    []
  );

  const monthOptions = useMemo(() => {
    const keys = new Set(items.map((i) => i.targetMonth));
    keys.add(monthKey());
    return ["all", ...Array.from(keys).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (filterMonth === "all") return items;
    return items.filter((i) => i.targetMonth === filterMonth);
  }, [items, filterMonth]);

  const totals = useMemo(() => {
    const target = filtered.reduce((s, i) => s + i.amount, 0);
    const saved = filtered.reduce((s, i) => s + i.savedSoFar, 0);
    const monthly = filtered.reduce((s, i) => s + i.monthlySave, 0);
    return { target, saved, monthly, remaining: Math.max(0, target - saved) };
  }, [filtered]);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success) setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = async (values: WishlistFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          categoryType: values.categoryType,
          amount: Number(values.amount),
          monthlySave: Number(values.monthlySave),
          targetMonth: values.targetMonth,
          genZComment: values.genZComment,
          savedSoFar: Number(values.savedSoFar || 0),
          priority: values.priority,
          status: values.status,
          purchaseUrl: values.purchaseUrl,
          notes: values.notes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Failed to add");
      toast.success(`${values.name} added to your wishlist 🌿`);
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from wishlist?`)) return;
    const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((i) => i._id !== id));
    }
  };

  const patchItem = async (id: string, patch: Partial<WishlistItem>) => {
    const res = await fetch(`/api/wishlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? "Could not update item");
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, ...data.item } : i)));
    return data.item as WishlistItem;
  };

  const handleStatusChange = async (
    item: WishlistItem,
    status: NonNullable<WishlistItem["status"]>
  ) => {
    try {
      const patch =
        status === "purchased"
          ? { status, savedSoFar: item.amount }
          : { status };
      await patchItem(item._id, patch);
      toast.success(`${item.name} marked ${STATUS_LABELS[status].toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status");
    }
  };

  const handleDeposit = async (item: WishlistItem, amountOverride?: number) => {
    const raw =
      amountOverride !== undefined
        ? String(amountOverride)
        : depositAmount[item._id] ?? String(item.monthlySave || 500);
    const add = Number(raw);
    if (isNaN(add) || add <= 0) {
      toast.error("Enter a valid amount to stash");
      return;
    }
    const nextSaved = Math.min(item.amount, item.savedSoFar + add);
    const res = await fetch(`/api/wishlist/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedSoFar: nextSaved }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(
        nextSaved >= item.amount
          ? `${item.name} fully funded! 🏆`
          : `Stashed ₹${add.toLocaleString("en-IN")} for ${item.name}`
      );
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, savedSoFar: nextSaved } : i))
      );
      setDepositAmount((d) => ({ ...d, [item._id]: "" }));
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">
              Wishlist
            </p>
            <h1 className="text-3xl font-black text-text-main">Dream vault</h1>
          </div>
          <p className="max-w-2xl text-sm text-text-light">
            Stash toward your next big purchase and watch your plant grow with every deposit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Add wishlist item"
          className="inline-flex items-center justify-center rounded-3xl bg-vibe-purple px-5 py-3 text-sm font-black text-white transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Add item
        </button>
      </header>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Add wishlist item"
        className="fixed bottom-28 left-4 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 ring-4 ring-white/50 transition-transform hover:scale-105 active:scale-95 dark:ring-black/30 sm:hidden"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatPill label="Dreams" value={`${filtered.length}`} accent />
        <StatPill label="Total target" value={`₹${totals.target.toLocaleString("en-IN")}`} />
        <StatPill label="Saved" value={`₹${totals.saved.toLocaleString("en-IN")}`} accent />
        <StatPill label="Remaining" value={`₹${totals.remaining.toLocaleString("en-IN")}`} />
      </div>

      <div className="glass-panel p-4 rounded-3xl border border-primary/20 bg-primary/5">
        <div className="flex items-start gap-2">
          <Sparkles className="text-primary shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-bold text-text-main leading-relaxed">{banner}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <StatPill label="Target" value={`₹${totals.target.toLocaleString("en-IN")}`} />
        <StatPill label="Saved" value={`₹${totals.saved.toLocaleString("en-IN")}`} accent />
        <StatPill label="Monthly" value={`₹${totals.monthly.toLocaleString("en-IN")}`} />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {monthOptions.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setFilterMonth(m)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all",
              filterMonth === m
                ? "bg-vibe-purple text-white border-vibe-purple"
                : "bg-white/10 border-white/10 opacity-70 hover:opacity-100"
            )}
          >
            {m === "all" ? "All" : formatMonthLabel(m)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm font-bold text-text-light py-12">
          Loading your wishlist…
        </p>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-10 rounded-[32px] text-center border-dashed border-2 border-primary/20">
          <p className="text-4xl mb-3">✨</p>
          <p className="font-black text-text-main">No items yet</p>
          <p className="text-xs text-text-light mt-2 font-bold">
            Tap + to add PS5, fits, subs, heels — whatever you&apos;re manifesting.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 px-6 py-3 bg-vibe-purple text-white rounded-full font-black text-sm"
          >
            Add first item
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item, i) => {
            const cat = getCategoryMeta(item.categoryType);
            const pct = item.amount > 0 ? Math.min(100, Math.round((item.savedSoFar / item.amount) * 100)) : 0;
            const motivation = buildMotivation(item);
            const expanded = expandedId === item._id;
            const status = item.status ?? (pct >= 100 ? "ready" : "planned");
            const priority = item.priority ?? "medium";

            return (
              <motion.li
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-5 rounded-[28px] border border-white/10"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-black text-text-main truncate">{item.name}</h3>
                        <p className="text-[10px] font-bold text-text-light uppercase tracking-wide">
                          {cat.label} · {formatMonthLabel(item.targetMonth)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-primary/15 px-2 py-1 text-[9px] font-black uppercase text-primary">
                            {STATUS_LABELS[status]}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[9px] font-black uppercase",
                              priority === "high"
                                ? "bg-red-500/10 text-red-500"
                                : priority === "low"
                                  ? "bg-text-light/10 text-text-light"
                                  : "bg-accent/20 text-accent-dark"
                            )}
                          >
                            {PRIORITY_LABELS[priority]}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-primary shrink-0">
                        {pct}%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-light mt-1">
                      ₹{item.savedSoFar.toLocaleString("en-IN")} / ₹
                      {item.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    className="h-full bg-gradient-to-r from-primary to-vibe-purple rounded-full"
                  />
                </div>

                <p className="mt-3 text-[11px] font-bold text-vibe-purple/90 leading-relaxed flex items-start gap-1.5">
                  <IndianRupee size={12} className="shrink-0 mt-0.5" />
                  <span>
                    Saving <strong>₹{item.monthlySave.toLocaleString("en-IN")}/mo</strong> toward
                    this
                  </span>
                </p>

                <p className="mt-2 text-[11px] font-bold text-text-light italic leading-relaxed">
                  &ldquo;{item.genZComment || "No cap — this one's worth the grind."}&rdquo;
                </p>

                {(item.notes || item.purchaseUrl) && (
                  <div className="mt-3 space-y-2 rounded-2xl bg-black/5 p-3 dark:bg-white/5">
                    {item.notes && (
                      <p className="flex items-start gap-2 text-[11px] font-bold text-text-light">
                        <StickyNote size={13} className="mt-0.5 shrink-0" />
                        <span>{item.notes}</span>
                      </p>
                    )}
                    {item.purchaseUrl && (
                      <a
                        href={item.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-primary hover:underline"
                      >
                        View item <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                <p className="mt-2 text-[10px] font-bold text-accent-dark bg-accent/10 px-3 py-2 rounded-xl">
                  {motivation}
                </p>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : item._id)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] font-black uppercase text-text-light hover:text-text-main"
                >
                  {expanded ? "Hide actions" : "Stash & manage"}
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-white/10 space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder={`₹${item.monthlySave || 500}`}
                        value={depositAmount[item._id] ?? ""}
                        onChange={(e) =>
                          setDepositAmount((d) => ({
                            ...d,
                            [item._id]: e.target.value,
                          }))
                        }
                        className="flex-1 p-3 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeposit(item)}
                        className="px-4 py-3 bg-green-500/20 text-green-700 dark:text-green-400 rounded-xl font-black text-xs uppercase"
                      >
                        Stash
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(Object.keys(STATUS_LABELS) as Array<NonNullable<WishlistItem["status"]>>).map(
                        (nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            onClick={() => handleStatusChange(item, nextStatus)}
                            className={cn(
                              "rounded-xl px-2 py-2 text-[10px] font-black uppercase",
                              status === nextStatus
                                ? "bg-vibe-purple text-white"
                                : "bg-black/5 text-text-light hover:text-text-main dark:bg-white/5"
                            )}
                          >
                            {STATUS_LABELS[nextStatus]}
                          </button>
                        )
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeposit(item, item.monthlySave)}
                        className="flex-1 py-2.5 rounded-xl bg-primary/15 text-primary font-black text-[10px] uppercase"
                      >
                        + Monthly (₹{item.monthlySave.toLocaleString("en-IN")})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.name)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        aria-label="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </ul>
      )}

      <AddWishlistModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleAdd}
        saving={saving}
      />
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3 border",
        accent ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
      )}
    >
      <p className="text-[9px] font-black uppercase text-text-light tracking-widest">{label}</p>
      <p className="text-sm font-black text-text-main mt-0.5">{value}</p>
    </div>
  );
}
