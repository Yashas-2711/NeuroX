import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/analytics.service";
import { analyticsQuerySchema } from "../validators/analytics.validators";
export async function getDashboard(request: Request, response: Response) { if (!request.auth) throw new AppError("Authentication required", 401); const parsed = analyticsQuerySchema.safeParse(request.query); if (!parsed.success) throw new AppError("Invalid analytics filters", 400); response.json({ success: true, data: await service.dashboard(request.auth, parsed.data) }); }
