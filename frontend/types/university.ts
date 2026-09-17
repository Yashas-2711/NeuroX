import type { Problem, ProblemMatch } from "@/types/problem";
export interface UniversityProfile { id?:string; institutionName:string; description:string; location:{city?:string;state?:string;country?:string}; domains:string[]; researchAreas:string[]; skills:string[]; resources:string[]; collaborationInterests:string[]; }
export interface Match { problem:Problem; match:ProblemMatch }
