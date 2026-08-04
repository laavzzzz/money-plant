import mongoose from "mongoose";

/**
 * Interface representing the cached Mongoose connection structure stored
 * on the global Node.js process context to survive Hot Module Replacement (HMR).
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend the Node.js global object type definition to register the custom
 * Mongoose cache namespace safely.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Environment configuration and safety checks.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Invalid/Missing Environment Variable: Please define 'MONGODB_URI' in your environment configuration (.env.local)."
  );
}

/**
 * Internal logger abstraction providing structured logging without exposing
 * sensitive credentials or cluttering production console outputs.
 */
const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`[dbConnect][INFO] ${message}`, meta ? JSON.stringify(meta) : "");
    }
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[dbConnect][WARN] ${message}`, meta ? JSON.stringify(meta) : "");
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[dbConnect][ERROR] ${message}`, meta ? JSON.stringify(meta) : "");
  },
};

/**
 * Global cache initialization.
 * In development mode, Node's global object is used so that the database
 * connection persists across module reloads caused by HMR. In production,
 * globalThis retains the module state across serverless container re-uses.
 */
let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Singleton guard flag to ensure Mongoose connection event listeners
 * are only attached once during the application runtime lifecycle.
 */
let listenersAttached = false;

/**
 * Attaches global lifecycle event listeners to the Mongoose connection object.
 */
function attachConnectionListeners(): void {
  if (listenersAttached) return;

  const db = mongoose.connection;

  db.on("connected", () => {
    logger.info("MongoDB connection established successfully.");
  });

  db.on("error", (err: Error) => {
    logger.error("MongoDB connection encountered an error:", { message: err.message });
  });

  db.on("disconnected", () => {
    logger.warn("MongoDB connection disconnected. Purging cached instance.");
    if (global.mongooseCache) {
      global.mongooseCache.conn = null;
      global.mongooseCache.promise = null;
    }
  });

  listenersAttached = true;
}

/**
 * Database Connection Options tailored for Next.js App Router and Serverless Runtime.
 */
const MONGO_OPTIONS: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
};

/**
 * Establishes or retrieves an existing cached Mongoose database connection.
 * Optimized for Next.js App Router route handlers, Server Actions, and Server Components.
 *
 * @returns {Promise<typeof mongoose>} The active Mongoose connection instance.
 * @throws {Error} If connection establishment fails.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // 1. Validate existing connection health
  if (cached.conn) {
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection lost or connecting; invalidate stale cache
    logger.warn("Cached Mongoose connection is stale or disconnected. Re-establishing...");
    cached.conn = null;
    cached.promise = null;
  }

  // 2. Initialize connection attempt if no active promise exists
  if (!cached.promise) {
    attachConnectionListeners();

    logger.info("Initiating new MongoDB connection...");

    cached.promise = mongoose
      .connect(MONGODB_URI!, MONGO_OPTIONS)
      .then((mongooseInstance) => {
        logger.info("MongoDB connection promise resolved.");
        return mongooseInstance;
      })
      .catch((error: Error) => {
        logger.error("Failed to connect to MongoDB:", { message: error.message });
        cached.promise = null;
        throw error;
      });
  }

  // 3. Await connection resolution and cache the active connection instance
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;