"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Building2, Globe2, Lightbulb, University } from "lucide-react";

const workflow = [
  ["01", "Surface", "Communities identify the challenges that matter most in their everyday lives."],
  ["02", "Connect", "Research and industry partners bring the right knowledge, capability, and context."],
  ["03", "Advance", "Collaborative teams turn validated insight into practical, measurable progress."],
];

const stakeholders = [
  { icon: Globe2, title: "Communities", text: "Make local challenges visible and help shape the problems worth solving." },
  { icon: University, title: "Universities", text: "Connect research, students, and faculty expertise to real-world needs." },
  { icon: Building2, title: "Industry", text: "Bring capability, resources, and implementation perspective to collaboration." },
];

export function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-hairline bg-background">
        <div className="m-stripe" />
        <div className="mx-auto grid min-h-[680px] max-w-[1440px] items-end gap-12 px-5 pb-16 pt-24 md:px-8 md:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:pt-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow">Societal innovation / Local action / Shared progress</p>
            <h1 className="display-xl mt-6 max-w-5xl">BUILD WHAT MATTERS.</h1>
            <p className="body-lead mt-8 max-w-xl">NeuroX connects community challenges with research, collaboration, and the people who can move ideas into real-world impact.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="button-primary">Submit a Problem <ArrowRight size={16} /></Link>
              <a href="#workflow" className="button-secondary">Explore the platform <ArrowRight size={16} /></a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative min-h-80 border border-hairline bg-surface p-6 md:p-8">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_0%,rgba(28,105,212,0.18)_48%,rgba(226,39,24,0.2)_100%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between border-b border-hairline pb-4"><span className="eyebrow">NeurX / 001</span><Lightbulb size={18} className="text-m-blue-dark" /></div>
              <div className="py-12"><p className="text-5xl font-bold tracking-[-0.06em] text-foreground md:text-7xl">N→X</p><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">From a signal in the community to a shared direction for change.</p></div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-success" /> Foundation release / Local development</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="platform" className="border-b border-hairline bg-surface-soft">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="eyebrow">The platform</p><h2 className="display-lg mt-5">A CLEARER PATH FROM NEED TO ACTION.</h2></div><p className="body-lead max-w-2xl self-end">NeuroX gives people and institutions a shared language for societal innovation. It is a place to frame meaningful challenges, find aligned capability, and create momentum around solutions.</p></div>
        </div>
      </section>

      <section id="workflow" className="border-b border-hairline bg-background">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">How it works</p><h2 className="display-md mt-4">SIGNAL. ALIGN. ADVANCE.</h2></div><p className="caption max-w-xs">A foundation for future workflows, designed around clarity and shared ownership.</p></div>
          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {workflow.map(([number, title, text]) => <article key={number} className="bg-background p-6 md:p-8"><p className="text-sm font-bold tracking-[0.18em] text-m-blue-dark">{number}</p><h3 className="title-lg mt-16 uppercase">{title}</h3><p className="body-copy mt-4">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="challenges" className="border-b border-hairline bg-surface-soft">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 lg:px-12"><p className="eyebrow">Built for many perspectives</p><h2 className="display-md mt-4 max-w-3xl">COLLABORATION STARTS WITH A SHARED VIEW.</h2><div className="mt-12 grid gap-px border border-hairline bg-hairline md:grid-cols-3">{stakeholders.map(({ icon: Icon, title, text }) => <article key={title} className="bg-surface-soft p-6 md:p-8"><Icon size={24} strokeWidth={1.4} className="text-m-blue-dark" /><h3 className="title-lg mt-12 uppercase">{title}</h3><p className="body-copy mt-4">{text}</p></article>)}</div></div>
      </section>

      <section id="about" className="border-b border-hairline bg-background">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 md:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-12"><div><p className="eyebrow">The next layer</p><h2 className="display-lg mt-5">INTELLIGENCE WITH PURPOSE.</h2></div><div className="self-end"><p className="body-lead">The NeuroX foundation is designed to support a future where evidence, expertise, and lived experience meet without losing sight of the people behind the problem.</p><Link href="/register" className="text-link mt-8 inline-flex">Join the foundation <ArrowRight size={16} /></Link></div></div>
      </section>

      <footer className="bg-background"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8 lg:px-12"><div><p className="text-sm font-bold uppercase tracking-[0.22em]">NeurX</p><p className="caption mt-2">Societal Innovation Collaboration Platform</p></div><p className="caption">Foundation release / Local development</p></div></footer>
    </main>
  );
}
