import { Types } from "mongoose";
import { Problem } from "../models";
import { AppError } from "../middleware/errorHandler";
import type { CreateProblemInput } from "../validators/problem.validators";
import { AIServiceError, analyzeProblem } from "./ai/aiClient";

function safe(problem: any) {
  return {
    id: problem._id.toString(), title: problem.title, description: problem.description, category: problem.category,
    location: problem.location, evidence: problem.evidence ?? [], priority: problem.priority, status: problem.status,
    aiAnalysis: { status: problem.aiAnalysisStatus ?? "PENDING", category: problem.aiClassification, confidence: problem.aiConfidence, embeddingDimensions: problem.embedding?.length, analyzedAt: problem.aiAnalyzedAt },
    createdAt: problem.createdAt, updatedAt: problem.updatedAt,
  };
}
export async function createProblem(input: CreateProblemInput, userId: string) {
  const problem = await Problem.create({ ...input, submittedBy: userId, status: "SUBMITTED", aiAnalysisStatus: "PENDING", evidence: input.evidence ? [input.evidence] : [] });
  try {
    const analysis = await analyzeProblem(problem.title, problem.description);
    problem.aiClassification = analysis.category;
    problem.aiConfidence = analysis.confidence;
    problem.embedding = analysis.embedding;
    problem.aiAnalysisStatus = "COMPLETED";
    problem.aiAnalyzedAt = new Date();
    await problem.save();
  } catch (error) {
    const reason = error instanceof AIServiceError ? error.message : "unexpected AI integration error";
    console.warn(`AI analysis failed for problem ${problem._id.toString()}: ${reason}`);
    problem.aiAnalysisStatus = "FAILED";
    await problem.save();
  }
  return safe(problem);
}
export async function getCitizenProblems(userId: string) { const problems = await Problem.find({ submittedBy: userId }).sort({ createdAt: -1 }); return problems.map(safe); }
export async function getCitizenProblemById(id: string, userId: string) { if (!Types.ObjectId.isValid(id)) throw new AppError("Problem not found", 404); const problem = await Problem.findById(id); if (!problem) throw new AppError("Problem not found", 404); if (problem.submittedBy.toString() !== userId) throw new AppError("You are not allowed to view this problem", 403); return safe(problem); }
