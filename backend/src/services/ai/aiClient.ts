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

export type AIAnalysisResult = z.infer<typeof analysisSchema>;

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
