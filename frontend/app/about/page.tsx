'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TopNav from '@/components/TopNav'
import GlassCard from '@/components/GlassCard'
import { getProfile } from '@/lib/api'
import type { CandidateProfile } from '@/lib/types'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const viewport = { once: true, margin: '-80px' }

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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
const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

// ── Hard-coded career data ─────────────────────────────────────────────────────

const BAH_PROMOTIONS = [
  { title: 'Associate / Data Scientist 3', period: '2025 — Present', current: true },
  { title: 'Associate / Data Scientist 2', period: '2024 — 2025' },
  { title: 'Associate / Data Scientist 1', period: '2023 — 2024' },
  { title: 'Senior Consultant', period: '2022 — 2023' },
  { title: 'Consultant', period: 'Mar 2022 — 2022' },
]

const BAH_ENGAGEMENTS = [
  {
    project: 'DisasterAssistance.gov',
    client: 'DHS / FEMA',
    role: 'Metrics Lead',
    bullets: [
      'Platform serves up to 20M annual users and 80M annual site visits; sole Metrics Lead on the engagement',
      'Defined and automated 100+ daily KPI measurement fields, giving senior government executives real-time analytics visibility during emergency response windows',
      'Deployed a production-grade internal RAG chatbot trained on live website metrics data — currently in active use, eliminating hours of manual data collection per week',
      'Directly managed one data scientist; coordinated across a ~30-person cross-disciplinary project team and 6–8 DHS/FEMA stakeholders',
    ],
  },
  {
    project: 'Grants Data Modernization',
    client: 'DOL Office of Apprenticeship',
    role: 'Data Scientist',
    bullets: [
      'Directed migration of grant data from Excel-based workflows to AWS and Snowflake via a 3-layer ETL pipeline',
      'Reduced data pipeline runtime from hours to minutes, eliminating recurring manual ingestion and cleaning',
      'Delivered 20+ real-time Tableau dashboards; led weekly strategy sessions with the Director to accelerate program-level decision-making',
      'Operated within a ~20-person team (3 data scientists, 5 data engineers, 5 analysts) alongside 5 DOL stakeholders',
    ],
  },
  {
    project: 'Internal Projects & Business Development',
    client: 'Booz Allen Hamilton',
    role: 'Contributor & Proposal Lead',
    bullets: [
      'OptiFleet 2.0: Lead PM for a 6-intern Summer Games cohort building an AI-enabled vehicle recommendation prototype evaluated for direct government contract implementation',
      'GenAI Consumer Recall Detection: Developed an agentic recall detection system (internal hackathon)',
      'Contributed to 7 proposal efforts, leading major sections of 3 — including full past-performance workstreams — helping secure contracts valued at $10M+',
    ],
  },
]

const INTERNSHIPS = [
  {
    company: 'Lockheed Martin',
    location: 'Bethesda, MD',
    title: 'Data Scientist Intern',
    period: 'May – Aug 2021',
    description:
      'NLP & topic modeling on large document corpora. Built semantic search improvements via k-means clustering, topic modeling, and Top2Vec. Developed session log analysis to identify user data retrieval failures.',
    tags: ['NLP', 'Top2Vec', 'k-means', 'Python'],
  },
  {
    company: 'R42 Group',
    location: 'Palo Alto, CA',
    title: 'AI Intern',
    period: 'Jun – Sep 2020',
    description:
      'Venture capital-adjacent AI environment. Enhanced an AI-based stock market predictive model with a volatility-optimized algorithmic overlay to improve downside risk management and expected return.',
    tags: ['Quant Finance', 'Python', 'AI'],
  },
  {
    company: 'EmPowerYu',
    location: 'Palo Alto, CA',
    title: 'Data Analytics Intern',
    period: 'May – Nov 2020',
    description:
      'Evaluated sensor event stability and reliability for a smart home IoT platform. Built anomaly detection pipelines to pinpoint and mitigate errors in sensor data logs.',
    tags: ['Anomaly Detection', 'Python', 'IoT'],
  },
]

