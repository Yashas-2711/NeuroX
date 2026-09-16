import { UnderDevelopment } from "@/components/shared/under-development";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function IndustryPage() {
  return <ProtectedRoute allowedRole="INDUSTRY"><UnderDevelopment area="INDUSTRY SPACE" /></ProtectedRoute>;
}
