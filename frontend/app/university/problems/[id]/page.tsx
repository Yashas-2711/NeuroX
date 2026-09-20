"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProblemDNASection } from "@/components/problems/problem-dna";
import { expressInterest, getUniversityProblem } from "@/services/university.service";
import type { Problem } from "@/types/problem";

function Content() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [item, setItem] = useState<Problem | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => { if (id) getUniversityProblem(id).then(setItem).catch(() => setError("Unable to load this validated problem.")); }, [id]);
  const interest = async () => { setBusy(true); setError(""); try { const result = await expressInterest(id); setProjectId(result.project._id); setMessage("Interest recorded and project workspace is ready."); } catch { setError("Unable to express interest. Please try again."); } finally { setBusy(false); } };
  if (error && !item) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!item) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-white/50">Loading problem…</p></main>;
  const match = item.match;
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/university/problems" className="text-link">← Validated problems</Link><p className="eyebrow mt-10">Validated problem / {item.category}</p><h1 className="display-md mt-3">{item.title}</h1><div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"><section className="border border-white/10 p-6 md:p-8"><p className="eyebrow">Problem overview</p><p className="mt-5 whitespace-pre-wrap leading-8 text-white/75">{item.description}</p><p className="mt-8 text-white/60">{item.location?.city}, {item.location?.state}, {item.location?.country}</p><ProblemDNASection problemId={id} canGenerate /><section className="mt-10 border-t border-white/10 pt-8"><p className="eyebrow">AI opportunity match</p>{match ? <><p className="mt-4 text-4xl text-blue-100">{(match.overallMatchScore * 100).toFixed(0)}%</p><p className="mt-5 text-sm text-white/60">Why this matches</p><ul className="mt-2 list-disc pl-5 text-sm leading-7 text-white/70">{match.matchingReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><p className="mt-5 text-sm text-white/60">Capability gaps</p><ul className="mt-2 list-disc pl-5 text-sm leading-7 text-white/70">{match.missingCapabilities.length ? match.missingCapabilities.map((gap) => <li key={gap}>{gap}</li>) : <li>No gaps identified from available profile data</li>}</ul></> : <p className="mt-4 text-white/55">Match unavailable.</p>}</section></section><aside className="space-y-5">{message && <p className="border border-green-300/20 p-4 text-sm text-green-100" role="status">{message}</p>}{error && item && <p className="text-sm text-red-200" role="alert">{error}</p>}{projectId ? <button className="button-primary w-full" onClick={() => router.push(`/university/projects/${projectId}`)}>Open project</button> : <button className="button-primary w-full" onClick={interest} disabled={busy}>{busy ? "Saving…" : "Express interest"}</button>}</aside></div></main>;
}

export default function Page() { return <ProtectedRoute allowedRole="UNIVERSITY"><Content /></ProtectedRoute>; }