const CERT_GROUPS = [
  {
    issuer: 'Anthropic',
    items: [
      'Claude 101',
      'Claude Code in Action',
      'Building with the Claude API',
      'Introduction to Model Context Protocol',
      'Claude with Amazon Bedrock',
    ],
  },
  {
    issuer: 'AWS',
    items: ['AWS Certified AI Practitioner Professional'],
  },
  {
    issuer: 'Google',
    items: ['Google AI Professional Certificate'],
  },
  {
    issuer: 'IBM',
    items: ['IBM RAG and Agentic AI Professional Certificate'],
  },
  {
    issuer: 'Amazon',
    items: [
      'ML & AI Fundamentals',
      'Generative AI Solutions',
      'Foundation Model Optimization',
      'Responsible AI Practices',
      'Security & Governance for AI',
      'Essentials of Prompt Engineering',
    ],
  },
]

// ── Skill grouping ─────────────────────────────────────────────────────────────

const AI_KW = ['ai', 'llm', 'genai', 'generative', 'rag', 'langchain', 'langgraph', 'vector', 'embed', 'agent', 'prompt', 'model', 'nlp', 'language', 'openai', 'chroma', 'evaluation', 'eval']
const CLOUD_KW = ['aws', 'azure', 'cloud', 'bedrock', 'mlops', 's3', 'snowpipe']
const DATA_KW = ['data', 'sql', 'etl', 'snowflake', 'bigquery', 'pandas', 'scikit', 'analytics', 'pipeline', 'engineering']
const VIZ_KW = ['tableau', 'looker', 'streamlit', 'visualization', 'storytelling', 'dashboard', 'reporting']

function groupSkills(skills: string[], tools: string[]) {
  const ai: string[] = [], cloud: string[] = [], data: string[] = [], viz: string[] = [], other: string[] = []
  for (const s of [...skills, ...tools]) {
    const lower = s.toLowerCase()
    if (AI_KW.some(k => lower.includes(k))) ai.push(s)
    else if (CLOUD_KW.some(k => lower.includes(k))) cloud.push(s)
    else if (DATA_KW.some(k => lower.includes(k))) data.push(s)
    else if (VIZ_KW.some(k => lower.includes(k))) viz.push(s)
    else other.push(s)
  }
  return { ai, cloud, data, viz, other }
}

// ── UI atoms ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8px] tracking-[0.18em] uppercase mb-3" style={{ color: 'rgba(226,223,208,0.28)' }}>
      {children}
    </p>
  )
}

function Tag({ label, gold }: { label: string; gold?: boolean }) {
  return (
    <span
      className="text-[9px] px-2 py-0.5 rounded-full"
      style={{
        background: gold ? 'rgba(196,168,130,0.10)' : 'rgba(226,223,208,0.06)',
        border: gold ? '0.5px solid rgba(196,168,130,0.25)' : '0.5px solid rgba(226,223,208,0.12)',
        color: gold ? 'rgba(196,168,130,0.9)' : 'rgba(226,223,208,0.55)',
      }}
    >
      {label}
    </span>
  )
}

// ── Career Timeline ────────────────────────────────────────────────────────────

