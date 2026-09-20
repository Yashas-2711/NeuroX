import { Types } from "mongoose";
import { Collaboration, ImpactIndicator, Industry, Milestone, OpportunityMatch, Problem, Project, ProblemDNA, RevivalReview, Solution, University } from "../models";
import { AppError } from "../utils/app-error";
import * as notifications from "./notification.service";

type Actor = { userId: string; role: string };
const id = (value: string) => { if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid problem ID", 400); return new Types.ObjectId(value); };
const thresholdDays = () => { const value = Number(process.env.REVIVAL_INACTIVITY_DAYS ?? 90); return Number.isFinite(value) && value > 0 ? value : 90; };
const eligible = ["VALIDATED", "MATCHED", "IN_PROGRESS"];

async function access(problemId: string, actor: Actor, write = false) {
  const problem = await Problem.findById(id(problemId)).select("_id title status submittedBy updatedAt createdAt");
  if (!problem) throw new AppError("Problem not found", 404);
  if (!eligible.includes(problem.status)) throw new AppError("This problem is not eligible for revival", 403);
  let allowed = actor.role === "ADMIN" || ["CITIZEN", "STUDENT"].includes(actor.role) && problem.submittedBy.toString() === actor.userId;
  let stakeholder = actor.role === "ADMIN";
  const projects = await Project.find({ problem: problem._id }).select("_id university");
  if (actor.role === "UNIVERSITY") { const university = await University.findOne({ user: id(actor.userId) }).select("_id"); const own = Boolean(university && projects.some((p) => p.university.toString() === university._id.toString())); allowed ||= own; stakeholder ||= own; }
  if (actor.role === "INDUSTRY") { const industry = await Industry.findOne({ user: id(actor.userId) }).select("_id"); const collab = industry && await Collaboration.exists({ project: { $in: projects.map((p) => p._id) }, industry: industry._id, status: "ACCEPTED" }); allowed ||= Boolean(collab); stakeholder ||= Boolean(collab); }
  if (!allowed || (write && !stakeholder)) throw new AppError("You are not authorized for this revival review", 403);
  return { problem, projects, stakeholder };
}

async function inactivity(problem: any) {
  const projects = await Project.find({ problem: problem._id }).select("_id updatedAt status").lean();
  const projectIds = projects.map((p) => p._id);
  const [milestones, solutions, collaborations] = await Promise.all([
    Milestone.find({ project: { $in: projectIds } }).select("updatedAt dueDate status").lean(),
    Solution.find({ project: { $in: projectIds } }).select("updatedAt status").lean(),
    Collaboration.find({ project: { $in: projectIds } }).select("updatedAt status").lean(),
  ]);
  const dates = [problem.updatedAt, ...projects.map((p) => p.updatedAt), ...milestones.map((m) => m.updatedAt), ...solutions.map((s) => s.updatedAt), ...collaborations.map((c) => c.updatedAt)].filter(Boolean).map((v) => new Date(v).getTime()).filter(Number.isFinite);
  const lastActivityAt = dates.length ? new Date(Math.max(...dates)) : problem.createdAt;
  const ageDays = Math.floor((Date.now() - lastActivityAt.getTime()) / 86400000);
  const signals: string[] = [];
  if (ageDays >= thresholdDays()) signals.push(`No meaningful activity for ${ageDays} days (threshold ${thresholdDays()} days).`);
  const overdue = milestones.filter((m) => m.dueDate && new Date(m.dueDate).getTime() < Date.now() && m.status !== "COMPLETED").length;
  if (overdue) signals.push(`${overdue} milestone(s) are overdue.`);
  if (!projects.length) signals.push("No university project is currently linked.");
  if (projects.length && !solutions.length) signals.push("No solution activity is recorded for the linked project.");
  return { flagged: signals.length > 0, signals, lastActivityAt, ageDays };
}

export async function listInactive(actor: Actor, page: number, limit: number, status?: string) {
  if (!["ADMIN", "UNIVERSITY", "INDUSTRY"].includes(actor.role)) throw new AppError("Insufficient permissions", 403);
  const problems = await Problem.find({ status: { $in: eligible } }).sort({ updatedAt: 1 }).lean(); const results = [];
  for (const problem of problems) { if (actor.role !== "ADMIN") { try { await access(problem._id.toString(), actor); } catch { continue; } } const result = await inactivity(problem); if (!result.flagged) continue; const review = await RevivalReview.findOne({ problem: problem._id }).lean(); if (status && review?.status !== status) continue; results.push({ problem: { id: problem._id.toString(), title: problem.title, status: problem.status, updatedAt: problem.updatedAt }, ...result, review }); }
  const total = results.length; const start = (page - 1) * limit; return { challenges: results.slice(start, start + limit), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function get(problemId: string, actor: Actor) { const { problem } = await access(problemId, actor); const detection = await inactivity(problem); const review = await RevivalReview.findOne({ problem: problem._id }).lean(); return { problem: { id: problem._id.toString(), title: problem.title, status: problem.status }, detection, review, recommendations: await recommendations(problem._id) }; }

async function recommendations(problemId: Types.ObjectId) {
  const [dna, indicators, matches, projects] = await Promise.all([ProblemDNA.findOne({ problem: problemId }).lean(), ImpactIndicator.find({ problem: problemId }).select("name targetValue").lean(), OpportunityMatch.find({ problem: problemId, status: { $ne: "FAILED" } }).sort({ overallScore: -1 }).limit(5).lean(), Project.find({ problem: problemId }).select("_id status").lean()]);
  const actions: string[] = []; if (!projects.length) actions.push("Review university opportunity matches and identify a project owner."); if (dna?.requiredSkills?.length) actions.push(`Address required skills: ${dna.requiredSkills.join(", ")}.`); if (indicators.some((i) => i.targetValue === null || i.targetValue === undefined)) actions.push("Complete missing impact targets before proposing revival outcomes."); if (matches.length) actions.push(`${matches.length} persisted opportunity match(es) are available for stakeholder review.`); if (!actions.length) actions.push("No additional recommendation can be generated from the currently persisted data."); return { actions, evidence: { dnaAvailable: Boolean(dna), indicatorCount: indicators.length, opportunityMatchCount: matches.length, projectCount: projects.length } };
}

const transitions: Record<string, string[]> = { FLAGGED: ["UNDER_REVIEW", "CLOSED"], UNDER_REVIEW: ["REVIVAL_PROPOSED", "CLOSED"], REVIVAL_PROPOSED: ["REVIVAL_IN_PROGRESS", "CLOSED"], REVIVAL_IN_PROGRESS: ["REVIVED", "CLOSED"], REVIVED: [], CLOSED: [] };
export async function createReview(problemId: string, input: any, actor: Actor) { const { problem } = await access(problemId, actor, true); const existing = await RevivalReview.findOne({ problem: problem._id }); if (existing) return existing; const review = await RevivalReview.create({ problem: problem._id, status: "FLAGGED", inactivitySignals: input.inactivitySignals ?? (await inactivity(problem)).signals, reviewNotes: input.reviewNotes, blockers: input.blockers ?? [], missingCapabilities: input.missingCapabilities ?? [], proposedActions: input.proposedActions ?? [], createdBy: id(actor.userId), history: [{ status: "FLAGGED", notes: input.reviewNotes, changedBy: id(actor.userId) }] }); await notifications.create({ recipient: problem.submittedBy, title: "Challenge flagged for revival review", message: `Your challenge "${problem.title}" may need renewed attention.`, type: "REVIVAL_FLAGGED", relatedType: "PROBLEM", relatedId: problem._id, dedupeKey: `revival-flagged:${problem._id}` }); return review; }
export async function updateReview(problemId: string, input: any, actor: Actor) { const { problem } = await access(problemId, actor, true); const review = await RevivalReview.findOne({ problem: problem._id }); if (!review) throw new AppError("Revival review not found", 404); if (input.status && !(transitions[review.status] ?? []).includes(input.status)) throw new AppError(`Invalid revival status transition: ${review.status} to ${input.status}`, 400); if (input.status) { review.status = input.status; review.history.push({ status: input.status, notes: input.reviewNotes, changedBy: id(actor.userId), changedAt: new Date() } as any); } for (const key of ["reviewNotes", "blockers", "missingCapabilities", "proposedActions", "assignedStakeholder"]) if (input[key] !== undefined) (review as any)[key] = input[key]; await review.save(); await notifications.create({ recipient: problem.submittedBy, title: "Challenge revival review updated", message: `Revival review status: ${review.status}.`, type: "REVIVAL_STATUS_CHANGED", relatedType: "PROBLEM", relatedId: problem._id, dedupeKey: `revival-status:${review._id}:${review.status}` }); return review; }
