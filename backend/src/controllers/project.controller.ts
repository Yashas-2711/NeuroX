import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/project.service";
import * as v from "../validators/project.validators";
const uid = (r: Request) => {
  if (!r.auth) throw new AppError("Authentication required", 401);
  return r.auth.userId;
};
const parsed = (schema: any, value: any) => {
  const p = schema.safeParse(value);
  if (!p.success) throw new AppError("Invalid project data", 400);
  return p.data;
};
export async function create(r: Request, s: Response) {
  s.status(201).json({
    success: true,
    data: {
      project: await service.create(
        uid(r),
        parsed(v.projectCreateSchema, r.body),
      ),
    },
  });
}
export async function list(r: Request, s: Response) {
  s.json({
    success: true,
    data: await service.list(uid(r), parsed(v.projectQuerySchema, r.query)),
  });
}
export async function detail(r: Request, s: Response) {
  s.json({
    success: true,
    data: { project: await service.detail(uid(r), r.params.id as string) },
  });
}
export async function update(r: Request, s: Response) {
  s.json({
    success: true,
    data: {
      project: await service.update(
        uid(r),
        r.params.id as string,
        parsed(v.projectUpdateSchema, r.body),
      ),
    },
  });
}
export async function status(r: Request, s: Response) {
  const p = parsed(v.projectStatusSchema, r.body);
  s.json({
    success: true,
    data: {
      project: await service.setStatus(uid(r), r.params.id as string, p.status),
    },
  });
}
export async function team(r: Request, s: Response) {
  s.status(201).json({
    success: true,
    data: {
      team: await service.createTeam(
        uid(r),
        r.params.id as string,
        parsed(v.teamCreateSchema, r.body).name,
      ),
    },
  });
}
export async function getTeam(r: Request, s: Response) {
  s.json({
    success: true,
    data: { team: await service.getTeam(uid(r), r.params.id as string) },
  });
}
export async function addMember(r: Request, s: Response) {
  const p = parsed(v.memberSchema, r.body);
  s.json({
    success: true,
    data: {
      team: await service.addMember(uid(r), r.params.id as string, p.userId),
    },
  });
}
export async function removeMember(r: Request, s: Response) {
  s.json({
    success: true,
    data: {
      team: await service.removeMember(
        uid(r),
        r.params.id as string,
        r.params.userId as string,
      ),
    },
  });
}
export async function milestones(r: Request, s: Response) {
  s.json({
    success: true,
    data: await service.listMilestones(uid(r), r.params.id as string),
  });
}
export async function addMilestone(r: Request, s: Response) {
  s.status(201).json({
    success: true,
    data: {
      milestone: await service.addMilestone(
        uid(r),
        r.params.id as string,
        parsed(v.milestoneCreateSchema, r.body),
      ),
    },
  });
}
export async function updateMilestone(r: Request, s: Response) {
  s.json({
    success: true,
    data: {
      milestone: await service.updateMilestone(
        uid(r),
        r.params.id as string,
        r.params.milestoneId as string,
        parsed(v.milestoneUpdateSchema, r.body),
      ),
    },
  });
}
export async function deleteMilestone(r: Request, s: Response) {
  s.json({
    success: true,
    data: await service.deleteMilestone(
      uid(r),
      r.params.id as string,
      r.params.milestoneId as string,
    ),
  });
}
