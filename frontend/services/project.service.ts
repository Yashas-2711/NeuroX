import { apiClient } from "@/lib/api";import type {Milestone,Project,Team} from "@/types/project";
export async function createProject(input:{title:string;description:string;problemId:string;startDate?:string;targetEndDate?:string}){const r=await apiClient.post<{data:{project:Project}}>("/university/projects",input);return r.data.data.project}
export async function getProjects(params:Record<string,string|number>={}){const r=await apiClient.get<{data:{projects:Project[];pagination:unknown}}>("/university/projects",{params});return r.data.data}
export async function getProject(id:string){const r=await apiClient.get<{data:{project:Project}}>(`/university/projects/${id}`);return r.data.data.project}
export async function updateProjectStatus(id:string,status:string){const r=await apiClient.patch<{data:{project:Project}}>(`/university/projects/${id}/status`,{status});return r.data.data.project}
export async function getTeam(id:string){const r=await apiClient.get<{data:{team:Team|null}}>(`/university/projects/${id}/team`);return r.data.data.team}
export async function createTeam(id:string,name:string){const r=await apiClient.post<{data:{team:Team}}>(`/university/projects/${id}/team`,{name});return r.data.data.team}
export async function addMember(id:string,userId:string){const r=await apiClient.post<{data:{team:Team}}>(`/university/projects/${id}/team/members`,{userId,role:"MEMBER"});return r.data.data.team}
export async function removeMember(id:string,userId:string){const r=await apiClient.delete<{data:{team:Team}}>(`/university/projects/${id}/team/members/${userId}`);return r.data.data.team}
export async function getMilestones(id:string){const r=await apiClient.get<{data:{milestones:Milestone[];progress:number;totalMilestones:number;completedMilestones:number;pendingMilestones:number;overdueMilestones:number}}>(`/university/projects/${id}/milestones`);return r.data.data}
export async function createMilestone(id:string,input:Partial<Milestone>){const r=await apiClient.post<{data:{milestone:Milestone}}>(`/university/projects/${id}/milestones`,input);return r.data.data.milestone}
export async function updateMilestone(id:string,mid:string,input:Partial<Milestone>){const r=await apiClient.patch<{data:{milestone:Milestone}}>(`/university/projects/${id}/milestones/${mid}`,input);return r.data.data.milestone}
export async function deleteMilestone(id:string,mid:string){await apiClient.delete(`/university/projects/${id}/milestones/${mid}`)}
