import type { ProblemProgress } from "@/types/problem";

const stages = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "AI_ANALYSIS", label: "AI analysis" },
  { key: "VALIDATING", label: "Under review" },
  { key: "VALIDATED", label: "Validated" },
  { key: "MATCHED", label: "University matched" },
  { key: "TEAM_FORMED", label: "Team formed" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "ARCHIVED", label: "Archived" },
] as const;

function currentIndex(progress: ProblemProgress) {
  if (progress.problem.status === "REJECTED") return 2;
  if (progress.problem.status === "ARCHIVED") return stages.length - 1;
  if (progress.problem.status === "RESOLVED") return 7;
  if (progress.problem.status === "IN_PROGRESS") return progress.projects.some((project) => project.team) ? 6 : 5;
  if (progress.projects.some((project) => project.team)) return 5;
  if (progress.projects.length || progress.problem.status === "MATCHED") return 4;
  if (progress.problem.status === "VALIDATED") return 3;
  if (progress.problem.status === "VALIDATING") return 2;
  if (progress.problem.status === "SUBMITTED" && progress.problem.aiAnalysisStatus === "COMPLETED") return 1;
  return 0;
}

export function ProblemProgressTracker({ progress }: { progress: ProblemProgress }) {
  const index = currentIndex(progress);
  const rejected = progress.problem.status === "REJECTED";
  return <section className="mt-10 border border-white/10 p-6" aria-labelledby="problem-progress-heading">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Problem lifecycle</p><h2 id="problem-progress-heading" className="mt-2 text-xl text-white">Read-only progress tracking</h2></div><p className="text-sm uppercase tracking-widest text-white/55">Current: {progress.problem.status.replaceAll("_", " ")}</p></div>
    {rejected && <p className="mt-5 border border-red-300/20 p-4 text-sm text-red-100">This problem was rejected during validation.</p>}
    <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.map((stage, stageIndex) => { const complete = !rejected && stageIndex < index; const active = !rejected && stageIndex === index; return <li key={stage.key} className={`border p-4 ${complete ? "border-green-300/30" : active ? "border-blue-300/50" : "border-white/10"}`}><p className="text-sm text-white">{complete ? "✓" : active ? "●" : "○"} {stage.label}</p><p className="mt-1 text-xs uppercase tracking-widest text-white/40">{stage.key.replaceAll("_", " ")}</p></li>; })}</ol>
    {progress.projects.map((project) => project.solutions?.length ? <div key={project.id} className="mt-6 border-t border-white/10 pt-5"><p className="eyebrow">Solutions / {project.title}</p><div className="mt-3 space-y-2">{project.solutions.map((solution) => <p key={solution.id} className="flex flex-wrap justify-between gap-3 text-sm text-white/70"><span>{solution.title}</span><span className="uppercase tracking-widest text-white/45">{solution.status}</span></p>)}</div></div> : null)}
  </section>;
}
