import { Types } from "mongoose";
import { Collaboration, Project, ProjectMessage, Team, University } from "../models";
import { AppError } from "../utils/app-error";
import * as notifications from "./notification.service";

const oid = (value: string) => { if (!Types.ObjectId.isValid(value)) throw new AppError("Invalid project ID", 400); return new Types.ObjectId(value); };
async function participant(projectId: string, userId: string) {
  const project = await Project.findById(oid(projectId)).select("_id title university"); if (!project) throw new AppError("Project not found", 404);
  const university = await University.findById(project.university).select("user");
  const team = await Team.findOne({ project: project._id }).select("leader members");
  const collaboration = await Collaboration.findOne({ project: project._id, status: "ACCEPTED" }).populate("industry", "user");
  const acceptedIndustryUser = (collaboration?.industry as any)?.user?.toString();
  const memberIds = [university?.user?.toString(), team?.leader?.toString(), ...(team?.members ?? []).map((member: any) => member.user.toString()), acceptedIndustryUser].filter(Boolean);
  if (!memberIds.includes(userId)) throw new AppError("Project communication is limited to participants", 403);
  return { project, memberIds: [...new Set(memberIds)] };
}
export async function list(projectId: string, userId: string, page: number, limit: number) { await participant(projectId, userId); const filter = { project: oid(projectId) }; const [messages, total] = await Promise.all([ProjectMessage.find(filter).populate("author", "name role").sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(), ProjectMessage.countDocuments(filter)]); return { messages: messages.map((message: any) => ({ id: message._id.toString(), body: message.body, author: message.author ? { id: message.author._id.toString(), name: message.author.name, role: message.author.role } : null, createdAt: message.createdAt })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } }; }
export async function create(projectId: string, userId: string, body: string) { const { project, memberIds } = await participant(projectId, userId); const message = await ProjectMessage.create({ project: project._id, author: oid(userId), body }); const recipients = memberIds.filter((id) => id !== userId); await notifications.notifyMany(recipients, { title: "New project communication", message: `A new update was posted in ${project.title}.`, type: "PROJECT_MESSAGE", relatedType: "PROJECT", relatedId: project._id, dedupeKey: `project-message:${message._id}` }); return (await ProjectMessage.findById(message._id).populate("author", "name role")) as any; }
