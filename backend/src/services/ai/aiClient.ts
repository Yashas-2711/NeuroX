import axios, { isAxiosError } from "axios";
import { z } from "zod";
import { env } from "../../config/env";

const predictionSchema = z.object({ category: z.string().min(1), confidence: z.number().finite().min(0).max(1) });
const analysisSchema = z.object({
  category: z.string().min(1),
  confidence: z.number().finite().min(0).max(1),
  top_predictions: z.array(predictionSchema).optional(),
  embedding: z.array(z.number().finite()).length(384),
  embedding_dimensions: z.literal(384),
});
const dnaSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().nullable(),
  root_causes: z.array(z.string()),
  affected_population: z.string().nullable(),
  geographic_context: z.object({ city: z.string().optional(), state: z.string().optional(), country: z.string().optional() }),
  severity_level: z.string().min(1),
  urgency_level: z.string().min(1),
  resource_requirements: z.array(z.string()),
  required_skills: z.array(z.string()),
  sustainability_relevance: z.string().nullable(),
  dna_summary: z.string().min(1),
  confidence: z.number().finite().min(0).max(1),
  data_sources: z.array(z.string()).default([]),
});

export type AIAnalysisResult = z.infer<typeof analysisSchema>;
export type AIEmbeddingResult = { embedding: number[]; dimensions: 384 };
export type AIDNAResult = z.infer<typeof dnaSchema>;

export class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIServiceError";
  }
}

function aiUrl(path: string) {
  const baseUrl = env.aiServiceUrl.trim().replace(/\/$/, "");
  if (!baseUrl) throw new AIServiceError("AI service URL is not configured");
  return `${baseUrl}${path}`;
}

function parseAnalysis(data: unknown): AIAnalysisResult {
  const result = analysisSchema.safeParse(data);
  if (!result.success) throw new AIServiceError("AI service returned an invalid analysis");
  return result.data;
}

export async function analyzeProblem(title: string, description: string): Promise<AIAnalysisResult> {
  try {
    const response = await axios.post(aiUrl("/analysis"), { title, description }, { timeout: env.aiRequestTimeoutMs });
    return parseAnalysis(response.data);
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (isAxiosError(error)) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") throw new AIServiceError("AI service request timed out");
      throw new AIServiceError(`AI service request failed with status ${error.response?.status ?? "unavailable"}`);
    }
    throw new AIServiceError("AI service request failed");
  }
}

export async function generateEmbedding(text: string): Promise<AIEmbeddingResult> {
  try {
    const response = await axios.post(aiUrl("/embed"), { text }, { timeout: env.aiRequestTimeoutMs });
    const parsed = z.object({ embedding: z.array(z.number().finite()).length(384), dimensions: z.literal(384) }).safeParse(response.data);
    if (!parsed.success) throw new AIServiceError("AI service returned an invalid embedding");
    return parsed.data;
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (isAxiosError(error)) throw new AIServiceError(error.code === "ECONNABORTED" ? "AI service request timed out" : "AI service request failed");
    throw new AIServiceError("AI service request failed");
  }
}

export async function generateProblemDNA(input: { title: string; description: string; category: string; priority: string; location: { city?: string; state?: string; country?: string } }): Promise<AIDNAResult> {
  try {
    const response = await axios.post(aiUrl("/dna"), input, { timeout: env.aiRequestTimeoutMs });
    const parsed = dnaSchema.safeParse(response.data);
    if (!parsed.success) throw new AIServiceError("AI service returned an invalid Problem DNA response");
    return parsed.data;
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    if (isAxiosError(error)) throw new AIServiceError(error.code === "ECONNABORTED" ? "AI service request timed out" : "AI service request failed");
    throw new AIServiceError("AI service request failed");
  }
}
