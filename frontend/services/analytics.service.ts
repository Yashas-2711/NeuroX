import { apiClient } from "@/lib/api";
import type { AnalyticsData } from "@/types/analytics";
export async function getAnalytics(params: { range: string; category?: string; status?: string }) { const r = await apiClient.get<{ data: AnalyticsData }>("/analytics", { params }); return r.data.data; }
