"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getProblem, getProblemProgress } from "@/services/problem.service";
import { ProblemProgressTracker } from "@/components/problems/problem-progress";
import { ProblemDNASection } from "@/components/problems/problem-dna";
import type { Problem } from "@/types/problem";
import type { ProblemProgress } from "@/types/problem";
function Content() {
  const p = useParams<{ id: string }>();
  const id = Array.isArray(p.id) ? p.id[0] : p.id;
  const [item, setItem] = useState<Problem | null>(null);
  const [progress, setProgress] = useState<ProblemProgress | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id)
      Promise.all([getProblem(id), getProblemProgress(id)])
        .then(([problem, tracking]) => { setItem(problem); setProgress(tracking); })
        .catch(() => setError("Unable to load this problem."));
  }, [id]);
  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <Link href="/citizen/problems" className="text-link">
        ← My problems
      </Link>
      {error && (
        <p className="mt-10 text-red-200" role="alert">
          {error}
        </p>
      )}
      {!error && !item && (
        <p className="mt-10 text-white/50">Loading problem…</p>
      )}
      {item && (
        <>
          <p className="eyebrow mt-10">
            {item.category} / {item.status}
          </p>
          <h1 className="display-md mt-3">{item.title}</h1>
          <Link href={`/citizen/problems/${id}/passport`} className="button-secondary mt-6 inline-flex">Open Challenge Passport</Link>
          <p className="mt-5 text-white/55">
            {item.location.city}, {item.location.state}, {item.location.country}{" "}
            · Priority {item.priority}
          </p>
          <article className="mt-12 border-t border-white/10 pt-8">
            <p className="whitespace-pre-wrap text-base leading-8 text-white/75">
              {item.description}
            </p>
            {item.evidence.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow">Evidence</p>
                {item.evidence.map((e, i) => (
                  <div
                    key={i}
                    className="mt-3 border border-white/10 p-5 text-white/65"
                  >
                    {e.description}
                    {e.reference && (
                      <a
                        className="text-link block break-all"
                        href={e.reference}
                      >
                        {e.reference}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            {item.aiAnalysis?.status === "COMPLETED" && (
              <section
                className="mt-10 border border-blue-300/20 p-5"
                aria-labelledby="ai-analysis-heading"
              >
                <p id="ai-analysis-heading" className="eyebrow">
                  Automated analysis
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Classification</p>
                    <p className="mt-2 text-white/80">{item.aiAnalysis.category ?? "Unavailable"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Confidence</p>
                    <p className="mt-2 text-white/80">
                      {typeof item.aiAnalysis.confidence === "number"
                        ? `${(item.aiAnalysis.confidence * 100).toFixed(1)}%`
                        : "Unavailable"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Embedding</p>
                    <p className="mt-2 text-white/80">
                      {item.aiAnalysis.embeddingDimensions === 384
                        ? "384 dimensions"
                        : "Unavailable"}
                    </p>
                  </div>
                </div>
              </section>
            )}
            <ProblemDNASection problemId={id} />
            {item.aiAnalysis?.status === "FAILED" && (
              <p className="mt-10 border border-amber-300/20 p-5 text-sm text-white/60">
                Automated analysis is temporarily unavailable. Your problem was
                saved successfully and can be analyzed later.
              </p>
            )}
            {(!item.aiAnalysis || item.aiAnalysis.status === "PENDING") && (
              <p className="mt-10 border border-blue-300/20 p-5 text-sm text-white/60">
                Automated analysis is still pending. Results will appear here
                when processing is complete.
              </p>
            )}
            {progress && <ProblemProgressTracker progress={progress} />}
            {progress && progress.projects.length === 0 && <p className="mt-5 text-sm text-white/55">Your problem has been submitted and is waiting for university matching.</p>}
            {progress && progress.projects.length > 0 && progress.projects.every((project) => !project.team) && <p className="mt-5 text-sm text-white/55">A university project has been created. Team formation is pending.</p>}
            {progress && progress.projects.length > 0 && <section className="mt-6 border border-white/10 p-5"><p className="eyebrow">University project progress</p>{progress.projects.map((project) => <div key={project.id} className="mt-4 border-t border-white/10 pt-4"><p className="text-white">{project.title}</p><p className="mt-1 text-sm text-white/55">{project.status} · {project.progress}% · {project.completedMilestones}/{project.totalMilestones} milestones complete</p></div>)}</section>}
          </article>
        </>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <ProtectedRoute allowedRole={["CITIZEN", "STUDENT"]}>
      <Content />
    </ProtectedRoute>
  );
}
