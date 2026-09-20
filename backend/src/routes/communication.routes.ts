import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/communication.controller";
const router = Router(); router.use(requireAuth); router.get("/:projectId/messages", asyncHandler(controller.list)); router.post("/:projectId/messages", asyncHandler(controller.create)); export default router;
