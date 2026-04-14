'use client'

import { useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/TopNav'
import {
  applyJobSourcePack,
  getJobSources,
  getJobSourcePacks,
  getTopFitJobs,
  refreshJobs,
  updateJobShortlist,
  updateJobSources,
} from '@/lib/api'
import type {
  JobFitResult,
  JobRefreshResponse,
  JobSourceConfig,
  JobSourcePack,
  TopFitJobsResponse,
} from '@/lib/types'

function MetricBar({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'primary' | 'secondary'
}) {
  const colorClass =
    tone === 'primary'
      ? 'bg-primary shadow-[0_0_4px_rgba(142,213,255,0.4)]'
      : 'bg-secondary shadow-[0_0_4px_rgba(68,226,205,0.4)]'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
          {label}
        </span>
        <span className="font-mono text-sm text-on-surface">{value.toFixed(3)}</span>
      </div>
      <div className="h-1 overflow-hidden bg-surface-container-highest">
        <div className={`h-full ${colorClass}`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  )
}

function RankedInsightList({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string
  subtitle: string
  items: { label: string; count: number }[]
  accent: 'primary' | 'secondary'
}) {
  return (
    <section className="rounded-[24px] border border-white/5 bg-surface-container-low p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-on-surface-variant/60">{title}</p>
      <h3 className="mt-3 text-xl font-bold text-on-surface">{subtitle}</h3>
      <div className="mt-5 space-y-3">
        {items.map(item => (
          <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-on-surface">{item.label}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                  {item.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-lowest">
                <div
                  className={`h-full rounded-full ${accent === 'primary' ? 'bg-primary' : 'bg-secondary'}`}
                  style={{ width: `${Math.max(12, Math.min(100, item.count * 8))}%` }}
                />
              </div>
            </div>
            <div
              className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                accent === 'primary'
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : 'border-secondary/20 bg-secondary/10 text-secondary'
              }`}
            >
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FitCard({
  result,
  onStatusChange,
}: {
  result: JobFitResult
  onStatusChange: () => Promise<void>
}) {
  const [status, setStatus] = useState(result.shortlist_status || 'new')
  const [saving, setSaving] = useState(false)

  async function handleStatusChange(nextStatus: string) {
    setSaving(true)
    try {
      await updateJobShortlist(result.job.id, nextStatus, result.shortlist_note)
      setStatus(nextStatus)
      await onStatusChange()
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="rounded-[28px] border border-white/5 bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {result.match_bucket}
            </span>
            <span className="rounded-full border border-white/10 bg-surface-container-lowest px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
              {result.job.source_label || result.job.source}
            </span>
          </div>
          <h2 className="text-[28px] font-bold leading-tight text-on-surface">{result.job.title}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {result.job.company} | {result.job.location}
          </p>
        </div>

        <div className="min-w-[120px] rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-4 text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-secondary">
            Fit Score
          </p>
          <p className="mt-2 text-3xl font-black text-on-surface">
            {Math.round(result.overall_score * 100)}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-white/10 bg-surface-container-lowest px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          {result.job.liveness_status === 'live' ? 'Live Source Verified' : result.job.liveness_status}
        </span>
        {result.job.liveness_note && (
          <span className="text-sm text-on-surface-variant">{result.job.liveness_note}</span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-on-surface-variant">{result.why_it_fits}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => handleStatusChange('review')}
          disabled={saving || status === 'review'}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary disabled:opacity-40"
        >
          Queue For Review
        </button>
        <button
          onClick={() => handleStatusChange('shortlisted')}
          disabled={saving || status === 'shortlisted'}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/40 disabled:opacity-40"
        >
          Shortlist
        </button>
        <button
          onClick={() => handleStatusChange('archived')}
          disabled={saving || status === 'archived'}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-amber-500/30 hover:text-amber-200 disabled:opacity-40"
        >
          Archive
        </button>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
          Queue status: {status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface-container-lowest p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
              Match Breakdown
            </h3>
            {result.job.salary_text && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {result.job.salary_text}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <MetricBar label="Preference Match" value={result.preference_match_score} tone="primary" />
            <MetricBar label="Profile Match" value={result.profile_match_score} tone="secondary" />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
            <p>
              <span className="font-semibold text-on-surface">Remote style:</span>{' '}
              {result.job.remote_type ?? 'Not specified'}
            </p>
            <p>
              <span className="font-semibold text-on-surface">Employment:</span>{' '}
              {result.job.employment_type ?? 'Not specified'}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-on-surface">Posted:</span>{' '}
              {result.job.posted_at ?? 'Not specified'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#101114] p-5">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-secondary">
            Why It Works
          </h3>
          <div className="space-y-3">
            {result.strengths.map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-secondary">
                  north_east
                </span>
                <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-4 mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
            Resume Angles
          </h3>
          <div className="space-y-3">
            {result.likely_resume_angles.map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-primary">
                  subdirectory_arrow_right
                </span>
                <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {result.risks.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-5 lg:col-span-2">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">
            Watchouts
          </h3>
          <div className="space-y-3">
            {result.risks.map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-sm text-amber-200">
                  priority_high
                </span>
                <p className="text-sm leading-relaxed text-amber-100/90">{item}</p>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </article>
  )
}

function emptySource(): JobSourceConfig {
  return {
    id: `custom-${Date.now()}`,
    name: '',
    platform: 'greenhouse',
    identifier: '',
    discovery_mode: 'ats_api',
    priority_tier: 1,
    enabled: true,
    notes: '',
  }
}

export default function TopFitJobsPage() {
  const [data, setData] = useState<TopFitJobsResponse | null>(null)
  const [sources, setSources] = useState<JobSourceConfig[]>([])
  const [sourcePacks, setSourcePacks] = useState<JobSourcePack[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [savingSources, setSavingSources] = useState(false)
  const [applyingPackId, setApplyingPackId] = useState<string | null>(null)
  const [recentDays, setRecentDays] = useState(0)
  const [dedupe, setDedupe] = useState(true)
  const [refreshResult, setRefreshResult] = useState<JobRefreshResponse | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedSources, setShowAdvancedSources] = useState(false)

  async function loadPageData() {
    setError(null)
    const [jobsResponse, sourcesResponse, packsResponse] = await Promise.all([
      getTopFitJobs(12, recentDays, dedupe),
      getJobSources(),
      getJobSourcePacks(),
    ])
    setData(jobsResponse)
    setSources(sourcesResponse)
    setSourcePacks(packsResponse)
  }

  useEffect(() => {
    loadPageData()
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load top-fit jobs'))
      .finally(() => setLoading(false))
  }, [recentDays, dedupe])

  async function handleRefresh() {
    setRefreshing(true)
    setError(null)
    setSaveMessage(null)
    try {
      const result = await refreshJobs()
      setRefreshResult(result)
      await loadPageData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh live jobs')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleSaveSources() {
    setSavingSources(true)
    setError(null)
    setSaveMessage(null)
    try {
      const sanitized = sources
        .map(source => ({
          ...source,
          name: source.name.trim(),
          identifier: source.identifier.trim(),
          notes: source.notes.trim(),
        }))
        .filter(source => source.name && source.identifier)

      const saved = await updateJobSources(sanitized)
      setSources(saved)
      setSaveMessage('Tracked sources saved. Refresh live jobs when you want the new boards pulled into the cache.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save tracked job sources')
    } finally {
      setSavingSources(false)
    }
  }

  async function handleApplySourcePack(packId: string) {
    setApplyingPackId(packId)
    setError(null)
    setSaveMessage(null)
    try {
      const applied = await applyJobSourcePack(packId)
      setSources(applied)
      const result = await refreshJobs()
      setRefreshResult(result)
      await loadPageData()
      setSaveMessage('Source pack applied and refreshed. The jobs agent is now scoring the new discovery universe.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply source pack')
    } finally {
      setApplyingPackId(null)
    }
  }

  function updateSource(index: number, patch: Partial<JobSourceConfig>) {
    setSources(prev => prev.map((source, i) => (i === index ? { ...source, ...patch } : source)))
  }

  function addSource() {
    setSources(prev => [...prev, emptySource()])
  }

  function removeSource(index: number) {
    setSources(prev => prev.filter((_, i) => i !== index))
  }

  const summary = useMemo(() => {
    if (!data || data.top_matches.length === 0) return null
    const bestFits = data.top_matches.filter(item => item.match_bucket === 'Best Fit').length
    const avgScore =
      data.top_matches.reduce((sum, item) => sum + item.overall_score, 0) / data.top_matches.length
    return { bestFits, avgScore }
  }, [data])

  const enabledSources = useMemo(() => sources.filter(source => source.enabled), [sources])
  const recommendedPack = data?.recommended_pack
  const currentSourceIds = useMemo(() => new Set(sources.map(source => source.id)), [sources])

  if (loading) {
    return (
      <>
        <TopNav subtitle="Top Fit Jobs" />
        <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
          <div className="p-10 flex items-center gap-2 text-on-surface-variant font-mono text-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Loading ranked opportunities...
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav subtitle="Top Fit Jobs" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(68,226,205,0.07),transparent_22%),linear-gradient(180deg,#121315_0%,#141518_100%)] px-8 pb-16 pt-24">
          <div className="mx-auto max-w-6xl space-y-8">
            <section className="relative overflow-hidden rounded-[30px] border border-white/5 bg-surface-container-low p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(56,189,248,0.08),transparent_30%,rgba(68,226,205,0.05))]" />
              <div className="relative space-y-8">
                <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-3 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2">
                      <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(68,226,205,0.6)]" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary">
                        Top Fit Jobs
                      </span>
                    </div>

                    <div className="space-y-4">
                      <h1 className="max-w-4xl text-4xl font-black tracking-tight text-on-surface lg:text-5xl">
                        A cleaner view of which jobs are actually worth your time.
                      </h1>
                      <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant">
                        The agent scans live boards, filters them against your profile and saved preferences, then
                        shows a diversified top list so one company does not flood the screen.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-7 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>
                          {refreshing ? 'progress_activity' : 'sync'}
                        </span>
                        {refreshing ? 'Refreshing Live Jobs...' : 'Refresh Live Jobs'}
                      </button>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                        {enabledSources.length} active sources across Greenhouse, Lever, and Ashby
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[0.8fr_0.9fr]">
                      <label className="block space-y-2">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                          Freshness Window
                        </span>
                        <select
                          value={recentDays}
                          onChange={e => setRecentDays(Number(e.target.value))}
                          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                        >
                          <option value={0}>All cached jobs</option>
                          <option value={7}>Last 7 days</option>
                          <option value={14}>Last 14 days</option>
                          <option value={30}>Last 30 days</option>
                          <option value={60}>Last 60 days</option>
                        </select>
                      </label>

                      <label className="flex items-center gap-3 self-end rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-3">
                        <input
                          type="checkbox"
                          checked={dedupe}
                          onChange={e => setDedupe(e.target.checked)}
                          className="h-4 w-4 rounded border-white/20 bg-surface-container-high text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Hide Duplicate Roles
                          </span>
                          <span className="block text-sm text-on-surface-variant">
                            Keep only the freshest version of repeated title and company matches.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/80 p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Roles Passing Filters
                      </p>
                      <p className="mt-3 text-3xl font-black text-on-surface">{data?.total_jobs ?? 0}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Jobs still standing after role-family, location, and liveness filters.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/80 p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Live Openings Scanned
                      </p>
                      <p className="mt-3 text-3xl font-black text-on-surface">{data?.live_jobs_count ?? 0}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        The total live ATS roles currently sitting in the cache before fit ranking.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/80 p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Best-Fit Roles in Pool
                      </p>
                      <p className="mt-3 text-3xl font-black text-on-surface">{data?.best_fit_count ?? 0}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        How many roles hit the best-fit bucket before the displayed company cap is applied.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/80 p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
                        Display Rule
                      </p>
                      <p className="mt-3 text-3xl font-black text-on-surface">
                        {data?.display_company_cap ?? 2} per company
                      </p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        The visible top list is diversified so one company cannot dominate the page.
                      </p>
                    </div>
                  </div>
                </div>

                {data && (
                  <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[24px] border border-white/5 bg-surface-container-lowest/70 p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                        Morning Brief Preview
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-on-surface">{data.brief_headline}</h2>
                      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{data.brief_summary}</p>
                    </div>

                    <div className="rounded-[24px] border border-white/5 bg-surface-container-lowest/70 p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-secondary">
                        Queue Health
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-3xl font-black text-on-surface">{data.new_since_refresh_count}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">new since refresh</p>
                        </div>
                        <div>
                          <p className="text-3xl font-black text-on-surface">{data.ready_to_review_count}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">queued for review</p>
                        </div>
                        <div>
                          <p className="text-3xl font-black text-on-surface">{data.shortlisted_count}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">shortlisted</p>
                        </div>
                        <div>
                          <p className="text-3xl font-black text-on-surface">{Math.round((summary?.avgScore ?? 0) * 100)}</p>
                          <p className="mt-1 text-sm text-on-surface-variant">avg visible fit score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {sourcePacks.length > 0 && (
              <section className="rounded-[28px] border border-white/5 bg-surface-container-low p-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-secondary">
                      Discovery Packs
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-on-surface">
                      Pick the source universe that best matches your current search direction
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">
                      Packs control where the crawler looks before ranking begins. They matter because changing
                      preferences alone will not create better results if the source universe stays too narrow.
                    </p>
                  </div>
                  {recommendedPack?.pack_id && (
                    <div className="max-w-sm rounded-2xl border border-primary/20 bg-primary/10 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                        Recommended Right Now
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-on-surface">{recommendedPack.pack_name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                        {recommendedPack.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {sourcePacks.map(pack => (
                    <div
                      key={pack.id}
                      className={`rounded-2xl border p-5 ${
                        recommendedPack?.pack_id === pack.id
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-white/5 bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-on-surface">{pack.name}</h3>
                            {recommendedPack?.pack_id === pack.id && (
                              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                                Recommended
                              </span>
                            )}
                            {pack.sources.every(source => currentSourceIds.has(source.id)) &&
                              currentSourceIds.size === pack.sources.length && (
                                <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
                                  Active
                                </span>
                              )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                            {pack.description}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-surface-container-high px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                          {pack.sources.length} sources
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {pack.recommended_for.map(item => (
                          <span
                            key={item}
                            className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-on-surface-variant">
                          Includes boards like {pack.sources.slice(0, 3).map(source => source.name).join(', ')}
                          {pack.sources.length > 3 ? ', and more.' : '.'}
                        </p>
                        <button
                          onClick={() => handleApplySourcePack(pack.id)}
                          disabled={applyingPackId === pack.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <span className={`material-symbols-outlined text-sm ${applyingPackId === pack.id ? 'animate-spin' : ''}`}>
                            {applyingPackId === pack.id ? 'progress_activity' : 'layers'}
                          </span>
                          {applyingPackId === pack.id ? 'Applying...' : 'Apply Pack'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data && (
              <div className="grid gap-6 xl:grid-cols-2">
                <RankedInsightList
                  title="Top Companies"
                  subtitle="Which employers are appearing most often in the filtered pool"
                  items={data.top_companies}
                  accent="primary"
                />
                <RankedInsightList
                  title="Top Job Titles"
                  subtitle="Which role families are dominating the current ranked pool"
                  items={data.top_titles}
                  accent="secondary"
                />
              </div>
            )}

            {refreshResult && (
              <section className="rounded-[24px] border border-white/5 bg-surface-container-low p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-secondary">
                    Refresh Result
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                    {refreshResult.fetched_jobs} live jobs fetched across {refreshResult.enabled_sources} sources
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    {refreshResult.added_jobs} added
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary">
                    {refreshResult.unchanged_jobs} unchanged
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                    {refreshResult.verified_live_jobs} verified live
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                    {refreshResult.unverified_jobs} unverified
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-200">
                    {refreshResult.dropped_jobs} dropped
                  </span>
                  {refreshResult.used_seed_fallback && (
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-200">
                      Using fallback seeded jobs
                    </span>
                  )}
                </div>
                {(refreshResult.added_previews.length > 0 || refreshResult.dropped_previews.length > 0) && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {refreshResult.added_previews.length > 0 && (
                      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                          Newly Seen Roles
                        </p>
                        <div className="mt-3 space-y-2">
                          {refreshResult.added_previews.map(item => (
                            <p key={item} className="text-sm text-on-surface-variant">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {refreshResult.dropped_previews.length > 0 && (
                      <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-200">
                          No Longer Returned
                        </p>
                        <div className="mt-3 space-y-2">
                          {refreshResult.dropped_previews.map(item => (
                            <p key={item} className="text-sm text-on-surface-variant">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {refreshResult.source_errors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {refreshResult.source_errors.map(item => (
                      <p key={item} className="text-sm text-amber-200">
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="rounded-[24px] border border-white/5 bg-surface-container-low p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Advanced Source Tuning</h2>
                  <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
                    This controls where the jobs agent looks for openings. It is mainly useful when we want to retarget
                    the crawler, debug weak matches, or widen into non-ATS direct-board search when ATS results are too concentrated.
                  </p>
                </div>
                <button
                  onClick={() => setShowAdvancedSources(prev => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showAdvancedSources ? 'expand_less' : 'expand_more'}
                  </span>
                  {showAdvancedSources ? 'Hide Source Controls' : 'Show Source Controls'}
                </button>
              </div>

              {showAdvancedSources && (
                <>
                  <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-on-surface-variant">
                      Company Label is the board name, Board Identifier is the ATS slug or full direct-board URL,
                      Discovery Mode describes how the crawler should treat the source, and Priority Tier decides
                      which sources get pulled first.
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={addSource}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Source
                      </button>
                      <button
                        onClick={handleSaveSources}
                        disabled={savingSources}
                        className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <span className={`material-symbols-outlined text-sm ${savingSources ? 'animate-spin' : ''}`}>
                          {savingSources ? 'progress_activity' : 'save'}
                        </span>
                        {savingSources ? 'Saving...' : 'Save Sources'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {sources.map((source, index) => (
                      <div
                        key={source.id}
                        className="grid gap-4 rounded-2xl border border-white/5 bg-surface-container-lowest p-4 lg:grid-cols-[1.1fr_0.8fr_1fr_0.8fr_auto]"
                      >
                        <div className="space-y-2">
                          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Company Label
                          </label>
                          <input
                            value={source.name}
                            onChange={e => updateSource(index, { name: e.target.value })}
                            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                            placeholder="Company name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Platform
                          </label>
                          <select
                            value={source.platform}
                            onChange={e => updateSource(index, { platform: e.target.value })}
                            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                          >
                            <option value="greenhouse">Greenhouse</option>
                            <option value="lever">Lever</option>
                            <option value="ashby">Ashby</option>
                            <option value="direct">Direct Board</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Board Identifier
                          </label>
                          <input
                            value={source.identifier}
                            onChange={e => updateSource(index, { identifier: e.target.value })}
                            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                            placeholder={source.platform === 'direct' ? 'https://company.com/careers' : 'example-company'}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                              Discovery Mode
                            </label>
                            <select
                              value={source.discovery_mode}
                              onChange={e => updateSource(index, { discovery_mode: e.target.value })}
                              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                            >
                              <option value="ats_api">ATS API</option>
                              <option value="direct_board">Direct Board</option>
                              <option value="broad_search">Broad Search</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                              Priority Tier
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={source.priority_tier}
                              onChange={e => updateSource(index, { priority_tier: Number(e.target.value) || 1 })}
                              className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-3">
                          <label className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-container-high px-4 py-3">
                            <input
                              type="checkbox"
                              checked={source.enabled}
                              onChange={e => updateSource(index, { enabled: e.target.checked })}
                              className="h-4 w-4 rounded border-white/20 bg-surface-container-high text-primary focus:ring-primary"
                            />
                            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                              Enabled
                            </span>
                          </label>
                          <button
                            onClick={() => removeSource(index)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-container-high px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-amber-500/30 hover:text-amber-200"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Remove
                          </button>
                        </div>

                        <div className="lg:col-span-5 space-y-2">
                          <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                            Notes
                          </label>
                          <input
                            value={source.notes}
                            onChange={e => updateSource(index, { notes: e.target.value })}
                            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                            placeholder="Why this board is included"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {saveMessage && <p className="mt-4 text-sm text-secondary">{saveMessage}</p>}
                </>
              )}
            </section>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {!error && data && data.top_matches.length === 0 && (
              <div className="rounded-[28px] border border-white/5 bg-surface-container-low p-10 text-center">
                <p className="text-lg font-semibold text-on-surface">No jobs are loaded yet.</p>
                <p className="mt-3 text-sm text-on-surface-variant">
                  Save a few live sources, then refresh the feed to pull current openings into the ranking surface.
                </p>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
              {data?.top_matches.map(result => (
                <FitCard key={result.job.id} result={result} onStatusChange={loadPageData} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
