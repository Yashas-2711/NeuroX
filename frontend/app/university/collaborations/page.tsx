"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getUniversityCollaborations, respondToCollaboration } from "@/services/industry.service";
import type { Collaboration } from "@/types/industry";

function Content() {
  const [items, setItems] = useState<Collaboration[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    return getUniversityCollaborations().then(setItems).catch(() => setError("Unable to load collaboration requests."));
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const respond = async (id: string, status: "accept" | "reject") => {
    try { await respondToCollaboration(id, status); await load(); }
    catch { setError("Unable to update collaboration request."); }
  };

  return <main className="mx-auto max-w-5xl px-5 py-16">
    <Link href="/university" className="text-link">← University workspace</Link>
    <p className="eyebrow mt-10">University / collaborations</p>
    <h1 className="display-md mt-3">Industry requests</h1>
    {error && <p className="mt-8 text-red-200" role="alert">{error}</p>}
    {!error && !items.length && <p className="mt-8 border border-dashed border-white/20 p-8 text-white/55">No industry collaborations yet.</p>}
    <div className="mt-8 space-y-4">
      {items.map((item) => <div key={item._id} className="border border-white/10 p-6">
        <p className="eyebrow">{item.status}</p>
        <h2 className="mt-3 text-xl text-white">{item.industry?.name || "Industry organization"}</h2>
        <p className="mt-2 text-white/65">{item.project?.title || "Related project unavailable"}</p>
        <p className="mt-4 text-white/55">{item.message}</p>
        {item.status === "PENDING" && item.project && <div className="mt-5 flex gap-3">
          <button className="button-primary" onClick={() => void respond(item._id, "accept")}>Accept</button>
          <button className="button-secondary" onClick={() => void respond(item._id, "reject")}>Reject</button>
        </div>}
      </div>)}
    </div>
  </main>;
}

export default function Page() { return <ProtectedRoute allowedRole="UNIVERSITY"><Content /></ProtectedRoute>; }
