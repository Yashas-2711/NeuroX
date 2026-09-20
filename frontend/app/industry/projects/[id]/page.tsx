"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getIndustryProject } from "@/services/industry.service";
import type { IndustryProjectView } from "@/types/industry";

function Content() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [item, setItem] = useState<IndustryProjectView | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getIndustryProject(id).then(setItem).catch(() => setError("Accepted collaboration not found.")); }, [id]);
  if (error) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!item) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-white/50">Loading project…</p></main>;
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/industry/collaborations" className="text-link">← My collaborations</Link><p className="eyebrow mt-10">Read-only project participation</p><h1 className="display-md mt-3">{item.project.title}</h1><p className="mt-4 text-white/55">{item.project.status} · {item.progress}% progress · Collaboration {item.collaboration.status}</p><section className="mt-8 border border-white/10 p-6"><p className="eyebrow">Project</p><p className="mt-4 leading-8 text-white/70">{item.project.description}</p><p className="mt-4 text-sm text-white/55">University: {item.project.university?.name || "University profile"}</p></section><section className="mt-6 border border-white/10 p-6"><p className="eyebrow">Solutions</p>{!item.solutions?.length ? <p className="mt-3 text-white/50">No solutions are visible yet.</p> : item.solutions.map((solution) => <div key={solution._id} className="mt-4 border-t border-white/10 pt-4"><div className="flex flex-wrap justify-between gap-3"><p className="text-white">{solution.title}</p><p className="eyebrow">{solution.status}</p></div><p className="mt-2 text-sm text-white/60">{solution.description}</p></div>)}</section><p className="mt-6 text-sm text-white/45">Project management, team, and milestone changes remain available only to the university owner.</p></main>;
}

export default function Page() { return <ProtectedRoute allowedRole="INDUSTRY"><Content /></ProtectedRoute>; }

