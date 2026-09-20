import { apiClient } from "@/lib/api";
import type { ImpactTwin } from "@/types/impact";
export async function getImpactTwin(problemId: string) { const r = await apiClient.get<{ data: ImpactTwin }>(`/problems/${problemId}/impact`); return r.data.data; }
export async function createImpactIndicator(problemId: string, input: Record<string, unknown>) { const r = await apiClient.post<{ data: { indicator: unknown } }>(`/problems/${problemId}/impact/indicators`, input); return r.data.data.indicator; }
export async function createImpactScenario(problemId: string, input: Record<string, unknown>) { const r = await apiClient.post<{ data: { scenario: unknown } }>(`/problems/${problemId}/impact/scenarios`, input); return r.data.data.scenario; }
export async function recordImpactObservation(problemId: string, input: Record<string, unknown>) { const r = await apiClient.post<{ data: { observation: unknown } }>(`/problems/${problemId}/impact/observations`, input); return r.data.data.observation; }
