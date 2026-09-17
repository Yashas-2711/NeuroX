import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/university.controller";
const router=Router(); router.use(requireAuth,requireRole("UNIVERSITY"));
router.get("/profile",asyncHandler(controller.profile)); router.patch("/profile",asyncHandler(controller.updateProfile)); router.get("/problems",asyncHandler(controller.problems)); router.get("/problems/:id/match",asyncHandler(controller.match)); router.get("/problems/:id",asyncHandler(controller.problem)); router.post("/problems/:id/interest",asyncHandler(controller.expressInterest)); router.get("/matches",asyncHandler(controller.matches)); export default router;
