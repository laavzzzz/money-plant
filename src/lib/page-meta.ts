export type PageMeta = {
  title: string;
  subtitle?: string;
  /** Skip the large layout page header (page has its own hero) */
  compactHeader?: boolean;
};

const ROUTES: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your garden at a glance",
  },
  "/transactions": {
    title: "History",
    subtitle: "Track income & expenses",
  },
  "/garden": {
    title: "Garden",
    subtitle: "Grow your money tree",
  },
  "/wishlist": {
    title: "Wishlist",
    subtitle: "Monthly drops you're manifesting",
  },
  "/leaderboard": {
    title: "Ranks",
    subtitle: "Aura leaderboard",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Your character sheet",
  },
  "/accounts": {
    title: "Accounts",
    subtitle: "Connected bank and balance overview",
  },
  "/goals": {
    title: "Goals",
    subtitle: "Savings targets",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Spending breakdown",
  },
};

export function getPageMeta(pathname: string): PageMeta {
  const key = Object.keys(ROUTES).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (key) return ROUTES[key];
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  return {
    title: segment.charAt(0).toUpperCase() + segment.slice(1),
    subtitle: "MoneyPlant",
  };
}
