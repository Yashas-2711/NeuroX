import { Types } from "mongoose";
import { Industry, OpportunityMatch, Problem, ProblemDNA, University } from "../models";
import { AppError } from "../utils/app-error";
import { calculateOpportunityMatch } from "./opportunity-matching.service";

type Actor = { userId: string; role: string };
type EntityType = "UNIVERSITY" | "INDUSTRY";
const activeGenerations = new Set<string>();

function oid(value: string, label = "ID") { if (!Types.ObjectId.isValid(value)) throw new AppError(`Invalid ${label}`, 400); return new Types.ObjectId(value); }
async function validatedProblem(value: string) { const problem = await Problem.findOne({ _id: oid(value, "problem ID"), status: "VALIDATED" }); if (!problem) throw new AppError("Only validated problems can be matched", 400); const dna = await ProblemDNA.findOne({ problem: problem._id, generationStatus: "COMPLETED" }).lean(); return { problem, dna }; }
async function ownEntity(actor: Actor, type: EntityType) {
  if (type === "UNIVERSITY") { const entity = await University.findOne({ user: oid(actor.userId, "user ID"), isActive: true }); if (!entity) throw new AppError("Complete your university profile first", 400); return entity; }
  const entity = await Industry.findOne({ user: oid(actor.userId, "user ID"), isActive: true }); if (!entity) throw new AppError("Complete your industry profile first", 400); return entity;
}
async function profiles(actor: Actor, type: EntityType) {
  if (actor.role === "ADMIN") return type === "UNIVERSITY" ? University.find({ isActive: true }) : Industry.find({ isActive: true });
  if ((type === "UNIVERSITY" && actor.role !== "UNIVERSITY") || (type === "INDUSTRY" && actor.role !== "INDUSTRY")) throw new AppError("Insufficient permissions", 403);
  return [await ownEntity(actor, type)];
}
function sourceDate(problem: any, dna: any, entity: any) { return new Date(Math.max(new Date(problem.updatedAt).getTime(), dna?.updatedAt ? new Date(dna.updatedAt).getTime() : 0, new Date(entity.updatedAt).getTime())); }
function safe(value: any) { const entity = value.entityType === "UNIVERSITY" ? value.university : value.industry; return { id: value._id.toString(), problemId: value.problem.toString(), entityType: value.entityType, entity: entity ? { id: entity._id.toString(), name: entity.name, location: entity.profileLocation } : undefined, overallScore: value.overallScore, scoreBreakdown: value.scoreBreakdown, weights: value.weights, matchingReasons: value.matchingReasons, matchedCapabilities: value.matchedCapabilities, missingCapabilities: value.missingCapabilities, status: value.status, generatedAt: value.generatedAt, sourceUpdatedAt: value.sourceUpdatedAt, updatedAt: value.updatedAt }; }
export async function generate(problemId: string, actor: Actor, requestedType?: EntityType) {
  if (actor.role !== "ADMIN" && !["UNIVERSITY", "INDUSTRY"].includes(actor.role)) throw new AppError("Only Admin, University, or Industry users can generate matches", 403);
  const { problem, dna } = await validatedProblem(problemId);
  const types: EntityType[] = requestedType ? [requestedType] : actor.role === "ADMIN" ? ["UNIVERSITY", "INDUSTRY"] : [actor.role as EntityType];
  const results: any[] = [];
  for (const type of types) {
    const entities = await profiles(actor, type);
    for (const entity of entities) {
      const key = `${problem._id}:${type}:${entity._id}`;
      if (activeGenerations.has(key)) throw new AppError("This match is already being generated", 409);
      activeGenerations.add(key);
      try {
        const match = await calculateOpportunityMatch({ ...problem.toObject(), dna }, entity.toObject(), type === "UNIVERSITY" ? "university" : "industry");
        const sourceUpdatedAt = sourceDate(problem, dna, entity);
        const filter = type === "UNIVERSITY" ? { problem: problem._id, entityType: type, university: entity._id } : { problem: problem._id, entityType: type, industry: entity._id };
        const document = { ...filter, overallScore: match.overallMatchScore * 100, scoreBreakdown: { semantic: match.semanticScore * 100, domain: match.domainScore * 100, skills: match.skillsScore * 100, resource: match.resourceScore * 100, location: match.locationScore * 100 }, weights: match.scoringWeights, matchingReasons: match.matchingReasons, matchedCapabilities: match.matchedCapabilities, missingCapabilities: match.missingCapabilities, status: "CURRENT", sourceVersion: "step16-v1", sourceUpdatedAt, generatedAt: new Date() };
        const saved = await OpportunityMatch.findOneAndUpdate(filter, { $set: document }, { upsert: true, new: true, setDefaultsOnInsert: true });
        results.push(saved);
      } finally { activeGenerations.delete(key); }
    }
  }
  return results.map(safe);
}
async function scopedFilter(actor: Actor, type?: EntityType) {
  const filter: any = type ? { entityType: type } : {};
  if (actor.role === "UNIVERSITY") { const entity = await ownEntity(actor, "UNIVERSITY"); filter.entityType = "UNIVERSITY"; filter.university = entity._id; }
  else if (actor.role === "INDUSTRY") { const entity = await ownEntity(actor, "INDUSTRY"); filter.entityType = "INDUSTRY"; filter.industry = entity._id; }
  else if (actor.role !== "ADMIN") throw new AppError("Insufficient permissions", 403);
  return filter;
}
export async function list(problemId: string, actor: Actor, query: { entityType?: EntityType; minScore?: number; page: number; limit: number; sort: "score" | "newest" }) {
  const { problem } = await validatedProblem(problemId); const filter = { ...(await scopedFilter(actor, query.entityType)), problem: problem._id, status: { $in: ["CURRENT", "STALE"] }, ...(query.minScore === undefined ? {} : { overallScore: { $gte: query.minScore } }) };
  const sort: Record<string, -1> = query.sort === "newest" ? { generatedAt: -1 } : { overallScore: -1 };
  const [items, total] = await Promise.all([OpportunityMatch.find(filter).populate("university", "name profileLocation updatedAt").populate("industry", "name profileLocation updatedAt").sort(sort).skip((query.page - 1) * query.limit).limit(query.limit), OpportunityMatch.countDocuments(filter)]);
  const dna = await ProblemDNA.findOne({ problem: problem._id, generationStatus: "COMPLETED" }).lean();
  await Promise.all(items.map(async (item: any) => { const entity = item.entityType === "UNIVERSITY" ? item.university : item.industry; if (entity && item.sourceUpdatedAt && sourceDate(problem, dna, entity) > new Date(item.sourceUpdatedAt)) { item.status = "STALE"; await OpportunityMatch.updateOne({ _id: item._id }, { $set: { status: "STALE" } }); } }));
  return { matches: items.map(safe), pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } };
}
export async function get(problemId: string, matchId: string, actor: Actor) { const { problem } = await validatedProblem(problemId); const match = await OpportunityMatch.findOne({ _id: oid(matchId, "match ID"), problem: problem._id, ...(await scopedFilter(actor)) }).populate("university", "name profileLocation").populate("industry", "name profileLocation"); if (!match) throw new AppError("Opportunity match not found", 404); return safe(match); }
