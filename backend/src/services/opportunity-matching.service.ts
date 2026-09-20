import { AppError } from "../utils/app-error";
import { generateEmbedding } from "./ai/aiClient";

export const OPPORTUNITY_MATCH_WEIGHTS = { semantic: 0.4, domain: 0.25, skills: 0.2, resource: 0.1, location: 0.05 } as const;

function tokens(values: string[]) { return new Set(values.filter(Boolean).join(" ").toLowerCase().split(/[^a-z0-9]+/).filter((value) => value.length > 2)); }
function overlap(required: string[], available: string[]) { const source = tokens(required); const target = tokens(available); return source.size ? [...source].filter((value) => target.has(value)).length / source.size : 0; }
function vectorNorm(values: number[]) { return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)); }

export async function calculateOpportunityMatch(problem: any, profile: any, kind: "university" | "industry") {
  if (!problem.embedding?.length || problem.embedding.length !== 384) throw new AppError("Problem embedding is unavailable", 503);
  const profileValues = kind === "university"
    ? [profile.description, ...(profile.domains ?? []), ...(profile.researchAreas ?? []), ...(profile.skills ?? []), ...(profile.resources ?? []), ...(profile.collaborationInterests ?? [])]
    : [profile.description, ...(profile.expertise ?? []), ...(profile.technologies ?? []), ...(profile.skills ?? []), ...(profile.resources ?? []), ...(profile.facilities ?? []), ...(profile.collaborationInterests ?? [])];
  const profileText = profileValues.filter(Boolean).join(" ").trim();
  if (!profileText) throw new AppError("Complete the matching profile before requesting an opportunity match", 400);
  let embedding;
  try { embedding = await generateEmbedding(profileText); } catch { throw new AppError("AI matching service is unavailable", 503); }
  const semantic = Math.max(0, Math.min(1, problem.embedding.reduce((sum: number, value: number, index: number) => sum + value * embedding.embedding[index], 0) / (vectorNorm(problem.embedding) * vectorNorm(embedding.embedding) || 1)));
  const dna = problem.dna ?? {};
  const requiredDomains = [problem.category, ...(dna.requiredDomains ?? [])];
  const requiredSkills = [...(dna.requiredSkills ?? []), problem.category, ...problem.description.split(/\s+/).slice(0, 8)];
  const requiredResources = dna.requiredResources ?? dna.resourceRequirements ?? [problem.category];
  const domains = kind === "university" ? [...(profile.domains ?? []), ...(profile.researchAreas ?? []), ...(profile.expertise ?? [])] : [...(profile.expertise ?? [])];
  const skills = kind === "university" ? [...(profile.skills ?? []), ...(profile.researchAreas ?? [])] : [...(profile.skills ?? []), ...(profile.technologies ?? []), ...(profile.expertise ?? [])];
  const resources = kind === "university" ? [...(profile.resources ?? [])] : [...(profile.resources ?? []), ...(profile.facilities ?? [])];
  const domain = overlap(requiredDomains, domains);
  const skill = overlap(requiredSkills, skills);
  const resource = overlap(requiredResources, resources);
  const location = overlap([problem.location?.country ?? "", problem.location?.state ?? ""], [profile.profileLocation?.country ?? "", profile.profileLocation?.state ?? ""]);
  const reasons: string[] = [];
  if (semantic >= 0.6) reasons.push("Strong semantic alignment with the available profile");
  if (domain > 0) reasons.push("Profile domains align with the problem category or DNA domains");
  if (skill > 0) reasons.push("Relevant skills, research areas, or technologies are available");
  if (resource > 0) reasons.push("Listed resources or facilities overlap with the identified needs");
  if (location > 0) reasons.push("Profile location is relevant to the problem location");
  const missingCapabilities: string[] = [];
  if (!domain) missingCapabilities.push("A directly matching domain is not listed in the profile");
  if (!skill) missingCapabilities.push("Required skills are not listed in the profile");
  if (!resource) missingCapabilities.push("Required resources or facilities are not listed in the profile");
  const matchedCapabilities = [...new Set([
    ...(domain ? domains.filter((value: string) => tokens(requiredDomains).has(value.toLowerCase())) : []),
    ...(skill ? skills.filter((value: string) => tokens(requiredSkills).has(value.toLowerCase())) : []),
    ...(resource ? resources.filter((value: string) => tokens(requiredResources).has(value.toLowerCase())) : []),
  ])];
  const overallMatchScore = semantic * OPPORTUNITY_MATCH_WEIGHTS.semantic + domain * OPPORTUNITY_MATCH_WEIGHTS.domain + skill * OPPORTUNITY_MATCH_WEIGHTS.skills + resource * OPPORTUNITY_MATCH_WEIGHTS.resource + location * OPPORTUNITY_MATCH_WEIGHTS.location;
  return {
    overallMatchScore: Math.max(0, Math.min(1, overallMatchScore)),
    semanticScore: semantic,
    domainScore: domain,
    skillsScore: skill,
    resourceScore: resource,
    locationScore: location,
    matchingReasons: reasons,
    matchedCapabilities,
    missingCapabilities,
    scoringWeights: OPPORTUNITY_MATCH_WEIGHTS,
  };
}

export function persistedDNA(problem: any, dna: any) {
  return dna ? {
    problemId: problem._id.toString(), title: problem.title, category: dna.category, description: problem.description,
    location: dna.geographicContext ?? problem.location, affectedArea: dna.geographicContext ? Object.values(dna.geographicContext).filter(Boolean).join(", ") : null,
    affectedPeople: dna.affectedPopulation ?? null, urgency: dna.urgencyLevel ?? problem.priority, requiredSkills: dna.requiredSkills ?? [], requiredDomains: dna.subcategory ? [dna.category, dna.subcategory] : [dna.category], requiredResources: dna.resourceRequirements ?? [], potentialCollaborationType: null,
  } : { problemId: problem._id.toString(), title: problem.title, category: problem.category, description: problem.description, location: problem.location, affectedArea: problem.location ? [problem.location.city, problem.location.state, problem.location.country].filter(Boolean).join(", ") : null, affectedPeople: null, urgency: problem.priority ?? null, requiredSkills: [], requiredDomains: [problem.category], requiredResources: [], potentialCollaborationType: null };
}
