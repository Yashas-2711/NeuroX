import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/industry.service";
import { collaborationRequestSchema, industryProfileSchema, opportunityQuerySchema } from "../validators/industry.validators";
function uid(request: Request) { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth.userId; }
function parse(schema: any, value: any) { const result = schema.safeParse(value); if (!result.success) throw new AppError("Invalid industry data", 400); return result.data; }
export async function profile(request: Request, response: Response) { response.json({ success: true, data: { profile: await service.getProfile(uid(request)) } }); }
export async function updateProfile(request: Request, response: Response) { response.json({ success: true, data: { profile: await service.saveProfile(uid(request), parse(industryProfileSchema, request.body)) } }); }
export async function opportunities(request: Request, response: Response) { response.json({ success: true, data: await service.opportunities(uid(request), parse(opportunityQuerySchema, request.query)) }); }
export async function opportunity(request: Request, response: Response) { response.json({ success: true, data: { opportunity: await service.opportunity(uid(request), request.params.id as string) } }); }
export async function interest(request: Request, response: Response) { const body = parse(collaborationRequestSchema, request.body); response.status(201).json({ success: true, data: await service.requestInterest(uid(request), request.params.id as string, body.message) }); }
export async function collaborations(request: Request, response: Response) { response.json({ success: true, data: { collaborations: await service.collaborations(uid(request)) } }); }
export async function project(request: Request, response: Response) { response.json({ success: true, data: { project: await service.industryProject(uid(request), request.params.id as string) } }); }
