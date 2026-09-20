"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProblemOpportunityMatch } from "@/services/opportunity-match.service";
import type { OpportunityEntityType, PersistedOpportunityMatch } from "@/types/opportunity-match";

export function MatchDetail({ problemId, matchId, entityType }: { problemId: string; matchId: string; entityType: OpportunityEntityType }) {
  const [item, setItem] = useState<PersistedOpportunityMatch | null>(null); const [error, setError] = useState("");
  useEffect(() => { getProblemOpportunityMatch(problemId, matchId).then(setItem).catch(() => setError("Unable to load this persisted match.")); }, [problemId, matchId]);
  if (error) return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!item) return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-white/50">Loading match…</p></main>;
  const back = entityType === "UNIVERSITY" ? `/university/problems/${problemId}` : `/industry/opportunities/${problemId}`;
  return <main className="mx-auto max-w-4xl px-5 py-16"><Link href={back} className="text-link">← Back to opportunity</Link><p className="eyebrow mt-10">{item.entityType} opportunity match · {item.status}</p><h1 className="display-md mt-3">{item.overallScore.toFixed(0)}%</h1><p className="mt-3 text-white/55">Generated {new Date(item.generatedAt).toLocaleString()}</p><section className="mt-8 border border-white/10 p-6"><p className="eyebrow">Score breakdown</p><div className="mt-5 grid gap-4 sm:grid-cols-5">{Object.entries(item.scoreBreakdown).map(([key, value]) => <div key={key}><p className="eyebrow">{key}</p><p className="mt-2 text-white">{value.toFixed(1)}%</p></div>)}</div></section><section className="mt-6 border border-white/10 p-6"><p className="eyebrow">Why this matches</p><ul className="mt-4 list-disc pl-5 text-white/70">{item.matchingReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><p className="eyebrow mt-8">Matched capabilities</p><p className="mt-3 text-white/70">{item.matchedCapabilities.length ? item.matchedCapabilities.join(", ") : "None identified"}</p><p className="eyebrow mt-8">Missing capabilities</p><p className="mt-3 text-amber-100">{item.missingCapabilities.length ? item.missingCapabilities.join(", ") : "None identified"}</p></section></main>;
}
