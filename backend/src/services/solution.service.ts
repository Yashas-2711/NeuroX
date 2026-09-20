import { Types } from "mongoose";
import { Collaboration, Problem, Project, Solution, Team, University } from "../models";
import { AppError } from "../utils/app-error";

type Actor = { userId: string; role: string };
const oid = (value: string) => {
  if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid ID", 400);
  return new Types.ObjectId(value);
};

async function projectFor(id: string) {
  const project = await Project.findById(oid(id)).populate("problem", "title description category location status submittedBy").populate("university", "name user");
  if (!project) throw new AppError("Project not found", 404);
  return project;
}

async function permission(actor: Actor, project: any, allowSubmitter = false) {
  const university = await University.findOne({ user: oid(actor.userId) }).select("_id");
  const isOwner = actor.role === "UNIVERSITY" && university && project.university && university._id.toString() === project.university._id?.toString?.();
  const team = await Team.findOne({ project: project._id, "members.user": oid(actor.userId) }).select("members");
  const isTeamMember = Boolean(team);
  const isProblemSubmitter = allowSubmitter && project.problem?.submittedBy?.toString?.() === actor.userId;
  const collaboration = actor.role === "INDUSTRY" ? await Collaboration.findOne({ project: project._id, status: "ACCEPTED" }) : null;
  return { isOwner: Boolean(isOwner), isTeamMember, isProblemSubmitter: Boolean(isProblemSubmitter), canIndustryRead: Boolean(collaboration) };
}

function safe(solution: any, internal = false) {
  const result: any = {
    id: solution._id.toString(),
    project: solution.project?.toString?.() ?? solution.project,
    problem: solution.problem?.toString?.() ?? solution.problem,
    title: solution.title,
    description: solution.description,
    approach: solution.approach ?? "",
    expectedOutcome: solution.expectedOutcome ?? "",
    requiredResources: solution.requiredResources ?? [],
    submittedBy: solution.submittedBy?.toString?.() ?? solution.submittedBy,
    status: solution.status,
    reviewedAt: solution.reviewedAt,
    stageUpdatedAt: solution.stageUpdatedAt,
    lifecycleNotes: solution.lifecycleNotes ?? "",
    createdAt: solution.createdAt,
    updatedAt: solution.updatedAt,
  };
  if (internal) {
    result.reviewNotes = solution.reviewNotes ?? "";
    result.reviewedBy = solution.reviewedBy?.toString?.() ?? solution.reviewedBy;
    result.stageUpdatedBy = solution.stageUpdatedBy?.toString?.() ?? solution.stageUpdatedBy;
  }
  return result;
}

async function accessible(actor: Actor, project: any) {
  const permissions = await permission(actor, project, true);
  if (!permissions.isOwner && !permissions.isTeamMember && !permissions.isProblemSubmitter && !permissions.canIndustryRead) {
    throw new AppError("You are not allowed to access solutions for this project", 403);
  }
  return permissions;
}

export async function list(actor: Actor, projectId: string) {
  const project = await projectFor(projectId);
  const permissions = await accessible(actor, project);
  const solutions = await Solution.find({ project: project._id }).sort({ createdAt: -1 });
  return { solutions: solutions.map((solution) => safe(solution, permissions.isOwner)), permissions: { canReview: permissions.isOwner, canSubmit: permissions.isOwner || permissions.isTeamMember } };
}

export async function create(actor: Actor, projectId: string, input: { title: string; description: string; approach?: string; expectedOutcome?: string; requiredResources?: string[] }) {
  const project = await projectFor(projectId);
  const permissions = await permission(actor, project);
  if (!permissions.isOwner && !permissions.isTeamMember) throw new AppError("Only an authorized university project team member can submit a solution", 403);
  if (["COMPLETED", "CANCELLED"].includes(project.status)) throw new AppError("Solutions cannot be submitted for a closed project", 400);
  const duplicate = await Solution.findOne({ project: project._id, title: input.title.trim(), status: { $nin: ["ARCHIVED", "REJECTED"] } });
  if (duplicate) throw new AppError("A solution with this title already exists for the project", 409);
  const problem = project.problem as any;
  const solution = await Solution.create({ ...input, project: project._id, problem: problem?._id ?? problem, submittedBy: oid(actor.userId), status: "SUBMITTED" });
  return safe(solution, permissions.isOwner);
}

export async function detail(actor: Actor, solutionId: string) {
  const solution = await Solution.findById(oid(solutionId));
  if (!solution) throw new AppError("Solution not found", 404);
  const project = await projectFor(solution.project.toString());
  const permissions = await accessible(actor, project);
  return { solution: safe(solution, permissions.isOwner), permissions: { canReview: permissions.isOwner, canManage: permissions.isOwner || (permissions.isTeamMember && solution.submittedBy.toString() === actor.userId) } };
}

export async function update(actor: Actor, solutionId: string, input: Record<string, unknown>) {
  const solution = await Solution.findById(oid(solutionId));
  if (!solution) throw new AppError("Solution not found", 404);
  const project = await projectFor(solution.project.toString());
  const permissions = await permission(actor, project);
  if (!permissions.isOwner && solution.submittedBy.toString() !== actor.userId) throw new AppError("You are not allowed to edit this solution", 403);
  if (!["DRAFT", "SUBMITTED"].includes(solution.status)) throw new AppError("Only draft or submitted solutions can be edited", 400);
  Object.assign(solution, input);
  await solution.save();
  return safe(solution, permissions.isOwner);
}

export async function review(actor: Actor, solutionId: string, status: "APPROVED" | "REJECTED", reviewNotes: string) {
  const solution = await Solution.findById(oid(solutionId));
  if (!solution) throw new AppError("Solution not found", 404);
  const project = await projectFor(solution.project.toString());
  const permissions = await permission(actor, project);
  if (!permissions.isOwner) throw new AppError("Only the university project owner can review solutions", 403);
  if (solution.status !== "SUBMITTED") throw new AppError("Only submitted solutions can be reviewed", 400);
  solution.status = status;
  solution.reviewNotes = reviewNotes;
  solution.reviewedBy = oid(actor.userId);
  solution.reviewedAt = new Date();
  await solution.save();
  return safe(solution, true);
}

export async function lifecycle(actor: Actor, solutionId: string, status: "PROTOTYPE" | "TESTING" | "IMPLEMENTATION" | "COMPLETED", lifecycleNotes: string) {
  const solution = await Solution.findById(oid(solutionId));
  if (!solution) throw new AppError("Solution not found", 404);
  const project = await projectFor(solution.project.toString());
  const permissions = await permission(actor, project);
  if (!permissions.isOwner) throw new AppError("Only the university project owner can advance solution lifecycle", 403);
  const allowed: Record<string, string> = { APPROVED: "PROTOTYPE", PROTOTYPE: "TESTING", TESTING: "IMPLEMENTATION", IMPLEMENTATION: "COMPLETED" };
  if (allowed[solution.status] !== status) throw new AppError(`Invalid solution status transition from ${solution.status} to ${status}`, 400);
  solution.status = status;
  solution.lifecycleNotes = lifecycleNotes;
  solution.stageUpdatedBy = oid(actor.userId);
  solution.stageUpdatedAt = new Date();
  await solution.save();
  return safe(solution, true);
}

