import type { Request, Response } from "express";
import { ZodError } from "zod";

import { asyncHandler } from "../middleware/asyncHandler";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";
import { AppError } from "../utils/app-error";
import { loginSchema, registerSchema } from "../validators/auth.validators";

function validationError(error: ZodError): AppError {
  return new AppError(error.issues[0]?.message ?? "Invalid request", 400);
}

export const register = asyncHandler(async (request: Request, response: Response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) throw validationError(parsed.error);

  const result = await registerUser(parsed.data);
  response.status(201).json({ success: true, message: "Registration successful", data: result });
});

export const login = asyncHandler(async (request: Request, response: Response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) throw validationError(parsed.error);

  const result = await loginUser(parsed.data);
  response.json({ success: true, message: "Login successful", data: result });
});

export const me = asyncHandler(async (request: Request, response: Response) => {
  if (!request.auth) throw new AppError("Authentication required", 401);
  const user = await getCurrentUser(request.auth.userId);
  response.json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (_request: Request, response: Response) => {
  response.json({ success: true, message: "Logout successful. Remove the token from the client." });
});

export const roleCheck = (role: string) => asyncHandler(async (_request: Request, response: Response) => {
  response.json({ success: true, message: `${role} access verified`, data: { role } });
});
