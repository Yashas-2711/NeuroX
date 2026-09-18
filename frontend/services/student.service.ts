import { apiClient } from "@/lib/api";
import type { StudentTeam } from "@/types/project";

export async function getStudentTeams() {
  const response = await apiClient.get<{ data: { teams: StudentTeam[] } }>("/student/teams");
  return response.data.data.teams;
}

export async function getStudentTeam(id: string) {
  const response = await apiClient.get<{ data: { team: StudentTeam } }>(`/student/teams/${id}`);
  return response.data.data.team;
}
