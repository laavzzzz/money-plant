import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10, // Keeps up to 10 connection sockets alive for speed
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error(
    "❌ Environment Configuration Failure: Please define MONGODB_URI inside your .env.local configuration file."
  );
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the database connection
  // is preserved across code changes during live reloading.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri!, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode (on Vercel/GitHub deployment), it's best to not use a global variable.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}

// Export the connection promise so other files can import it instantly
export default clientPromise;