import { z } from "zod";

export const adminProblemQuerySchema = z.object({
  status: z.enum(["SUBMITTED", "VALIDATING", "VALIDATED", "REJECTED", "MATCHED", "IN_PROGRESS", "RESOLVED", "ARCHIVED"]).optional(),
  sortBy: z.enum(["createdAt", "title", "category", "status", "aiConfidence"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const rejectionSchema = z.object({
  reason: z.string().trim().min(3).max(2000),
}).strict();

export const problemIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid problem ID");
export type AdminProblemQuery = z.infer<typeof adminProblemQuerySchema>;
