'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/TopNav'
import type { EvaluationScores } from '@/lib/types'

interface SessionQualityEntry {
  id: string
  question: string
  answer: string
  sources: string[]
  evidence_snippets: string[]
  scores: EvaluationScores
  processingTime: number
  createdAt: string
}

const SESSION_STORAGE_KEY = 'career-architect-answer-quality-session'

function MetricBar({
  label,
  value,
  color,
}: {
  label: string
  value: number | null
  color: 'secondary' | 'primary'
}) {
  const pct = value !== null ? Math.round(value * 100) : 0
  const barClass =
    color === 'secondary'
      ? 'bg-secondary shadow-[0_0_4px_rgba(68,226,205,0.4)]'
      : 'bg-primary shadow-[0_0_4px_rgba(142,213,255,0.4)]'
  const valClass = color === 'secondary' ? 'text-secondary' : 'text-primary'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono text-on-surface-variant/70">{label}</span>
        <span className={`text-sm font-mono ${valClass}`}>
          {value !== null ? value.toFixed(3) : '-'}
        </span>
      </div>
      <div className="h-1 bg-surface-container-highest w-full overflow-hidden">
        <div className={`h-full ${barClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AnswerQualityCheckPage() {
  const [entries, setEntries] = useState<SessionQualityEntry[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    setEntries(raw ? JSON.parse(raw) : [])
  }, [])

  const aggregates = useMemo(() => {
    if (entries.length === 0) {
      return {
        avgGroundedness: null,
        avgCompleteness: null,
        avgConfidence: null,
        unsupportedRate: null,
        avgSources: null,
      }
    }

    return {
      avgGroundedness:
        entries.reduce((sum, entry) => sum + entry.scores.groundedness, 0) / entries.length,
      avgCompleteness:
        entries.reduce((sum, entry) => sum + entry.scores.completeness, 0) / entries.length,
      avgConfidence:
        entries.reduce((sum, entry) => sum + entry.scores.confidence, 0) / entries.length,
      unsupportedRate:
        entries.filter(entry => entry.scores.unsupported_claim).length / entries.length,
      avgSources:
        entries.reduce((sum, entry) => sum + entry.sources.length, 0) / entries.length,
    }
  }, [entries])

  function clearSession() {
    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setEntries([])
  }

  return (
    <>
      <TopNav subtitle="Answer Quality Check" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="p-10 space-y-10 max-w-6xl">
          <header>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Answer Quality Check
            </h2>
            <p className="text-on-surface-variant text-lg font-body max-w-3xl">
              Review the quality of answers generated in the current Career Knowledge Base session.
              This page summarizes groundedness, completeness, confidence, and source coverage for
              the questions you actually asked.
            </p>
            <div className="mt-5">
              <Link
                href="/knowledge-base"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
              >
                Return to Career Knowledge Base
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                  Session Metrics
                </h3>
                <span className="px-3 py-1 rounded-full border border-secondary/20 bg-secondary/10 text-secondary font-mono text-[10px] uppercase tracking-[0.25em]">
                  {entries.length} Answers
                </span>
              </div>

              {entries.length === 0 ? (
                <p className="font-mono text-sm text-on-surface-variant/50">
                  Ask questions in the Career Knowledge Base to populate this check.
                </p>
              ) : (
                <div className="space-y-5">
                  <MetricBar label="Avg Groundedness" value={aggregates.avgGroundedness} color="secondary" />
                  <MetricBar label="Avg Completeness" value={aggregates.avgCompleteness} color="primary" />
                  <MetricBar label="Avg Confidence" value={aggregates.avgConfidence} color="primary" />

                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="rounded-xl border border-white/5 bg-surface-container-lowest p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Unsupported Claim Rate
                      </p>
                      <p className="mt-3 text-2xl font-bold text-on-surface">
                        {aggregates.unsupportedRate !== null
                          ? `${Math.round(aggregates.unsupportedRate * 100)}%`
                          : '-'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-surface-container-lowest p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Avg Sources Per Answer
                      </p>
                      <p className="mt-3 text-2xl font-bold text-on-surface">
                        {aggregates.avgSources !== null ? aggregates.avgSources.toFixed(1) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">visibility</span>
                What This Means
              </h3>

              <div className="space-y-5 text-sm leading-relaxed text-on-surface-variant">
                <p>
                  This view is session-based. It is not using the old benchmark prompt set anymore.
                  It only reflects answers generated from your current browser session in the Career
                  Knowledge Base.
                </p>
                <p>
                  Groundedness and completeness come from the existing LLM-as-judge scoring already
                  returned with each answer. Source counts help indicate how much retrieval support
                  the answer had.
                </p>
                <button
                  onClick={clearSession}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Clear Session Check
                </button>
              </div>
            </section>
          </div>

          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-sm">fact_check</span>
              Session Answers
            </h3>

            {entries.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                  forum
                </span>
                <p className="font-mono text-sm text-on-surface-variant/50">
                  No current-session answers yet. Start in the Career Knowledge Base first.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {entries
                  .slice()
                  .reverse()
                  .map(entry => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/5 bg-surface-container-lowest p-5"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-on-surface">{entry.question}</p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 shrink-0">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed text-on-surface-variant mb-4">
                        {entry.answer}
                      </p>

                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-white/5 bg-surface-container-highest/40 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Groundedness
                          </p>
                          <p className="mt-2 text-lg font-bold text-secondary">
                            {entry.scores.groundedness.toFixed(3)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-surface-container-highest/40 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Completeness
                          </p>
                          <p className="mt-2 text-lg font-bold text-primary">
                            {entry.scores.completeness.toFixed(3)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-surface-container-highest/40 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Sources
                          </p>
                          <p className="mt-2 text-lg font-bold text-on-surface">
                            {entry.sources.length}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-surface-container-highest/40 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Unsupported
                          </p>
                          <p className={`mt-2 text-lg font-bold ${entry.scores.unsupported_claim ? 'text-red-400' : 'text-green-400'}`}>
                            {entry.scores.unsupported_claim ? 'Flagged' : 'Clear'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-white/5 bg-[#101114] p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                          Judge Explanation
                        </p>
                        <p className="text-sm leading-relaxed text-on-surface-variant">
                          {entry.scores.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
