import { Types } from "mongoose";
import { Milestone, Problem, Project, Team, UniversityInterest } from "../models";
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

async function projectProgress(projectId: Types.ObjectId) {
  const milestones = await Milestone.find({ project: projectId });
  const completed = milestones.filter((milestone) => milestone.status === "COMPLETED").length;
  return {
    progress: milestones.length ? Math.round((completed / milestones.length) * 100) : 0,
    totalMilestones: milestones.length,
    completedMilestones: completed,
    pendingMilestones: milestones.length - completed,
    overdueMilestones: milestones.filter((milestone) => milestone.dueDate && milestone.dueDate < new Date() && milestone.status !== "COMPLETED").length,
  };
}

async function buildProblemProgress(id: string, userId?: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Problem not found", 404);
  const problem = await Problem.findById(id).select("title status category location submittedBy aiAnalysisStatus createdAt updatedAt");
  if (!problem) throw new AppError("Problem not found", 404);
  if (userId && problem.submittedBy.toString() !== userId) throw new AppError("You are not allowed to view this problem", 403);

  const [interests, projects] = await Promise.all([
    UniversityInterest.find({ problem: problem._id }).populate("university", "name profileLocation"),
    Project.find({ problem: problem._id }).populate("university", "name profileLocation").sort({ createdAt: -1 }),
  ]);
  const projectSummaries = await Promise.all(projects.map(async (project) => {
    const [team, stats] = await Promise.all([
      Team.findOne({ project: project._id }).populate("leader", "name email role").populate("members.user", "name email role"),
      projectProgress(project._id),
    ]);
    return { id: project._id.toString(), title: project.title, description: project.description, status: project.status, university: project.university, startDate: project.startDate, targetEndDate: project.targetEndDate, team, ...stats };
  }));
  return {
    problem: { id: problem._id.toString(), title: problem.title, status: problem.status, category: problem.category, location: problem.location, aiAnalysisStatus: problem.aiAnalysisStatus, createdAt: problem.createdAt, updatedAt: problem.updatedAt },
    interests: interests.map((interest: any) => ({ id: interest._id.toString(), status: interest.status, university: interest.university })),
    projects: projectSummaries,
  };
}

export async function getProblemProgress(id: string, userId: string) {
  return buildProblemProgress(id, userId);
}

export async function getAdminProblemProgress(id: string) {
  return buildProblemProgress(id);
}
