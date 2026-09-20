import { Types } from "mongoose";
import { Collaboration, Industry, Milestone, Problem, Project, Solution, Team, University, UniversityInterest } from "../models";
import { AppError } from "../utils/app-error";

type Actor = { userId: string; role: string };
const id = (value: string) => { if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid problem ID", 400); return new Types.ObjectId(value); };

export async function getPassport(problemId: string, actor: Actor) {
  const problem = await Problem.findById(id(problemId)).select("title description category location priority status submittedBy aiClassification aiConfidence aiAnalysisStatus aiAnalyzedAt aiAnalysisFailedAt validatedAt validatedBy rejectedAt rejectedBy rejectionReason createdAt updatedAt");
  if (!problem) throw new AppError("Problem not found", 404);
  const projects = await Project.find({ problem: problem._id }).populate("university", "name profileLocation user").sort({ createdAt: 1 });
  const interests = await UniversityInterest.find({ problem: problem._id }).populate("university", "name profileLocation user").sort({ createdAt: 1 });
  const collaborations = projects.length ? await Collaboration.find({ project: { $in: projects.map((project) => project._id) } }).populate("industry", "name profileLocation").sort({ createdAt: 1 }) : [];
  const solutions = projects.length ? await Solution.find({ project: { $in: projects.map((project) => project._id) } }).sort({ createdAt: 1 }) : [];
  await authorize(problem, projects, collaborations, actor);

  const events: PassportEvent[] = [{ type: "PROBLEM_SUBMITTED", status: "SUBMITTED", timestamp: problem.createdAt, title: "Problem submitted", detail: problem.title }];
  if (problem.aiAnalysisStatus === "COMPLETED" && problem.aiAnalyzedAt) events.push({ type: "AI_ANALYSIS_COMPLETED", status: "COMPLETED", timestamp: problem.aiAnalyzedAt, title: "AI analysis completed", detail: problem.aiClassification ? `Classified as ${problem.aiClassification}` : undefined });
  if (problem.aiAnalysisStatus === "FAILED" && problem.aiAnalysisFailedAt) events.push({ type: "AI_ANALYSIS_FAILED", status: "FAILED", timestamp: problem.aiAnalysisFailedAt, title: "AI analysis failed", detail: "Automated analysis did not complete." });
  if (problem.validatedAt) events.push({ type: "ADMIN_VALIDATED", status: "VALIDATED", timestamp: problem.validatedAt, title: "Problem validated", detail: "The problem passed administrative validation." });
  if (problem.rejectedAt) events.push({ type: "ADMIN_REJECTED", status: "REJECTED", timestamp: problem.rejectedAt, title: "Problem rejected", detail: problem.rejectionReason });
  interests.forEach((interest: any) => events.push({ type: "UNIVERSITY_INTEREST", status: interest.status, timestamp: interest.createdAt, title: "University interest recorded", detail: interest.university?.name ? `${interest.university.name} expressed interest.` : undefined }));
  projects.forEach((project: any) => {
    events.push({ type: "PROJECT_CREATED", status: project.status, timestamp: project.createdAt, title: "University project created", detail: project.title, relatedId: project._id.toString(), relatedType: "PROJECT" });
    if (project.status === "COMPLETED") events.push({ type: "PROJECT_COMPLETED", status: "COMPLETED", timestamp: project.updatedAt, title: "Project completed", detail: project.title, relatedId: project._id.toString(), relatedType: "PROJECT" });
  });
  collaborations.forEach((collaboration: any) => {
    events.push({ type: "INDUSTRY_COLLABORATION_REQUEST", status: collaboration.status, timestamp: collaboration.createdAt, title: "Industry collaboration requested", detail: collaboration.message, relatedId: collaboration.project.toString(), relatedType: "PROJECT" });
    if (collaboration.respondedAt) events.push({ type: "INDUSTRY_COLLABORATION_DECISION", status: collaboration.status, timestamp: collaboration.respondedAt, title: `Industry collaboration ${collaboration.status.toLowerCase()}`, relatedId: collaboration.project.toString(), relatedType: "PROJECT" });
  });
  solutions.forEach((solution: any) => {
    events.push({ type: "SOLUTION_SUBMITTED", status: solution.status, timestamp: solution.createdAt, title: "Solution submitted", detail: solution.title, relatedId: solution._id.toString(), relatedType: "SOLUTION" });
    if (solution.reviewedAt) events.push({ type: "SOLUTION_REVIEWED", status: solution.status, timestamp: solution.reviewedAt, title: `Solution ${solution.status.toLowerCase()}`, detail: solution.title, relatedId: solution._id.toString(), relatedType: "SOLUTION" });
    if (solution.stageUpdatedAt) events.push({ type: "SOLUTION_STAGE_CHANGED", status: solution.status, timestamp: solution.stageUpdatedAt, title: `Solution moved to ${solution.status.toLowerCase()}`, detail: solution.title, relatedId: solution._id.toString(), relatedType: "SOLUTION" });
  });
  events.sort((a, b) => {
    const timestampOrder = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (timestampOrder !== 0) return timestampOrder;
    return `${a.type}:${a.relatedId ?? ""}:${a.title}`.localeCompare(`${b.type}:${b.relatedId ?? ""}:${b.title}`);
  });
  const projectSummaries = await Promise.all(projects.map(async (project: any) => { const milestones = await Milestone.find({ project: project._id }); const completed = milestones.filter((milestone) => milestone.status === "COMPLETED").length; const team = await Team.findOne({ project: project._id }).select("name leader members"); return { id: project._id.toString(), title: project.title, status: project.status, university: project.university, progress: milestones.length ? Math.round((completed / milestones.length) * 100) : 0, totalMilestones: milestones.length, completedMilestones: completed, team: team ? { id: team._id.toString(), name: team.name } : null }; }));
  return { problem: { id: problem._id.toString(), title: problem.title, category: problem.category, location: problem.location, priority: problem.priority, status: problem.status, aiAnalysisStatus: problem.aiAnalysisStatus, createdAt: problem.createdAt, updatedAt: problem.updatedAt }, events, projects: projectSummaries };
}

type PassportEvent = { type: string; status: string; timestamp: Date; title: string; detail?: string; relatedId?: string; relatedType?: string };

async function authorize(problem: any, projects: any[], collaborations: any[], actor: Actor) {
  if (actor.role === "ADMIN") return;
  if (["CITIZEN", "STUDENT"].includes(actor.role) && problem.submittedBy.toString() === actor.userId) return;
  if (actor.role === "UNIVERSITY") {
    const university = await University.findOne({ user: id(actor.userId) }).select("_id");
    if (university && projects.some((project: any) => project.university?._id?.toString() === university._id.toString())) return;
    if (university && projects.length === 0 && (await UniversityInterest.exists({ problem: problem._id, university: university._id }))) return;
  }
  if (actor.role === "INDUSTRY") {
    const industry = await Industry.findOne({ user: id(actor.userId) }).select("_id");
    if (industry && collaborations.some((collaboration: any) => collaboration.industry?._id?.toString() === industry._id.toString() && collaboration.status === "ACCEPTED")) return;
  }
  throw new AppError("You are not allowed to view this challenge passport", 403);
}
