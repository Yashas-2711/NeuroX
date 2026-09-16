import mongoose from "mongoose";

import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required before connecting to MongoDB");
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connection established");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(env.mongodbUri);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
