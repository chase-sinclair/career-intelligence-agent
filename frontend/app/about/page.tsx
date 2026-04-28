'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TopNav from '@/components/TopNav'
import GlassCard from '@/components/GlassCard'
import { getProfile } from '@/lib/api'
import type { CandidateProfile } from '@/lib/types'

// ── Animation variants ────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const slideLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
}

const slideRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
}

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.12 } },
}

const viewport = { once: true, margin: '-80px' }

// ── Skill grouping ────────────────────────────────────────────────────────────

const AI_KEYWORDS = ['langchain', 'langgraph', 'rag', 'llm', 'openai', 'chroma', 'embedding', 'eval', 'agent', 'gpt']
const BACKEND_KEYWORDS = ['python', 'fastapi', 'postgres', 'redis', 'sql', 'django', 'flask']
const FRONTEND_KEYWORDS = ['next', 'react', 'typescript', 'tailwind', 'javascript']

function groupSkills(skills: string[]) {
  const ai: string[] = []
  const backend: string[] = []
  const frontend: string[] = []
  const other: string[] = []

  for (const skill of skills) {
    const s = skill.toLowerCase()
    if (AI_KEYWORDS.some(k => s.includes(k))) ai.push(skill)
    else if (BACKEND_KEYWORDS.some(k => s.includes(k))) backend.push(skill)
    else if (FRONTEND_KEYWORDS.some(k => s.includes(k))) frontend.push(skill)
    else other.push(skill)
  }

  return { ai, backend, frontend, other }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] tracking-[0.18em] uppercase mb-3"
       style={{ color: 'rgba(226,223,208,0.28)' }}>
      {children}
    </p>
  )
}

function SkillTag({ label, gold }: { label: string; gold?: boolean }) {
  if (gold) {
    return (
      <span
        className="text-[9px] px-2 py-0.5 rounded-full"
        style={{
          background: 'rgba(196,168,130,0.10)',
          border: '0.5px solid rgba(196,168,130,0.25)',
          color: 'rgba(196,168,130,0.9)',
        }}
      >
        {label}
      </span>
    )
  }
  return (
    <span
      className="text-[9px] px-2 py-0.5 rounded-full"
      style={{
        background: 'rgba(226,223,208,0.06)',
        border: '0.5px solid rgba(226,223,208,0.12)',
        color: 'rgba(226,223,208,0.55)',
      }}
    >
      {label}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <>
      <TopNav subtitle="Architect Profile" />
      <main className="pt-24 px-6 pb-10 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded-xl h-32 animate-pulse"
            style={{ background: 'rgba(226,223,208,0.04)', border: '0.5px solid rgba(226,223,208,0.08)' }}
          />
        ))}
      </main>
    </>
  )
}

