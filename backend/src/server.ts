import app from "./app";
import { connectDatabase } from "./config/database";
import { env, validateEnvironment } from "./config/env";

async function startServer() {
  validateEnvironment({ requireDatabase: env.nodeEnv !== "test" });

  if (env.nodeEnv !== "test") {
    await connectDatabase();
  }

  app.listen(env.port, () => {
    console.log(`NeuroX backend listening on port ${env.port}`);
  });
}

if (require.main === module) {
  startServer().catch((error: unknown) => {
    console.error("Unable to start NeuroX backend:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export { startServer };
