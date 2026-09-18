import { Types } from "mongoose";
import { Milestone, Project, Team, University } from "../models";
import { AppError } from "../utils/app-error";

function oid(value: string) {
  if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid ID", 400);
  return new Types.ObjectId(value);
}

async function progress(projectId: Types.ObjectId) {
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

async function safeTeam(team: any) {
  const project = await Project.findById(team.project)
    .populate("problem", "title description category location status")
    .populate("university", "name profileLocation")
    .select("title description problem university status startDate targetEndDate createdAt updatedAt");
  if (!project) throw new AppError("Project not found", 404);
  const [leader, members, stats] = await Promise.all([
    team.populate("leader", "name email role"),
    team.populate("members.user", "name email role"),
    progress(project._id),
  ]);
  return {
    id: team._id.toString(),
    name: team.name,
    leader: leader.leader,
    members: members.members,
    project: { ...project.toObject(), id: project._id.toString(), ...stats },
  };
}

export async function listTeams(userId: string) {
  const teams = await Team.find({ "members.user": oid(userId) }).sort({ updatedAt: -1 });
  return Promise.all(teams.map(safeTeam));
}

export async function getTeam(userId: string, teamId: string) {
  const team = await Team.findOne({ _id: oid(teamId), "members.user": oid(userId) });
  if (!team) throw new AppError("Team not found", 404);
  return safeTeam(team);
}
