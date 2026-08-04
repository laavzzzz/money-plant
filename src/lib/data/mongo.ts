import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/money-plant";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  failed: boolean;
};

type GlobalWithMongooseCache = typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const globalWithCache = globalThis as GlobalWithMongooseCache;

const cached: MongooseCache = (globalWithCache.mongooseCache ?? {
  conn: null,
  promise: null,
  failed: false,
}) as MongooseCache;

if (!globalWithCache.mongooseCache) {
  globalWithCache.mongooseCache = cached;
}

const MONGO_PROBE_MS = 1500;

function useLocalOnly(): boolean {
  const flag = process.env.USE_LOCAL_DATA?.toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export async function tryMongoConnect(): Promise<boolean> {
  if (useLocalOnly()) return false;
  if (cached.failed) return false;
  if (cached.conn?.connection?.readyState === 1) return true;

  try {
    if (!cached.promise) {
      const connectPromise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: MONGO_PROBE_MS,
        connectTimeoutMS: MONGO_PROBE_MS,
      });
      cached.promise = Promise.race([
        connectPromise,
        new Promise<typeof mongoose>((_, reject) => {
          setTimeout(
            () => reject(new Error("MongoDB probe timeout")),
            MONGO_PROBE_MS + 200
          );
        }),
      ]);
    }
    cached.conn = await cached.promise;
    return cached.conn.connection.readyState === 1;
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    cached.promise = null;
    cached.conn = null;
    cached.failed = true;
    console.warn(
      "[MoneyPlant] MongoDB unavailable — using local file store (.data/). Start MongoDB or set MONGODB_URI.",
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

/** @deprecated Use tryMongoConnect; kept for existing imports */
export default async function dbConnect() {
  const ok = await tryMongoConnect();
  if (!ok) {
    throw new Error(
      "MongoDB is not available. The app will use local storage when APIs support it."
    );
  }
  return cached.conn!;
}
