import dotenv from "dotenv";

dotenv.config();

export type NodeEnvironment = "development" | "test" | "production";

const nodeEnvironment = (process.env.NODE_ENV ?? "development") as NodeEnvironment;

if (!["development", "test", "production"].includes(nodeEnvironment)) {
  throw new Error("NODE_ENV must be development, test, or production");
}

export const env = {
  nodeEnv: nodeEnvironment,
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? "",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "",
  aiRequestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 30000),
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
} as const;

export function validateEnvironment(options: { requireDatabase?: boolean } = {}) {
  const missing: string[] = [];

  if (!Number.isInteger(env.port) || env.port <= 0) {
    throw new Error("PORT must be a positive integer");
  }
  if (!Number.isInteger(env.aiRequestTimeoutMs) || env.aiRequestTimeoutMs <= 0) {
    throw new Error("AI_REQUEST_TIMEOUT_MS must be a positive integer");
  }

  if (!env.clientUrl) missing.push("CLIENT_URL");
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (options.requireDatabase && !env.mongodbUri) missing.push("MONGODB_URI");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
