'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import TopNav from '@/components/TopNav'
import AnimatedReveal from '@/components/AnimatedReveal'
import { PROJECT_DETAILS } from '@/lib/project-details'

function SectionDivider() {
  return (
    <div className="my-16 flex items-center justify-center">
      <div className="h-px w-full max-w-md bg-[linear-gradient(90deg,transparent,rgba(56,189,248,0.45),transparent)]" />
    </div>
  )
}

function StatusDot({ status }: { status: 'Healthy' | 'Warning' | 'Critical' }) {
  const colorClass =
    status === 'Healthy' ? 'bg-emerald-400' : status === 'Warning' ? 'bg-amber-300' : 'bg-rose-400'

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`} />
}

function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-medium text-primary">
      {label}
    </span>
  )
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>()
  const detail = PROJECT_DETAILS[params.slug]

  if (!detail) {
    notFound()
  }

  return (
    <>
      <TopNav subtitle="Project Deep Dive" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_24%),linear-gradient(180deg,#121315_0%,#151619_100%)] px-8 pb-24 pt-24">
          <div className="mx-auto max-w-5xl">
            <div className="sticky top-16 z-30 border-b border-white/5 bg-[#121315]/80 py-4 backdrop-blur-xl">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Projects
              </Link>
            </div>

            <section className="pb-8 pt-12">
              <AnimatedReveal>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-primary">
                  {detail.subtitle}
                </p>
                <h1 className="text-4xl font-black tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
                  {detail.name}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                  {detail.summary}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {detail.techStack.map(tech => (
                    <TechBadge key={tech} label={tech} />
                  ))}
                </div>
              </AnimatedReveal>
            </section>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-6 text-2xl font-bold text-on-surface">The Problem</h2>
              <div className="space-y-4 text-base leading-relaxed text-on-surface-variant">
                {detail.problemParagraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="my-8 rounded-2xl border border-primary/20 bg-primary/10 p-6">
                  <p className="font-medium text-on-surface">{detail.problemCallout}</p>
                </div>
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">What It Does</h2>
              <div className="space-y-4">
                {detail.whatItDoes.map((step, index) => (
                  <AnimatedReveal key={step.label} delayMs={index * 90}>
                    <div className="flex items-start gap-5 rounded-2xl border border-white/5 bg-surface-container-low p-5 transition-colors hover:border-primary/20">
                      <span className="font-mono text-sm font-bold text-primary">{step.label}</span>
                      <p className="text-on-surface-variant">{step.description}</p>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">How It Works</h2>
              <p className="mb-8 text-on-surface-variant">
                Raw GitHub activity flows through a lakehouse pipeline before the AI agent investigates and generates an actionable recommendation.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {detail.dataPipeline.map((layer, index) => (
                  <AnimatedReveal key={layer.title} delayMs={index * 120}>
                    <div className="h-full rounded-2xl border border-white/5 bg-surface-container-low p-6">
                      <h3 className="mb-3 text-lg font-semibold text-on-surface">{layer.title}</h3>
                      <p className="text-sm leading-relaxed text-on-surface-variant">{layer.description}</p>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">The Six Health Signals</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {detail.healthSignals.map((signal, index) => (
                  <AnimatedReveal key={signal.signal} delayMs={index * 70}>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-5">
                      <h3 className="mb-1 font-semibold text-on-surface">{signal.signal}</h3>
                      <p className="text-sm text-on-surface-variant">{signal.description}</p>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">The AI Agent</h2>
              <div className="relative space-y-0">
                {detail.agentNodes.map((node, index) => (
                  <AnimatedReveal key={node.label} delayMs={index * 90}>
                    <div className="relative flex items-start gap-5 py-4">
                      {index < detail.agentNodes.length - 1 && (
                        <div className="absolute left-[15px] top-[44px] h-[calc(100%-20px)] w-px bg-white/10" />
                      )}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
                        <span className="font-mono text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-on-surface">{node.label}</h3>
                        <p className="text-sm text-on-surface-variant">{node.description}</p>
                      </div>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">Sample Output</h2>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-container-low">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface-container-lowest">
                      <th className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-variant/60">
                        Project
                      </th>
                      <th className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-variant/60">
                        Score
                      </th>
                      <th className="px-5 py-3 text-left font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-variant/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.healthScores.map(score => (
                      <tr key={score.project} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-4 font-mono text-sm text-on-surface">{score.project}</td>
                        <td className="px-5 py-4 font-mono text-sm text-on-surface-variant">{score.score} / 10</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                            <StatusDot status={score.status} />
                            {score.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedReveal>

            <AnimatedReveal className="mt-12">
              <h3 className="mb-4 text-lg font-semibold text-on-surface-variant">
                AI-Generated Assessment <span className="font-mono text-xs text-rose-300">{detail.aiAssessment.subject}</span>
              </h3>
              <div className="space-y-4 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-rose-300">Primary risk signal</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{detail.aiAssessment.primaryRisk}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200">Mitigating factors</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{detail.aiAssessment.mitigatingFactors}</p>
                </div>
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Recommended action</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{detail.aiAssessment.recommendedAction}</p>
                </div>
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-6 text-2xl font-bold text-on-surface">Semantic Search</h2>
              <p className="mb-6 text-on-surface-variant">
                AI-generated assessments are embedded for natural-language lookup, so teams can ask for classes of risk instead of opening reports one by one.
              </p>
              <div className="space-y-3">
                {detail.semanticQueries.map((query, index) => (
                  <AnimatedReveal key={query} delayMs={index * 70}>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface-container-low px-5 py-3">
                      <span className="text-primary">→</span>
                      <span className="font-mono text-sm italic text-on-surface-variant">{query}</span>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">Technical Highlights</h2>
              <div className="space-y-6">
                {detail.technicalHighlights.map((highlight, index) => (
                  <AnimatedReveal key={highlight.title} delayMs={index * 90}>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-6">
                      <h3 className="mb-2 font-mono text-sm font-semibold text-primary">{highlight.title}</h3>
                      <p className="text-sm leading-relaxed text-on-surface-variant">{highlight.description}</p>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">By The Numbers</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {detail.metrics.map((metric, index) => (
                  <AnimatedReveal key={metric.label} delayMs={index * 80}>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-low p-5 text-center">
                      <div className="text-2xl font-black text-primary drop-shadow-[0_0_18px_rgba(56,189,248,0.3)]">
                        {metric.value}
                      </div>
                      <div className="mt-1 text-xs text-on-surface-variant">{metric.label}</div>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">What I Learned</h2>
              <div className="space-y-6 text-on-surface-variant">
                {detail.lessonsLearned.map(lesson => (
                  <p key={lesson} className="leading-relaxed">{lesson}</p>
                ))}
              </div>
            </AnimatedReveal>

            <SectionDivider />

            <AnimatedReveal>
              <h2 className="mb-8 text-2xl font-bold text-on-surface">V2 Roadmap</h2>
              <div className="space-y-3">
                {detail.roadmap.map((item, index) => (
                  <AnimatedReveal key={item} delayMs={index * 70}>
                    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-container-low/80 px-5 py-3">
                      <span className="font-mono text-xs text-primary/70">→</span>
                      <p className="text-sm text-on-surface-variant">{item}</p>
                    </div>
                  </AnimatedReveal>
                ))}
              </div>
            </AnimatedReveal>

            <div className="mt-20 border-t border-white/5 pt-8 text-center">
              <Link href="/projects" className="text-sm text-on-surface-variant transition-colors hover:text-primary">
                ← Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