function CareerTimeline() {
  return (
    <GlassCard>
      <SectionLabel>Career Timeline</SectionLabel>
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="flex flex-col"
      >

        {/* ── Booz Allen Hamilton (grouped) ────────────────────────────── */}
        <motion.div variants={fadeUp} className="flex gap-5">
          {/* Spine */}
          <div className="flex flex-col items-center w-5 flex-shrink-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 mt-2.5"
              style={{
                background: 'rgba(196,168,130,0.9)',
                boxShadow: '0 0 10px rgba(196,168,130,0.45)',
                border: '1px solid rgba(196,168,130,0.6)',
              }}
            />
            <motion.div
              className="w-px flex-1 mt-2"
              style={{ background: 'linear-gradient(to bottom, rgba(196,168,130,0.3), rgba(196,168,130,0.06) 85%, transparent)' }}
              initial={{ scaleY: 0, transformOrigin: 'top' }}
              whileInView={{ scaleY: 1 }}
              viewport={viewport}
              transition={{ duration: 1.0, delay: 0.4, ease: EASE }}
            />
          </div>

          {/* BAH card */}
          <div className="flex-1 pb-7">
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(196,168,130,0.05)', border: '0.5px solid rgba(196,168,130,0.18)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: 'rgba(196,168,130,0.92)' }}>
                    Booz Allen Hamilton
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'rgba(226,223,208,0.3)' }}>
                    McLean, VA · Management & Technology Consulting
                  </p>
                </div>
                <span className="text-[9px] tabular-nums flex-shrink-0 ml-3" style={{ color: 'rgba(196,168,130,0.4)' }}>
                  Mar 2022 — Present
                </span>
              </div>

              {/* Promotion ladder */}
              <div className="relative pl-4 mb-4">
                <div className="absolute left-[5px] top-0 bottom-0 w-px" style={{ background: 'rgba(196,168,130,0.12)' }} />
                <div className="flex flex-col gap-2">
                  {BAH_PROMOTIONS.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 relative">
                      <div
                        className="absolute left-[-11px] w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: p.current ? 'rgba(196,168,130,0.9)' : 'rgba(196,168,130,0.28)',
                          boxShadow: p.current ? '0 0 6px rgba(196,168,130,0.5)' : 'none',
                        }}
                      />
                      <span
                        className="text-[10px] flex-1"
                        style={{ color: p.current ? 'rgba(226,223,208,0.85)' : 'rgba(226,223,208,0.4)' }}
                      >
                        {p.title}
                        {p.current && (
                          <span
                            className="ml-2 text-[8px] px-1.5 py-[1px] rounded"
                            style={{
                              background: 'rgba(196,168,130,0.1)',
                              border: '0.5px solid rgba(196,168,130,0.22)',
                              color: 'rgba(196,168,130,0.7)',
                            }}
                          >
                            current
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] tabular-nums" style={{ color: 'rgba(196,168,130,0.28)' }}>
                        {p.period}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Engagements */}
              <div className="flex flex-col gap-4 border-t pt-3.5" style={{ borderColor: 'rgba(196,168,130,0.08)' }}>
                <p className="text-[8px] tracking-[0.16em] uppercase" style={{ color: 'rgba(196,168,130,0.35)' }}>
                  Key Engagements
                </p>
                {BAH_ENGAGEMENTS.map((eng, ei) => (
                  <div key={ei}>
                    {/* Engagement header */}
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-[10px] font-medium flex-shrink-0" style={{ color: 'rgba(226,223,208,0.72)' }}>
                          {eng.project}
                        </span>
                        <span className="text-[8px]" style={{ color: 'rgba(226,223,208,0.22)' }}>·</span>
                        <span className="text-[9px] truncate" style={{ color: 'rgba(226,223,208,0.35)' }}>
                          {eng.client}
                        </span>
                      </div>
                      <span
                        className="text-[8px] px-1.5 py-[1px] rounded flex-shrink-0"
                        style={{
                          background: 'rgba(196,168,130,0.07)',
                          border: '0.5px solid rgba(196,168,130,0.15)',
                          color: 'rgba(196,168,130,0.5)',
                        }}
                      >
                        {eng.role}
                      </span>
                    </div>
                    {/* Bullets */}
                    <div className="flex flex-col gap-1 pl-2">
                      {eng.bullets.map((b, bi) => (
                        <div key={bi} className="flex gap-2 items-start">
                          <span className="text-[8px] mt-[2px] flex-shrink-0" style={{ color: 'rgba(196,168,130,0.22)' }}>—</span>
                          <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.36)' }}>{b}</p>
                        </div>
                      ))}
                    </div>
                    {ei < BAH_ENGAGEMENTS.length - 1 && (
                      <div className="mt-3.5 h-px" style={{ background: 'rgba(226,223,208,0.04)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Internships ──────────────────────────────────────────────── */}
        {INTERNSHIPS.map((intern, i) => (
          <motion.div key={intern.company} variants={fadeUp} className="flex gap-5">
            {/* Spine */}
            <div className="flex flex-col items-center w-5 flex-shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2"
                style={{ background: 'rgba(226,223,208,0.28)', border: '0.5px solid rgba(226,223,208,0.14)' }}
              />
              {i < INTERNSHIPS.length - 1 && (
                <motion.div
                  className="w-px flex-1 mt-1.5"
                  style={{ background: 'linear-gradient(to bottom, rgba(226,223,208,0.1), rgba(226,223,208,0.03) 80%, transparent)' }}
                  initial={{ scaleY: 0, transformOrigin: 'top' }}
                  whileInView={{ scaleY: 1 }}
                  viewport={viewport}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${i < INTERNSHIPS.length - 1 ? 'pb-6' : 'pb-0'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium" style={{ color: 'rgba(226,223,208,0.68)' }}>
                    {intern.company}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'rgba(226,223,208,0.3)' }}>
                    {intern.title} · {intern.location}
                  </p>
                </div>
                <span className="text-[9px] tabular-nums flex-shrink-0 ml-3" style={{ color: 'rgba(226,223,208,0.22)' }}>
                  {intern.period}
                </span>
              </div>
              <p className="text-[9px] leading-relaxed mt-1.5" style={{ color: 'rgba(226,223,208,0.28)' }}>
                {intern.description}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {intern.tags.map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
          </motion.div>
        ))}

      </motion.div>
    </GlassCard>
  )
}

// ── Loading / Error ────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      <TopNav subtitle="Architect Profile" />
      <main className="pt-24 px-6 pb-10 flex flex-col gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="rounded-xl animate-pulse"
            style={{ height: i === 2 ? 280 : 120, background: 'rgba(226,223,208,0.04)', border: '0.5px solid rgba(226,223,208,0.08)' }}
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

// ── Page ───────────────────────────────────────────────────────────────────────

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

  const grouped = groupSkills(profile.skills, profile.tools)

  const summaryRaw = profile.summary ||
    'Data Scientist with 4+ years building analytics and AI-enabled systems across federal and enterprise environments. Grown into a Lead Data Scientist role at Booz Allen Hamilton, owning data pipelines, dashboards, and applied AI deployments end-to-end across major federal clients.'
  const dotIdx = summaryRaw.indexOf('. ')
  const firstSentence = dotIdx >= 0 ? summaryRaw.slice(0, dotIdx + 1) : summaryRaw
  const restSummary = dotIdx >= 0 ? summaryRaw.slice(dotIdx + 2) : ''

  const exploring =
    (profile as CandidateProfile & { currently_exploring?: string[] }).currently_exploring ??
    ['Multi-agent systems', 'LLM fine-tuning', 'Rust']

  const edu = profile.education[0]
  const eduDegree = edu ? (edu.degree || edu.field_of_study || edu.program || '') : 'B.S. — Computational Modeling & Data Analytics'
  const eduInst = edu ? (edu.institution || edu.school || edu.university || edu.college || '') : 'Virginia Tech · Minor in Statistics'
  const eduYear = edu ? (edu.graduation_year || edu.year || edu.end_year || edu.end_date || '') : '2021'

  return (
    <>
      <TopNav subtitle="Architect Profile" />

      <main className="pt-24 px-6 pb-10 flex flex-col gap-4">

        {/* ── Hero Strip ────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
          <GlassCard accent>
            <div className="flex items-start justify-between gap-6">

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
                    {profile.headline || 'Data Scientist · GenAI Strategy · Analytics Transformation'}
                  </span>
                  <span className="w-px h-3" style={{ background: 'rgba(226,223,208,0.12)' }} />
                  <span className="text-[10px]" style={{ color: 'rgba(226,223,208,0.4)' }}>New York, NY</span>
                  <span className="w-px h-3" style={{ background: 'rgba(226,223,208,0.12)' }} />
                  <a
                    href="https://www.linkedin.com/in/chase-sinclair"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px]"
                    style={{ color: 'rgba(196,168,130,0.6)' }}
                  >
                    LinkedIn
                  </a>
                </div>

                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: 'rgba(180,158,120,0.1)', border: '0.5px solid rgba(180,158,120,0.22)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4A882' }} />
                  <span className="text-[9px] tracking-wide" style={{ color: 'rgba(196,168,130,0.85)' }}>
                    Open to opportunities
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-5 items-center flex-shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>4+</p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>Yrs Full-Time</p>
                </div>
                <span className="w-px h-8" style={{ background: 'rgba(226,223,208,0.07)' }} />
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>5</p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>Promotions</p>
                </div>
                <span className="w-px h-8" style={{ background: 'rgba(226,223,208,0.07)' }} />
                <div className="text-center">
                  <p className="text-2xl font-light leading-none tracking-[-0.02em]" style={{ color: '#E2DFD0' }}>20M</p>
                  <p className="text-[8px] uppercase tracking-[0.1em] mt-1" style={{ color: 'rgba(226,223,208,0.3)' }}>Users Served</p>
                </div>
              </div>

            </div>
          </GlassCard>
        </motion.div>

        {/* ── Career Summary ────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
          <GlassCard>
            <SectionLabel>Career Summary</SectionLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,223,208,0.55)' }}>
              <strong style={{ color: 'rgba(226,223,208,0.82)', fontWeight: 500 }}>{firstSentence}</strong>
              {restSummary && <> {restSummary}</>}
            </p>
          </GlassCard>
        </motion.div>

        {/* ── Career Timeline ───────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
          <CareerTimeline />
        </motion.div>

        {/* ── Skills + Education ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={viewport}>
            <GlassCard className="h-full">
              <SectionLabel>Skills</SectionLabel>

              {grouped.ai.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    AI / GenAI
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.ai.map(s => <Tag key={s} label={s} gold />)}
                  </div>
                </>
              )}

              {grouped.data.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Data Engineering
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.data.map(s => <Tag key={s} label={s} />)}
                  </div>
                </>
              )}

              {grouped.cloud.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Cloud / MLOps
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.cloud.map(s => <Tag key={s} label={s} />)}
                  </div>
                </>
              )}

              {grouped.viz.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Visualization
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grouped.viz.map(s => <Tag key={s} label={s} />)}
                  </div>
                </>
              )}

              {grouped.other.length > 0 && (
                <>
                  <p className="text-[8px] tracking-[0.12em] uppercase mt-3 mb-1.5" style={{ color: 'rgba(226,223,208,0.22)' }}>
                    Leadership
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {grouped.other.map(s => <Tag key={s} label={s} />)}
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>

          <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={viewport}>
            <GlassCard className="h-full">
              <SectionLabel>Education</SectionLabel>
              <p className="text-sm font-medium" style={{ color: 'rgba(226,223,208,0.8)' }}>{eduDegree}</p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(226,223,208,0.4)' }}>{eduInst}</p>
              {eduYear && (
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(196,168,130,0.55)' }}>{eduYear}</p>
              )}

              <div className="border-t mt-4 pt-4" style={{ borderColor: 'rgba(226,223,208,0.06)' }}>
                <SectionLabel>Currently Exploring</SectionLabel>
                <div className="flex flex-wrap gap-1">
                  {exploring.map(t => <Tag key={t} label={t} gold />)}
                </div>
              </div>
            </GlassCard>
          </motion.div>

        </div>

        {/* ── Certifications ────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
          <GlassCard>
            <SectionLabel>Certifications</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              {CERT_GROUPS.map(group => (
                <div key={group.issuer}>
                  <p
                    className="text-[9px] font-medium tracking-[0.1em] uppercase mb-1.5"
                    style={{ color: 'rgba(196,168,130,0.6)' }}
                  >
                    {group.issuer}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.items.map(item => (
                      <p key={item} className="text-[9px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.38)' }}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

      </main>
    </>
  )
}
