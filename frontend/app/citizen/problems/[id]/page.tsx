"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getProblem } from "@/services/problem.service";
import type { Problem } from "@/types/problem";
function Content() {
  const p = useParams<{ id: string }>();
  const id = Array.isArray(p.id) ? p.id[0] : p.id;
  const [item, setItem] = useState<Problem | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (id)
      getProblem(id)
        .then(setItem)
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
            <p className="mt-10 border border-blue-300/20 p-5 text-sm text-white/60">
              AI analysis will appear after automated analysis. No AI processing
              has run yet.
            </p>
          </article>
        </>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <ProtectedRoute allowedRole="CITIZEN">
      <Content />
    </ProtectedRoute>
  );
}
