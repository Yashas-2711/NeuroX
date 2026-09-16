"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { getMyProblems } from "@/services/problem.service";
import { ProblemCard } from "@/components/problems/problem-card";
import type { Problem } from "@/types/problem";
function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.resolve()
      .then(getMyProblems)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <p className="eyebrow">Citizen space / overview</p>
      <h1 className="display-md mt-3">Welcome, {user?.name ?? "citizen"}.</h1>
      <p className="body-lead mt-5 max-w-2xl">
        Turn a lived community challenge into a starting point for research,
        collaboration, and measurable impact.
      </p>
      <Link
        href="/citizen/problems/new"
        className="button-primary mt-8 inline-flex"
      >
        Submit a problem
      </Link>
      <div className="mt-16 flex items-end justify-between">
        <div>
          <p className="eyebrow">Your activity</p>
          <h2 className="title-lg mt-3">Recent problems</h2>
        </div>
        <Link href="/citizen/problems" className="text-link">
          View all
        </Link>
      </div>
      {loading ? (
        <p className="mt-6 text-white/50">Loading your submissions…</p>
      ) : items.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((x) => (
            <ProblemCard key={x.id} problem={x} />
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-white/20 p-8 text-white/55">
          No problems submitted yet. Start with one specific challenge from your
          community.
        </div>
      )}
    </main>
  );
}
export default function Page() {
  return (
    <ProtectedRoute allowedRole="CITIZEN">
      <Dashboard />
    </ProtectedRoute>
  );
}
