import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/collaboration.service";
function uid(request: Request) { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth.userId; }
export async function list(request: Request, response: Response) { response.json({ success: true, data: { collaborations: await service.listForUniversity(uid(request)) } }); }
export async function accept(request: Request, response: Response) { response.json({ success: true, data: { collaboration: await service.accept(uid(request), request.params.id as string) } }); }
export async function reject(request: Request, response: Response) { response.json({ success: true, data: { collaboration: await service.reject(uid(request), request.params.id as string) } }); }
