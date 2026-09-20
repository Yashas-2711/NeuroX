"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getIndustryProfile, updateIndustryProfile } from "@/services/industry.service";
import type { IndustryProfile } from "@/types/industry";

const empty: IndustryProfile = { organizationName: "", description: "", industryType: "", location: {}, domains: [], expertise: [], technologies: [], skills: [], resources: [], facilities: [], collaborationInterests: [] };
const listKeys = ["domains", "expertise", "technologies", "skills", "resources", "facilities", "collaborationInterests"] as const;

function PageContent() {
  const [profile, setProfile] = useState<IndustryProfile>(empty); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  useEffect(() => { getIndustryProfile().then((value) => { if (value) setProfile(value); }).catch(() => setError("Unable to load your Industry profile.")).finally(() => setLoading(false)); }, []);
  const setList = (key: typeof listKeys[number], value: string) => setProfile((current) => ({ ...current, [key]: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setError(""); setMessage(""); try { const saved = await updateIndustryProfile({ ...profile, organizationName: profile.organizationName.trim(), industryType: profile.industryType.trim(), location: { city: profile.location.city?.trim(), state: profile.location.state?.trim(), country: profile.location.country?.trim() } }); setProfile(saved); setMessage("Industry profile saved successfully."); } catch (requestError) { const apiMessage = axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === "string" ? requestError.response.data.message : "Unable to save the Industry profile."; setError(apiMessage); } finally { setSaving(false); } };
  if (loading) return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-white/50">Loading profile…</p></main>;
  return <main className="mx-auto max-w-4xl px-5 py-16"><Link href="/industry" className="text-link">← Industry workspace</Link><p className="eyebrow mt-10">Industry profile</p><h1 className="display-md mt-3">Organization capabilities</h1><form onSubmit={save} className="mt-10 space-y-5"><Input label="Organization name" value={profile.organizationName} onChange={(value) => setProfile({ ...profile, organizationName: value })}/><Input label="Industry type" value={profile.industryType} onChange={(value) => setProfile({ ...profile, industryType: value })}/><label className="block text-sm text-white/70">Description<textarea value={profile.description} onChange={(event) => setProfile({ ...profile, description: event.target.value })} className="mt-2 min-h-28 w-full border border-white/15 bg-transparent p-3 text-white"/></label><div className="grid gap-5 md:grid-cols-3"><Input label="City" value={profile.location.city ?? ""} onChange={(value) => setProfile({ ...profile, location: { ...profile.location, city: value } })}/><Input label="State" value={profile.location.state ?? ""} onChange={(value) => setProfile({ ...profile, location: { ...profile.location, state: value } })}/><Input label="Country" value={profile.location.country ?? ""} onChange={(value) => setProfile({ ...profile, location: { ...profile.location, country: value } })}/></div>{listKeys.map((key) => <Input key={key} label={`${key} (comma separated)`} value={profile[key].join(", ")} onChange={(value) => setList(key, value)}/>)}{message && <p className="text-green-100" role="status">{message}</p>}{error && <p className="text-red-200" role="alert">{error}</p>}<button type="submit" className="button-primary" disabled={saving || !profile.organizationName.trim()}>{saving ? "Saving…" : "Save profile"}</button></form></main>;
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm text-white/70">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full border border-white/15 bg-transparent px-3 text-white"/></label>; }
export default function Page() { return <ProtectedRoute allowedRole="INDUSTRY"><PageContent /></ProtectedRoute>; }
