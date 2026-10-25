import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<string> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host;
  }

  // First try connecting to real MongoDB URI
  try {
    let cleanUri = env.MONGODB_URI.trim().replace(/[^\x20-\x7E]/g, '');
    cleanUri = cleanUri.replace(/\/+(\?|$)/, '$1');
    const conn = await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to MongoDB at ${cleanUri.replace(/:[^:@]+@/, ':****@')}`);
    return conn.connection.host;
  } catch (err: any) {
    if (!env.USE_MEMORY_DB_FALLBACK) {
      console.error(`[MongoDB] Failed to connect to ${env.MONGODB_URI} and fallback disabled:`, err.message);
      throw err;
    }
    console.warn(`[MongoDB] Could not reach ${env.MONGODB_URI} (${err.message}). Starting MongoMemoryServer...`);
  }

  // Fallback to in-memory MongoDB server
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected to In-Memory MongoDB at ${uri}`);
    return uri;
  } catch (memErr: any) {
    console.error(`[MongoDB] Failed to start MongoMemoryServer:`, memErr.message);
    throw memErr;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    mongoMemoryServer = null;
  }
  console.log('[MongoDB] Disconnected from MongoDB');
}
