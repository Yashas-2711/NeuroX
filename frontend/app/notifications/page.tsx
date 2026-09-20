"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import type { AppNotification } from "@/types/notification";
import { USER_ROLES } from "@/types/auth";

function Content() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getNotifications().then((data) => { if (active) setItems(data.notifications); }).catch(() => { if (active) setError("Unable to load notifications."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const read = async (item: AppNotification) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
    } catch { setError("Unable to update notification status."); }
  };
  const destination = (item: AppNotification) => {
    if (!item.relatedId) return "/notifications";
    if (item.relatedType === "PROBLEM") {
      if (user?.role === "ADMIN") return `/admin/problems/${item.relatedId}`;
      if (user?.role === "UNIVERSITY") return `/university/problems/${item.relatedId}`;
      if (user?.role === "INDUSTRY") return `/industry/opportunities/${item.relatedId}`;
      return `/citizen/problems/${item.relatedId}`;
    }
    if (item.relatedType === "PROJECT") return `/university/projects/${item.relatedId}`;
    return "/notifications";
  };
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">Workspace updates</p>
      <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="display-md mt-3">Notifications</h1><button className="button-secondary" onClick={async () => { try { await markAllNotificationsRead(); setItems((current) => current.map((item) => ({ ...item, isRead: true }))); } catch { setError("Unable to update notification status."); } }}>Mark all read</button></div>
      {loading && <p className="mt-8 text-white/50">Loading notifications…</p>}
      {error && <p className="mt-8 text-red-200" role="alert">{error}</p>}
      {!loading && !error && !items.length && <p className="mt-8 border border-dashed border-white/20 p-8 text-white/55">No notifications yet.</p>}
      <div className="mt-8 space-y-3">{items.map((item) => <Link key={item.id} href={destination(item)} onClick={() => void read(item)} className={`block border p-5 ${item.isRead ? "border-white/10" : "border-blue-300/40"}`}><div className="flex flex-wrap justify-between gap-3"><p className="text-white">{item.title}</p><p className="eyebrow">{new Date(item.createdAt).toLocaleString()}</p></div><p className="mt-2 text-sm text-white/65">{item.message}</p></Link>)}</div>
    </main>
  );
}

export default function Page() { return <ProtectedRoute allowedRole={[...USER_ROLES]}><Content /></ProtectedRoute>; }
