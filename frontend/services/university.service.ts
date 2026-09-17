import { apiClient } from "@/lib/api";
import type { Problem } from "@/types/problem";
import type { Match, UniversityProfile } from "@/types/university";
export async function getUniversityProfile(){const r=await apiClient.get<{data:{profile:UniversityProfile|null}}>("/university/profile");return r.data.data.profile}
export async function updateUniversityProfile(input:UniversityProfile){const r=await apiClient.patch<{data:{profile:UniversityProfile}}>("/university/profile",input);return r.data.data.profile}
export async function getUniversityProblems(params:Record<string,string|number>={}){const r=await apiClient.get<{data:{problems:Problem[];pagination:unknown}}>("/university/problems",{params});return r.data.data}
export async function getUniversityProblem(id:string){const r=await apiClient.get<{data:{problem:Problem}}>(`/university/problems/${id}`);return r.data.data.problem}
export async function getUniversityMatches(){const r=await apiClient.get<{data:{matches:Match[]}}>("/university/matches");return r.data.data.matches}
export async function expressInterest(id:string){const r=await apiClient.post(`/university/problems/${id}/interest`);return r.data}
