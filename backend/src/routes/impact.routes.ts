import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/impact-twin.controller";

const router = Router();
router.use(requireAuth);
router.get("/:problemId/impact", asyncHandler(controller.get));
router.post("/:problemId/impact/indicators", asyncHandler(controller.createIndicator));
router.patch("/:problemId/impact/indicators/:indicatorId", asyncHandler(controller.updateIndicator));
router.post("/:problemId/impact/scenarios", asyncHandler(controller.createScenario));
router.patch("/:problemId/impact/scenarios/:scenarioId", asyncHandler(controller.updateScenario));
router.post("/:problemId/impact/observations", asyncHandler(controller.observe));
router.get("/:problemId/impact/history", asyncHandler(controller.history));
export default router;
