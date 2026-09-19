"use client";

import React, { useCallback, useEffect, useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  IndianRupee,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  StickyNote,
  CheckCircle2,
  Sliders,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/Input";
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

/**
 * Strict structural domain model definitions for Wishlist entities.
 */
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

type WishlistStatus = NonNullable<WishlistItem["status"]>;
type WishlistPriority = NonNullable<WishlistItem["priority"]>;

const STATUS_LABELS: Record<WishlistStatus, string> = {
  planned: "Planned",
  saving: "Saving",
  ready: "Ready",
  purchased: "Purchased",
} as const;

const PRIORITY_LABELS: Record<WishlistPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
} as const;

/**
 * Enterprise Localized Indian National Rupee Format Assistant.
 */
function formatCurrency(amount: number): string {
  try {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

/**
 * Core Wishlist Management Dashboard Component view tree.
 */
export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const tabListId = useId();
  const mainHeaderId = useId();

  // Pick deterministic motivational copy based on minute markers
  // ✅ FIXED: Initializes safely and updates only on the client
const [bannerText, setBannerText] = useState("Main character energy = saving before you swipe. This month's drops await. 🌿");

useEffect(() => {
  if (typeof window !== "undefined" && MOTIVATION_BANNERS?.length) {
    const index = Math.floor(Date.now() / 60000) % MOTIVATION_BANNERS.length;
    setBannerText(MOTIVATION_BANNERS[index]);
  }
}, []);

  // Compute unique target dates sorted ascending with active baseline
  const monthOptions = useMemo(() => {
    const dynamicKeys = new Set<string>(items.map((i) => i.targetMonth));
    dynamicKeys.add(monthKey());
    return ["all", ...Array.from(dynamicKeys).sort()];
  }, [items]);

  // Handle month configuration filtering vectors
  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesMonth = filterMonth === "all" || item.targetMonth === filterMonth;
      const matchesSearch =
        !searchLower || item.name.toLowerCase().includes(searchLower) || item.categoryType.toLowerCase().includes(searchLower);
      
      return matchesMonth && matchesSearch;
    });
  }, [items, filterMonth, searchQuery]);

  // Aggregate current metrics portfolio matching the active tab filters
  const metrics = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        const amt = item.amount || 0;
        const saved = item.savedSoFar || 0;
        const monthly = item.monthlySave || 0;

        acc.target += amt;
        acc.saved += saved;
        acc.monthly += monthly;
        return acc;
      },
      { target: 0, saved: 0, monthly: 0 }
    );
  }, [filteredItems]);

  const remainingBalance = Math.max(0, metrics.target - metrics.saved);

  /**
   * Performs an asynchronous operational fetch to populate data stores.
   */
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", { method: "GET" });
      if (!res.ok) throw new Error("Network connection fault context.");
      const data = await res.json();
      if (data.success) {
        setItems(data.items ?? []);
      } else {
        throw new Error(data.message ?? "Server rejected lookup data maps.");
      }
    } catch (err) {
      console.error("[WISHLIST_LOAD_ERROR]:", err);
      toast.error("Failed to sync your manifest dashboard vault.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /**
   * Persists new elements downstream to the data repository layers.
   */
  const handleAdd = async (values: WishlistFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          categoryType: values.categoryType,
          amount: Math.abs(Number(values.amount) || 0),
          monthlySave: Math.abs(Number(values.monthlySave) || 0),
          targetMonth: values.targetMonth,
          genZComment: values.genZComment?.trim(),
          savedSoFar: Math.abs(Number(values.savedSoFar) || 0),
          priority: values.priority,
          status: values.status || "planned",
          purchaseUrl: values.purchaseUrl?.trim(),
          notes: values.notes?.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Failed verification execution parameters.");
      
      toast.success(`${values.name} successfully committed to Manifest Vault 🌿`);
      setModalOpen(false);
      await loadItems();
    } catch (err) {
      console.error("[WISHLIST_ADD_ERROR]:", err);
      toast.error(err instanceof Error ? err.message : "Failed to record new target.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Safely deletes structural entries from remote and localized states.
   */
  const handleDelete = async (id: string, name: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Delete transaction dropped.");
      
      toast.success(`Removed "${name}" from your vault portfolio.`);
      setItems((prev) => prev.filter((item) => item._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("[WISHLIST_DELETE_ERROR]:", err);
      toast.error("Could not remove specified element profile mapping.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(`CRITICAL: Permanently delete ${count} selected items from your vault?`)) return;

    setLoading(true);
    try {
      // Sequentially execute deletions for the selected set
      await Promise.all(Array.from(selectedIds).map((id) => fetch(`/api/wishlist/${id}`, { method: "DELETE" })));
      toast.success(`Successfully purged ${count} items from your portfolio.`);
      setItems((prev) => prev.filter((item) => !selectedIds.has(item._id)));
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Bulk deletion failed. Some items may still persist.");
      await loadItems();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Patch-merges localized state with transactional changes.
   */
  const patchItem = useCallback(async (id: string, patch: Partial<WishlistItem>) => {
    const res = await fetch(`/api/wishlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? "Failed partial state transition updates.");
    
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, ...data.item } : i)));
    return data.item as WishlistItem;
  }, []);

  /**
   * Modifies the operational progression tracking tags assigned to specific rows.
   */
  const handleStatusChange = async (item: WishlistItem, nextStatus: WishlistStatus) => {
    try {
      const patchData = nextStatus === "purchased" ? { status: nextStatus, savedSoFar: item.amount } : { status: nextStatus };
      await patchItem(item._id, patchData);
      toast.success(`${item.name} status advanced to ${STATUS_LABELS[nextStatus].toLowerCase()}`);
    } catch (err) {
      console.error("[WISHLIST_STATUS_ERROR]:", err);
      toast.error("Could not complete target state configuration swap.");
    }
  };

  /**
   * Modifies the priority vector assigned to specific rows.
   */
  const handlePriorityChange = async (item: WishlistItem, nextPriority: WishlistPriority) => {
    try {
      await patchItem(item._id, { priority: nextPriority });
      toast.success(`${item.name} shifted to ${PRIORITY_LABELS[nextPriority].toLowerCase()}`);
    } catch (err) {
      console.error("[WISHLIST_PRIORITY_ERROR]:", err);
      toast.error("Could not update strategic asset priority vector.");
    }
  };

  /**
   * Appends targeted numeric currency additions towards goal balances.
   */
  const handleDeposit = async (item: WishlistItem, amountOverride?: number) => {
    const rawInput = amountOverride !== undefined ? String(amountOverride) : depositAmount[item._id] ?? "";
    const computedAddition = Number(rawInput);
    const remainingNeeded = item.amount - item.savedSoFar;

    if (isNaN(computedAddition) || computedAddition <= 0) {
      toast.error("Please insert a proper target funding calculation.");
      return;
    }

    if (item.savedSoFar >= item.amount) {
      toast.info(`${item.name} is already fully funded. No further deposits needed.`);
      setDepositAmount((prev) => ({ ...prev, [item._id]: "" }));
      return;
    }

    try {
      const calculatedTarget = Math.min(item.amount, item.savedSoFar + computedAddition);
      await patchItem(item._id, { savedSoFar: calculatedTarget });
      
      toast.success(
        calculatedTarget >= item.amount
          ? `🏆 ${item.name} is now completely fully funded! Max status achieved.`
          : `Stashed ${formatCurrency(computedAddition)} into your ${item.name} vault balance.`
      );
      
      setDepositAmount((prev) => ({ ...prev, [item._id]: "" }));
    } catch (err) {
      console.error("[WISHLIST_DEPOSIT_ERROR]:", err);
      toast.error("Failed to safely complete your wallet transaction deposit balance.");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6 max-w-7xl mx-auto px-1">
      {/* Upper Information Action Architecture Bar */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {selectedIds.size > 0 ? (
              <motion.div
                key="bulk-actions"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 py-2"
              >
                <div className="bg-vibe-purple/10 border border-vibe-purple/20 px-4 py-2 rounded-2xl">
                  <p className="text-sm font-black text-vibe-purple">
                    {selectedIds.size} items selected
                  </p>
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  <Trash2 size={14} /> Purge Selection
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs font-black uppercase text-text-light hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.div key="standard-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-xs uppercase tracking-[0.35em] font-black text-text-light">Wishlist</p>
                <h1 id={mainHeaderId} className="text-3xl font-black text-text-main tracking-tight">Dream vault</h1>
                <p className="max-w-2xl text-sm text-text-light">
                  Stash toward your next big purchase and watch your capital ecosystem expand with every single strategic deposit.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PRIMARY ADD BUTTON */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center rounded-3xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-white transition-all shadow-lg shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shrink-0 z-10 relative"
        >
          <Plus size={18} className="mr-2" /> Add entry item
        </button>
      </header>

      {/* Search and Filter Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center gap-3">
          <p className="text-xs font-bold text-text-light uppercase tracking-widest hidden sm:block">
            Filter & Search
          </p>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search wishlist items by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={20} className="text-text-light" />}
            className="border-none shadow-vibe bg-white/40 dark:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary w-full"
            aria-label="Search wishlist items"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-light hover:text-text-main transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Floating Dynamic Trigger Access Port for mobile break-points */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Add architectural wishlist target"
        className="fixed bottom-28 right-4 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 ring-4 ring-white/50 transition-all hover:scale-105 active:scale-95 dark:ring-black/30 sm:hidden focus:outline-none focus:ring-emerald-400"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* High-Level Overview Aggregations Panels Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Portfolio metrics status metrics grid">
        <StatPill label="Dreams count" value={String(filteredItems.length)} accent />
        <StatPill label="Total target allocation" value={formatCurrency(metrics.target)} />
        <StatPill label="Aggregated savings" value={formatCurrency(metrics.saved)} accent />
        <StatPill label="Remaining balance needed" value={formatCurrency(remainingBalance)} />
      </section>

      {/* Motivational Stream Interceptor Node */}
      <div className="glass-panel p-4 rounded-3xl border border-primary/20 bg-primary/5 shadow-inner" role="status">
        <div className="flex items-start gap-2.5">
          <Sparkles className="text-primary shrink-0 mt-0.5 animate-pulse" size={18} />
          <p className="text-sm font-bold text-text-main leading-relaxed">{bannerText}</p>
        </div>
      </div>

      {/* Primary Month Aggregated Matrix Navigation Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black uppercase text-text-light tracking-widest pl-1">Timeline Horizons</p>
          {filteredItems.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
            >
              {selectedIds.size === filteredItems.length
                ? "Deselect All"
                : `Select All ${filteredItems.length}`}
            </button>
          )}
        </div>
        <div 
          className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 snap-x snap-mandatory"
          role="tablist"
          id={tabListId}
          aria-label="Timeline navigation sets"
        >
          {monthOptions.map((monthKeyVal) => {
            const isActive = filterMonth === monthKeyVal;
            return (
              <button
                key={monthKeyVal}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilterMonth(monthKeyVal)}
                className={cn(
                  "shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all snap-center focus:outline-none focus:ring-2 focus:ring-vibe-purple/40",
                  isActive
                    ? "bg-vibe-purple text-white border-vibe-purple shadow-vibe"
                    : "bg-white/5 dark:bg-white/5 border-black/5 dark:border-white/10 opacity-70 hover:opacity-100 text-text-main"
                )}
              >
                {monthKeyVal === "all" ? "All Targets" : formatMonthLabel(monthKeyVal)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Items Evaluation Block Tree */}
      <main aria-describedby={mainHeaderId}>
        {loading ? (
          <div className="flex items-center justify-center py-24" aria-live="polite">
            <p className="text-center text-sm font-bold text-text-light animate-pulse tracking-widest uppercase">
              Synchronizing active wishlist portfolio ledger maps…
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-panel p-12 rounded-[32px] text-center border-dashed border-2 border-primary/20 bg-black/5 dark:bg-white/5">
            <p className="text-4xl mb-4" aria-hidden="true">✨</p>
            <h3 className="font-black text-text-main text-lg tracking-tight">No elements discovered within timeline parameters</h3>
            {searchQuery ? (
              <>
                <p className="text-xs text-text-light mt-2 max-w-md mx-auto font-bold leading-relaxed">
                  No wishlist items match your current search query. Try adjusting your filters or search terms.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-6 px-6 py-3 bg-vibe-purple text-white rounded-full font-black text-xs uppercase tracking-wider shadow-vibe transition-transform hover:scale-105 active:scale-95"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <p className="text-xs text-text-light mt-2 max-w-md mx-auto font-bold leading-relaxed">
                Tap the tracking controls to initialize records for consoles, configurations, memberships, or apparel targets you are actively manifesting.
              </p>
            )}
            {!searchQuery && <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 px-6 py-3 bg-vibe-purple text-white rounded-full font-black text-xs uppercase tracking-wider shadow-vibe transition-transform hover:scale-105 active:scale-95"
            >
              Add initial manifest asset
            </button>
}
</div>
            ):
          <ul className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <WishlistItemRow
                  key={item._id}
                  item={item}
                  index={idx}
                  isExpanded={expandedId === item._id}
                  isSelected={selectedIds.has(item._id)}
                  depositValue={depositAmount[item._id] ?? ""}
                  onToggleExpand={() => setExpandedId(expandedId === item._id ? null : item._id)}
                  onUpdateDepositValue={(val) => setDepositAmount((prev) => ({ ...prev, [item._id]: val }))}
                  onDepositSubmit={handleDeposit}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onToggleSelect={() => toggleSelectItem(item._id)}
                  onDeleteSubmit={handleDelete}
                />
              ))}
            </AnimatePresence>
          </ul>
}
      </main>

      <AddWishlistModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleAdd}
        saving={saving}
      />
    </div>
  );
}

interface WishlistItemRowProps {
  item: WishlistItem;
  index: number;
  isExpanded: boolean;
  isSelected: boolean;
  depositValue: string;
  onToggleExpand: () => void;
  onUpdateDepositValue: (value: string) => void;
  onDepositSubmit: (item: WishlistItem, amountOverride?: number) => Promise<void>;
  onStatusChange: (item: WishlistItem, nextStatus: WishlistStatus) => Promise<void>;
  onPriorityChange: (item: WishlistItem, nextPriority: WishlistPriority) => Promise<void>;
  onToggleSelect: () => void;
  onDeleteSubmit: (id: string, name: string) => Promise<void>;
}

/**
 * Presentational and operational structural item data display row.
 */
function WishlistItemRow({
  item,
  index,
  isExpanded,
  isSelected,
  depositValue,
  onToggleExpand,
  onUpdateDepositValue,
  onDepositSubmit,
  onStatusChange,
  onPriorityChange,
  onToggleSelect,
  onDeleteSubmit,
}: WishlistItemRowProps) {
  const categoryMeta = getCategoryMeta(item.categoryType) || { emoji: "📦", label: "General" };
  
  const completionPercentage = useMemo(() => {
    if (!item.amount || item.amount <= 0) return 0;
    return Math.min(100, Math.round((item.savedSoFar / item.amount) * 100));
  }, [item.savedSoFar, item.amount]);

  const contextMotivation = useMemo(() => buildMotivation(item), [item]);
  
  const computedStatus = (item.status ?? (completionPercentage >= 100 ? "ready" : "planned")) as WishlistStatus;
  const currentPriority = (item.priority ?? "medium") as WishlistPriority;
  const rowAriaId = useId();

  const runDestructionSequence = () => {
    if (typeof window !== "undefined" && window.confirm(`CRITICAL: Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
      onDeleteSubmit(item._id, item.name);
    }
  };

  const handleDoneClick = () => {
    onToggleExpand();
    toast.success(`Settings locked in for ${item.name} ⚡`);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.03 }}
      className={cn(
        "glass-panel p-5 rounded-[28px] border bg-white/20 dark:bg-white/5 shadow-sm transition-all relative",
        isExpanded ? "border-vibe-purple/40 ring-1 ring-vibe-purple/20" : "border-black/5 dark:border-white/10 hover:border-primary/20",
        isSelected && "bg-vibe-purple/5 border-vibe-purple/30 ring-1 ring-vibe-purple/10 shadow-vibe-sm"
      )}
    >
      <div className="flex gap-4 items-start">
        {/* SELECTION CHECKBOX */}
        <div className="pt-3.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={cn(
              "w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center shrink-0",
              isSelected ? "bg-vibe-purple border-vibe-purple" : "bg-white/10 border-black/10 dark:border-white/20"
            )}
          >
            {isSelected && <CheckCircle2 size={12} className="text-white" />}
          </button>
        </div>

        <div 
          className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-2xl shrink-0 select-none shadow-sm"
          aria-hidden="true"
        >
          {categoryMeta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-black text-text-main text-base tracking-tight truncate">{item.name}</h3>
              <p className="text-[10px] font-bold text-text-light uppercase tracking-wider mt-0.5">
                {categoryMeta.label} · {formatMonthLabel(item.targetMonth)}
              </p>
              
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Tracking taxonomies">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[9px] font-black uppercase text-primary tracking-wide">
                  {STATUS_LABELS[computedStatus]}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide",
                    currentPriority === "high" && "bg-red-500/10 text-red-500",
                    currentPriority === "low" && "bg-text-light/10 text-text-light",
                    currentPriority === "medium" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {PRIORITY_LABELS[currentPriority]}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="text-sm font-black text-primary tracking-tight bg-primary/10 px-2 py-0.5 rounded-lg">
                  {completionPercentage}%
                </span>
              </div>
              {/* QUICK DELETE BUTTON - Now accessible in the header */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); runDestructionSequence(); }}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-90 border border-red-500/10"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-xs font-black text-text-main">{formatCurrency(item.savedSoFar)}</span>
            <span className="text-[10px] text-text-light font-bold">saved of {formatCurrency(item.amount)}</span>
          </div>
        </div>
      </div>

      {/* Graphic Structural Progress Line Vector Tracker */}
      <div className="mt-4 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-vibe-purple rounded-full"
        />
      </div>

      {/* Target Metrics Specific Blocks */}
      <div className="mt-4 space-y-2 text-[11px] font-bold text-text-main leading-relaxed">
        <p className="text-vibe-purple/90 dark:text-purple-400 flex items-center gap-1.5">
          <IndianRupee size={13} className="shrink-0" />
          <span>
            Allocating monthly provisions of <strong className="font-black text-sm">{formatCurrency(item.monthlySave)}</strong> towards goal vector bounds.
          </span>
        </p>

        <p className="text-text-light italic bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-black/[0.02] dark:border-white/[0.02]">
          &ldquo;{item.genZComment || "No cap — this one's worth the grind."}&rdquo;
        </p>
      </div>

      {/* Internal Core Expanded Details Segment Context links */}
      {(item.notes || item.purchaseUrl) && (
        <div className="mt-3 space-y-2 rounded-2xl bg-black/5 dark:bg-white/5 p-3.5 border border-black/[0.03] dark:border-white/[0.03]">
          {item.notes && (
            <p className="flex items-start gap-2 text-[11px] font-medium text-text-light leading-relaxed">
              <StickyNote size={14} className="mt-0.5 shrink-0 text-text-light/70" />
              <span>{item.notes}</span>
            </p>
          )}
          {item.purchaseUrl && (
            <a
              href={item.purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-primary"
            >
              View item asset vector link <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Realtime contextual localized algorithm generated response */}
      <div className="mt-3 text-[10px] font-black tracking-wide text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3.5 py-2.5 rounded-xl">
        {contextMotivation}
      </div>

      {/* Interactive Expand Controls Base Button */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={rowAriaId}
        onClick={onToggleExpand}
        className={cn(
          "mt-4 w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors focus:outline-none",
          isExpanded 
            ? "text-vibe-purple bg-vibe-purple/10 hover:bg-vibe-purple/20" 
            : "text-text-light hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
        )}
      >
        <span>{isExpanded ? "Hide manipulation panel" : "Stash funds & manage asset"}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Manipulation Matrix Panels */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={rowAriaId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-5 pb-2">
              
              {/* Custom Multiplier Increments Block */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase text-text-light tracking-widest pl-0.5">Quick Fund Stash</p>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-light">₹</span>
                    <input
                      type="number"
                      min={1}
                      placeholder={String(item.monthlySave || 500)}
                      value={depositValue}
                      onChange={(e) => onUpdateDepositValue(e.target.value)}
                      className="w-full pl-6 pr-3 py-3 rounded-xl bg-black/5 dark:bg-white/5 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/40 border border-transparent text-text-main"
                      aria-label="Custom allocation balance deposit sum"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDepositSubmit(item)}
                    className="px-5 py-3 bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30 rounded-xl font-black text-xs uppercase tracking-wider transition-colors focus:ring-2 focus:ring-green-400"
                  >
                    Stash Capital
                  </button>
                </div>
              </div>

              {/* Workflow Status Manipulation Selector Layout Array */}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-text-light tracking-widest pl-0.5 flex items-center gap-1">
                  <Sliders size={10} /> Advance Pipeline Target
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.keys(STATUS_LABELS) as WishlistStatus[]).map((nextStatus) => {
                    const isActiveStatus = computedStatus === nextStatus;
                    return (
                      <button
                        key={nextStatus}
                        type="button"
                        onClick={() => onStatusChange(item, nextStatus)}
                        className={cn(
                          "rounded-xl px-2 py-3 text-[10px] font-black uppercase tracking-wider transition-all border",
                          isActiveStatus
                            ? "bg-vibe-purple text-white border-vibe-purple shadow-vibe transform scale-[1.02]"
                            : "bg-black/5 text-text-light border-transparent hover:text-text-main dark:bg-white/5 hover:bg-black/10"
                        )}
                      >
                        {STATUS_LABELS[nextStatus]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Asset Strategic Priority Configuration Node */}
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-text-light tracking-widest pl-0.5 flex items-center gap-1">
                  <Flag size={10} /> Adjust Asset Priority Vector
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PRIORITY_LABELS) as WishlistPriority[]).map((nextPriority) => {
                    const isActivePriority = currentPriority === nextPriority;
                    return (
                      <button
                        key={nextPriority}
                        type="button"
                        onClick={() => onPriorityChange(item, nextPriority)}
                        className={cn(
                          "rounded-xl px-2 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all border text-center",
                          isActivePriority
                            ? nextPriority === "high"
                              ? "bg-red-500 text-white border-red-500 shadow-sm font-black"
                              : nextPriority === "medium"
                              ? "bg-amber-500 text-white border-amber-500 shadow-sm font-black"
                              : "bg-text-light text-white border-text-light shadow-sm font-black"
                            : "bg-black/5 text-text-light border-transparent hover:text-text-main dark:bg-white/5 hover:bg-black/10"
                        )}
                      >
                        {nextPriority}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Standard Deposit, Delete, and the Requested "Done" Button */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDepositSubmit(item, item.monthlySave)}
                    className="w-full py-3.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black text-[10px] uppercase tracking-widest transition-colors border border-primary/20"
                  >
                    Allocate standard month metrics ({formatCurrency(item.monthlySave)})
                  </button>
                </div>
                
                {/* DONE BUTTON TO SAVE AND CLOSE THE PANEL */}
                <button
                  type="button"
                  onClick={handleDoneClick}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-text-main text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm mt-1 animate-shimmer"
                >
                  <CheckCircle2 size={16} />
                  Done / Save Settings
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

interface StatPillProps {
  label: string;
  value: string;
  accent?: boolean;
}

/**
 * Isolated highly optimal view element container mapping statistics labels.
 */
function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 border transition-all shadow-sm min-w-0 flex flex-col justify-between",
        accent
          ? "bg-primary/10 border-primary/20 dark:bg-primary/5"
          : "bg-white/5 border-black/5 dark:border-white/10"
      )}
    >
      <p className="text-[9px] font-black uppercase text-text-light tracking-widest truncate">{label}</p>
      <p className="text-base font-black text-text-main mt-1 tracking-tight truncate">{value}</p>
    </div>
  );
}