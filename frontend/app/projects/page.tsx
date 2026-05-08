'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import ProjectDeepDive from '@/components/ProjectDeepDive'
import { PROJECT_DETAILS } from '@/lib/project-details'

// ── Filter definitions ────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'All Projects',   value: 'all' },
  { label: 'RAG System',     value: 'rag' },
  { label: 'Full-Stack AI',  value: 'full-stack' },
  { label: 'Multi-Agent',    value: 'multi-agent' },
  { label: 'AI Automation',  value: 'automation' },
  { label: 'Published',      value: 'published' },
]

// ── Project data ──────────────────────────────────────────────────────────────

const PROJECTS: ProjectCardProps[] = [
  {
    number: '01',
    title: 'KB Agent — Proposal Intelligence Platform',
    category: 'Agentic RAG',
    categoryTag: 'rag',
    badge: '★ Winner',
    description:
      'Production Slack bot that turns a document library into a queryable AI proposal intelligence system — automated ingestion, hybrid dense+sparse search, and six purpose-built LLM analytical workflows for government proposal teams.',
    highlights: [
      'Manual RRF implementation after diagnosing Qdrant client v1.17.1 serialization bug — dense + BM25-style sparse vectors merged via custom formula',
      'Six Claude-powered analytical functions including gap analysis, RFP scoring, proposal narrative drafting with [EVIDENCE MISSING] flags, and thread-aware conversation',
      'Fault-tolerant ingestion with typed quarantine system (LOCKED_FILE, CORRUPT_FILE, TRANSIENT_ERROR) and SHA-256 change detection',
    ],
    tags: ['Python', 'Qdrant', 'Claude Opus', 'FastMCP', 'Slack Bolt SDK', 'MS Graph API'],
    impactLine: 'Hours → seconds for proposal research',
    slug: 'kb-agent',
    bgImage: '/images/projects/kb-agent.png',
  },
  {
    number: '02',
    title: 'RentalShield NYC',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    description:
      'AI-powered rental scam screening for Manhattan apartment seekers — multimodal screenshot analysis, live rent comparison, broker license verification, and explainable risk scoring with ranked contributing factors.',
    highlights: [
      '7-service MCP-style tool orchestration pipeline with independently executable services — listing parser, screenshot AI, address verification, rent comparison, broker lookup',
      'Claude Sonnet 4 via AWS Bedrock for image byte multimodal reasoning over uploaded screenshots',
      'Iteratively calibrated scam scoring across real test cases with careful false-positive handling',
    ],
    tags: ['Next.js 15', 'TypeScript', 'AWS Bedrock', 'Claude Sonnet 4', 'Supabase', 'RentCast API'],
    impactLine: 'Production-ready with real external integrations',
    slug: 'rentalshield-nyc',
    bgImage: '/images/projects/rentalshield-nyc.jpg',
  },
  {
    number: '03',
    title: 'AI Venture Architect',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    description:
      'Multi-agent platform that transforms rough AI product ideas into structured opportunity reports — market analysis, technical architecture, feasibility scoring, and evaluation guidance with a clarification gate and live SSE progress streaming.',
    highlights: [
      'Clarification gate pauses the workflow on low-clarity inputs and routes users through targeted questions before analysis begins',
      'Market research and solution architecture agents run in parallel via asyncio.gather, synthesized by a third agent into a final report',
      'Deterministic scoring utility for uniqueness, feasibility, risk, and confidence — computed separately from LLM generation for reproducible outputs',
    ],
    tags: ['LangGraph', 'FastAPI', 'Next.js', 'AWS Bedrock', 'Tavily', 'Langfuse', 'PostgreSQL'],
    impactLine: 'Eval infrastructure built in from day one',
    slug: 'ai-venture-architect',
    bgImage: '/images/projects/ai-venture-architect.jpg',
  },
  {
    number: '04',
    title: 'PEAI Chat Assistant',
    category: 'RAG System',
    categoryTag: 'rag',
    description:
      'Two-pass source prioritization RAG system for the AI Operating Partners website — enforces proprietary content priority that Pinecone Assistant doesn\'t natively support, with a custom citation framework per source type.',
    highlights: [
      'Pass 1 restricts retrieval to book content via metadata filter; programmatic evaluation layer detects insufficient answers and triggers Pass 2 fallback to broader corpus',
      'Custom citation framework strips Pinecone default markers on fallback answers and applies chapter/page citations on book answers',
      'Flask proxy app built to fully simulate and debug the chatbot before production integration',
    ],
    tags: ['Python', 'Flask', 'Pinecone Assistant', 'RAG', 'Prompt Engineering'],
    impactLine: 'Live on aioperatingpartners.ai',
    slug: 'peai-chat-assistant',
    bgImage: '/images/projects/peai-chat-assistant.jpg',
  },
  {
    number: '05',
    title: 'DealLens — PE CIM Intelligence Workflow',
    category: 'AI Automation',
    categoryTag: 'automation',
    description:
      'Fully automated private equity CIM intake pipeline — PDF upload triggers structured extraction, risk flagging, diligence question generation, IC memo drafting, and Slack alerts, with a polished Airtable deal operating system as the analyst-facing review surface.',
    highlights: [
      'Three-Zap separation of concerns: intake pipeline, diligence builder, and investment criteria scorer operate as independent workflows triggered by Airtable view membership',
      'OpenAI structured JSON extraction with custom schema — generalizes across CIM formats, industries, and deal structures without hardcoded logic, validated across 3 synthetic CIMs',
      'Full loop from PDF upload to structured Airtable record to Slack alert to Google Docs IC memo runs in minutes with zero manual analyst input',
    ],
    tags: ['Zapier', 'OpenAI API', 'Airtable', 'PDF.co', 'Google Drive', 'Slack'],
    impactLine: 'Hours of manual CIM review → fully automated in minutes',
    slug: 'deallens',
    bgImage: '/images/projects/deallens.jpg',
  },
  {
    number: '06',
    title: 'PEAI Book — ML Model Matrix',
    category: 'Published Work',
    categoryTag: 'published',
    badge: 'Published',
    description:
      'Authored the AI Model Capability Matrix chapter in The Private Equity AI Operating Partner — a 12-category framework mapping atomic AI abilities to ML model types and training paradigms for finance and operations professionals.',
    highlights: [
      '12-category Atomic Abilities framework mapping core business problems to AI model types (XGBoost, CNNs, GPT, ARIMA, etc.) and training paradigms',
      'Designed as a decision-support tool first — enabling non-technical PE operators to identify the right modeling approach without ML background',
      'Published practitioner-level strategy guide written for operations leaders making live investment and operational decisions',
    ],
    tags: ['AI Strategy', 'Framework Design', 'Published 2024'],
    impactLine: 'Available at aioperatingpartners.ai/peai-book',
    slug: 'peai-book-ml-model-matrix',
    bgImage: '/images/projects/peai-book-ml-model-matrix.jpg',
  },
  {
    number: '07',
    title: 'Career Radar — Labor Market Intelligence',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    description:
      'Full-stack labor market intelligence app that ingests real job postings, normalizes and enriches them via an n8n automation pipeline, and presents AI-powered insights across seven purpose-built dashboard views — with a grounded OpenAI narrative layer that summarizes deterministic data without inventing facts.',
    highlights: [
      'n8n orchestration pipeline moves postings from raw sources through deduplication, role classification, skill extraction, and Supabase transformation into normalized market evidence',
      'Supabase serves as both the storage and transformation reliability layer — handling deduplication logic, canonical job records, company dictionary mapping, and role family normalization across ~1,000 real postings',
      'OpenAI narrative layer deliberately constrained to summarize deterministic data only — all counts, rankings, and company references come from the structured data layer, never from AI generation',
    ],
    tags: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'n8n', 'OpenAI API', 'SerpAPI'],
    impactLine: '~1,000 real postings → structured labor market intelligence',
    slug: 'career-radar',
    bgImage: '/images/projects/career-radar.jpg',
  },
  {
    number: '08',
    title: 'OSS Dependency Risk Agent',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    description:
      'Daily automated health monitoring pipeline for 800+ open-source dependencies — GitHub Archive ingestion, multi-hop lakehouse transformation, 7-signal composite scoring, and a LangGraph agent powered by Claude Sonnet that synthesizes risk assessments and flags repos for upgrade or replacement.',
    highlights: [
      '7-signal composite health score (commit frequency, issue resolution, PR throughput, contributor diversity, governance, security) with logarithmic normalization across a 48-day rolling Databricks/dbt lakehouse pipeline',
      '5-node LangGraph agent (Monitor → Investigate → Synthesize → Recommend → Deliver) calls Claude Sonnet per flagged repo and indexes AI-written risk assessments into Pinecone for semantic search',
      'Scoring model iterated through multiple data-driven design decisions: PR formula refactored from ratio to log-scale for window stability; bus-factor weight zeroed after identifying 48-day window bias',
    ],
    tags: ['Python', 'LangGraph', 'Claude Sonnet', 'Databricks', 'dbt', 'Pinecone', 'FastAPI', 'Next.js 14'],
    impactLine: '705 repos scored daily — end-to-end automated',
    slug: 'oss-dependency-risk-agent',
    bgImage: '/images/projects/oss-dependency-risk-agent.jpg',
  },
]

