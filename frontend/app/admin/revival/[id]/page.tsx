"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { createRevivalReview, getRevival, updateRevivalReview } from "@/services/revival.service";
import type { RevivalDetail, RevivalStatus } from "@/types/revival";

function messageFrom(error: unknown, fallback: string) {
  const value = error as { response?: { data?: { message?: string } } };
  return value.response?.data?.message ?? fallback;
}

function Content() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [data, setData] = useState<RevivalDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setError(""); return getRevival(id).then(setData).catch((reason: unknown) => setError(messageFrom(reason, "Unable to load revival review."))); }, [id]);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  const change = async (status: RevivalStatus) => { setBusy(true); setError(""); try { const review = data?.review ? await updateRevivalReview(id, { status }) : await createRevivalReview(id, { proposedActions: [] }); setData((current) => current ? { ...current, review } : current); } catch (reason: unknown) { setError(messageFrom(reason, "Unable to update revival review.")); } finally { setBusy(false); } };
  const currentStatus = data?.review?.status;
  const nextStatus: RevivalStatus | null = currentStatus === "FLAGGED" ? "UNDER_REVIEW" : currentStatus === "UNDER_REVIEW" ? "REVIVAL_PROPOSED" : currentStatus === "REVIVAL_PROPOSED" ? "REVIVAL_IN_PROGRESS" : currentStatus === "REVIVAL_IN_PROGRESS" ? "REVIVED" : null;
  const nextLabel = currentStatus === "FLAGGED" ? "Start review" : currentStatus === "UNDER_REVIEW" ? "Propose revival" : currentStatus === "REVIVAL_PROPOSED" ? "Start revival" : currentStatus === "REVIVAL_IN_PROGRESS" ? "Mark revived" : null;
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/admin/revival" className="text-link">← Revival candidates</Link>{error && <p className="mt-8 text-red-200" role="alert">{error}</p>}{!data && !error && <p className="mt-10 text-white/55">Loading…</p>}{data && <><p className="eyebrow mt-10">Revival review / {data.problem.status}</p><h1 className="display-md mt-3">{data.problem.title}</h1><section className="mt-10 border border-white/10 p-6"><p className="eyebrow">Why flagged</p><ul className="mt-4 list-disc pl-5 text-white/70">{data.detection.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul><p className="mt-5 text-sm text-white/50">Last activity: {new Date(data.detection.lastActivityAt).toLocaleString()}</p></section><section className="mt-6 border border-blue-300/20 p-6"><p className="eyebrow">Evidence-based next steps</p><ul className="mt-4 list-disc pl-5 text-white/70">{data.recommendations.actions.map((action) => <li key={action}>{action}</li>)}</ul></section><section className="mt-6 border border-white/10 p-6"><p className="eyebrow">Review status</p><p className="mt-3 text-white">{data.review?.status ?? "Not started"}</p><div className="mt-5 flex flex-wrap gap-3">{!data.review && <button className="button-primary" disabled={busy} onClick={() => void change("UNDER_REVIEW")}>Start review</button>}{data.review && nextStatus && nextLabel && <button className="button-primary" disabled={busy} onClick={() => void change(nextStatus)}>{nextLabel}</button>}{data.review && !["REVIVED", "CLOSED"].includes(data.review.status) && <button className="button-secondary" disabled={busy} onClick={() => void change("CLOSED")}>Close review</button>}</div></section></>}</main>;
}

export default function Page() { return <ProtectedRoute allowedRole={["ADMIN", "UNIVERSITY", "INDUSTRY"]}><Content /></ProtectedRoute>; }
