import { z } from "zod";

const list = z.array(z.string().trim().min(1).max(120)).max(50).default([]);
const location = z.object({ city: z.string().trim().max(120).optional(), state: z.string().trim().max(120).optional(), country: z.string().trim().max(120).optional() }).strict().default({});
export const industryProfileSchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).default(""),
  industryType: z.string().trim().max(120).default(""),
  location,
  domains: list,
  expertise: list,
  technologies: list,
  skills: list,
  resources: list,
  facilities: list,
  collaborationInterests: list,
}).strict();
export const opportunityQuerySchema = z.object({ search: z.string().trim().max(200).optional(), category: z.string().trim().max(120).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const collaborationRequestSchema = z.object({ message: z.string().trim().min(3).max(5000) }).strict();
export const collaborationIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid collaboration ID");
export type IndustryProfileInput = z.infer<typeof industryProfileSchema>;
