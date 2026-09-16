import Link from "next/link";

export function UnderDevelopment({ area }: { area: string }) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-24">
      <section className="w-full max-w-2xl border border-hairline bg-surface p-8 md:p-12">
        <p className="eyebrow">NeuroX / Foundation</p>
        <h1 className="display-md mt-5">{area} IS UNDER DEVELOPMENT</h1>
        <p className="body-copy mt-5 max-w-xl">
          This route is reserved for a later platform phase. The current release establishes the visual and routing foundation only.
        </p>
        <Link href="/" className="button-primary mt-8 inline-flex">
          Return to home
        </Link>
      </section>
    </main>
  );
}
