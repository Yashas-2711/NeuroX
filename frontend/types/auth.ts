export const USER_ROLES = ["CITIZEN", "STUDENT", "UNIVERSITY", "INDUSTRY", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type PublicUserRole = Exclude<UserRole, "ADMIN">;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
