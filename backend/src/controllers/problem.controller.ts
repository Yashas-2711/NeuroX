import type { Request, Response } from "express";
import { createProblemSchema } from "../validators/problem.validators";
import { AppError } from "../middleware/errorHandler";
import * as service from "../services/problem.service";

function auth(request: Request) { if (!request.auth) throw new AppError("Authentication required", 401); return request.auth; }
export async function create(request: Request, response: Response) { const user = auth(request); const parsed = createProblemSchema.safeParse(request.body); if (!parsed.success) throw new AppError("Invalid problem data", 400); const problem = await service.createProblem(parsed.data, user.userId); response.status(201).json({ success: true, message: "Problem submitted successfully", data: { problem } }); }
export async function listMine(request: Request, response: Response) { const user = auth(request); const problems = await service.getCitizenProblems(user.userId); response.json({ success: true, data: { problems } }); }
export async function getMine(request: Request, response: Response) { const user = auth(request); const problem = await service.getCitizenProblemById(request.params.id as string, user.userId); response.json({ success: true, data: { problem } }); }
export async function getProgress(request: Request, response: Response) { const user = auth(request); const progress = await service.getProblemProgress(request.params.id as string, user.userId); response.json({ success: true, data: progress }); }
