import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import * as controller from "../controllers/notification.controller";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.get("/unread-count", asyncHandler(controller.unreadCount));
router.patch("/read-all", asyncHandler(controller.readAll));
router.patch("/:id/read", asyncHandler(controller.read));
export default router;
