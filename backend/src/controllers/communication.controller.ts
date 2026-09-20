import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/communication.service";
import { messageQuerySchema, messageSchema } from "../validators/communication.validators";
const auth = (request: Request) => { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; };
export async function list(request: Request, response: Response) { const user = auth(request); const query = messageQuerySchema.safeParse(request.query); if (!query.success) throw new AppError("Invalid message query", 400); response.json({ success: true, data: await service.list(request.params.projectId as string, user.userId, query.data.page, query.data.limit) }); }
export async function create(request: Request, response: Response) { const user = auth(request); const parsed = messageSchema.safeParse(request.body); if (!parsed.success) throw new AppError("Invalid message content", 400); response.status(201).json({ success: true, data: { message: await service.create(request.params.projectId as string, user.userId, parsed.data.body) } }); }
