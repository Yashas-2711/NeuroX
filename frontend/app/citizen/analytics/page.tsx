"use client";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
export default function Page() { return <ProtectedRoute allowedRole={["CITIZEN", "STUDENT"]}><AnalyticsDashboard title="My challenge analytics" /></ProtectedRoute>; }
