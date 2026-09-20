import { Router } from "express";

import healthRouter from "./health.routes";
import authRouter from "./auth.routes";
import problemRouter from "./problem.routes";
import adminProblemRouter from "./admin-problem.routes";
import universityRouter from "./university.routes";
import projectRouter from "./project.routes";
import studentRouter from "./student.routes";
import industryRouter from "./industry.routes";
import collaborationRouter from "./collaboration.routes";
import { projectSolutionRouter, solutionRouter } from "./solution.routes";

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
apiRouter.use("/university/projects", projectRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/industry", industryRouter);
apiRouter.use("/university/collaborations", collaborationRouter);
apiRouter.use("/projects", projectSolutionRouter);
apiRouter.use("/solutions", solutionRouter);

export default apiRouter;
