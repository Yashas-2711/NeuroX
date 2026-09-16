import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { USER_ROLES, type UserRole } from "../models";

export interface AuthTokenPayload extends jwt.JwtPayload {
  userId: string;
  role: UserRole;
}

export function generateAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string") throw new Error("Invalid token payload");

  const payload = decoded as jwt.JwtPayload & { userId?: unknown; role?: unknown };
  const userId = typeof payload.userId === "string" ? payload.userId : typeof payload.sub === "string" ? payload.sub : "";

  if (!userId || typeof payload.role !== "string" || !USER_ROLES.includes(payload.role as UserRole)) {
    throw new Error("Invalid token payload");
  }

  return { ...payload, userId, role: payload.role as UserRole };
}
