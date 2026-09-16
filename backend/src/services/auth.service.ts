import bcrypt from "bcryptjs";

import { User, type IUser, type UserRole } from "../models";
import { AppError } from "../utils/app-error";
import { generateAccessToken } from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../validators/auth.validators";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toSafeUser(user: IUser & { _id?: unknown }): SafeUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  const existingUser = await User.findOne({ email }).select("_id").lean();

  if (existingUser) throw new AppError("Unable to register with those details", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name.trim(),
    email,
    role: input.role,
    passwordHash,
  });

  const safeUser = toSafeUser(user.toObject() as IUser & { _id: unknown });
  return { user: safeUser, token: generateAccessToken(safeUser.id, safeUser.role) };
}

export async function loginUser(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) throw new AppError("Invalid email or password", 401);

  const safeUser = toSafeUser(user.toObject() as IUser & { _id: unknown });
  return { user: safeUser, token: generateAccessToken(safeUser.id, safeUser.role) };
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId).select("+passwordHash").lean();

  if (!user || !user.isActive) throw new AppError("Authentication required", 401);

  return toSafeUser(user as IUser & { _id: unknown });
}
