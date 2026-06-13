import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseConnection = typeof mongoose;

type MongooseCache = {
    conn: MongooseConnection | null;
    promise: Promise<MongooseConnection> | null;
};

// Reuse a single cache object across hot reloads in development.
const globalWithMongoose = globalThis as typeof globalThis & {
    mongooseCache?: MongooseCache;
};

const cached = globalWithMongoose.mongooseCache ?? {
    conn: null,
    promise: null,
};

globalWithMongoose.mongooseCache = cached;

export async function connectToDatabase(): Promise<MongooseConnection> {
    // Return the existing connection immediately when available.
    if (cached.conn) {
        return cached.conn;
    }

    // Create only one in-flight connection promise at a time.
    if (!cached.promise) {
        // Validate MongoDB URI exists
        if (!MONGODB_URI) {
            throw new Error("Missing MONGODB_URI environment variable");
        }
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 20000,
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset promise on failure so future attempts can retry.
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

export default connectToDatabase;
