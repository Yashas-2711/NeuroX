"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProblemProgressTracker } from "@/components/problems/problem-progress";
import { getAdminProblemProgress } from "@/services/admin.service";
import type { ProblemProgress } from "@/types/problem";

function Content() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [progress, setProgress] = useState<ProblemProgress | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { getAdminProblemProgress(id).then(setProgress).catch(() => setError("Unable to load problem progress.")); }, [id]);
  if (error) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!progress) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-white/50">Loading problem progress…</p></main>;
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/admin" className="text-link">← Validation portal</Link><p className="eyebrow mt-10">Admin / problem progress</p><h1 className="display-md mt-3">{progress.problem.title}</h1><p className="mt-4 text-white/55">{progress.problem.category} · {progress.problem.status}</p><ProblemProgressTracker progress={progress} /><section className="mt-6 border border-white/10 p-6"><p className="eyebrow">University projects</p>{!progress.projects.length&&<p className="mt-4 text-white/55">No university project has been created yet.</p>}{progress.projects.map((project)=><div key={project.id} className="mt-4 border-t border-white/10 pt-4"><p className="text-white">{project.title}</p><p className="mt-1 text-sm text-white/55">{project.status} · {project.progress}% · {project.completedMilestones}/{project.totalMilestones} milestones complete</p><p className="mt-1 text-sm text-white/55">{typeof project.university === "string" ? project.university : project.university.name || "University profile"}</p></div>)}</section></main>;
}

export default function Page() { return <ProtectedRoute allowedRole="ADMIN"><Content /></ProtectedRoute>; }
