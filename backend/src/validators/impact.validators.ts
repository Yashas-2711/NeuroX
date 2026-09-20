import { z } from "zod";

const number = z.number().finite();
const optionalNumber = number.nullable().optional();
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const indicatorCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  unit: z.string().trim().min(1).max(80),
  baselineValue: number,
  targetValue: optionalNumber,
  measurementPeriod: z.string().trim().max(160).optional(),
  evidenceReference: z.string().trim().url().max(1000).optional(),
  responsibleStakeholder: z.string().trim().max(200).optional(),
}).strict();

export const indicatorUpdateSchema = indicatorCreateSchema.partial().strict();

export const scenarioCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).optional(),
  proposedIntervention: z.string().trim().min(3).max(5000),
  expectedValues: z.record(z.string().regex(/^[a-f\d]{24}$/i), number).default({}),
  assumptions: z.array(z.string().trim().min(1).max(500)).max(30).default([]),
  estimationMethod: z.string().trim().min(3).max(1000),
  confidenceLevel: z.number().min(0).max(1).optional(),
  uncertaintyRange: z.object({ min: number, max: number }).refine((v) => v.min <= v.max, "Invalid uncertainty range").optional(),
  estimatedTimeline: z.string().trim().max(160).optional(),
}).strict();

export const scenarioUpdateSchema = scenarioCreateSchema.partial().strict();

export const observationCreateSchema = z.object({
  indicatorId: objectId,
  observedValue: number,
  measurementDate: z.coerce.date(),
  evidenceReference: z.string().trim().url().max(1000).optional(),
  notes: z.string().trim().max(3000).optional(),
}).strict();

export const historyQuerySchema = z.object({
  indicatorId: objectId.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
