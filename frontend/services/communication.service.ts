import { apiClient } from "@/lib/api";
import type { ProjectMessage } from "@/types/communication";
export async function getProjectMessages(projectId: string) { const r = await apiClient.get<{ data: { messages: ProjectMessage[]; pagination: unknown } }>(`/projects/${projectId}/messages`, { params: { page: 1, limit: 50 } }); return r.data.data; }
export async function postProjectMessage(projectId: string, body: string) { const r = await apiClient.post<{ data: { message: ProjectMessage } }>(`/projects/${projectId}/messages`, { body }); return r.data.data.message; }
