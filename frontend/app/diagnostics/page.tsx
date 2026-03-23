'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/TopNav'
import { runEval, getEvalResults } from '@/lib/api'
import type { EvalRunResult } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  const barClass = color === 'secondary' ? 'bg-secondary shadow-[0_0_4px_rgba(68,226,205,0.4)]' : 'bg-primary shadow-[0_0_4px_rgba(142,213,255,0.4)]'
  const valClass = color === 'secondary' ? 'text-secondary' : 'text-primary'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono text-on-surface-variant/70">{label}</span>
        <span className={`text-sm font-mono ${valClass}`}>
          {value !== null ? value.toFixed(3) : '—'}
        </span>
      </div>
      <div className="h-1 bg-surface-container-highest w-full overflow-hidden">
        <div
          className={`h-full ${barClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
        pass
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : 'bg-red-500/10 text-red-400 border-red-500/20'
      }`}
    >
      {pass ? 'PASS' : 'FAIL'}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DiagnosticsPage() {
  const [results, setResults] = useState<EvalRunResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEvalResults()
      .then(setResults)
      .catch(() => {}) // 404 = no prior run, show empty state
      .finally(() => setLoading(false))
  }, [])

  async function handleRunEval() {
    if (running) return
    setRunning(true)
    setError(null)
    try {
      setResults(await runEval())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Evaluation run failed')
    } finally {
      setRunning(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <TopNav subtitle="Evaluations" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="p-10 space-y-10 max-w-6xl">

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <header>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Evaluation Diagnostics
            </h2>
            <p className="text-on-surface-variant text-lg font-body">
              LLM-as-judge scoring against the gold recruiter question set.
            </p>
          </header>

          {/* ── Section A + B: Metrics + Run Controls (side by side) ─────────── */}
          <div className="grid grid-cols-12 gap-8">

            {/* Aggregate Metrics */}
            <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                Aggregate Metrics
              </h3>

              {loading ? (
                <p className="font-mono text-xs text-on-surface-variant/50">Loading...</p>
              ) : (
                <div className="space-y-5">
                  <MetricBar label="Avg Groundedness"       value={results?.avg_groundedness       ?? null} color="secondary" />
                  <MetricBar label="Avg Completeness"       value={results?.avg_completeness       ?? null} color="primary"   />
                  <MetricBar label="Avg Confidence"         value={results?.avg_confidence         ?? null} color="primary"   />
                  <MetricBar label="Must-Mention Pass Rate" value={results?.must_mention_pass_rate ?? null} color="secondary" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-mono text-on-surface-variant/70">
                      Unsupported Claim Rate
                    </span>
                    {results ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          results.unsupported_claim_rate > 0
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}
                      >
                        {(results.unsupported_claim_rate * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold border border-white/5">
                        —
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Run Controls */}
            <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">play_circle</span>
                Run Evaluation
              </h3>

              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                    Runs the full chat pipeline on each gold question and scores every answer with the gpt-4o-mini judge.
                  </p>
                  {results && (
                    <p className="font-mono text-[10px] text-on-surface-variant/50 pt-2">
                      Last run: {new Date(results.timestamp).toLocaleString()} &nbsp;·&nbsp; {results.total_questions} questions
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRunEval}
                  disabled={running}
                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {running ? (
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  )}
                  {running ? 'RUNNING...' : 'RUN EVALUATION'}
                </button>

                {error && (
                  <div className="bg-surface-container-lowest p-4 rounded-lg border-l-2 border-red-500/50">
                    <p className="font-mono text-xs text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section C: Per-Question Results Table ─────────────────────────── */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-tertiary" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-sm">fact_check</span>
              Per-Question Results
              {results && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold border border-secondary/20">
                  {results.total_questions} QUESTIONS
                </span>
              )}
            </h3>

            {!results ? (
              /* Empty state */
              <div className="py-16 flex flex-col items-center gap-4 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                  folder_open
                </span>
                <p className="font-mono text-sm text-on-surface-variant/50">
                  No evaluation results yet. Click Run Evaluation to begin.
                </p>
              </div>
            ) : (
              /* Results table */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-container-highest">
                      {['ID', 'Question', 'Gnd', 'Cmp', 'Unsupported', 'Must-Mention', 'Explanation'].map(h => (
                        <th
                          key={h}
                          className="text-left font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/60 pb-3 pr-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-highest">
                    {results.results.map(r => (
                      <tr
                        key={r.id}
                        className="hover:bg-surface-container-highest/30 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-[10px] text-on-surface-variant/60">
                          {r.id}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-on-surface max-w-[200px]">
                          <span className="line-clamp-2" title={r.question}>{r.question}</span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-secondary">
                          {r.scores.groundedness.toFixed(3)}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[11px] text-primary">
                          {r.scores.completeness.toFixed(3)}
                        </td>
                        <td className="py-3 pr-4">
                          <PassBadge pass={!r.scores.unsupported_claim} />
                        </td>
                        <td className="py-3 pr-4">
                          <PassBadge pass={r.must_mention_pass} />
                        </td>
                        <td className="py-3 font-mono text-[10px] text-on-surface-variant/70 max-w-[240px]">
                          <span className="line-clamp-2" title={r.scores.explanation}>
                            {r.scores.explanation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  )
}
