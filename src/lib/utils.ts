import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 🛠 THE CLASS MERGER
 * Safely merges Tailwind classes, handling conflicts automatically.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 💵 CURRENCY FORMATTER
 * Converts numbers into clean USD strings.
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * 📈 COMPACT NUMBER FORMATTER
 * Converts 1000 to "1k", 1000000 to "1M" — essential for Gen Z UIs.
 */
export function formatCompactNumber(number: number) {
  const formatter = Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(number);
}

/**
 * 📅 DATE FORMATTER
 * Returns dates in a readable format (e.g., "May 12, 2026").
 */
export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * 🕒 RELATIVE TIME FORMATTER
 * Returns "2 hours ago", "Yesterday", etc. Perfect for transaction feeds.
 */
export function formatRelativeTime(date: Date | string | number) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

/**
 * 🌿 PLANT GROWTH CALCULATOR (Identity Logic)
 * Calculates level and progress percentage based on a score or savings goal.
 */
export function calculateLevel(score: number) {
  const pointsPerLevel = 1000;
  const level = Math.floor(score / pointsPerLevel) + 1;
  const progress = (score % pointsPerLevel) / 10; // Returns percentage 0-100
  
  return {
    level,
    progress,
    label: level > 10 ? "Ancient Oak" : level > 5 ? "Money Tree" : "Sprout",
  };
}

/**
 * 🪄 PERCENTAGE FORMATTER
 * Good for showing growth rates or budget usage.
 */
export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}