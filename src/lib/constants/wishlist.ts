export const WISHLIST_CATEGORIES = [
  { id: "electronics", label: "Electronics & Tech", emoji: "📱" },
  { id: "fashion", label: "Fashion & Clothing", emoji: "👗" },
  { id: "footwear", label: "Footwear", emoji: "👠" },
  { id: "beauty", label: "Beauty & Skincare", emoji: "💄" },
  { id: "education", label: "Education & Courses", emoji: "📚" },
  { id: "food", label: "Food & Dining", emoji: "🍔" },
  { id: "travel", label: "Travel & Experiences", emoji: "✈️" },
  { id: "health", label: "Health & Fitness", emoji: "💪" },
  { id: "subscriptions", label: "Subscriptions & SaaS", emoji: "⚡" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "home", label: "Home & Living", emoji: "🏠" },
  { id: "transport", label: "Transportation", emoji: "🚗" },
  { id: "gifts", label: "Gifts & Social", emoji: "🎁" },
  { id: "hobbies", label: "Hobbies & Creative", emoji: "🎨" },
  { id: "pets", label: "Pets", emoji: "🐾" },
  { id: "luxury", label: "Luxury & Designer", emoji: "✨" },
  { id: "music", label: "Music & Audio", emoji: "🎧" },
  { id: "sports", label: "Sports & Outdoors", emoji: "⚽" },
  { id: "finance", label: "Finance & Investing", emoji: "📈" },
  { id: "other", label: "Other", emoji: "🌿" },
] as const;

export type WishlistCategoryId = (typeof WISHLIST_CATEGORIES)[number]["id"];

export function getCategoryMeta(id: string) {
  return (
    WISHLIST_CATEGORIES.find((c) => c.id === id) ??
    WISHLIST_CATEGORIES.find((c) => c.id === "other")!
  );
}

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function monthsUntilTarget(targetMonth: string): number {
  const [ty, tm] = targetMonth.split("-").map(Number);
  const now = new Date();
  const target = new Date(ty, (tm ?? 1) - 1, 1);
  const diff =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return Math.max(1, diff);
}

export function buildMotivation(item: {
  name: string;
  amount: number;
  savedSoFar: number;
  monthlySave: number;
  targetMonth: string;
  genZComment?: string;
}): string {
  const remaining = Math.max(0, item.amount - item.savedSoFar);
  const pct = item.amount > 0 ? Math.round((item.savedSoFar / item.amount) * 100) : 0;
  const months = monthsUntilTarget(item.targetMonth);

  if (remaining <= 0) {
    return `W in the chat — ${item.name} is fully funded! Go claim that bag. 🏆`;
  }
  if (pct >= 75) {
    return `You're ${pct}% there on ${item.name}. One more push and it's yours — no cap. 🔥`;
  }
  if (item.monthlySave > 0 && item.monthlySave * months >= remaining) {
    return `Stack ₹${item.monthlySave.toLocaleString("en-IN")}/mo and ${item.name} lands by ${formatMonthLabel(item.targetMonth)}. Stay locked in. 💸`;
  }
  if (pct < 25) {
    return `Every ₹${item.monthlySave.toLocaleString("en-IN")} you stash for ${item.name} is a step away from broke era. Plant the bread. 🌱`;
  }
  return `${pct}% stacked for ${item.name}. Keep the monthly ₹${item.monthlySave.toLocaleString("en-IN")} vibe alive till ${formatMonthLabel(item.targetMonth)}. 🚀`;
}

export const MOTIVATION_BANNERS = [
  "Your wishlist isn't a fantasy — it's a budget with aura. Stack smart. ✨",
  "Main character energy = saving before you swipe. This month's drops await. 🌿",
  "Fanum tax on impulse buys. Redirect that bread to your wishlist. 💰",
];
