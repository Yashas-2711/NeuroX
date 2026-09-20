import { apiClient } from "@/lib/api";
import type { Collaboration, IndustryOpportunity, IndustryProfile, IndustryProjectView } from "@/types/industry";
export async function getIndustryProfile(){const r=await apiClient.get<{data:{profile:IndustryProfile|null}}>("/industry/profile");return r.data.data.profile}
export async function updateIndustryProfile(input:IndustryProfile){const r=await apiClient.patch<{data:{profile:IndustryProfile}}>("/industry/profile",input);return r.data.data.profile}
export async function getIndustryOpportunities(params:Record<string,string|number>={}){const r=await apiClient.get<{data:{opportunities:IndustryOpportunity[];pagination:unknown}}>("/industry/opportunities",{params});return r.data.data}
export async function getIndustryOpportunity(id:string){const r=await apiClient.get<{data:{opportunity:IndustryOpportunity}}>(`/industry/opportunities/${id}`);return r.data.data.opportunity}
export async function expressIndustryInterest(projectId:string,message:string){const r=await apiClient.post<{data:{collaboration:Collaboration;project:unknown}}>(`/industry/projects/${projectId}/interest`,{message});return r.data.data}
export async function getIndustryCollaborations(){const r=await apiClient.get<{data:{collaborations:Collaboration[]}}>("/industry/collaborations");return r.data.data.collaborations}
export async function getIndustryProject(id:string){const r=await apiClient.get<{data:{project:IndustryProjectView}}>(`/industry/projects/${id}`);return r.data.data.project}
export async function getUniversityCollaborations(){const r=await apiClient.get<{data:{collaborations:Collaboration[]}}>("/university/collaborations");return r.data.data.collaborations}
export async function respondToCollaboration(id:string,status:"accept"|"reject"){const r=await apiClient.patch<{data:{collaboration:Collaboration}}>(`/university/collaborations/${id}/${status}`);return r.data.data.collaboration}
