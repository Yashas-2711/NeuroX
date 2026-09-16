import { apiClient } from "@/lib/api";
import type { AuthResponse, AuthUser, PublicUserRole } from "@/types/auth";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export async function registerRequest(input: { name: string; email: string; password: string; role: PublicUserRole }) {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", input);
  return response.data.data;
}

export async function loginRequest(input: { email: string; password: string }) {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", input);
  return response.data.data;
}

export async function currentUserRequest() {
  const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
  return response.data.data.user;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}
