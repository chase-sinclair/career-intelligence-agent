'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import ProjectDeepDive from '@/components/ProjectDeepDive'
import FeaturedProject, { type PipelineNode } from '@/components/FeaturedProject'
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

// ── Tier 1: featured work ─────────────────────────────────────────────────────

interface FeaturedEntry {
  slug: string
  name: string
  descriptor: string
  contextParagraph: string
  statusLabel: string
  statusFilled: boolean
  ctaLabel: string
  nodes: PipelineNode[]
}

const FEATURED: FeaturedEntry[] = [
  {
    slug: 'kb-agent',
    name: 'KB Agent',
    descriptor: 'Proposal Intelligence Platform',
    contextParagraph:
      'Proposal teams lose half a day finding what the firm has already written. The retrieval layer runs a hand built Reciprocal Rank Fusion merge, written after diagnosing a serialization bug that broke the client library’s native hybrid path, and every answer cites the documents it came from.',
    statusLabel: 'Working prototype',
    statusFilled: false,
    ctaLabel: 'Read the case study',
    nodes: [
      { label: 'SharePoint ingestion', color: 'var(--sk-data)' },
      { label: 'Hybrid indexing', color: 'var(--sk-ai)' },
      { label: 'Custom RRF merge', color: 'var(--sk-ai)' },
      { label: 'MCP tool dispatch', color: 'var(--sk-platform)' },
      { label: 'Cited answer in Slack', color: 'var(--accent)' },
    ],
  },
  {
    slug: 'deallens',
    name: 'DealLens',
    descriptor: 'PE CIM Intelligence Workflow',
    contextParagraph:
      'First pass CIM review is manual, repetitive, and structured enough to automate. Three independently triggered workflows keep the system maintainable, and a synthetic validation set across three deal outcomes shows it generalizes without any CIM specific logic.',
    statusLabel: 'Interactive walkthrough',
    statusFilled: true,
    ctaLabel: 'Walk through the pipeline',
    nodes: [
      { label: 'CIM intake trigger', color: 'var(--sk-data)' },
      { label: 'Structured extraction', color: 'var(--sk-ai)' },
      { label: 'Airtable records, 5 tables', color: 'var(--sk-viz)' },
      { label: 'Diligence and criteria Zaps', color: 'var(--sk-auto)' },
      { label: 'IC memo and Slack alert', color: 'var(--accent)' },
    ],
  },
]

// ── Tier 2: selected builds, in display order ─────────────────────────────────

const SELECTED: ProjectCardProps[] = [
  {
    title: 'OSS Dependency Risk Agent',
    category: 'AI + Data Eng',
    tagline: 'Scores open source projects daily across seven health signals and writes actionable risk assessments.',
    stack: ['LangGraph', 'Databricks', 'Pinecone', 'Claude Sonnet', 'Next.js'],
    proof: 'Lakehouse pipeline (S3, PySpark, Delta Lake, dbt) feeding a five node agent over 705 repos',
    slug: 'oss-dependency-risk-agent',
  },
  {
    title: 'PEAI Chat Assistant',
    category: 'RAG System',
    statusLabel: 'Live',
    tagline: 'Production RAG chatbot on aioperatingpartners.ai, grounded in proprietary PE content.',
    stack: ['RAG', 'Two-Pass Routing', 'Python', 'Flask', 'Pinecone Assistant'],
    proof: 'Two pass retrieval enforces book first sourcing with page level citations, live for real users',
    slug: 'peai-chat-assistant',
  },
  {
    title: 'RentalShield NYC',
    category: 'Full-Stack AI',
    tagline: 'Rental scam screening for Manhattan apartment seekers, with explainable risk scoring.',
    stack: ['Next.js', 'AWS Bedrock', 'Claude 3.5', 'MCP', 'TypeScript'],
    proof: 'Seven service pipeline: multimodal screenshot analysis, rent comparison, broker license checks',
    slug: 'rentalshield-nyc',
  },
  {
    title: 'AI Venture Architect',
    category: 'Multi-Agent',
    tagline: 'Turns a rough AI product idea into a full market, technical, and opportunity analysis.',
    stack: ['LangGraph', 'FastAPI', 'AWS Bedrock', 'Tavily', 'SSE'],
    proof: 'Clarity gate, parallel analysis agents, and scoring kept deterministic and out of the model',
    slug: 'ai-venture-architect',
  },
  {
    title: 'Career Radar',
    descriptor: 'Labor Market Intelligence',
    category: 'Full-Stack AI',
    tagline: 'Ingests real job postings and surfaces structured intelligence on how AI is reshaping roles.',
    stack: ['Next.js', 'Supabase', 'n8n', 'OpenAI', 'TypeScript'],
    proof: 'About 1,000 real postings normalized automatically, with rankings never left to generation',
    slug: 'career-radar',
  },
  {
    title: 'ML Model Matrix',
    descriptor: 'The Private Equity AI Operating Partner',
    category: 'Published Work',
    variant: 'publication',
    linkLabel: 'How the framework works',
    tagline: 'A framework mapping business problems to ML model types, published in The Private Equity AI Operating Partner.',
    stack: ['AI Strategy', 'Framework Design', 'Published 2026'],
    proof: 'Authored the model selection matrix (Appendix 1) and served as a peer reviewer on the book',
    slug: 'peai-book-ml-model-matrix',
  },
]

