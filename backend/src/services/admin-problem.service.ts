import { Types } from "mongoose";
import { Problem } from "../models";
import { AppError } from "../utils/app-error";
import type { AdminProblemQuery } from "../validators/admin.validators";

function safe(problem: any) {
  const submittedBy = problem.submittedBy;
  return {
    id: problem._id.toString(),
    title: problem.title,
    description: problem.description,
    category: problem.category,
    location: problem.location,
    evidence: problem.evidence ?? [],
    priority: problem.priority,
    status: problem.status,
    submittedBy: submittedBy ? {
      id: submittedBy._id?.toString?.() ?? submittedBy.toString(),
      name: submittedBy.name,
      email: submittedBy.email,
      role: submittedBy.role,
    } : undefined,
    aiAnalysis: {
      status: problem.aiAnalysisStatus ?? "PENDING",
      category: problem.aiClassification,
      confidence: problem.aiConfidence,
      embeddingDimensions: problem.embedding?.length,
      analyzedAt: problem.aiAnalyzedAt,
    },
    validatedAt: problem.validatedAt,
    validatedBy: problem.validatedBy?.toString?.(),
    rejectedAt: problem.rejectedAt,
    rejectedBy: problem.rejectedBy?.toString?.(),
    rejectionReason: problem.rejectionReason,
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
  };
}

function validId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid problem ID", 400);
  return new Types.ObjectId(id);
}

export async function listProblems(query: AdminProblemQuery) {
  const filter = { status: query.status };
  const [items, total, submitted, validated, rejected] = await Promise.all([
    Problem.find(filter).populate("submittedBy", "name email role").sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    Problem.countDocuments(filter),
    Problem.countDocuments({ status: "SUBMITTED" }),
    Problem.countDocuments({ status: "VALIDATED" }),
    Problem.countDocuments({ status: "REJECTED" }),
  ]);
  return { problems: items.map(safe), counts: { submitted, validated, rejected, total: submitted + validated + rejected }, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}

export async function getProblem(id: string) {
  const problem = await Problem.findById(validId(id)).populate("submittedBy", "name email role");
  if (!problem) throw new AppError("Problem not found", 404);
  return safe(problem);
}

export async function validateProblem(id: string, adminId: string) {
  const problem = await Problem.findById(validId(id));
  if (!problem) throw new AppError("Problem not found", 404);
  if (problem.status !== "SUBMITTED") throw new AppError("Only submitted problems can be validated", 400);
  problem.status = "VALIDATED";
  problem.validatedAt = new Date();
  problem.validatedBy = new Types.ObjectId(adminId);
  await problem.save();
  return getProblem(id);
}

export async function rejectProblem(id: string, adminId: string, reason: string) {
  const problem = await Problem.findById(validId(id));
  if (!problem) throw new AppError("Problem not found", 404);
  if (problem.status !== "SUBMITTED") throw new AppError("Only submitted problems can be rejected", 400);
  problem.status = "REJECTED";
  problem.rejectedAt = new Date();
  problem.rejectedBy = new Types.ObjectId(adminId);
  problem.rejectionReason = reason;
  await problem.save();
  return getProblem(id);
}
