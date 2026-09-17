"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getAdminProblems } from "@/services/admin.service";
import type { Problem } from "@/types/problem";

function AdminContent() {
  const [items, setItems] = useState<Problem[]>([]); const [counts, setCounts] = useState({ total: 0, submitted: 0, validated: 0, rejected: 0 }); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = () => { setLoading(true); setError(""); getAdminProblems().then((data) => { setItems(data.problems); setCounts(data.counts); }).catch(() => setError("Unable to load the validation queue.")).finally(() => setLoading(false)); };
  useEffect(() => { Promise.resolve().then(load); }, []);
  return <main className="mx-auto max-w-6xl px-5 py-16">
    <p className="eyebrow">NeuroX / Admin control</p><h1 className="display-md mt-3">Validation portal</h1>
    <p className="body-copy mt-5 max-w-2xl">Review citizen submissions and verify the local AI analysis before problems move forward.</p>
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Total submitted" value={counts.total} /><Metric label="Awaiting review" value={counts.submitted} /><Metric label="Validated" value={counts.validated} /><Metric label="Rejected" value={counts.rejected} /></div>
    <section className="mt-14"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Review queue</p><h2 className="display-sm mt-2">Problems awaiting validation</h2></div><button className="button-secondary" onClick={load} disabled={loading}>Refresh</button></div>
      {loading && <p className="mt-8 text-white/50">Loading review queue…</p>}{error && <p className="mt-8 text-red-200" role="alert">{error} <button className="underline" onClick={load}>Retry</button></p>}
      {!loading && !error && items.length === 0 && <p className="mt-8 border border-dashed border-white/20 p-8 text-white/55">No submitted problems are waiting for validation.</p>}
      {!loading && !error && items.length > 0 && <div className="mt-8 overflow-x-auto border border-white/10"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45"><tr><th className="p-4">Problem</th><th className="p-4">Category</th><th className="p-4">Location</th><th className="p-4">AI confidence</th><th className="p-4">Submitted</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-white/10 last:border-0"><td className="p-4 font-medium text-white">{item.title}</td><td className="p-4 text-white/65">{item.category}</td><td className="p-4 text-white/65">{item.location.city}, {item.location.state}</td><td className="p-4 text-white/65">{typeof item.aiAnalysis?.confidence === "number" ? `${(item.aiAnalysis.confidence * 100).toFixed(1)}%` : "Pending"}</td><td className="p-4 text-white/65">{new Date(item.createdAt).toLocaleDateString()}</td><td className="p-4"><span className="border border-blue-300/30 px-2 py-1 text-xs uppercase tracking-wider text-blue-100">{item.status}</span></td><td className="p-4"><Link className="text-link" href={`/admin/problems/${item.id}`}>Review</Link></td></tr>)}</tbody></table></div>}
    </section></main>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="border border-white/10 p-5"><p className="eyebrow">{label}</p><p className="mt-3 text-xl uppercase text-white">{value}</p></div>; }
export default function AdminPage() { return <ProtectedRoute allowedRole="ADMIN"><AdminContent /></ProtectedRoute>; }
