import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/student.controller";

const router = Router();
router.use(requireAuth, requireRole("STUDENT"));
router.get("/teams", asyncHandler(controller.listTeams));
router.get("/teams/:id", asyncHandler(controller.getTeam));
export default router;
