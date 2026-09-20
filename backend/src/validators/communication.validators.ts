import { z } from "zod";
export const messageSchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();
export const messageQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
