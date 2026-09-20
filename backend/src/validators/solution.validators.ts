import { z } from "zod";

const id = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const solutionCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(10000),
  approach: z.string().trim().max(10000).optional().default(""),
  expectedOutcome: z.string().trim().max(5000).optional().default(""),
  requiredResources: z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]),
}).strict();

export const solutionUpdateSchema = solutionCreateSchema.partial().strict();

export const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().trim().max(5000).optional().default(""),
}).superRefine((value, ctx) => {
  if (value.status === "REJECTED" && value.reviewNotes.length < 3) {
    ctx.addIssue({ code: "custom", path: ["reviewNotes"], message: "A rejection reason is required" });
  }
}).strict();

export const lifecycleSchema = z.object({
  status: z.enum(["PROTOTYPE", "TESTING", "IMPLEMENTATION", "COMPLETED"]),
  lifecycleNotes: z.string().trim().max(5000).optional().default(""),
}).strict();

export const solutionIdSchema = id;

