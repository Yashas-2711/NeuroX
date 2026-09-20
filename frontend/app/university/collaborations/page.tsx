"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getUniversityCollaborations, respondToCollaboration } from "@/services/industry.service";
import type { Collaboration } from "@/types/industry";

function Content() {
  const [items, setItems] = useState<Collaboration[]>([]); const [error, setError] = useState("");
  const load = () => getUniversityCollaborations().then(setItems).catch(() => setError("Unable to load collaboration requests."));
  useEffect(() => { load(); }, []);
  const respond = async (id: string, status: "accept" | "reject") => { try { await respondToCollaboration(id, status); load(); } catch { setError("Unable to update collaboration request."); } };
  return <main className="mx-auto max-w-5xl px-5 py-16"><Link href="/university" className="text-link">← University workspace</Link><p className="eyebrow mt-10">University / collaborations</p><h1 className="display-md mt-3">Industry requests</h1>{error && <p className="mt-8 text-red-200" role="alert">{error}</p>}{!error && !items.length && <p className="mt-8 border border-dashed border-white/20 p-8 text-white/55">No industry collaborations yet.</p>}<div className="mt-8 space-y-4">{items.map((x) => <div key={x._id} className="border border-white/10 p-6"><p className="eyebrow">{x.status}</p><h2 className="mt-3 text-xl text-white">{x.industry?.name || "Industry organization"}</h2><p className="mt-2 text-white/65">{x.project.title}</p><p className="mt-4 text-white/55">{x.message}</p>{x.status === "PENDING" && <div className="mt-5 flex gap-3"><button className="button-primary" onClick={() => respond(x._id, "accept")}>Accept</button><button className="button-secondary" onClick={() => respond(x._id, "reject")}>Reject</button></div>}</div>)}</div></main>;
}
export default function Page() { return <ProtectedRoute allowedRole="UNIVERSITY"><Content /></ProtectedRoute>; }