const ALL_SLUGS = [...FEATURED.map((f) => f.slug), ...SELECTED.map((p) => p.slug)]

// ── Decorative constellation ──────────────────────────────────────────────────

/** Node positions in the SVG's own 360x200 coordinate space. */
const STAR_NODES: Array<{ x: number; y: number; c: string }> = [
  { x: 28, y: 152, c: 'var(--sk-data)' },
  { x: 76, y: 94, c: 'var(--sk-ai)' },
  { x: 138, y: 142, c: 'var(--sk-auto)' },
  { x: 118, y: 40, c: 'var(--sk-viz)' },
  { x: 196, y: 78, c: 'var(--sk-platform)' },
  { x: 186, y: 16, c: 'var(--sk-ai)' },
  { x: 250, y: 130, c: 'var(--sk-lead)' },
  { x: 300, y: 56, c: 'var(--sk-data)' },
  { x: 332, y: 150, c: 'var(--sk-viz)' },
  { x: 266, y: 188, c: 'var(--sk-platform)' },
]

const STAR_EDGES: Array<[number, number]> = [
  [0, 1], [1, 3], [1, 2], [2, 4], [3, 5], [4, 5],
  [4, 7], [2, 6], [6, 8], [6, 9], [7, 8],
]

/**
 * Purely decorative. Hidden below 1280px so it can never collide with the
 * heading or the intro copy, and the wrapper clips its own overflow so an
 * absolutely positioned child cannot widen the document.
 */
function Constellation() {
  return (
    <div
      aria-hidden="true"
      className="hidden xl:block"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 360,
        height: 200,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg width="360" height="200" viewBox="0 0 360 200" fill="none">
        {STAR_EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={STAR_NODES[a].x}
            y1={STAR_NODES[a].y}
            x2={STAR_NODES[b].x}
            y2={STAR_NODES[b].y}
            stroke="rgba(var(--ink-rgb),0.16)"
            strokeWidth="1"
          />
        ))}
        {STAR_NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="4"
            fill="var(--panel-solid)"
            stroke={n.c}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({
  label,
  caption,
  accent = false,
}: {
  label: string
  caption?: string
  accent?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          color: accent ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.50)',
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: 'rgba(var(--ink-rgb),0.12)' }} />
      {caption && (
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            color: 'rgba(var(--ink-rgb),0.40)',
          }}
        >
          {caption}
        </span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter()

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
        <div className="pt-24 px-6 md:px-10 pb-10" style={{ overflowX: 'hidden' }}>

          {/* Page header */}
          <header className="mb-10" style={{ position: 'relative' }}>
            <Constellation />
            <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-3"
              style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
              Portfolio / 2023 to 2026
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight mb-3"
              style={{ color: 'var(--ink)' }}>
              Technical{' '}
              <span style={{ color: 'var(--accent)' }}>Projects</span>
            </h2>
            <p className="text-base"
              style={{ color: 'rgba(var(--ink-rgb),0.62)', lineHeight: 1.6, maxWidth: '58ch' }}>
              Systems I designed and shipped end to end: retrieval pipelines, multi-agent workflows, and
              production data platforms. Each one solves a real problem for a real user, not a tutorial dataset.
            </p>
          </header>

          {/* ── Tier 1 ────────────────────────────────────────────────────── */}
          <SectionLabel label="Featured Work" caption="Two deep dives" accent />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 44 }}>
            {FEATURED.map((f, i) => (
              <FeaturedProject
                key={f.slug}
                slug={f.slug}
                index={i}
                name={f.name}
                descriptor={f.descriptor}
                contextParagraph={f.contextParagraph}
                statusLabel={f.statusLabel}
                statusFilled={f.statusFilled}
                ctaLabel={f.ctaLabel}
                nodes={f.nodes}
                onOpen={openOverlay}
              />
            ))}
          </div>

          {/* ── Tier 2 ────────────────────────────────────────────────────── */}
          <SectionLabel label="Selected Builds" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 16 }}>
            {SELECTED.map((project) => (
              <ProjectCard key={project.slug} {...project} onOpen={openOverlay} />
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
