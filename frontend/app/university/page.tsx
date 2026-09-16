import { UnderDevelopment } from "@/components/shared/under-development";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UniversityPage() {
  return <ProtectedRoute allowedRole="UNIVERSITY"><UnderDevelopment area="UNIVERSITY SPACE" /></ProtectedRoute>;
}
