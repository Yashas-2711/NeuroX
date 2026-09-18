import { z } from "zod";
import { PROJECT_STATUSES, MILESTONE_TYPES } from "../models";

export const projectCreateSchema = z.object({ title: z.string().trim().min(3).max(200), description: z.string().trim().min(10).max(10000), problemId: z.string().regex(/^[a-f\d]{24}$/i), startDate: z.coerce.date().optional(), targetEndDate: z.coerce.date().optional() }).strict();
export const projectUpdateSchema = z.object({ title: z.string().trim().min(3).max(200).optional(), description: z.string().trim().min(10).max(10000).optional(), startDate: z.coerce.date().nullable().optional(), targetEndDate: z.coerce.date().nullable().optional() }).strict();
export const projectStatusSchema = z.object({ status: z.enum(PROJECT_STATUSES) }).strict();
export const projectQuerySchema = z.object({ status: z.enum(PROJECT_STATUSES).optional(), search: z.string().trim().max(200).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
export const teamCreateSchema = z.object({ name: z.string().trim().min(2).max(160) }).strict();
export const memberSchema = z.object({ userId: idSchema, role: z.literal("MEMBER").default("MEMBER") }).strict();
export const milestoneCreateSchema = z.object({ title: z.string().trim().min(2).max(200), description: z.string().trim().max(3000).default(""), type: z.enum(MILESTONE_TYPES), dueDate: z.coerce.date().optional(), order: z.number().int().min(0).default(0) }).strict();
export const milestoneUpdateSchema = milestoneCreateSchema.partial().extend({ status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(), completedAt: z.coerce.date().nullable().optional() }).strict();
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
