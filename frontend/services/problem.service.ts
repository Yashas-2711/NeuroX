import { apiClient } from "@/lib/api"; import type { CreateProblemInput,Problem,ProblemProgress } from "@/types/problem";
export async function createProblem(input:CreateProblemInput){const r=await apiClient.post<{data:{problem:Problem}}>("/problems",input);return r.data.data.problem}
export async function getMyProblems(){const r=await apiClient.get<{data:{problems:Problem[]}}>("/problems/my");return r.data.data.problems}
export async function getProblem(id:string){const r=await apiClient.get<{data:{problem:Problem}}>(`/problems/${id}`);return r.data.data.problem}
export async function getProblemProgress(id:string){const r=await apiClient.get<{data:ProblemProgress}>(`/problems/${id}/progress`);return r.data.data}
export async function getChallengePassport(id:string){const r=await apiClient.get<{data:import("@/types/passport").ChallengePassport}>(`/problems/${id}/passport`);return r.data.data}
