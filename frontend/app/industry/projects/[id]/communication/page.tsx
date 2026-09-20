"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProjectCommunication } from "@/components/projects/project-communication";
function Content() { const params = useParams<{ id: string }>(); const id = Array.isArray(params.id) ? params.id[0] : params.id; return <main className="mx-auto max-w-5xl px-5 py-16"><Link href={`/industry/projects/${id}`} className="text-link">← Project</Link><h1 className="display-md mt-10">Project communication</h1><ProjectCommunication projectId={id} /></main>; }
export default function Page() { return <ProtectedRoute allowedRole="INDUSTRY"><Content /></ProtectedRoute>; }
