import mongoose from "mongoose";

/* 🔐 Ensure env exists and narrow type */
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "❌ Please define MONGODB_URI in .env.local"
  );
}
const MONGODB_URI: string = uri; // now guaranteed string

/* 🧠 Cache type */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/* 🌍 Extend globalThis */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/* ♻️ Initialize cache */
const cached: MongooseCache =
  global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/* 🔌 Connect */
export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}