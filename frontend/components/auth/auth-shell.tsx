import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, intro, children, footer }: { title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 md:px-8 lg:px-12">
      <section className="grid w-full max-w-5xl border border-hairline bg-surface lg:grid-cols-[0.75fr_1.25fr]">
        <div className="relative hidden overflow-hidden border-r border-hairline bg-surface-soft p-10 lg:block">
          <div className="m-stripe absolute left-0 top-0" />
          <p className="eyebrow mt-2">NeuroX / Access</p>
          <h1 className="display-md mt-8">MOVE THE SIGNAL FORWARD.</h1>
          <p className="body-copy mt-6 max-w-xs">Join a shared foundation for community challenges, research, and collaboration.</p>
          <Link href="/" className="text-link absolute bottom-10 left-10">Back to NeuroX</Link>
        </div>
        <div className="p-6 md:p-10 lg:p-14">
          <p className="eyebrow">NeuroX platform</p>
          <h2 className="display-md mt-4">{title}</h2>
          <p className="body-copy mt-4 max-w-lg">{intro}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 border-t border-hairline pt-6">{footer}</div>
        </div>
      </section>
    </main>
  );
}
