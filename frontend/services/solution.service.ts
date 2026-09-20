import { apiClient } from "@/lib/api";
import type { Solution, SolutionPermissions } from "@/types/solution";

export async function getSolutions(projectId: string) {
  const response = await apiClient.get<{ data: { solutions: Solution[]; permissions: SolutionPermissions } }>(`/projects/${projectId}/solutions`);
  return response.data.data;
}
export async function createSolution(projectId: string, input: { title: string; description: string; approach?: string; expectedOutcome?: string; requiredResources?: string[] }) {
  const response = await apiClient.post<{ data: { solution: Solution } }>(`/projects/${projectId}/solutions`, input);
  return response.data.data.solution;
}
export async function getSolution(id: string) {
  const response = await apiClient.get<{ data: { solution: Solution; permissions: SolutionPermissions } }>(`/solutions/${id}`);
  return response.data.data;
}
export async function updateSolution(id: string, input: Partial<Pick<Solution, "title" | "description" | "approach" | "expectedOutcome" | "requiredResources">>) {
  const response = await apiClient.patch<{ data: { solution: Solution } }>(`/solutions/${id}`, input);
  return response.data.data.solution;
}
export async function reviewSolution(id: string, status: "APPROVED" | "REJECTED", reviewNotes: string) {
  const response = await apiClient.patch<{ data: { solution: Solution } }>(`/solutions/${id}/review`, { status, reviewNotes });
  return response.data.data.solution;
}
export async function advanceSolution(id: string, status: "PROTOTYPE" | "TESTING" | "IMPLEMENTATION" | "COMPLETED", lifecycleNotes: string) {
  const response = await apiClient.patch<{ data: { solution: Solution } }>(`/solutions/${id}/status`, { status, lifecycleNotes });
  return response.data.data.solution;
}

