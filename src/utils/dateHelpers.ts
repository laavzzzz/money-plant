/* 🧠 SAFE DATE FORMATTER */

type FormatOptions = {
  withYear?: boolean;
  withTime?: boolean;
};

/* 📅 MAIN FORMAT FUNCTION */
export function formatDate(
  date: string | Date,
  options: FormatOptions = {}
) {
  try {
    const d = new Date(date);

    // ❌ invalid date check
    if (isNaN(d.getTime())) return "Invalid date";

    const { withYear = false, withTime = false } = options;

    const base = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      ...(withYear && { year: "numeric" }),
    });

    if (withTime) {
      const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${base}, ${time}`;
    }

    return base;
  } catch (error) {
    console.error("Date format error:", error);
    return "Invalid date";
  }
}

/* 📅 TODAY */
export function getToday() {
  return new Date().toISOString().split("T")[0];
}

/* 📅 YESTERDAY */
export function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

/* 📅 RELATIVE TIME (NEW 🔥) */
export function timeAgo(date: string | Date) {
  const now = new Date();
  const past = new Date(date);

  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return formatDate(date);
}