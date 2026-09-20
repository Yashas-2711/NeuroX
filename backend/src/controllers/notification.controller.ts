import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import * as service from "../services/notification.service";
import {
  notificationIdSchema,
  notificationQuerySchema,
} from "../validators/notification.validators";

function userId(request: Request) {
  if (!request.auth) throw new AppError("Authentication required", 401);
  return request.auth.userId;
}
function parse<T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) throw new AppError("Invalid notification input", 400);
  return result.data as T;
}
export async function list(request: Request, response: Response) {
  const query = parse(notificationQuerySchema, request.query);
  response.json({
    success: true,
    data: await service.list(userId(request), query.page, query.limit),
  });
}
export async function unreadCount(request: Request, response: Response) {
  response.json({
    success: true,
    data: { unreadCount: await service.unreadCount(userId(request)) },
  });
}
export async function read(request: Request, response: Response) {
  const id = parse(notificationIdSchema, request.params.id);
  response.json({
    success: true,
    data: { notification: await service.markRead(userId(request), id) },
  });
}
export async function readAll(request: Request, response: Response) {
  response.json({
    success: true,
    data: await service.markAllRead(userId(request)),
  });
}
