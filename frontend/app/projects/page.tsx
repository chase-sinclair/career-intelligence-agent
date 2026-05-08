'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import ProjectDeepDive from '@/components/ProjectDeepDive'
import { PROJECT_DETAILS } from '@/lib/project-details'

// ── Filter definitions ────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'All Projects',  value: 'all' },
  { label: 'RAG System',    value: 'rag' },
  { label: 'Full-Stack AI', value: 'full-stack' },
  { label: 'Multi-Agent',   value: 'multi-agent' },
  { label: 'AI Workflow',   value: 'workflow' },
  { label: 'AI + Data Eng', value: 'data-eng' },
  { label: 'Published',     value: 'published' },
]

// ── Project data ──────────────────────────────────────────────────────────────

const PROJECTS: ProjectCardProps[] = [
  {
    title: 'KB Agent — Proposal Intelligence Platform',
    category: 'Agentic RAG',
    categoryTag: 'rag',
    tagline: 'AI research assistant that turns dense proposal repositories into cited, decision-ready answers.',
    stack: ['RAG', 'Hybrid Search', 'Custom RRF', 'Streamlit', 'Claude 3.5'],
    bullets: [
      'Reduced proposal research from hours to seconds for a live consulting team',
      'Built hybrid dense + sparse retrieval with custom RRF merge and source-grounded responses',
    ],
    slug: 'kb-agent',
    bgImage: '/images/projects/kb-agent.png',
  },
  {
    title: 'RentalShield NYC',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tagline: 'Multimodal risk-scoring pipeline that detects fraudulent NYC rental listings from screenshots and listing data.',
    stack: ['Next.js', 'AWS Bedrock', 'Claude 3.5', 'MCP', 'TypeScript'],
    bullets: [
      'Built a 7-service AI pipeline with real external integrations and production-ready error handling',
      'Uses multimodal Claude via Bedrock to analyze listing screenshots and score scam risk with evidence',
    ],
    slug: 'rentalshield-nyc',
    bgImage: '/images/projects/rentalshield-nyc.jpg',
  },
  {
    title: 'AI Venture Architect',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    tagline: 'Multi-agent system that turns a rough AI product idea into a full market, technical, and opportunity analysis.',
    stack: ['LangGraph', 'FastAPI', 'AWS Bedrock', 'Tavily', 'SSE'],
    bullets: [
      'Parallel market research + architecture agents with a clarification gate for vague inputs',
      'Deterministic opportunity scoring separate from LLM generation for reproducible results',
    ],
    slug: 'ai-venture-architect',
    bgImage: '/images/projects/ai-venture-architect.jpg',
  },
  {
    title: 'PEAI Chat Assistant',
    category: 'RAG System',
    categoryTag: 'rag',
    tagline: 'Deployed RAG chatbot on aioperatingpartners.ai answering questions grounded in proprietary PE content.',
    stack: ['RAG', 'Two-Pass Routing', 'Next.js', 'OpenAI'],
    bullets: [
      'Live in production — two-pass retrieval enforces proprietary content priority over general knowledge',
      "Serves real users on a published book's homepage with source-grounded, cited answers",
    ],
    slug: 'peai-chat-assistant',
    bgImage: '/images/projects/peai-chat-assistant.jpg',
  },
  {
    title: 'DealLens — PE CIM Intelligence Workflow',
    category: 'AI Workflow',
    categoryTag: 'workflow',
    tagline: 'Automated first-pass CIM intake pipeline that turns raw PE deal PDFs into structured deal records, IC memos, and Slack alerts — in minutes.',
    stack: ['OpenAI', 'Zapier', 'Airtable', 'PDF.co', 'Google Docs'],
    bullets: [
      'Reduced first-pass CIM intake from hours of manual analyst work to a fully automated pipeline',
      'Three-Zap separation of concerns: deal records, diligence questions, scoring, and IC memos across 7 Airtable tables',
    ],
    slug: 'deallens',
    bgImage: '/images/projects/deallens.jpg',
  },
  {
    title: 'PEAI Book — ML Model Matrix',
    category: 'Published Work',
    categoryTag: 'published',
    tagline: 'Co-authored chapter in The Private Equity AI Operating Partner mapping business problems to ML model types.',
    stack: ['AI Strategy', 'Framework Design', 'Published 2024'],
    bullets: [
      'Published author — strategic framework used by PE operators to evaluate AI use cases',
      'Authored the AI Model Capability Matrix chapter in a commercially released book',
    ],
    slug: 'peai-book-ml-model-matrix',
    bgImage: '/images/projects/peai-book-ml-model-matrix.jpg',
  },
  {
    title: 'Career Radar — Labor Market Intelligence',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tagline: 'Full-stack app that ingests real job postings and surfaces structured intelligence on how AI is reshaping roles.',
    stack: ['Next.js', 'Supabase', 'n8n', 'OpenAI', 'TypeScript'],
    bullets: [
      'Automated ingestion pipeline processing ~1,000 real postings into normalized market intelligence',
      'AI constrained to summarize deterministic data only — rankings never come from generation',
    ],
    slug: 'career-radar',
    bgImage: '/images/projects/career-radar.jpg',
  },
  {
    title: 'OSS Dependency Risk Agent',
    category: 'AI + Data Engineering',
    categoryTag: 'data-eng',
    tagline: 'Monitors 800+ open-source projects daily, scores them across 7 health signals, and uses a LangGraph agent to write actionable risk assessments.',
    stack: ['LangGraph', 'Claude Sonnet', 'Databricks', 'Pinecone', 'Next.js'],
    bullets: [
      'Monitors 705 actively scored repos across 15 OSS categories with zero manual input',
      'Full lakehouse pipeline (S3 → PySpark → Delta Lake → dbt) feeding a 5-node AI agent with tiered recommendations',
    ],
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
            <p className="text-base max-w-3xl"
              style={{ color: 'rgba(226,223,208,0.5)', lineHeight: 1.6 }}>
              Side projects built to expand my hands-on experience with AI, data, and full-stack tools beyond my day-to-day client work — spanning RAG systems, agentic workflows, and modern AI application stacks.
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
              gap: 16,
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
