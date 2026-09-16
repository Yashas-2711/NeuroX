import { UnderDevelopment } from "@/components/shared/under-development";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CitizenPage() {
  return <ProtectedRoute allowedRole="CITIZEN"><UnderDevelopment area="CITIZEN SPACE" /></ProtectedRoute>;
}
