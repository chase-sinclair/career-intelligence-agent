'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/TopNav'
import { getProfile, getAboutContent } from '@/lib/api'
import type { CandidateProfile, AboutContent } from '@/lib/types'

export default function AboutPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProfile(), getAboutContent()])
      .then(([p, a]) => {
        setProfile(p)
        setAbout(a)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <TopNav subtitle="Candidate Profile" />
        <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
          <div className="p-10 flex items-center gap-2 text-on-surface-variant font-mono text-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Loading profile...
          </div>
        </main>
      </>
    )
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Pull a key from an education record with common name variations. */
  function eduField(rec: Record<string, string>, ...keys: string[]): string {
    for (const k of keys) {
      if (rec[k]) return rec[k]
    }
    return ''
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <TopNav subtitle="Candidate Profile" />

      <main className="ml-64 h-screen overflow-y-auto custom-scrollbar">
        <div className="p-10">

          {/* ── Hero Section: Intentional Asymmetry ──────────────────────────── */}
          <section className="grid grid-cols-12 gap-10 mb-16 items-end">
            <div className="col-span-12 lg:col-span-8">
              <h1 className="text-6xl font-black font-headline tracking-tighter text-on-surface mb-2">
                {profile?.name ?? '—'}
              </h1>
              <p className="text-2xl font-light text-primary tracking-tight mb-4">
                {profile?.headline ?? about?.hero_headline ?? '—'}
              </p>
              {about?.about_paragraphs.slice(0, 1).map((para, i) => (
                <p key={i} className="text-on-surface-variant text-sm leading-relaxed mb-6 max-w-2xl">
                  {para}
                </p>
              ))}
              <div className="flex flex-wrap items-center gap-6">
                {/* Location and external links are not available in the API response */}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col items-end">
              <button className="group relative px-8 py-5 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg overflow-hidden transition-all hover:bg-surface-container-highest">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                <div className="relative flex items-center gap-4">
                  <div className="text-right">
                    <span className="block font-bold text-lg">Download Resume</span>
                  </div>
                  <span className="material-symbols-outlined text-3xl group-hover:translate-y-1 transition-transform">
                    download
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* ── Two-Column Layout ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-10">

            {/* ── Left Column: Skills & Education ───────────────────────────── */}
            <div className="col-span-12 lg:col-span-4 space-y-10">

              {/* Skills Grid */}
              <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                  Core Competencies
                </h3>
                <div className="space-y-8">
                  {/* Skills */}
                  {profile && profile.skills.length > 0 && (
                    <div>
                      <span className="block font-mono text-[10px] text-primary uppercase mb-3 tracking-widest">
                        Skills
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface-container-highest rounded-sm font-mono text-xs border border-outline-variant/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {profile && profile.tools.length > 0 && (
                    <div>
                      <span className="block font-mono text-[10px] text-primary uppercase mb-3 tracking-widest">
                        Tools &amp; Platforms
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profile.tools.map((tool, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface-container-highest rounded-sm font-mono text-xs border border-outline-variant/10"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {profile && profile.certifications.length > 0 && (
                    <div>
                      <span className="block font-mono text-[10px] text-primary uppercase mb-3 tracking-widest">
                        Certifications
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface-container-highest rounded-sm font-mono text-xs border border-outline-variant/10"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border-l-2 border-secondary/40">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">school</span>
                  Academic Background
                </h3>
                <div className="space-y-4">
                  {profile?.education.map((edu, i) => {
                    const degree      = eduField(edu, 'degree', 'field_of_study', 'program')
                    const institution = eduField(edu, 'institution', 'school', 'university', 'college')
                    const year        = eduField(edu, 'graduation_year', 'year', 'end_year', 'end_date')
                    const thesis      = eduField(edu, 'thesis', 'dissertation', 'thesis_title')
                    const meta        = [year && `Class of ${year}`, thesis && `Thesis: ${thesis}`]
                      .filter(Boolean)
                      .join(' • ')
                    return (
                      <div key={i}>
                        {i > 0 && <div className="h-[1px] bg-surface-container-highest my-4" />}
                        <p className="font-headline font-bold text-lg text-on-surface">{degree}</p>
                        <p className="text-sm text-secondary font-medium">{institution}</p>
                        {meta && (
                          <p className="font-mono text-[11px] text-on-surface-variant mt-1">{meta}</p>
                        )}
                      </div>
                    )
                  })}
                  {!profile?.education.length && (
                    <p className="font-mono text-[11px] text-on-surface-variant/50">No education data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Column: Experience Timeline ─────────────────────────── */}
            <div className="col-span-12 lg:col-span-8">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">history</span>
                  Professional Timeline
                </h3>
              </div>

              <div className="space-y-6 relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-[1px] bg-surface-container-highest" />

                {profile?.experience.map((exp, i) => (
                  <div key={i} className="relative pl-16 group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-[21px] top-2 w-2.5 h-2.5 rounded-full border-4 border-background z-10 ${
                        i === 0
                          ? 'bg-primary group-hover:scale-125 transition-transform'
                          : 'bg-surface-container-highest group-hover:bg-primary transition-colors'
                      }`}
                    />

                    <div className="bg-surface-container-low p-6 rounded-lg hover:bg-surface-container-high transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold font-headline">{exp.title}</h4>
                          <p className="text-primary font-medium">{exp.company}</p>
                        </div>
                        <span className="font-mono text-[11px] py-1 px-3 bg-surface-container-lowest text-on-surface-variant rounded-full border border-outline-variant/20 shrink-0 ml-4">
                          {exp.start_date} — {exp.end_date ?? 'Present'}
                        </span>
                      </div>

                      <ul className="space-y-3">
                        {exp.impact_bullets.map((bullet, j) => (
                          <li key={j} className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-xs text-primary mt-1">
                              arrow_forward
                            </span>
                            <p className="font-mono text-sm leading-relaxed text-on-surface-variant">
                              {bullet}
                            </p>
                          </li>
                        ))}
                        {exp.impact_bullets.length === 0 && exp.description && (
                          <li className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-xs text-primary mt-1">
                              arrow_forward
                            </span>
                            <p className="font-mono text-sm leading-relaxed text-on-surface-variant">
                              {exp.description}
                            </p>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}

                {!profile?.experience.length && (
                  <p className="font-mono text-[11px] text-on-surface-variant/50 pl-16">
                    No experience data available.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
