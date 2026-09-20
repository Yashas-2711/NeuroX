import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/solution.service";
import * as v from "../validators/solution.validators";

const actor = (request: Request) => {
  if (!request.auth) throw new AppError("Authentication required", 401);
  return { userId: request.auth.userId, role: request.auth.role };
};
const parse = (schema: { safeParse: (value: unknown) => any }, value: unknown) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new AppError("Invalid solution data", 400);
  return parsed.data;
};

export async function list(request: Request, response: Response) { response.json({ success: true, data: await service.list(actor(request), request.params.projectId as string) }); }
export async function create(request: Request, response: Response) { response.status(201).json({ success: true, data: { solution: await service.create(actor(request), request.params.projectId as string, parse(v.solutionCreateSchema, request.body)) } }); }
export async function detail(request: Request, response: Response) { response.json({ success: true, data: await service.detail(actor(request), request.params.id as string) }); }
export async function update(request: Request, response: Response) { response.json({ success: true, data: { solution: await service.update(actor(request), request.params.id as string, parse(v.solutionUpdateSchema, request.body)) } }); }
export async function review(request: Request, response: Response) { const input = parse(v.reviewSchema, request.body); response.json({ success: true, data: { solution: await service.review(actor(request), request.params.id as string, input.status, input.reviewNotes) } }); }
export async function lifecycle(request: Request, response: Response) { const input = parse(v.lifecycleSchema, request.body); response.json({ success: true, data: { solution: await service.lifecycle(actor(request), request.params.id as string, input.status, input.lifecycleNotes) } }); }

