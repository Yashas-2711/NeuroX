import { apiClient } from "@/lib/api";
import type { Problem, ProblemProgress } from "@/types/problem";

export interface AdminProblemPage { problems: Problem[]; counts: { total: number; submitted: number; validated: number; rejected: number }; pagination: { page: number; limit: number; total: number; pages: number } }
export async function getAdminProblems(status?: string, page = 1) { const r = await apiClient.get<{data:AdminProblemPage}>("/admin/problems", { params: { ...(status ? { status } : {}), page } }); return r.data.data; }
export async function getAdminProblem(id: string) { const r = await apiClient.get<{data:{problem:Problem}}>(`/admin/problems/${id}`); return r.data.data.problem; }
export async function getAdminProblemProgress(id: string) { const r = await apiClient.get<{data:ProblemProgress}>(`/admin/problems/${id}/progress`); return r.data.data; }
export async function validateAdminProblem(id: string) { const r = await apiClient.patch<{data:{problem:Problem}}>(`/admin/problems/${id}/validate`); return r.data.data.problem; }
export async function rejectAdminProblem(id: string, reason: string) { const r = await apiClient.patch<{data:{problem:Problem}}>(`/admin/problems/${id}/reject`, { reason }); return r.data.data.problem; }
