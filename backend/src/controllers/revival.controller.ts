import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/revival.service";
import { revivalCreateSchema, revivalQuerySchema, revivalUpdateSchema } from "../validators/revival.validators";
const actor = (request: Request) => { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; };
const parse = <T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }, value: unknown) => { const result = schema.safeParse(value); if (!result.success) throw new AppError("Invalid revival data", 400); return result.data as T; };
export async function list(request: Request, response: Response) { const query = parse(revivalQuerySchema, request.query); response.json({ success: true, data: await service.listInactive(actor(request), query.page, query.limit, query.status) }); }
export async function get(request: Request, response: Response) { response.json({ success: true, data: await service.get(request.params.problemId as string, actor(request)) }); }
export async function create(request: Request, response: Response) { response.status(201).json({ success: true, data: { review: await service.createReview(request.params.problemId as string, parse(revivalCreateSchema, request.body), actor(request)) } }); }
export async function update(request: Request, response: Response) { response.json({ success: true, data: { review: await service.updateReview(request.params.problemId as string, parse(revivalUpdateSchema, request.body), actor(request)) } }); }
