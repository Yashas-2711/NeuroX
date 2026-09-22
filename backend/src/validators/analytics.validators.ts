import { z } from "zod";
import { PROBLEM_CATEGORIES, PROBLEM_STATUSES } from "../models";
export const analyticsQuerySchema = z.object({ range: z.enum(["7", "30", "90", "all"]).default("30"), category: z.enum(PROBLEM_CATEGORIES).optional(), status: z.enum(PROBLEM_STATUSES).optional() });
