import { apiClient } from "@/lib/api";
import type { AppNotification } from "@/types/notification";
export async function getNotifications(params: { page?: number; limit?: number } = {}) { const response = await apiClient.get<{ data: { notifications: AppNotification[]; unreadCount: number; pagination: unknown } }>("/notifications", { params }); return response.data.data; }
export async function getUnreadNotificationCount() { const response = await apiClient.get<{ data: { unreadCount: number } }>("/notifications/unread-count"); return response.data.data.unreadCount; }
export async function markNotificationRead(id: string) { await apiClient.patch(`/notifications/${id}/read`); }
export async function markAllNotificationsRead() { await apiClient.patch("/notifications/read-all"); }

