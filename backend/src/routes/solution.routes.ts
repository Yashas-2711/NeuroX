import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/solution.controller";

export const projectSolutionRouter = Router();
projectSolutionRouter.use(requireAuth);
projectSolutionRouter.get("/:projectId/solutions", asyncHandler(controller.list));
projectSolutionRouter.post("/:projectId/solutions", asyncHandler(controller.create));

export const solutionRouter = Router();
solutionRouter.use(requireAuth);
solutionRouter.get("/:id", asyncHandler(controller.detail));
solutionRouter.patch("/:id", asyncHandler(controller.update));
solutionRouter.patch("/:id/review", asyncHandler(controller.review));
solutionRouter.patch("/:id/status", asyncHandler(controller.lifecycle));

