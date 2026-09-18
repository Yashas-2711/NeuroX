"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProblemCard } from "@/components/problems/problem-card";
import { getMyProblems } from "@/services/problem.service";
import type { Problem } from "@/types/problem";
function Content() {
  const [items, setItems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  function load() {
    getMyProblems()
      .then(setItems)
      .catch(() => setError("Unable to load your problems."))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    Promise.resolve().then(load);
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <Link href="/citizen" className="text-link">
        ← Citizen space
      </Link>
      <div className="mt-10 flex flex-wrap justify-between gap-5">
        <div>
          <p className="eyebrow">Citizen contribution / 02</p>
          <h1 className="display-md mt-3">My problems</h1>
        </div>
        <Link
          href="/citizen/problems/new"
          className="button-primary inline-flex"
        >
          Submit a problem
        </Link>
      </div>
      {loading && (
        <p className="mt-10 text-white/50">Loading your submissions…</p>
      )}
      {error && (
        <p className="mt-10 text-red-200" role="alert">
          {error}{" "}
          <button
            className="underline"
            onClick={() => {
              setLoading(true);
              setError("");
              load();
            }}
          >
            Retry
          </button>
        </p>
      )}
      {!loading && !error && !items.length && (
        <p className="mt-10 border border-dashed border-white/20 p-8 text-white/55">
          No submissions yet.
        </p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((x) => (
            <ProblemCard key={x.id} problem={x} />
          ))}
        </div>
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
