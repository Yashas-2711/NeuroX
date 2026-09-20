import { Types } from "mongoose";
import { Problem, ProblemDNA } from "../models";
import { AppError } from "../utils/app-error";
import { AIServiceError, generateProblemDNA } from "./ai/aiClient";

function problemId(value: string) {
  if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid problem ID", 400);
  return new Types.ObjectId(value);
}

function safe(value: any) {
  return {
    id: value._id.toString(),
    problemId: value.problem.toString(),
    category: value.category,
    subcategory: value.subcategory,
    rootCauses: value.rootCauses ?? [],
    affectedPopulation: value.affectedPopulation,
    geographicContext: value.geographicContext ?? {},
    severityLevel: value.severityLevel,
    urgencyLevel: value.urgencyLevel,
    resourceRequirements: value.resourceRequirements ?? [],
    requiredSkills: value.requiredSkills ?? [],
    sustainabilityRelevance: value.sustainabilityRelevance,
    dnaSummary: value.dnaSummary,
    confidence: value.confidence,
    generatedAt: value.generatedAt,
    updatedAt: value.updatedAt,
    generationStatus: value.generationStatus,
    failureReason: value.generationStatus === "FAILED" ? value.failureReason : undefined,
  };
}

async function getProblem(id: string) {
  const problem = await Problem.findById(problemId(id));
  if (!problem) throw new AppError("Problem not found", 404);
  return problem;
}

async function authorize(problem: any, actor: { userId: string; role: string }, generation = false) {
  if (generation && !["ADMIN", "UNIVERSITY"].includes(actor.role)) throw new AppError("Only Admin or University users can generate Problem DNA", 403);
  if (actor.role === "ADMIN") return;
  if (["CITIZEN", "STUDENT"].includes(actor.role) && problem.submittedBy.toString() === actor.userId) return;
  if (["UNIVERSITY", "INDUSTRY"].includes(actor.role) && problem.status === "VALIDATED") return;
  throw new AppError("You are not allowed to access this Problem DNA", 403);
}

export async function getDNA(id: string, actor: { userId: string; role: string }) {
  const problem = await getProblem(id);
  await authorize(problem, actor);
  const dna = await ProblemDNA.findOne({ problem: problem._id });
  if (!dna) throw new AppError("Problem DNA has not been generated yet", 404);
  return safe(dna);
}

export async function getStatus(id: string, actor: { userId: string; role: string }) {
  const problem = await getProblem(id);
  await authorize(problem, actor);
  const dna = await ProblemDNA.findOne({ problem: problem._id }).select("generationStatus generatedAt updatedAt failureReason");
  return dna ? safe(dna) : { problemId: problem._id.toString(), generationStatus: "PENDING" };
}

export async function generate(id: string, actor: { userId: string; role: string }) {
  const problem = await getProblem(id);
  await authorize(problem, actor, true);
  if (problem.status !== "VALIDATED") throw new AppError("Problem DNA can only be generated for validated problems", 400);
  const existing = await ProblemDNA.findOne({ problem: problem._id });
  if (existing?.generationStatus === "COMPLETED") return safe(existing);
  const dna = existing ?? await ProblemDNA.create({ problem: problem._id, category: problem.category, severityLevel: problem.priority, urgencyLevel: problem.priority, dnaSummary: "Generation pending", confidence: 0, generationStatus: "PENDING" });
  dna.generationStatus = "GENERATING";
  dna.failureReason = undefined;
  await dna.save();
  try {
    const result = await generateProblemDNA({ title: problem.title, description: problem.description, category: problem.category, priority: problem.priority, location: { city: problem.location?.city, state: problem.location?.state, country: problem.location?.country } });
    Object.assign(dna, { category: result.category, subcategory: result.subcategory, rootCauses: result.root_causes, affectedPopulation: result.affected_population, geographicContext: result.geographic_context, severityLevel: result.severity_level, urgencyLevel: result.urgency_level, resourceRequirements: result.resource_requirements, requiredSkills: result.required_skills, sustainabilityRelevance: result.sustainability_relevance, dnaSummary: result.dna_summary, confidence: result.confidence, generatedAt: new Date(), generationStatus: "COMPLETED", failureReason: undefined });
    await dna.save();
    return safe(dna);
  } catch (error) {
    dna.generationStatus = "FAILED";
    dna.failureReason = error instanceof AIServiceError ? error.message : "Problem DNA generation failed";
    await dna.save();
    throw new AppError("Problem DNA generation is unavailable", 503);
  }
}
