"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";

export function ProtectedRoute({ allowedRole, children }: { allowedRole: UserRole | UserRole[]; children: ReactNode }) {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, router, user]);

  if (!hydrated || !user) {
    return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6"><p className="eyebrow">Checking authentication...</p></main>;
  }

  const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (!allowed.includes(user.role)) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
        <section className="w-full max-w-2xl border border-hairline bg-surface p-8 md:p-12">
          <p className="eyebrow">403 / Access restricted</p>
          <h1 className="display-md mt-5">THIS SPACE IS NOT ASSIGNED TO YOUR ROLE.</h1>
          <p className="body-copy mt-5">Your authenticated role is {user.role}. Choose the workspace assigned to your account.</p>
          <Link href={`/${user.role.toLowerCase()}`} className="button-primary mt-8 inline-flex">Go to my workspace</Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
