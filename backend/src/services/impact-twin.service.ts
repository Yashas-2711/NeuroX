import { Types } from "mongoose";
import { ImpactIndicator, ImpactObservation, ImpactScenario, Problem, Project, University, Collaboration, Industry } from "../models";
import { AppError } from "../utils/app-error";

type Actor = { userId: string; role: string };
const oid = (value: string) => { if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid problem ID", 400); return new Types.ObjectId(value); };

async function context(problemId: string, actor: Actor) {
  const problem = await Problem.findById(oid(problemId)).select("_id status submittedBy");
  if (!problem) throw new AppError("Problem not found", 404);
  const projects = await Project.find({ problem: problem._id }).select("_id university createdBy");
  let allowed = actor.role === "ADMIN" || problem.submittedBy.toString() === actor.userId;
  let canWrite = actor.role === "ADMIN";
  if (actor.role === "UNIVERSITY") {
    const university = await University.findOne({ user: oid(actor.userId) }).select("_id");
    const own = university && projects.some((project) => project.university.toString() === university._id.toString());
    allowed ||= Boolean(own); canWrite ||= Boolean(own);
  }
  if (actor.role === "INDUSTRY") {
    const collaborations = await Collaboration.find({ project: { $in: projects.map((p) => p._id) }, status: "ACCEPTED" }).select("industry");
    const industry = await Industry.findOne({ user: oid(actor.userId) }).select("_id");
    const own = industry && collaborations.some((c) => c.industry.toString() === industry._id.toString());
    allowed ||= Boolean(own); canWrite ||= Boolean(own);
  }
  if (!allowed) throw new AppError("You are not allowed to access this Impact Twin", 403);
  if (!["VALIDATED", "MATCHED", "IN_PROGRESS", "RESOLVED"].includes(problem.status) && actor.role !== "ADMIN") throw new AppError("Impact Twin is available after validation", 403);
  return { problem, canWrite };
}

function progress(baseline: number, target: number | null | undefined, observed: number | null | undefined) {
  if (observed === null || observed === undefined || target === null || target === undefined || target === baseline) return null;
  const value = ((observed - baseline) / (target - baseline)) * 100;
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value * 100) / 100)) : null;
}

function compare(indicator: any, latest: any, scenarios: any[]) {
  const observed = latest?.observedValue ?? null;
  return {
    baseline: indicator.baselineValue,
    target: indicator.targetValue ?? null,
    observed,
    unit: indicator.unit,
    baselineToObserved: observed === null ? null : observed - indicator.baselineValue,
    progressToTarget: progress(indicator.baselineValue, indicator.targetValue, observed),
    scenarioEstimates: scenarios.map((scenario) => ({ id: scenario._id.toString(), name: scenario.name, value: scenario.expectedValues?.get?.(indicator._id.toString()) ?? scenario.expectedValues?.[indicator._id.toString()] ?? null })),
  };
}

export async function getImpactTwin(problemId: string, actor: Actor) {
  await context(problemId, actor);
  const problemObjectId = oid(problemId);
  const [indicators, scenarios, observations] = await Promise.all([
    ImpactIndicator.find({ problem: problemObjectId }).sort({ createdAt: 1 }).lean(),
    ImpactScenario.find({ problem: problemObjectId }).sort({ createdAt: -1 }).lean(),
    ImpactObservation.find({ problem: problemObjectId }).sort({ measurementDate: -1, createdAt: -1 }).lean(),
  ]);
  const comparisons = indicators.map((indicator: any) => {
    const latest = observations.find((item: any) => item.indicator.toString() === indicator._id.toString());
    return { indicator, comparison: compare(indicator, latest, scenarios) };
  });
  const calculated = comparisons.map((item) => item.comparison.progressToTarget).filter((value): value is number => value !== null);
  return {
    problemId,
    indicators: comparisons,
    scenarios,
    summary: {
      totalIndicators: indicators.length,
      indicatorsWithObservations: comparisons.filter((item) => item.comparison.observed !== null).length,
      targetProgress: calculated.length ? Math.round((calculated.reduce((a, b) => a + b, 0) / calculated.length) * 100) / 100 : null,
      scenarioCount: scenarios.length,
      latestObservationDate: observations[0]?.measurementDate ?? null,
      dataCompleteness: indicators.length ? Math.round((comparisons.filter((item) => item.indicator.evidenceReference && item.comparison.observed !== null).length / indicators.length) * 100) : 0,
    },
  };
}

async function writable(problemId: string, actor: Actor) { const result = await context(problemId, actor); if (!result.canWrite) throw new AppError("Only an authorized project stakeholder can modify impact data", 403); return result; }

export async function createIndicator(problemId: string, input: any, actor: Actor) { await writable(problemId, actor); return ImpactIndicator.create({ ...input, problem: oid(problemId), createdBy: oid(actor.userId) }); }
 export async function updateIndicator(problemId: string, indicatorId: string, input: any, actor: Actor) { await writable(problemId, actor); const item = await ImpactIndicator.findOneAndUpdate({ _id: oid(indicatorId), problem: oid(problemId) }, { $set: { ...input, updatedBy: oid(actor.userId) } }, { returnDocument: "after", runValidators: true }); if (!item) throw new AppError("Impact indicator not found", 404); return item; }
export async function createScenario(problemId: string, input: any, actor: Actor) { await writable(problemId, actor); return ImpactScenario.create({ ...input, problem: oid(problemId), createdBy: oid(actor.userId) }); }
 export async function updateScenario(problemId: string, scenarioId: string, input: any, actor: Actor) { await writable(problemId, actor); const item = await ImpactScenario.findOneAndUpdate({ _id: oid(scenarioId), problem: oid(problemId) }, { $set: input }, { returnDocument: "after", runValidators: true }); if (!item) throw new AppError("Impact scenario not found", 404); return item; }
export async function recordObservation(problemId: string, input: any, actor: Actor) { await writable(problemId, actor); const indicator = await ImpactIndicator.findOne({ _id: oid(input.indicatorId), problem: oid(problemId) }); if (!indicator) throw new AppError("Impact indicator not found", 404); return ImpactObservation.create({ ...input, indicator: indicator._id, problem: oid(problemId), recordedBy: oid(actor.userId) }); }
export async function getHistory(problemId: string, query: { indicatorId?: string; page: number; limit: number }, actor: Actor) { await context(problemId, actor); const filter: any = { problem: oid(problemId) }; if (query.indicatorId) filter.indicator = oid(query.indicatorId); const skip = (query.page - 1) * query.limit; const [observations, total] = await Promise.all([ImpactObservation.find(filter).sort({ measurementDate: -1 }).skip(skip).limit(query.limit).lean(), ImpactObservation.countDocuments(filter)]); return { observations, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } }; }
