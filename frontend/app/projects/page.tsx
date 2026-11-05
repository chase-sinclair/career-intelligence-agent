'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import ProjectDeepDive from '@/components/ProjectDeepDive'
import { PROJECT_DETAILS } from '@/lib/project-details'

// ── Standalone case-study routes ──────────────────────────────────────────────

/**
 * Slugs that own a full page under `app/projects/<slug>/` instead of opening
 * the ProjectDeepDive overlay. A static segment takes precedence over the
 * `[slug]` catch-all in the App Router, so these pages are authoritative and
 * the catch-all never redirects them back to the overlay. Every other card
 * keeps its existing overlay behavior.
 */
const STANDALONE_ROUTES = new Set(['deallens', 'peai-chat-assistant', 'peai-book-ml-model-matrix'])

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
    title: 'KB Agent',
    descriptor: 'Proposal Intelligence Platform',
    category: 'Agentic RAG',
    categoryTag: 'rag',
    tagline: 'AI research assistant that turns dense proposal repositories into cited, decision-ready answers.',
    stack: ['Python', 'Qdrant', 'Claude Opus', 'FastMCP', 'Slack Bolt SDK', 'MS Graph API'],
    proof: 'Hybrid dense and sparse retrieval with a custom RRF merge, and every answer cites its sources',
    slug: 'kb-agent',
  },
  {
    title: 'RentalShield NYC',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tagline: 'Rental scam screening for Manhattan apartment seekers, with explainable risk scoring.',
    stack: ['Next.js', 'AWS Bedrock', 'Claude 3.5', 'MCP', 'TypeScript'],
    proof: 'Seven service pipeline: multimodal screenshot analysis, rent comparison, broker license checks',
    slug: 'rentalshield-nyc',
  },
  {
    title: 'AI Venture Architect',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    tagline: 'Turns a rough AI product idea into a full market, technical, and opportunity analysis.',
    stack: ['LangGraph', 'FastAPI', 'AWS Bedrock', 'Tavily', 'SSE'],
    proof: 'Clarity gate, parallel analysis agents, and scoring kept deterministic and out of the model',
    slug: 'ai-venture-architect',
  },
  {
    title: 'PEAI Chat Assistant',
    category: 'RAG System',
    categoryTag: 'rag',
    tagline: 'Production RAG chatbot on aioperatingpartners.ai, grounded in proprietary PE content.',
    stack: ['RAG', 'Two-Pass Routing', 'Python', 'Flask', 'Pinecone Assistant'],
    proof: 'Two pass retrieval enforces book first sourcing with page level citations, live for real users',
    slug: 'peai-chat-assistant',
  },
  {
    title: 'DealLens',
    descriptor: 'PE CIM Intelligence Workflow',
    category: 'AI Automation',
    categoryTag: 'automation',
    tagline: 'Automated first-pass CIM intake that turns raw PE deal PDFs into structured records, IC memos, and Slack alerts.',
    stack: ['Zapier', 'OpenAI API', 'Airtable', 'PDF.co', 'Google Drive', 'Slack'],
    proof: 'Three independently triggered Zaps keep deal records, diligence, scoring, and IC memos maintainable',
    slug: 'deallens',
  },
  {
    title: 'ML Model Matrix',
    descriptor: 'The Private Equity AI Operating Partner',
    category: 'Published Work',
    categoryTag: 'published',
    tagline: 'A framework mapping business problems to ML model types, published in The Private Equity AI Operating Partner.',
    stack: ['AI Strategy', 'Framework Design', 'Published 2026'],
    proof: 'Authored the model selection matrix (Appendix 1) and served as a peer reviewer on the book',
    slug: 'peai-book-ml-model-matrix',
  },
  {
    title: 'Career Radar',
    descriptor: 'Labor Market Intelligence',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tagline: 'Ingests real job postings and surfaces structured intelligence on how AI is reshaping roles.',
    stack: ['Next.js', 'Supabase', 'n8n', 'OpenAI', 'TypeScript'],
    proof: 'About 1,000 real postings normalized automatically, with rankings never left to generation',
    slug: 'career-radar',
  },
  {
    title: 'OSS Dependency Risk Agent',
    category: 'AI + Data Eng',
    categoryTag: 'data-eng',
    tagline: 'Scores open source projects daily across seven health signals and writes actionable risk assessments.',
    stack: ['LangGraph', 'Claude Sonnet', 'Databricks', 'Pinecone', 'Next.js'],
    proof: 'Lakehouse pipeline (S3, PySpark, Delta Lake, dbt) feeding a five node agent over 705 repos',
    slug: 'oss-dependency-risk-agent',
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
    // Projects with a standalone case-study route bypass the overlay entirely.
    if (STANDALONE_ROUTES.has(slug)) {
      router.push(`/projects/${slug}`)
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
    if (openSlug && STANDALONE_ROUTES.has(openSlug)) {
      // A hand-written ?open= for a project that owns a real page should land
      // on that page, not a stale overlay copy of it.
      router.replace(`/projects/${openSlug}`)
      return
    }
    if (openSlug && openSlug in PROJECT_DETAILS) {
      window.history.replaceState({}, '', `/projects/${openSlug}`)
      setActiveSlug(openSlug)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true)
        })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
              style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
              Portfolio — 2023–2025
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2"
              style={{ color: 'var(--ink)' }}>
              Technical{' '}
              <span style={{ color: 'var(--accent)' }}>Projects</span>
            </h2>
            <p className="text-base max-w-3xl"
              style={{ color: 'rgba(var(--ink-rgb),0.62)', lineHeight: 1.6 }}>
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
                      ? { background: 'var(--accent)', color: 'var(--accent-ink)', border: '1px solid var(--accent)' }
                      : { background: 'transparent', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),0.24)' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.color = 'var(--accent)'
                      el.style.borderColor = 'rgba(var(--accent-rgb),0.5)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      const el = e.currentTarget
                      el.style.color = 'var(--accent)'
                      el.style.borderColor = 'rgba(var(--accent-rgb),0.24)'
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
