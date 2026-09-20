"use client";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MatchDetail } from "@/components/opportunities/match-detail";
function PageContent() { const params = useParams<{ problemId: string; matchId: string }>(); const problemId = Array.isArray(params.problemId) ? params.problemId[0] : params.problemId; const matchId = Array.isArray(params.matchId) ? params.matchId[0] : params.matchId; return <MatchDetail problemId={problemId} matchId={matchId} entityType="UNIVERSITY"/>; }
export default function Page() { return <ProtectedRoute allowedRole="UNIVERSITY"><PageContent /></ProtectedRoute>; }