const ALL_SLUGS = PROJECTS.map(p => p.slug)

// ── Card animation state ──────────────────────────────────────────────────────

type AnimState = 'visible' | 'exiting' | 'hidden' | 'entering'

function getWrapperStyle(state: AnimState): React.CSSProperties {
  if (state === 'hidden') return { display: 'none' }
  if (state === 'exiting') return {
    opacity: 0,
    transform: 'scale(0.93)',
    transition: 'opacity 250ms ease, transform 250ms ease',
  }
  if (state === 'entering') return {
    opacity: 0,
    transform: 'scale(0.93)',
    transition: 'none',
  }
  return {
    opacity: 1,
    transform: 'scale(1)',
    transition: 'opacity 300ms ease, transform 300ms ease',
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('all')
  const [cardStates, setCardStates] = useState<Record<string, AnimState>>(
    () => Object.fromEntries(PROJECTS.map(p => [p.slug, 'visible' as AnimState]))
  )

  // Overlay state
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)

  const openOverlay = useCallback((slug: string) => {
    if (slug === 'deallens') {
      router.push('/projects/deallens')
      return
    }
    if (!(slug in PROJECT_DETAILS)) return
    setActiveSlug(slug)
    window.history.pushState({}, '', `/projects/${slug}`)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimatingIn(true)
      })
    })
  }, [router])

  const closeOverlay = useCallback(() => {
    setIsAnimatingIn(false)
    window.history.pushState({}, '', '/projects')
    setTimeout(() => setActiveSlug(null), 340)
  }, [])

  const handleNavigate = useCallback((slug: string) => {
    setActiveSlug(slug)
    window.history.replaceState({}, '', `/projects/${slug}`)
  }, [])

  // Auto-open overlay if URL contains ?open=<slug> (set by [slug]/page.tsx redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const openSlug = params.get('open')
    if (openSlug && openSlug in PROJECT_DETAILS) {
      window.history.replaceState({}, '', `/projects/${openSlug}`)
      setActiveSlug(openSlug)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true)
        })
      })
    }
  }, [])

  // Close overlay on browser back button
  useEffect(() => {
    function onPopState() {
      if (activeSlug) {
        setIsAnimatingIn(false)
        setTimeout(() => setActiveSlug(null), 340)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [activeSlug])

  function handleFilter(newFilter: string) {
    if (newFilter === activeFilter) return
    setActiveFilter(newFilter)

    const toHide = PROJECTS
      .filter(p => newFilter !== 'all' && p.categoryTag !== newFilter)
      .filter(p => cardStates[p.slug] === 'visible')
      .map(p => p.slug)

    const toShow = PROJECTS
      .filter(p => newFilter === 'all' || p.categoryTag === newFilter)
      .filter(p => cardStates[p.slug] === 'hidden')
      .map(p => p.slug)

    if (toHide.length > 0) {
      setCardStates(prev => {
        const next = { ...prev }
        toHide.forEach(slug => { next[slug] = 'exiting' })
        return next
      })
    }

    setTimeout(() => {
      setCardStates(prev => {
        const next = { ...prev }
        toHide.forEach(slug => { next[slug] = 'hidden' })
        toShow.forEach(slug => { next[slug] = 'entering' })
        return next
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCardStates(prev => {
            const next = { ...prev }
            toShow.forEach(slug => { next[slug] = 'visible' })
            return next
          })
        })
      })
    }, 280)
  }

  return (
    <>
      <TopNav subtitle="Technical Projects" />

      {/* Background content — dims and scales when overlay opens */}
      <main
        className="pl-5 h-screen overflow-y-auto custom-scrollbar"
        style={{
          transform: isAnimatingIn ? 'scale(0.97)' : 'scale(1)',
          opacity: isAnimatingIn ? 0.4 : 1,
          transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1), opacity 400ms cubic-bezier(0.32, 0.72, 0, 1)',
          transformOrigin: 'top center',
          pointerEvents: activeSlug ? 'none' : 'auto',
        }}
      >
        <div className="pt-24 px-10 pb-10">

          {/* Page header */}
          <header className="mb-8">
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
              style={{ color: 'rgba(226,223,208,0.22)' }}>
              Portfolio — 2023–2025
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2"
              style={{ color: '#e3e2e5' }}>
              Technical{' '}
              <span style={{ color: '#C4A882' }}>Projects</span>
            </h2>
            <p className="text-base max-w-2xl font-body"
              style={{ color: 'rgba(226,223,208,0.45)' }}>
              A curated selection of high-impact AI and data science initiatives.
            </p>
          </header>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            {FILTERS.map(f => {
              const isActive = f.value === activeFilter
              return (
                <button
                  key={f.value}
                  onClick={() => handleFilter(f.value)}
                  className="font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full transition-colors duration-150"
                  style={
                    isActive
                      ? { background: '#C4A882', color: '#0d0e10', border: '1px solid #C4A882' }
                      : { background: 'transparent', color: 'rgba(196,168,130,0.45)', border: '1px solid rgba(196,168,130,0.2)' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.color = '#C4A882'
                      el.style.borderColor = 'rgba(196,168,130,0.5)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.color = 'rgba(196,168,130,0.45)'
                      el.style.borderColor = 'rgba(196,168,130,0.2)'
                    }
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Project grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {PROJECTS.map(project => (
              <div key={project.slug} style={getWrapperStyle(cardStates[project.slug])}>
                <ProjectCard {...project} onOpen={openOverlay} />
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Overlay */}
      {activeSlug && (
        <ProjectDeepDive
          slug={activeSlug}
          isAnimatingIn={isAnimatingIn}
          onClose={closeOverlay}
          allSlugs={ALL_SLUGS}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}
