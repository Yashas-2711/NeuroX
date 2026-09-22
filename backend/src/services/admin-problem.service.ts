import { Types } from "mongoose";
import { Problem } from "../models";
import { AppError } from "../utils/app-error";
import { create as createNotification } from "./notification.service";
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
  const filter = query.status ? { status: query.status } : { status: { $in: ["SUBMITTED", "VALIDATED", "REJECTED"] } };
  const sortField = query.sortBy === "aiConfidence" ? "aiConfidence" : query.sortBy;
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const sort = { [sortField]: sortDirection, _id: sortDirection } as Record<string, 1 | -1>;
  const [items, total, submitted, validated, rejected] = await Promise.all([
    Problem.find(filter).populate("submittedBy", "name email role").sort(sort).skip((query.page - 1) * query.limit).limit(query.limit),
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
  await createNotification({ recipient: problem.submittedBy.toString(), title: "Problem validated", message: `Your problem “${problem.title}” has been validated.`, type: "PROBLEM_VALIDATED", relatedType: "PROBLEM", relatedId: problem._id, dedupeKey: `problem-validated:${problem._id}` });
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
  await createNotification({ recipient: problem.submittedBy.toString(), title: "Problem rejected", message: `Your problem “${problem.title}” was rejected.`, type: "PROBLEM_REJECTED", relatedType: "PROBLEM", relatedId: problem._id, dedupeKey: `problem-rejected:${problem._id}` });
  return getProblem(id);
}
