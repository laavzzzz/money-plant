import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "❌ Environment Configuration Failure: Please define MONGODB_URI inside your .env.local configuration file."
  );
}

const uri = process.env.MONGODB_URI;

// ⚡ Optimized Connection Pooling configurations for serverless environments
const options: MongoClientOptions = {
  maxPoolSize: 10,             // Keeps up to 10 concurrent sockets open per instance
  minPoolSize: 2,              // Keeps at least 2 sockets warm to avoid cold-start lag
  connectTimeoutMS: 10000,     // Time out after 10 seconds if connection drops
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, utilize a global variable to cache and preserve 
  // the client instance across Hot Module Replacement (HMR) reloads.
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production serverless/edge spaces, it's safer to instantiate a clean client per cold start.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the secure singleton client promise to be consumed directly by NextAuth Adapter
export default clientPromise;