function ErrorState() {
  return (
    <>
      <TopNav subtitle="Architect Profile" />
      <main className="pt-24 px-6 pb-10">
        <p className="text-sm" style={{ color: 'rgba(226,223,208,0.4)' }}>
          Could not load profile. Make sure the backend is running.
        </p>
      </main>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (error || !profile) return <ErrorState />

  const grouped = groupSkills([...profile.skills, ...profile.tools])

  const summaryFallback =
    'I build AI systems that turn unstructured knowledge into reliable, production-grade intelligence. Over eight years I\'ve moved from backend engineering into the LLM era — designing RAG pipelines, agentic workflows, and evaluation frameworks that actually ship. My work sits at the intersection of software architecture and applied AI: I care as much about latency and observability as I do about prompt design. I\'m looking for a senior role where AI is the core product, not a feature bolt-on.'

  const summaryRaw = profile.summary || summaryFallback
  const dotIdx = summaryRaw.indexOf('. ')
  const firstSentence = dotIdx >= 0 ? summaryRaw.slice(0, dotIdx + 1) : summaryRaw
  const restSummary = dotIdx >= 0 ? summaryRaw.slice(dotIdx + 2) : ''

  const exploringFallback = ['Multi-agent systems', 'LLM fine-tuning', 'Rust']
  const exploring = (profile as CandidateProfile & { currently_exploring?: string[] }).currently_exploring ?? exploringFallback

  const yrsExp = profile.experience.length
    ? String(new Date().getFullYear() - parseInt(profile.experience[profile.experience.length - 1].start_date?.slice(0, 4) || '2016'))
    : '8'

  return (
    <>
      <TopNav subtitle="Architect Profile" />

      <main className="pt-24 px-6 pb-10 flex flex-col gap-4">

        {/* ── Section 1: Hero Strip ───────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
          <GlassCard accent>
            <div className="flex items-start justify-between gap-6">

              {/* Left */}
              <div>
                <h1
                  className="text-4xl md:text-5xl font-light tracking-[-0.03em] leading-none"
                  style={{ color: '#E2DFD0' }}
                >
                  Chase{' '}
                  <em className="font-serif not-italic" style={{ color: '#C4A882' }}>Sinclair</em>
                </h1>

                <div className="flex gap-3 mt-2 flex-wrap items-center">
                  <span className="text-[10px]" style={{ color: 'rgba(226,223,208,0.4)' }}>
                    {profile.headline || 'AI Systems Architect'}
                  </span>
                  <span className="w-px h-3" style={{ background: 'rgba(226,223,208,0.12)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(226,223,208,0.4)' }}>
                    Remote
                  </span>
                  <span className="w-px h-3" style={{ background: 'rgba(226,223,208,0.12)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(226,223,208,0.4)' }}>
                    github.com/chase
                  </span>
                </div>

                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(180,158,120,0.1)',
                    border: '0.5px solid rgba(180,158,120,0.22)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4A882' }} />
                  <span className="text-[9px] tracking-wide" style={{ color: 'rgba(196,168,130,0.85)' }}>
                    Open to opportunities
                  </span>
                </div>
              </div>

              {/* Right: stats */}
              <div className="flex gap-5 items-center flex-shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>
                    {yrsExp}+
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>
                    Years
                  </p>
                </div>
                <span className="w-px h-8" style={{ background: 'rgba(226,223,208,0.07)' }} />
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>
                    {profile.projects.length || '—'}
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>
                    Projects
                  </p>
                </div>
                <span className="w-px h-8" style={{ background: 'rgba(226,223,208,0.07)' }} />
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>
                    {new Set(profile.experience.map(e => e.company)).size || '—'}
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>
                    Companies
                  </p>
                </div>
              </div>

            </div>
          </GlassCard>
        </motion.div>

        {/* ── Section 2: Career Summary ───────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          custom={0.1}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <SectionLabel>Career Summary</SectionLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,223,208,0.55)' }}>
              <strong style={{ color: 'rgba(226,223,208,0.82)', fontWeight: 500 }}>{firstSentence}</strong>
              {restSummary && <> {restSummary}</>}
            </p>
          </GlassCard>
        </motion.div>

        {/* ── Section 3: Skills + Education ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Skills */}
          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={viewport}>
            <GlassCard className="h-full">
              <SectionLabel>Skills</SectionLabel>

              {grouped.ai.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    AI / LLM
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.ai.map(s => <SkillTag key={s} label={s} gold />)}
                  </div>
                </>
              )}

              {grouped.backend.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Backend
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.backend.map(s => <SkillTag key={s} label={s} />)}
                  </div>
                </>
              )}

              {grouped.frontend.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Frontend
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.frontend.map(s => <SkillTag key={s} label={s} />)}
                  </div>
                </>
              )}

              {grouped.other.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Other
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {grouped.other.map(s => <SkillTag key={s} label={s} />)}
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>

          {/* Education */}
          <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={viewport}>
            <GlassCard className="h-full">
              <SectionLabel>Education</SectionLabel>

              {profile.education.map((edu, i) => {
                const degree = edu.degree || edu.field_of_study || edu.program || ''
                const institution = edu.institution || edu.school || edu.university || edu.college || ''
                const year = edu.graduation_year || edu.year || edu.end_year || edu.end_date || ''
                return (
                  <div key={i}>
                    {i > 0 && (
                      <div className="border-t mt-4 pt-4" style={{ borderColor: 'rgba(226,223,208,0.06)' }} />
                    )}
                    <p className="text-sm font-medium" style={{ color: 'rgba(226,223,208,0.8)' }}>{degree}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(226,223,208,0.4)' }}>{institution}</p>
                    {year && (
                      <p className="text-[9px] mt-0.5" style={{ color: 'rgba(196,168,130,0.55)' }}>{year}</p>
                    )}
                  </div>
                )
              })}

              {!profile.education.length && (
                <p className="text-[10px]" style={{ color: 'rgba(226,223,208,0.3)' }}>No education data.</p>
              )}

              <div className="border-t mt-4 pt-4" style={{ borderColor: 'rgba(226,223,208,0.06)' }}>
                <SectionLabel>Currently Exploring</SectionLabel>
                <div className="flex flex-wrap gap-1">
                  {exploring.map(tag => <SkillTag key={tag} label={tag} gold />)}
                </div>
              </div>
            </GlassCard>
          </motion.div>

        </div>

        {/* ── Section 4: Experience ───────────────────────────────────────────── */}
        <GlassCard>
          <SectionLabel>Experience</SectionLabel>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
            {profile.experience.map((exp, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex gap-3 py-3"
                style={{
                  borderBottom: i < profile.experience.length - 1
                    ? '1px solid rgba(226,223,208,0.05)'
                    : 'none',
                }}
              >
                {/* Accent bar */}
                <motion.div
                  className="w-0.5 rounded-full flex-shrink-0 self-stretch"
                  style={{
                    minHeight: 40,
                    background: i === 0 ? 'rgba(196,168,130,0.55)' : 'rgba(196,168,130,0.22)',
                    transformOrigin: 'top',
                  }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={viewport}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] font-medium" style={{ color: 'rgba(226,223,208,0.82)' }}>
                      {exp.company}
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(196,168,130,0.55)' }}>
                      {exp.start_date} — {exp.end_date ?? 'Present'}
                    </p>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(226,223,208,0.42)' }}>
                    {exp.title}
                  </p>

                  {(exp.impact_bullets.length > 0 || exp.description) && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      {(exp.impact_bullets.length > 0
                        ? exp.impact_bullets
                        : [exp.description]
                      ).map((bullet, j) => (
                        <div key={j} className="flex gap-2 items-start pl-3 relative">
                          <span
                            className="absolute left-0 text-[9px] leading-relaxed"
                            style={{ color: 'rgba(196,168,130,0.35)' }}
                          >
                            —
                          </span>
                          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.32)' }}>
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {!profile.experience.length && (
              <p className="text-[10px]" style={{ color: 'rgba(226,223,208,0.3)' }}>No experience data.</p>
            )}
          </motion.div>
        </GlassCard>

      </main>
    </>
  )
}
