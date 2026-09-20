"use client";

import { useEffect, useState } from "react";
import { generateProblemDNA, getProblemDNA } from "@/services/problem.service";
import type { ProblemDNA } from "@/types/problem";

export function ProblemDNASection({ problemId, canGenerate = false }: { problemId: string; canGenerate?: boolean }) {
  const [dna, setDna] = useState<ProblemDNA | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getProblemDNA(problemId).then((value) => { if (active) setDna(value); }).catch(() => { if (active) setDna(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [problemId]);
  const generate = async () => { setBusy(true); setError(""); try { setDna(await generateProblemDNA(problemId)); } catch { setError("Problem DNA generation is currently unavailable."); } finally { setBusy(false); } };
  return <section className="mt-10 border border-blue-300/20 p-5" aria-labelledby="problem-dna-heading">
    <div className="flex flex-wrap items-center justify-between gap-3"><p id="problem-dna-heading" className="eyebrow">Problem DNA</p>{canGenerate && !dna && <button className="button-secondary" onClick={() => void generate()} disabled={busy}>{busy ? "Generating…" : "Generate DNA"}</button>}</div>
    {loading && <p className="mt-4 text-sm text-white/50">Loading Problem DNA…</p>}
    {!loading && !dna && !error && <p className="mt-4 text-sm text-white/55">Problem DNA has not been generated yet.</p>}
    {error && <p className="mt-4 text-sm text-red-200" role="alert">{error}</p>}
    {dna?.generationStatus === "FAILED" && <p className="mt-4 text-sm text-amber-100">DNA generation failed. No inferred values were stored as completed.</p>}
    {dna?.generationStatus === "COMPLETED" && <><p className="mt-4 text-sm leading-7 text-white/70">{dna.dnaSummary}</p><dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><D label="Category" value={dna.category}/><D label="Subcategory" value={dna.subcategory}/><D label="Severity" value={dna.severityLevel}/><D label="Urgency" value={dna.urgencyLevel}/><D label="Affected population" value={dna.affectedPopulation}/><D label="Confidence" value={typeof dna.confidence === "number" ? `${(dna.confidence * 100).toFixed(1)}%` : null}/></dl><List label="Root causes" values={dna.rootCauses}/><List label="Required skills" values={dna.requiredSkills}/><List label="Required resources" values={dna.resourceRequirements ?? dna.requiredResources ?? []}/><D label="Sustainability relevance" value={dna.sustainabilityRelevance}/><p className="mt-5 text-xs uppercase tracking-widest text-white/40">Derived from submitted problem data and local AI classification. Unknown values remain unavailable.</p></>}
  </section>;
}
function D({ label, value }: { label: string; value?: string | null }) { return <div><dt className="eyebrow">{label}</dt><dd className="mt-1 text-white/70">{value || "Unavailable"}</dd></div>; }
function List({ label, values }: { label: string; values: string[] }) { return <div className="mt-5"><p className="eyebrow">{label}</p><p className="mt-2 text-sm text-white/70">{values.length ? values.join(", ") : "Unavailable"}</p></div>; }
