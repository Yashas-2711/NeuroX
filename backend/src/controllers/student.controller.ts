import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/student.service";

function userId(request: Request) {
  if (!request.auth) throw new AppError("Authentication required", 401);
  return request.auth.userId;
}

export async function listTeams(request: Request, response: Response) {
  response.json({ success: true, data: { teams: await service.listTeams(userId(request)) } });
}

export async function getTeam(request: Request, response: Response) {
  response.json({ success: true, data: { team: await service.getTeam(userId(request), request.params.id as string) } });
}
