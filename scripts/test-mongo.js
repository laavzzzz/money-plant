const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function main() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf-8');
        const match = raw.match(/^MONGODB_URI=(.+)$/m);
        if (match) uri = match[1].trim();
      }
    }

    if (!uri) {
      console.error('MONGODB_URI not found in environment or .env.local');
      process.exit(2);
    }

    console.log('Using MONGODB_URI:', uri.replace(/([^:\/]{4}).+(@)/, '$1***$2'));

    // try connecting with a short timeout
    const opts = { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 };
    await mongoose.connect(uri, opts);
    console.log('MongoDB connection: OK');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
