import { Router } from "express";

import { env } from "../config/env";

const healthRouter = Router();

healthRouter.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "NeuroX API is running",
    service: "backend",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
