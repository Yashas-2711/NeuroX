"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getProject, updateProjectStatus } from "@/services/project.service";
import type { Project } from "@/types/project";

function displayPerson(value: Project["createdBy"]) { if (typeof value === "string") return value; return value.name || value.email || "University project owner"; }
function displayUniversity(value: Project["university"]) { return typeof value === "string" ? value : value.name || "University profile"; }
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString() : "Not set"; }

function Content() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [item, setItem] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  useEffect(() => { getProject(id).then(setItem).catch(() => setError("Unable to load this project.")); }, [id]);
  const changeStatus = async (status: string) => { setSavingStatus(true); setError(""); try { setItem(await updateProjectStatus(id, status)); } catch { setError("This project status transition is not allowed."); } finally { setSavingStatus(false); } };
  if (error && !item) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-red-200" role="alert">{error}</p></main>;
  if (!item) return <main className="mx-auto max-w-5xl px-5 py-16"><p className="text-white/50">Loading project…</p></main>;
  const problem = typeof item.problem === "object" ? item.problem : null;
  return <main className="mx-auto max-w-5xl px-5 py-16">
    <Link href="/university/projects" className="text-link">← Back to Projects</Link>
    <div className="mt-10 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Project workspace / {item.status}</p><h1 className="display-md mt-3">{item.title}</h1></div><select value={item.status} onChange={(event) => changeStatus(event.target.value)} disabled={savingStatus} className="border border-white/15 bg-background px-3 py-2 text-white"><option value="PROPOSED">PROPOSED</option><option value="ACTIVE">ACTIVE</option><option value="ON_HOLD">ON_HOLD</option><option value="COMPLETED">COMPLETED</option><option value="CANCELLED">CANCELLED</option></select></div>
    {error && <p className="mt-5 text-red-200" role="alert">{error}</p>}
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Progress" value={`${item.progress}%`} /><Metric label="Milestones" value={`${item.completedMilestones}/${item.totalMilestones}`} /><Metric label="Pending" value={item.pendingMilestones} /><Metric label="Overdue" value={item.overdueMilestones} /></div>
    <section className="mt-10 border border-white/10 p-6"><p className="eyebrow">Project overview</p><p className="mt-4 leading-8 text-white/70">{item.description}</p><div className="mt-6 grid gap-4 text-sm text-white/65 sm:grid-cols-2"><p><span className="text-white/40">University:</span> {displayUniversity(item.university)}</p><p><span className="text-white/40">Project owner:</span> {displayPerson(item.createdBy)}</p><p><span className="text-white/40">Start date:</span> {formatDate(item.startDate)}</p><p><span className="text-white/40">Target end:</span> {formatDate(item.targetEndDate)}</p></div>{problem && <p className="mt-6 text-white/60">Linked problem: <Link className="text-link" href={`/university/problems/${problem.id}`}>{problem.title}</Link></p>}</section>
    <section className="mt-6 grid gap-5 md:grid-cols-3"><Summary title="Team" value={item.team ? `${item.team.name} · ${item.team.members.length} member(s)` : "No team created yet"} /><Summary title="Milestones" value={`${item.totalMilestones} total · ${item.completedMilestones} completed`} /><Summary title="Solutions" value={`${item.solutionsCount ?? 0} total · ${item.pendingSolutions ?? 0} pending review`} /></section>
    <section className="mt-6 border border-white/10 p-6"><p className="eyebrow">Industry collaborations</p>{!item.collaborations?.length&&<p className="mt-3 text-white/55">No industry collaborations yet.</p>}{item.collaborations?.map((collaboration)=><div key={collaboration._id} className="mt-4 border-t border-white/10 pt-4"><p className="text-white">{collaboration.industry?.name||"Industry organization"}</p><p className="mt-1 text-sm text-white/55">{collaboration.status} · {collaboration.message}</p></div>)}</section>
    <div className="mt-8 flex flex-wrap gap-3">{problem && <Link href={`/university/problems/${problem.id}`} className="button-secondary">View Problem</Link>}<Link href={`/university/projects/${id}/team`} className="button-secondary">Team</Link><Link href={`/university/projects/${id}/milestones`} className="button-secondary">Milestones</Link><Link href={`/university/projects/${id}/solutions`} className="button-primary">Solutions ({item.solutionsCount ?? 0})</Link></div>
  </main>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="border border-white/10 p-5"><p className="eyebrow">{label}</p><p className="mt-2 text-xl text-white">{value}</p></div>; }
function Summary({ title, value }: { title: string; value: string }) { return <div className="border border-white/10 p-5"><p className="eyebrow">{title}</p><p className="mt-3 text-white/70">{value}</p></div>; }
export default function Page() { return <ProtectedRoute allowedRole="UNIVERSITY"><Content /></ProtectedRoute>; }
