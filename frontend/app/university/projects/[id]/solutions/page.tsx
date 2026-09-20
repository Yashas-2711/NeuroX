"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { createSolution, getSolutions } from "@/services/solution.service";
import type { Solution } from "@/types/solution";

function Content() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [items, setItems] = useState<Solution[]>([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", approach: "", expectedOutcome: "", requiredResources: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(() => { getSolutions(projectId).then((data) => { setItems(data.solutions); setCanSubmit(Boolean(data.permissions.canSubmit)); }).catch(() => setError("Unable to load solutions for this project.")).finally(() => setLoading(false)); }, [projectId]);
  useEffect(() => { void load(); }, [load]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setError(""); try { await createSolution(projectId, { ...form, requiredResources: form.requiredResources.split(",").map((item) => item.trim()).filter(Boolean) }); setForm({ title: "", description: "", approach: "", expectedOutcome: "", requiredResources: "" }); void load(); } catch (error: unknown) { setError(errorMessage(error, "Unable to submit solution.")); } finally { setSaving(false); } };
  return <main className="mx-auto max-w-6xl px-5 py-16"><Link href={`/university/projects/${projectId}`} className="text-link">← Back to project</Link><p className="eyebrow mt-10">Project delivery</p><h1 className="display-md mt-3">Solutions</h1><p className="mt-3 max-w-2xl text-white/60">Propose and track solutions for this university project. Review and lifecycle transitions remain owner-controlled.</p>{error && <p className="mt-6 text-red-200" role="alert">{error}</p>}{loading ? <p className="mt-8 text-white/50">Loading solutions…</p> : <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><section className="space-y-4">{!items.length && <div className="border border-dashed border-white/20 p-8 text-white/55">No solutions have been submitted yet.</div>}{items.map((item) => <Link key={item.id} href={`/university/projects/${projectId}/solutions/${item.id}`} className="block border border-white/10 p-5 transition hover:border-blue-300/50"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg text-white">{item.title}</h2><span className="eyebrow">{item.status}</span></div><p className="mt-3 line-clamp-3 text-sm text-white/60">{item.description}</p><p className="mt-4 text-xs uppercase tracking-widest text-white/40">Submitted {new Date(item.createdAt).toLocaleDateString()}</p></Link>)}</section>{canSubmit && <form onSubmit={submit} className="border border-white/10 p-5"><p className="eyebrow">Submit solution</p><Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required /><TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} required /><TextArea label="Proposed approach" value={form.approach} onChange={(value) => setForm({ ...form, approach: value })} /><TextArea label="Expected outcome" value={form.expectedOutcome} onChange={(value) => setForm({ ...form, expectedOutcome: value })} /><Field label="Required resources" value={form.requiredResources} onChange={(value) => setForm({ ...form, requiredResources: value })} placeholder="Comma-separated" /><button className="button-primary mt-4 w-full" disabled={saving}>{saving ? "Submitting…" : "Submit Solution"}</button></form>}</div>}</main>;
}
function Field({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) { return <label className="mt-4 block text-sm text-white/70">{label}{required && " *"}<input required={required} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border border-white/15 bg-background px-3 py-2 text-white outline-none focus:border-blue-300" /></label>; }
function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="mt-4 block text-sm text-white/70">{label}{required && " *"}<textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-2 w-full border border-white/15 bg-background px-3 py-2 text-white outline-none focus:border-blue-300" /></label>; }
export default function Page() { return <ProtectedRoute allowedRole={["UNIVERSITY", "STUDENT"]}><Content /></ProtectedRoute>; }

function errorMessage(error: unknown, fallback: string) { const response = (error as { response?: { data?: { message?: string } } }).response; return response?.data?.message || fallback; }
