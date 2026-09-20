import { z } from "zod";
export const opportunityQuerySchema = z.object({ entityType: z.enum(["UNIVERSITY", "INDUSTRY"]).optional(), minScore: z.coerce.number().min(0).max(100).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20), sort: z.enum(["score", "newest"]).default("score") });
export const opportunityGenerateSchema = z.object({ entityType: z.enum(["UNIVERSITY", "INDUSTRY"]).optional() }).strict();
export type OpportunityQuery = z.infer<typeof opportunityQuerySchema>;
