import { Router } from "express";

import healthRouter from "./health.routes";
import authRouter from "./auth.routes";
import problemRouter from "./problem.routes";

const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.json({
    success: true,
    name: "NeuroX API",
    version: "1.0.0",
  });
});

apiRouter.use(healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/problems", problemRouter);

export default apiRouter;
