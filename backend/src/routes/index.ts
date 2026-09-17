import { Router } from "express";

import healthRouter from "./health.routes";
import authRouter from "./auth.routes";
import problemRouter from "./problem.routes";
import adminProblemRouter from "./admin-problem.routes";
import universityRouter from "./university.routes";

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
apiRouter.use("/admin/problems", adminProblemRouter);
apiRouter.use("/university", universityRouter);

export default apiRouter;
