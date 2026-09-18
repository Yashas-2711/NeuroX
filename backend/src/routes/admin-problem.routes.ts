import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { detail, list, progress, reject, validate } from "../controllers/admin-problem.controller";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));
router.get("/", asyncHandler(list));
router.get("/:id", asyncHandler(detail));
router.get("/:id/progress", asyncHandler(progress));
router.patch("/:id/validate", asyncHandler(validate));
router.patch("/:id/reject", asyncHandler(reject));
export default router;
