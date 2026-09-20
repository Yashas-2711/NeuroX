import { Types } from "mongoose";
import { Notification } from "../models";
import { AppError } from "../utils/app-error";

export type NotificationInput = {
  recipient: string | Types.ObjectId;
  title: string;
  message: string;
  type: string;
  relatedType?: string;
  relatedId?: string | Types.ObjectId;
  dedupeKey?: string;
};

export async function create(input: NotificationInput) {
  try {
    const document = {
      ...input,
      recipient: new Types.ObjectId(input.recipient.toString()),
      relatedId: input.relatedId ? new Types.ObjectId(input.relatedId.toString()) : undefined,
    };
    if (input.dedupeKey) {
      await Notification.updateOne({ dedupeKey: input.dedupeKey }, { $setOnInsert: document }, { upsert: true });
      return Notification.findOne({ dedupeKey: input.dedupeKey });
    }
    return Notification.create(document);
  } catch (error) {
    console.warn(`Notification delivery failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return null;
  }
}

export async function notifyMany(recipients: string[], input: Omit<NotificationInput, "recipient">) {
  await Promise.all([...new Set(recipients)].map((recipient) => create({ ...input, recipient, dedupeKey: input.dedupeKey ? `${input.dedupeKey}:${recipient}` : undefined })));
}

export async function list(userId: string, page: number, limit: number) {
  const filter = { recipient: new Types.ObjectId(userId) };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  return { notifications: items.map(safe), unreadCount: unread, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function unreadCount(userId: string) { return Notification.countDocuments({ recipient: new Types.ObjectId(userId), isRead: false }); }

export async function markRead(userId: string, id: string) {
  if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid notification ID", 400);
  const result = await Notification.findOneAndUpdate({ _id: id, recipient: new Types.ObjectId(userId) }, { isRead: true }, { returnDocument: "after" });
  if (!result) throw new AppError("Notification not found", 404);
  return safe(result);
}

export async function markAllRead(userId: string) { await Notification.updateMany({ recipient: new Types.ObjectId(userId), isRead: false }, { isRead: true }); return { updated: true }; }

function safe(value: any) { return { id: value._id.toString(), title: value.title, message: value.message, type: value.type, relatedType: value.relatedType, relatedId: value.relatedId?.toString?.(), isRead: value.isRead, createdAt: value.createdAt }; }
