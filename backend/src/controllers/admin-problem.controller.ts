import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/admin-problem.service";
import { adminProblemQuerySchema, rejectionSchema } from "../validators/admin.validators";

function adminId(request: Request) {
  if (!request.auth) throw new AppError("Authentication required", 401);
  return request.auth.userId;
}

export async function list(request: Request, response: Response) {
  const parsed = adminProblemQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new AppError("Invalid admin problem query", 400);
  response.json({ success: true, data: await service.listProblems(parsed.data) });
}

export async function detail(request: Request, response: Response) {
  response.json({ success: true, data: { problem: await service.getProblem(request.params.id as string) } });
}

export async function validate(request: Request, response: Response) {
  response.json({ success: true, message: "Problem validated successfully", data: { problem: await service.validateProblem(request.params.id as string, adminId(request)) } });
}

export async function reject(request: Request, response: Response) {
  const parsed = rejectionSchema.safeParse(request.body);
  if (!parsed.success) throw new AppError("A valid rejection reason is required", 400);
  response.json({ success: true, message: "Problem rejected successfully", data: { problem: await service.rejectProblem(request.params.id as string, adminId(request), parsed.data.reason) } });
}
