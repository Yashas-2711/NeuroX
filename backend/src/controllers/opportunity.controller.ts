import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { opportunityGenerateSchema, opportunityQuerySchema } from "../validators/opportunity.validators";
import * as service from "../services/opportunity-match.service";
function actor(request: Request) { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; }
function id(value: string | string[]) { return Array.isArray(value) ? value[0] : value; }
export async function generate(request: Request, response: Response) { const parsed = opportunityGenerateSchema.safeParse(request.body ?? {}); if (!parsed.success) throw new AppError("Invalid opportunity generation request", 400); response.status(201).json({ success: true, data: { matches: await service.generate(id(request.params.problemId), actor(request), parsed.data.entityType) } }); }
export async function list(request: Request, response: Response) { const parsed = opportunityQuerySchema.safeParse(request.query); if (!parsed.success) throw new AppError("Invalid opportunity filters", 400); response.json({ success: true, data: await service.list(id(request.params.problemId), actor(request), parsed.data) }); }
export async function get(request: Request, response: Response) { response.json({ success: true, data: { match: await service.get(id(request.params.problemId), id(request.params.matchId), actor(request)) } }); }
export async function refresh(request: Request, response: Response) { response.status(201).json({ success: true, data: { matches: await service.generate(id(request.params.problemId), actor(request)) } }); }
