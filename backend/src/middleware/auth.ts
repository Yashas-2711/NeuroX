import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { UserRole } from "../models";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequest;
    }
  }
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) return next(new AppError("Authentication required", 401));

  try {
    request.auth = verifyAccessToken(token);
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) return next(new AppError("Authentication token expired", 401));
    return next(new AppError("Invalid authentication token", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth) return next(new AppError("Authentication required", 401));
    if (!roles.includes(request.auth.role)) return next(new AppError("Insufficient permissions", 403));
    return next();
  };
}
