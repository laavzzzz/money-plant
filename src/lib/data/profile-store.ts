import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const PROFILE_FILE = path.join(DATA_DIR, "profile.json");

const DEFAULT_PROFILE = {
  name: "Player One",
  title: "Level 12 Wealth Guardian",
  email: "player.one@moneyplant.app",
  phone: "+91 98765 43210",
  location: "Bengaluru, India",
  accountType: "Premium Saver",
  joinedDate: "June 2024",
  bio: "Building better money habits one plant at a time.",
  totalSaved: "₹1,24,800",
  monthlyAverage: "₹12,300",
  goalCompletion: "8 / 12",
  profilePic: null,
};

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();

  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(file, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function getLocalProfile() {
  return readJson(PROFILE_FILE, DEFAULT_PROFILE);
}

export async function saveLocalProfile(profile: Partial<typeof DEFAULT_PROFILE>) {
  const current = await getLocalProfile();
  const next = { ...current, ...profile };
  await writeJson(PROFILE_FILE, next);
  return next;
}
