import { UnderDevelopment } from "@/components/shared/under-development";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminPage() {
  return <ProtectedRoute allowedRole="ADMIN"><UnderDevelopment area="ADMIN SPACE" /></ProtectedRoute>;
}
