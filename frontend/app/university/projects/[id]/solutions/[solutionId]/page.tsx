"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { advanceSolution, getSolution, reviewSolution } from "@/services/solution.service";
import type { Solution } from "@/types/solution";

function Content() {
  const params = useParams<{ id: string; solutionId: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const solutionId = Array.isArray(params.solutionId) ? params.solutionId[0] : params.solutionId;
  const [item, setItem] = useState<Solution | null>(null); const [canReview, setCanReview] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [notes, setNotes] = useState("");
  const load = useCallback(() => getSolution(solutionId).then((data) => { setItem(data.solution); setCanReview(data.permissions.canReview); }).catch(() => setError("Unable to load this solution.")), [solutionId]);
  useEffect(() => { void load(); }, [load]);
  const review = async (status: "APPROVED" | "REJECTED") => { setBusy(true); setError(""); try { setItem(await reviewSolution(solutionId, status, notes)); } catch (error: unknown) { setError(errorMessage(error, "Unable to review this solution.")); } finally { setBusy(false); } };
  const advance = async (status: "PROTOTYPE" | "TESTING" | "IMPLEMENTATION" | "COMPLETED") => { setBusy(true); setError(""); try { setItem(await advanceSolution(solutionId, status, notes)); } catch (error: unknown) { setError(errorMessage(error, "Unable to advance this solution.")); } finally { setBusy(false); } };
  if (!item && error) return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!item) return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-white/50">Loading solution…</p></main>;
  const next: Record<string, "PROTOTYPE" | "TESTING" | "IMPLEMENTATION" | "COMPLETED"> = { APPROVED: "PROTOTYPE", PROTOTYPE: "TESTING", TESTING: "IMPLEMENTATION", IMPLEMENTATION: "COMPLETED" };
  return <main className="mx-auto max-w-4xl px-5 py-16"><Link href={`/university/projects/${projectId}/solutions`} className="text-link">← Back to solutions</Link><div className="mt-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Solution / {item.status}</p><h1 className="display-md mt-3">{item.title}</h1></div><span className="border border-blue-300/30 px-3 py-2 text-sm text-blue-100">{item.status}</span></div>{error && <p className="mt-5 text-red-200" role="alert">{error}</p>}<section className="mt-8 border border-white/10 p-6"><p className="eyebrow">Proposal</p><p className="mt-4 whitespace-pre-wrap leading-8 text-white/75">{item.description}</p>{item.approach && <Info title="Proposed approach" value={item.approach} />}{item.expectedOutcome && <Info title="Expected outcome" value={item.expectedOutcome} />}{item.requiredResources.length > 0 && <Info title="Required resources" value={item.requiredResources.join(", ")} />}</section>{canReview && <section className="mt-6 border border-white/10 p-6"><p className="eyebrow">Owner controls</p><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Review or stage notes" rows={4} className="mt-4 w-full border border-white/15 bg-background px-3 py-2 text-white" />{item.status === "SUBMITTED" && <div className="mt-4 flex flex-wrap gap-3"><button className="button-primary" disabled={busy} onClick={() => review("APPROVED")}>Approve</button><button className="button-secondary" disabled={busy} onClick={() => review("REJECTED")}>Reject</button></div>}{next[item.status] && <button className="button-primary mt-4" disabled={busy} onClick={() => advance(next[item.status])}>Move to {next[item.status]}</button>}</section>}</main>;
}
function Info({ title, value }: { title: string; value: string }) { return <div className="mt-6 border-t border-white/10 pt-4"><p className="eyebrow">{title}</p><p className="mt-2 whitespace-pre-wrap text-white/65">{value}</p></div>; }
export default function Page() { return <ProtectedRoute allowedRole={["UNIVERSITY", "STUDENT"]}><Content /></ProtectedRoute>; }

function errorMessage(error: unknown, fallback: string) { const response = (error as { response?: { data?: { message?: string } } }).response; return response?.data?.message || fallback; }
