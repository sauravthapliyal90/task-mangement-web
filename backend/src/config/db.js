import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    // Pool sizing matters for scalability under concurrent load -
    // each app instance keeps a small pool instead of one connection
    // per request.
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
  });

  logger.info(`MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

export { connectDB, disconnectDB };
