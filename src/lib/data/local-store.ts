import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type StoreTransaction = {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type StoreStreak = {
  userId: string;
  count: number;
  lastActiveDate: string | null;
};

export type StoreGoal = {
  _id: string;
  title: string;
  saved: number;
  target: number;
  emoji: string;
};

export type StoreWishlistItem = {
  _id: string;
  name: string;
  categoryType: string;
  amount: number;
  monthlySave: number;
  savedSoFar: number;
  targetMonth: string;
  genZComment: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const TX_FILE = path.join(DATA_DIR, "transactions.json");
const STREAK_FILE = path.join(DATA_DIR, "streak.json");
const GOALS_FILE = path.join(DATA_DIR, "goals.json");
const WISHLIST_FILE = path.join(DATA_DIR, "wishlist.json");

const SEED_TRANSACTIONS: StoreTransaction[] = [
  {
    _id: "seed-1",
    title: "Monthly Salary",
    amount: 45000,
    type: "income",
    category: "Income",
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-2",
    title: "Coffee Run",
    amount: 320,
    type: "expense",
    category: "Food",
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-3",
    title: "Metro Pass",
    amount: 800,
    type: "expense",
    category: "Transport",
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-4",
    title: "Freelance Gig",
    amount: 5000,
    type: "income",
    category: "Income",
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_STREAK: StoreStreak = {
  userId: "demo-user",
  count: 3,
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await ensureDir();
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function listLocalTransactions(): Promise<StoreTransaction[]> {
  const txs = await readJson<StoreTransaction[]>(TX_FILE, SEED_TRANSACTIONS);
  return [...txs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function addLocalTransaction(
  input: Omit<StoreTransaction, "_id" | "createdAt" | "updatedAt" | "date"> & {
    date?: string;
  }
): Promise<StoreTransaction> {
  const txs = await listLocalTransactions();
  const now = new Date().toISOString();
  const tx: StoreTransaction = {
    _id: randomUUID(),
    title: input.title,
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date ?? now,
    createdAt: now,
    updatedAt: now,
  };
  txs.unshift(tx);
  await writeJson(TX_FILE, txs);
  return tx;
}

export async function deleteLocalTransaction(id: string): Promise<boolean> {
  const txs = await listLocalTransactions();
  const next = txs.filter((t) => t._id !== id);
  if (next.length === txs.length) return false;
  await writeJson(TX_FILE, next);
  return true;
}

export async function getLocalStreak(): Promise<StoreStreak> {
  return readJson<StoreStreak>(STREAK_FILE, DEFAULT_STREAK);
}

export async function saveLocalStreak(streak: StoreStreak) {
  await writeJson(STREAK_FILE, streak);
}

const SEED_GOALS: StoreGoal[] = [
  { _id: "goal-1", title: "Europe Trip", saved: 35000, target: 100000, emoji: "✈️" },
  { _id: "goal-2", title: "New Laptop", saved: 45000, target: 80000, emoji: "💻" },
];

export async function listLocalGoals(): Promise<StoreGoal[]> {
  return readJson<StoreGoal[]>(GOALS_FILE, SEED_GOALS);
}

export async function addLocalGoal(
  input: Omit<StoreGoal, "_id">
): Promise<StoreGoal> {
  const goals = await listLocalGoals();
  const goal: StoreGoal = { _id: randomUUID(), ...input };
  goals.push(goal);
  await writeJson(GOALS_FILE, goals);
  return goal;
}

function monthOffset(add: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + add);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const SEED_WISHLIST: StoreWishlistItem[] = [
  {
    _id: "wish-1",
    name: "PS5 Slim",
    categoryType: "gaming",
    amount: 54999,
    monthlySave: 9000,
    savedSoFar: 18000,
    targetMonth: monthOffset(2),
    genZComment: "Ranked nights with the squad — no lag, no L.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "wish-2",
    name: "Zara Jacket",
    categoryType: "fashion",
    amount: 4500,
    monthlySave: 1500,
    savedSoFar: 3000,
    targetMonth: monthOffset(1),
    genZComment: "Fall fit check needs to eat.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "wish-3",
    name: "Claude Pro",
    categoryType: "subscriptions",
    amount: 2000,
    monthlySave: 2000,
    savedSoFar: 2000,
    targetMonth: monthOffset(0),
    genZComment: "AI co-pilot for assignments and side hustles.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "wish-4",
    name: "YSL Heels",
    categoryType: "luxury",
    amount: 89000,
    monthlySave: 12000,
    savedSoFar: 24000,
    targetMonth: monthOffset(5),
    genZComment: "Event season — walk in, own the room.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function listLocalWishlist(): Promise<StoreWishlistItem[]> {
  const items = await readJson<StoreWishlistItem[]>(WISHLIST_FILE, SEED_WISHLIST);
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function addLocalWishlistItem(
  input: Omit<StoreWishlistItem, "_id" | "createdAt" | "updatedAt" | "savedSoFar"> & {
    savedSoFar?: number;
  }
): Promise<StoreWishlistItem> {
  const items = await listLocalWishlist();
  const now = new Date().toISOString();
  const item: StoreWishlistItem = {
    _id: randomUUID(),
    savedSoFar: input.savedSoFar ?? 0,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  items.unshift(item);
  await writeJson(WISHLIST_FILE, items);
  return item;
}

export async function updateLocalWishlistItem(
  id: string,
  patch: Partial<
    Pick<
      StoreWishlistItem,
      | "name"
      | "categoryType"
      | "amount"
      | "monthlySave"
      | "savedSoFar"
      | "targetMonth"
      | "genZComment"
    >
  >
): Promise<StoreWishlistItem | null> {
  const items = await listLocalWishlist();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = {
    ...items[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(WISHLIST_FILE, items);
  return items[idx];
}

export async function deleteLocalWishlistItem(id: string): Promise<boolean> {
  const items = await listLocalWishlist();
  const next = items.filter((i) => i._id !== id);
  if (next.length === items.length) return false;
  await writeJson(WISHLIST_FILE, next);
  return true;
}
