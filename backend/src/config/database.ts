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

  // Step 6 stores structured city/state/country values. The earlier schema
  // created a 2dsphere index that is incompatible with that shape; GPS/maps
  // are intentionally deferred to a later workflow step.
  try {
    await mongoose.connection.db?.collection("problems").dropIndex("location_2dsphere");
  } catch (error) {
    if ((error as { code?: number }).code !== 27) throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
