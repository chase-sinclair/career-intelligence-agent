'use client'

import Link from 'next/link'

function LandingCard({
  icon,
  title,
  body,
  action,
  href,
  accent = 'primary',
}: {
  icon: string
  title: string
  body: string
  action: string
  href: string
  accent?: 'primary' | 'secondary' | 'neutral'
}) {
  const accentClass =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'secondary'
        ? 'text-secondary'
        : 'text-on-surface'

  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-white/5 bg-surface-container-low p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-surface-container-high"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-surface-container-lowest">
        <span className={`material-symbols-outlined ${accentClass}`}>{icon}</span>
      </div>
      <h3 className="mb-3 text-xl font-bold text-on-surface">{title}</h3>
      <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{body}</p>
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
        {action}
        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
          arrow_outward
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <>
      <main className="ml-64 min-h-screen overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_28%),radial-gradient(circle_at_top_right,rgba(68,226,205,0.08),transparent_24%),linear-gradient(180deg,#121315_0%,#141518_100%)]">
        <div className="mx-auto max-w-6xl px-8 pb-16 pt-14">
          <section className="relative overflow-hidden rounded-[32px] border border-white/5 bg-surface-container-low px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(56,189,248,0.08),transparent_28%,rgba(68,226,205,0.06))]" />
            <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-3 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(68,226,205,0.6)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary">
                    Recruiter View Recommended
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-5xl font-black tracking-tight text-on-surface lg:text-6xl">
                    Explore Chase Sinclair through an{' '}
                    <span className="text-primary">Architect Profile</span> and an AI-powered{' '}
                    <span className="text-secondary">Career Knowledge Base</span>.
                  </h1>
                  <p className="max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                    Career Architect is a recruiter-facing experience designed to make professional
                    research faster and more interactive. Start with the Architect Profile for a
                    structured overview, then move into the Career Knowledge Base to ask grounded
                    questions about experience, projects, and impact.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-7 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90"
                  >
                    View Chase&apos;s Architect Profile
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-lowest px-7 py-4 text-base font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    Try Demo Workflow
                    <span className="material-symbols-outlined text-lg">science</span>
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                      Start Here
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">Architect Profile</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Best first stop for recruiters.</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                      Interactive Layer
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">Career Knowledge Base</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Ask detailed questions with evidence.</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                      Capability Demo
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">Create a New Profile</p>
                    <p className="mt-1 text-sm text-on-surface-variant">Preview how the workflow generalizes.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[26px] border border-white/5 bg-[#101114]/90 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
                        Recommended Flow
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-on-surface">How to use the app</h2>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                      Live
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        step: '01',
                        title: 'Open the Architect Profile',
                        body: 'Read the structured profile, timeline, skills, and project context before going deeper.',
                      },
                      {
                        step: '02',
                        title: 'Open the Career Knowledge Base',
                        body: 'Use natural-language questions to investigate technical depth, leadership, and evidence-backed experience.',
                      },
                      {
                        step: '03',
                        title: 'Review projects or try the demo',
                        body: 'Explore featured work or preview how the same workflow can be used for other professionals.',
                      },
                    ].map(item => (
                      <div
                        key={item.step}
                        className="rounded-2xl border border-white/5 bg-surface-container-lowest px-4 py-4"
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-secondary">
                            {item.step}
                          </span>
                          <h3 className="text-base font-bold text-on-surface">{item.title}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-6">
            <LandingCard
              icon="badge"
              title="Architect Profile"
              body="A polished, recruiter-friendly view of Chase's background, experience, skills, and academic foundation."
              action="Open Profile"
              href="/about"
              accent="primary"
            />
            <LandingCard
              icon="forum"
              title="Career Knowledge Base"
              body="An interactive RAG interface that answers detailed questions using grounded source evidence and quality metrics."
              action="Ask Questions"
              href="/knowledge-base"
              accent="secondary"
            />
            <LandingCard
              icon="folder_open"
              title="Projects"
              body="A curated collection of technical work spanning AI systems, analytics platforms, and end-to-end product builds."
              action="Browse Projects"
              href="/projects"
              accent="neutral"
            />
            <LandingCard
              icon="tune"
              title="Job Preferences"
              body="The foundation for a stronger personal jobs agent that will learn role targets, preferences, and constraints before daily matching begins."
              action="Set Preferences"
              href="/job-preferences"
              accent="secondary"
            />
            <LandingCard
              icon="work"
              title="Top Fit Jobs"
              body="A scored scouting queue that ranks opportunities against your Architect Profile and saved preferences, with strengths, risks, and talking angles."
              action="View Matches"
              href="/top-fit-jobs"
              accent="primary"
            />
            <LandingCard
              icon="experiment"
              title="Demo Lab"
              body="A guided capability showcase for creating a new profile from uploaded career artifacts and supporting documents."
              action="Launch Demo"
              href="/admin"
              accent="neutral"
            />
          </section>
        </div>
      </main>
    </>
  )
}
