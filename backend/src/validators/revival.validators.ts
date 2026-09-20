import { z } from "zod";
export const revivalStatus = z.enum(["FLAGGED", "UNDER_REVIEW", "REVIVAL_PROPOSED", "REVIVAL_IN_PROGRESS", "REVIVED", "CLOSED"]);
export const revivalCreateSchema = z.object({ reviewNotes: z.string().trim().max(5000).optional(), blockers: z.array(z.string().trim().min(1).max(500)).max(30).default([]), missingCapabilities: z.array(z.string().trim().min(1).max(300)).max(30).default([]), proposedActions: z.array(z.string().trim().min(1).max(500)).max(30).default([]), inactivitySignals: z.array(z.string().trim().min(1).max(500)).max(30).optional() }).strict();
export const revivalUpdateSchema = revivalCreateSchema.partial().extend({ status: revivalStatus.optional(), assignedStakeholder: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional() }).strict();
export const revivalQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20), status: revivalStatus.optional() });
