import { apiClient } from "@/lib/api"; import type { CreateProblemInput,Problem } from "@/types/problem";
export async function createProblem(input:CreateProblemInput){const r=await apiClient.post<{data:{problem:Problem}}>("/problems",input);return r.data.data.problem}
export async function getMyProblems(){const r=await apiClient.get<{data:{problems:Problem[]}}>("/problems/my");return r.data.data.problems}
export async function getProblem(id:string){const r=await apiClient.get<{data:{problem:Problem}}>(`/problems/${id}`);return r.data.data.problem}
