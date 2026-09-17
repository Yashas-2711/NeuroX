import { z } from "zod";
import { PROBLEM_CATEGORIES } from "../models";

const strings = z.array(z.string().trim().min(1).max(120)).max(50).default([]);
export const universityProfileSchema = z.object({
  institutionName: z.string().trim().min(2).max(200), description: z.string().trim().max(5000).default(""),
  location: z.object({ city: z.string().trim().max(120).default(""), state: z.string().trim().max(120).default(""), country: z.string().trim().max(120).default("") }).strict().default({ city: "", state: "", country: "" }),
  domains: strings, researchAreas: strings, skills: strings, resources: strings, collaborationInterests: strings,
}).strict();
export const universityProblemQuerySchema = z.object({ status: z.literal("VALIDATED").default("VALIDATED"), category: z.enum(PROBLEM_CATEGORIES).optional(), location: z.string().trim().max(120).optional(), search: z.string().trim().max(200).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const universityProblemIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid problem ID");
export type UniversityProfileInput = z.infer<typeof universityProfileSchema>;
