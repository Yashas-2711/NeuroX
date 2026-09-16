import { Router } from "express";

import { login, logout, me, register, roleCheck } from "../controllers/auth.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);
authRouter.post("/logout", requireAuth, logout);

authRouter.get("/test/citizen", requireAuth, requireRole("CITIZEN"), roleCheck("CITIZEN"));
authRouter.get("/test/university", requireAuth, requireRole("UNIVERSITY"), roleCheck("UNIVERSITY"));
authRouter.get("/test/industry", requireAuth, requireRole("INDUSTRY"), roleCheck("INDUSTRY"));
authRouter.get("/test/admin", requireAuth, requireRole("ADMIN"), roleCheck("ADMIN"));

export default authRouter;
