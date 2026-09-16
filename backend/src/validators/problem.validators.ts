import { z } from "zod";
import { PROBLEM_CATEGORIES, PROBLEM_PRIORITIES } from "../models";

const locationSchema = z
  .object({
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(120),
    type: z.literal("Point").optional(),
    coordinates: z
      .tuple([z.number().gte(-180).lte(180), z.number().gte(-90).lte(90)])
      .optional(),
  })
  .strict();
const evidenceSchema = z
  .object({
    description: z.string().trim().max(2000).optional(),
    reference: z.string().trim().url().max(500).optional(),
  })
  .strict()
  .refine(
    (value) => value.description || value.reference,
    "Evidence needs a description or reference",
  );
export const createProblemSchema = z
  .object({
    title: z.string().trim().min(5).max(200),
    description: z.string().trim().min(20).max(10000),
    category: z.enum(PROBLEM_CATEGORIES),
    location: locationSchema,
    evidence: evidenceSchema.optional(),
    priority: z.enum(PROBLEM_PRIORITIES).default("MEDIUM"),
  })
  .strict();
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
