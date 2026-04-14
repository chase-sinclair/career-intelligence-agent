'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import TopNav from '@/components/TopNav'
import { getJobPreferences, updateJobPreferences } from '@/lib/api'
import type { JobPreferences } from '@/lib/types'

const EMPTY_PREFERENCES: JobPreferences = {
  target_titles: [],
  exclude_title_keywords: [],
  target_keywords: [],
  preferred_locations: [],
  remote_preference: 'remote_or_hybrid',
  salary_floor: null,
  target_seniority: [],
  preferred_industries: [],
  preferred_company_types: [],
  tech_focus_areas: [],
  public_sector_interest: '',
  work_authorization_notes: '',
  avoid_keywords: [],
  stretch_roles_allowed: true,
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function formatList(values: string[]): string {
  return values.join(', ')
}

function SectionCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/5 bg-surface-container-low p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-on-surface">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-on-surface-variant">{body}</p>
      <div className="mt-8">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/60">
        {label}
      </span>
      {children}
      {hint && <span className="block text-xs text-on-surface-variant/55">{hint}</span>}
    </label>
  )
}

export default function JobPreferencesPage() {
  const [preferences, setPreferences] = useState<JobPreferences>(EMPTY_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getJobPreferences()
      .then(setPreferences)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load job preferences'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveMessage(null)
    setError(null)
    try {
      const saved = await updateJobPreferences(preferences)
      setPreferences(saved)
      setSaveMessage('Preferences saved. This will drive the stronger jobs agent as we build it out.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save job preferences')
    } finally {
      setSaving(false)
    }
  }

  const readiness = useMemo(() => {
    let score = 0
    if (preferences.target_titles.length > 0) score += 1
    if (preferences.preferred_locations.length > 0) score += 1
    if (preferences.target_keywords.length > 0) score += 1
    if (preferences.preferred_industries.length > 0) score += 1
    if (preferences.tech_focus_areas.length > 0) score += 1
    if (preferences.salary_floor !== null) score += 1
    return score
  }, [preferences])

  if (loading) {
    return (
      <>
        <TopNav subtitle="Job Preferences" />
        <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
          <div className="p-10 flex items-center gap-2 text-on-surface-variant font-mono text-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Loading job-agent preferences...
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopNav subtitle="Job Preferences" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(68,226,205,0.07),transparent_22%),linear-gradient(180deg,#121315_0%,#141518_100%)] px-8 pb-16 pt-24">
          <div className="mx-auto max-w-6xl space-y-8">
            <section className="relative overflow-hidden rounded-[30px] border border-white/5 bg-surface-container-low p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(56,189,248,0.08),transparent_30%,rgba(68,226,205,0.05))]" />
              <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-3 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2">
                    <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(68,226,205,0.6)]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-secondary">
                      Stronger Agent Foundation
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-4xl text-4xl font-black tracking-tight text-on-surface lg:text-5xl">
                      Shape what the future <span className="text-primary">job-finding agent</span>{' '}
                      optimizes for every morning.
                    </h1>
                    <p className="max-w-3xl text-base leading-relaxed text-on-surface-variant">
                      This page will become the control center for a daily jobs brief built around
                      your Architect Profile, Career Knowledge Base, and personal job-search
                      preferences. Today, it saves the targeting signals the agent will use next:
                      titles, locations, salary constraints, industries, and what to avoid.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Current Stage
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Preferences Capture</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        Next Build
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Greenhouse + Lever ingestion</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-container-lowest/70 p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
                        End Goal
                      </p>
                      <p className="mt-2 text-sm font-semibold text-on-surface">Daily top-fit jobs brief</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/5 bg-[#101114]/90 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary">
                        Agent Readiness
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-on-surface">Preference signal strength</h2>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                      {readiness}/6
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      { label: 'Target roles defined', ok: preferences.target_titles.length > 0 },
                      { label: 'Locations set', ok: preferences.preferred_locations.length > 0 },
                      { label: 'Keywords captured', ok: preferences.target_keywords.length > 0 },
                      { label: 'Industry preferences set', ok: preferences.preferred_industries.length > 0 },
                      { label: 'Tech focus areas set', ok: preferences.tech_focus_areas.length > 0 },
                      { label: 'Salary floor set', ok: preferences.salary_floor !== null },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-3"
                      >
                        <span className="text-sm text-on-surface">{item.label}</span>
                        <span
                          className={`font-mono text-[10px] uppercase tracking-[0.25em] ${
                            item.ok ? 'text-secondary' : 'text-on-surface-variant/50'
                          }`}
                        >
                          {item.ok ? 'Ready' : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <SectionCard
              eyebrow="Preference Inputs"
              title="Tell the agent what a strong fit looks like"
              body="Keep these values practical and directional. We can tune them later once the jobs ingestion and scoring layers are in place."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Field
                  label="Target Titles"
                  hint="Comma-separated. Example: Lead Data Scientist, Senior Data Scientist, Applied AI Strategist"
                >
                  <input
                    value={formatList(preferences.target_titles)}
                    onChange={e =>
                      setPreferences(prev => ({ ...prev, target_titles: parseList(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="Lead Data Scientist, Senior Data Scientist"
                  />
                </Field>

                <Field
                  label="Target Keywords"
                  hint="These will help the agent identify matching responsibilities and domains."
                >
                  <input
                    value={formatList(preferences.target_keywords)}
                    onChange={e =>
                      setPreferences(prev => ({ ...prev, target_keywords: parseList(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="GenAI, RAG, analytics transformation"
                  />
                </Field>

                <Field
                  label="Exclude Title Keywords"
                  hint="Hard filter for role families you do not want ranked. Example: account executive, sales, recruiter"
                >
                  <input
                    value={formatList(preferences.exclude_title_keywords)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        exclude_title_keywords: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="account executive, sales, recruiter"
                  />
                </Field>

                <Field
                  label="Preferred Locations"
                  hint="Use city names, metro areas, states, or Remote."
                >
                  <input
                    value={formatList(preferences.preferred_locations)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        preferred_locations: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="Remote, Washington, DC, Northern Virginia"
                  />
                </Field>

                <Field label="Remote Preference">
                  <select
                    value={preferences.remote_preference}
                    onChange={e =>
                      setPreferences(prev => ({ ...prev, remote_preference: e.target.value }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
                  >
                    <option value="remote_only">Remote only</option>
                    <option value="remote_or_hybrid">Remote or hybrid</option>
                    <option value="hybrid_only">Hybrid only</option>
                    <option value="open_to_on_site">Open to on-site</option>
                  </select>
                </Field>

                <Field label="Target Seniority" hint="Comma-separated. Example: Senior, Lead, Staff">
                  <input
                    value={formatList(preferences.target_seniority)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        target_seniority: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="Senior, Lead, Staff"
                  />
                </Field>

                <Field label="Salary Floor" hint="Annual base target in USD. Leave blank if flexible.">
                  <input
                    type="number"
                    value={preferences.salary_floor ?? ''}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        salary_floor: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="175000"
                  />
                </Field>

                <Field label="Preferred Industries">
                  <input
                    value={formatList(preferences.preferred_industries)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        preferred_industries: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="AI, Enterprise SaaS, Public Sector"
                  />
                </Field>

                <Field label="Preferred Company Types">
                  <input
                    value={formatList(preferences.preferred_company_types)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        preferred_company_types: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="Growth-stage startup, established technology company"
                  />
                </Field>

                <Field label="Tech Focus Areas">
                  <input
                    value={formatList(preferences.tech_focus_areas)}
                    onChange={e =>
                      setPreferences(prev => ({
                        ...prev,
                        tech_focus_areas: parseList(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                    placeholder="LLM applications, RAG systems, data platforms"
                  />
                </Field>
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <SectionCard
                eyebrow="Additional Signal"
                title="Capture context the ranking agent should respect"
                body="These notes will matter once we move from static preferences to job scoring and briefing."
              >
                <div className="space-y-6">
                  <Field label="Public Sector Interest">
                    <textarea
                      value={preferences.public_sector_interest}
                      onChange={e =>
                        setPreferences(prev => ({
                          ...prev,
                          public_sector_interest: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                      placeholder="Open to federal, consulting, or public-sector adjacent roles if the mission and remit are strong."
                    />
                  </Field>

                  <Field label="Work Authorization Notes">
                    <textarea
                      value={preferences.work_authorization_notes}
                      onChange={e =>
                        setPreferences(prev => ({
                          ...prev,
                          work_authorization_notes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                      placeholder="Optional notes for future filtering or outreach context."
                    />
                  </Field>

                  <Field label="Avoid Keywords">
                    <input
                      value={formatList(preferences.avoid_keywords)}
                      onChange={e =>
                        setPreferences(prev => ({ ...prev, avoid_keywords: parseList(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/35 focus:border-primary/50 focus:outline-none"
                      placeholder="on-site only, junior, commission-only"
                    />
                  </Field>

                  <label className="flex items-start gap-3 rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-4">
                    <input
                      type="checkbox"
                      checked={preferences.stretch_roles_allowed}
                      onChange={e =>
                        setPreferences(prev => ({
                          ...prev,
                          stretch_roles_allowed: e.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-surface-container-high text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-on-surface">
                        Include stretch roles
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-on-surface-variant">
                        Allow the agent to include strong-adjacent roles that may be slightly outside
                        the exact target title but still align with your background.
                      </span>
                    </div>
                  </label>
                </div>
              </SectionCard>

              <SectionCard
                eyebrow="Preview"
                title="What the future morning brief will optimize for"
                body="This is a plain-language preview of the filters and signals the jobs agent will apply once ingestion and scoring are connected."
              >
                <div className="space-y-4">
                  {[
                    `Targeting ${preferences.target_titles.length || 0} core role titles`,
                    `${preferences.remote_preference.replaceAll('_', ' ')} work preference`,
                    `${preferences.preferred_locations.length || 0} preferred locations`,
                    preferences.salary_floor
                      ? `Salary floor of $${preferences.salary_floor.toLocaleString()}`
                      : 'No salary floor set yet',
                    `${preferences.tech_focus_areas.length || 0} technical focus areas`,
                    preferences.stretch_roles_allowed
                      ? 'Stretch roles can appear in the brief'
                      : 'Only direct-fit roles should be included',
                  ].map(item => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/5 bg-surface-container-lowest px-4 py-4"
                    >
                      <p className="text-sm leading-relaxed text-on-surface-variant">{item}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-7 py-4 text-base font-bold text-on-primary transition-all hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                <span className={`material-symbols-outlined text-lg ${saving ? 'animate-spin' : ''}`}>
                  {saving ? 'progress_activity' : 'save'}
                </span>
                {saving ? 'Saving Preferences...' : 'Save Job Preferences'}
              </button>

              {saveMessage && <p className="text-sm text-secondary">{saveMessage}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
