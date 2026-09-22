"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { createImpactIndicator, createImpactScenario, getImpactTwin, recordImpactObservation } from "@/services/impact.service";
import type { ImpactTwin } from "@/types/impact";

const editableRoles = ["ADMIN", "CITIZEN", "STUDENT", "UNIVERSITY", "INDUSTRY"];

function errorMessage(error: unknown, fallback: string) {
  const value = error as { response?: { data?: { message?: string } } };
  return value.response?.data?.message ?? fallback;
}

function Field({ label, name, value, onChange, type = "text", required = false, placeholder = "" }: { label: string; name: string; value?: string; onChange?: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="block text-sm text-white/70"><span className="eyebrow">{label}</span><input name={name} type={type} required={required} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} placeholder={placeholder} className="input mt-2 w-full" /></label>;
}

function TextArea({ label, name, value, onChange, required = false, placeholder = "" }: { label: string; name: string; value?: string; onChange?: (value: string) => void; required?: boolean; placeholder?: string }) {
  return <label className="block text-sm text-white/70"><span className="eyebrow">{label}</span><textarea name={name} required={required} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} placeholder={placeholder} className="input mt-2 min-h-24 w-full p-3" /></label>;
}

function Content() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [data, setData] = useState<ImpactTwin | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [indicator, setIndicator] = useState({ name: "", description: "", unit: "", baseline: "", target: "", period: "", evidence: "", stakeholder: "" });
  const [scenario, setScenario] = useState({ name: "", description: "", intervention: "", assumptions: "", confidence: "", timeline: "" });
  const [expectedValues, setExpectedValues] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    if (!id) return;
    setError("");
    getImpactTwin(id).then(setData).catch((e) => setError(errorMessage(e, "Unable to load Impact Twin.")));
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const addIndicator = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await createImpactIndicator(id, { name: indicator.name, description: indicator.description, unit: indicator.unit, baselineValue: Number(indicator.baseline), targetValue: indicator.target === "" ? null : Number(indicator.target), measurementPeriod: indicator.period, evidenceReference: indicator.evidence || undefined, responsibleStakeholder: indicator.stakeholder });
      setIndicator({ name: "", description: "", unit: "", baseline: "", target: "", period: "", evidence: "", stakeholder: "" }); setMessage("Impact indicator created successfully."); load();
    } catch (e: unknown) { setMessage(errorMessage(e, "Unable to create indicator.")); }
    finally { setSaving(false); }
  };

  const addScenario = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const values = Object.fromEntries(Object.entries(expectedValues).filter(([, value]) => value !== "").map(([key, value]) => [key, Number(value)]));
    const assumptions = scenario.assumptions.split(",").map((value) => value.trim()).filter(Boolean);
    try {
      await createImpactScenario(id, { name: scenario.name, description: scenario.description, proposedIntervention: scenario.intervention, expectedValues: values, assumptions, estimationMethod: "Stakeholder-provided scenario estimate", confidenceLevel: scenario.confidence === "" ? undefined : Number(scenario.confidence), estimatedTimeline: scenario.timeline });
      setScenario({ name: "", description: "", intervention: "", assumptions: "", confidence: "", timeline: "" }); setExpectedValues({}); setMessage("Scenario estimate created successfully."); load();
    } catch (e: unknown) { setMessage(errorMessage(e, "Unable to create scenario.")); }
    finally { setSaving(false); }
  };

  const addObservation = async (event: FormEvent<HTMLFormElement>, indicatorId: string) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setMessage("");
    try {
      await recordImpactObservation(id, { indicatorId, observedValue: Number(form.get("observedValue")), measurementDate: form.get("measurementDate"), evidenceReference: form.get("evidenceReference") || undefined, notes: form.get("notes") || undefined });
      setMessage("Observed measurement recorded successfully."); event.currentTarget.reset(); load();
    } catch (e: unknown) { setMessage(errorMessage(e, "Unable to record observation.")); }
    finally { setSaving(false); }
  };

  const canEdit = Boolean(user && editableRoles.includes(user.role));
  return <main className="mx-auto max-w-6xl px-5 py-16">
    <Link href={`/citizen/problems/${id}`} className="text-link">← Back to problem</Link>
    <p className="eyebrow mt-10">Impact Twin / Evidence-based tracking</p><h1 className="display-md mt-3">Challenge impact</h1>
    {error && <div className="mt-8 border border-red-300/30 p-5 text-red-100" role="alert">{error}<button onClick={load} className="button-secondary ml-4">Retry</button></div>}
    {!error && !data && <p className="mt-10 text-white/55">Loading impact data...</p>}
    {data && <>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Indicators", data.summary.totalIndicators], ["Observed", data.summary.indicatorsWithObservations], ["Target progress", data.summary.targetProgress === null ? "—" : `${data.summary.targetProgress}%`], ["Data completeness", `${data.summary.dataCompleteness}%`]].map(([label, value]) => <div key={String(label)} className="border border-white/10 p-5"><p className="eyebrow">{label}</p><p className="mt-3 text-2xl text-white">{value}</p></div>)}</div>
      {canEdit && <>
        <form onSubmit={addIndicator} className="mt-10 border border-blue-300/20 p-6"><p className="eyebrow">Create an indicator</p><div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Indicator Name" name="name" required value={indicator.name} onChange={(value) => setIndicator({ ...indicator, name: value })} /><Field label="Unit" name="unit" required value={indicator.unit} onChange={(value) => setIndicator({ ...indicator, unit: value })} /><TextArea label="Description" name="description" value={indicator.description} onChange={(value) => setIndicator({ ...indicator, description: value })} /><Field label="Measurement Period" name="period" value={indicator.period} onChange={(value) => setIndicator({ ...indicator, period: value })} /><Field label="Baseline Value" name="baseline" type="number" required value={indicator.baseline} onChange={(value) => setIndicator({ ...indicator, baseline: value })} /><Field label="Target Value" name="target" type="number" value={indicator.target} onChange={(value) => setIndicator({ ...indicator, target: value })} /><Field label="Evidence Reference (URL)" name="evidence" type="url" value={indicator.evidence} onChange={(value) => setIndicator({ ...indicator, evidence: value })} /><Field label="Responsible Stakeholder" name="stakeholder" value={indicator.stakeholder} onChange={(value) => setIndicator({ ...indicator, stakeholder: value })} /></div><button disabled={saving} className="button-primary mt-5">{saving ? "Saving..." : "Create indicator"}</button></form>
        <form onSubmit={addScenario} className="mt-6 border border-amber-300/20 p-6"><p className="eyebrow">Create a scenario</p><div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Scenario Name" name="scenarioName" required value={scenario.name} onChange={(value) => setScenario({ ...scenario, name: value })} /><Field label="Estimated Timeline" name="timeline" value={scenario.timeline} onChange={(value) => setScenario({ ...scenario, timeline: value })} /><TextArea label="Description" name="scenarioDescription" value={scenario.description} onChange={(value) => setScenario({ ...scenario, description: value })} /><TextArea label="Proposed Intervention" name="intervention" required value={scenario.intervention} onChange={(value) => setScenario({ ...scenario, intervention: value })} /><TextArea label="Assumptions (comma separated)" name="assumptions" value={scenario.assumptions} onChange={(value) => setScenario({ ...scenario, assumptions: value })} /><Field label="Confidence Level (0–1)" name="confidence" type="number" value={scenario.confidence} onChange={(value) => setScenario({ ...scenario, confidence: value })} /></div>{data.indicators.length > 0 && <div className="mt-5 border-t border-white/10 pt-5"><p className="eyebrow">Expected Values</p><p className="mt-2 text-sm text-white/50">Enter an expected value for any indicator used by this scenario.</p><div className="mt-3 grid gap-3 md:grid-cols-2">{data.indicators.map(({ indicator: item }) => <Field key={item._id} label={`${item.name} (${item.unit})`} name={`expected-${item._id}`} type="number" value={expectedValues[item._id] ?? ""} onChange={(value) => setExpectedValues({ ...expectedValues, [item._id]: value })} />)}</div></div>}<button disabled={saving} className="button-secondary mt-5">{saving ? "Saving..." : "Create scenario"}</button></form>
        {message && <p className="mt-5 text-sm text-white/70" role="status">{message}</p>}
      </>}
      {!canEdit && message && <p className="mt-5 text-sm text-white/70" role="status">{message}</p>}
      <section className="mt-12"><h2 className="display-sm">Indicators</h2>{data.indicators.length === 0 ? <p className="mt-5 border border-white/10 p-6 text-white/55">No impact indicators have been defined yet.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">{data.indicators.map(({ indicator: item, comparison }) => <article key={item._id} className="border border-white/10 p-5"><h3 className="text-lg text-white">{item.name}</h3><p className="mt-1 text-sm text-white/55">{item.description || "No description provided."}</p><div className="mt-5 grid grid-cols-3 gap-3 text-sm"><div><p className="eyebrow">Baseline</p><p className="mt-2 text-white">{comparison.baseline} {comparison.unit}</p></div><div><p className="eyebrow">Target</p><p className="mt-2 text-white">{comparison.target === null ? "Not set" : `${comparison.target} ${comparison.unit}`}</p></div><div><p className="eyebrow">Observed</p><p className="mt-2 text-white">{comparison.observed === null ? "Not recorded" : `${comparison.observed} ${comparison.unit}`}</p></div></div>{comparison.progressToTarget !== null && <p className="mt-5 text-sm text-blue-100">Progress toward target: {comparison.progressToTarget}%</p>}{canEdit && <form onSubmit={(event) => void addObservation(event, item._id)} className="mt-5 space-y-3 border-t border-white/10 pt-5"><p className="eyebrow">Create an observation</p><div className="grid gap-3 md:grid-cols-2"><Field label="Observed Value" name="observedValue" type="number" required /><Field label="Measurement Date" name="measurementDate" type="date" required /><Field label="Evidence Reference (URL)" name="evidenceReference" type="url" /><TextArea label="Notes" name="notes" /></div><button disabled={saving} className="button-secondary">{saving ? "Saving..." : "Record observation"}</button></form>}</article>)}</div>}</section>
      <section className="mt-12"><h2 className="display-sm">Scenarios</h2>{data.scenarios.length === 0 ? <p className="mt-5 border border-white/10 p-6 text-white/55">No scenario estimates have been created.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">{data.scenarios.map((item) => <article key={item._id} className="border border-amber-300/20 p-5"><p className="eyebrow">Estimate — not observed outcome</p><h3 className="mt-2 text-lg text-white">{item.name}</h3><p className="mt-2 text-sm text-white/65">{item.description || item.proposedIntervention}</p><p className="mt-4 text-sm text-white/45">Method: {item.estimationMethod} · Timeline: {item.estimatedTimeline || "Not set"}</p></article>)}</div>}</section>
    </>}
  </main>;
}

export default function Page() { return <ProtectedRoute allowedRole={["CITIZEN", "STUDENT", "UNIVERSITY", "INDUSTRY", "ADMIN"]}><Content /></ProtectedRoute>; }
