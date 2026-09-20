import { apiClient } from "@/lib/api";
import type { RevivalDetail, RevivalChallenge, RevivalStatus } from "@/types/revival";
export async function listRevivalChallenges() { const r = await apiClient.get<{ data: { challenges: RevivalChallenge[] } }>("/revival?limit=50"); return r.data.data.challenges; }
export async function getRevival(problemId: string) { const r = await apiClient.get<{ data: RevivalDetail }>(`/revival/${problemId}`); return r.data.data; }
export async function createRevivalReview(problemId: string, input: Record<string, unknown>) { const r = await apiClient.post<{ data: { review: RevivalDetail["review"] } }>(`/revival/${problemId}/review`, input); return r.data.data.review; }
export async function updateRevivalReview(problemId: string, input: { status?: RevivalStatus; reviewNotes?: string; blockers?: string[]; proposedActions?: string[] }) { const r = await apiClient.patch<{ data: { review: RevivalDetail["review"] } }>(`/revival/${problemId}/review`, input); return r.data.data.review; }
