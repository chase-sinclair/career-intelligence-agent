'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ProjectCard, { type ProjectCardProps } from '@/components/ProjectCard'
import ProjectDeepDive from '@/components/ProjectDeepDive'
import FeaturedProject from '@/components/FeaturedProject'
import { PROJECT_DETAILS } from '@/lib/project-details'

// ── Standalone case-study routes ──────────────────────────────────────────────

/**
 * Slugs that own a full page under `app/projects/<slug>/` instead of opening
 * the ProjectDeepDive overlay. A static segment takes precedence over the
 * `[slug]` catch-all in the App Router, so these pages are authoritative and
 * the catch-all never redirects them back to the overlay.
 *
 * As of Session 19 this set covers every card in PROJECTS, so the overlay has
 * no live path into it. That is deliberate, and ProjectDeepDive is kept rather
 * than deleted: it is the fallback for any card added here before its
 * standalone page exists, which is exactly the state each of these eight
 * passed through. A card whose slug is missing from this set still opens a
 * working deep dive from `lib/project-details.ts` instead of doing nothing.
 *
 * `lib/project-details.ts` also remains the content source of record. Each
 * standalone page's data file is derived from its entry there.
 */
const STANDALONE_ROUTES = new Set([
  'deallens',
  'peai-chat-assistant',
  'peai-book-ml-model-matrix',
  'kb-agent',
  'rentalshield-nyc',
  'ai-venture-architect',
  'career-radar',
  'oss-dependency-risk-agent',
])

// ── Tier 1: featured work ─────────────────────────────────────────────────────

interface FeaturedEntry {
  slug: string
  name: string
  descriptor: string
  contextParagraph: string
  statusLabel: string
  statusDot: 'filled' | 'hollow' | 'none'
  ctaLabel: string
  nodes: string[]
}

const FEATURED: FeaturedEntry[] = [
  {
    slug: 'kb-agent',
    name: 'KB Agent',
    descriptor: 'Proposal Intelligence Platform',
    contextParagraph:
      'Proposal teams lose half a day finding what the firm has already written. Retrieval merges a dense vector query and a BM25 style sparse query with Reciprocal Rank Fusion at k=60, implemented in application code after a serialization bug in the vector database client broke its server side fusion path. Drafting is the workflow that earns the architecture: it marks every requirement the corpus cannot support [EVIDENCE MISSING] inline rather than writing around the gap.',
    statusLabel: 'Working prototype',
    statusDot: 'hollow',
    ctaLabel: 'Read the case study',
    nodes: [
      'Folder tree ingestion',
      'Hybrid indexing',
      'RRF merge in app code',
      'MCP tool dispatch',
      'Cited answer in Slack',
    ],
  },
  {
    slug: 'deallens',
    name: 'DealLens',
    descriptor: 'PE CIM Intelligence Workflow',
    contextParagraph:
      'First pass CIM review is manual, repetitive, and structured enough to automate. Three independently triggered workflows keep the system maintainable, and a synthetic validation set across three deal outcomes shows it generalizes without any CIM specific logic.',
    statusLabel: 'Interactive walkthrough',
    statusDot: 'none',
    ctaLabel: 'Walk through the pipeline',
    nodes: [
      'CIM intake trigger',
      'Structured extraction',
      'Airtable records, 5 tables',
      'Diligence and criteria Zaps',
      'IC memo and Slack alert',
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
    category: 'Full-Stack AI',
    tagline: 'Ingests real job postings and surfaces structured intelligence on how AI is reshaping roles.',
    stack: ['Next.js', 'Supabase', 'n8n', 'OpenAI', 'TypeScript'],
    proof: 'About 1,000 real postings normalized automatically, with rankings never left to generation',
    slug: 'career-radar',
  },
  {
    title: 'ML Model Matrix',
    category: 'Published Work',
    linkLabel: 'How the framework works',
    tagline: 'A framework mapping business problems to ML model types, published in The Private Equity AI Operating Partner.',
    stack: ['AI Strategy', 'Framework Design', 'Published 2026'],
    proof: 'Authored the model selection matrix (Appendix 1) and served as a peer reviewer on the book',
    slug: 'peai-book-ml-model-matrix',
  },
]

const ALL_SLUGS = [...FEATURED.map((f) => f.slug), ...SELECTED.map((p) => p.slug)]

// ── Decorative constellation ──────────────────────────────────────────────────

/**
 * Node positions in the SVG's own 360x200 coordinate space, with a per-node
 * radius and ink alpha. Interest comes from size and weight, not hue: a
 * coloured node here would read as a category code with no legend to decode it.
 *
 * `halo` marks the nodes that carry a soft accent wash, matching the breathing
 * halo ConstellationCanvas puts on roughly a fifth of its nodes. Static and
 * decorative, so it is not a code either.
 */
type StarNode = { x: number; y: number; r: number; a: number; halo?: boolean }

const STAR_NODES: StarNode[] = [
  { x: 28, y: 152, r: 3, a: 0.36 },
  { x: 76, y: 94, r: 4.5, a: 0.54, halo: true },
  { x: 138, y: 142, r: 3.5, a: 0.42 },
  { x: 118, y: 40, r: 4, a: 0.46 },
  { x: 196, y: 78, r: 5, a: 0.62, halo: true },
  { x: 186, y: 16, r: 3, a: 0.34 },
  { x: 250, y: 130, r: 4, a: 0.48 },
  { x: 300, y: 56, r: 3.5, a: 0.40 },
  { x: 332, y: 150, r: 4.5, a: 0.52 },
  { x: 266, y: 188, r: 3, a: 0.36 },
]

const STAR_EDGES: Array<[number, number]> = [
  [0, 1], [1, 3], [1, 2], [2, 4], [3, 5], [4, 5],
  [4, 7], [2, 6], [6, 8], [6, 9], [7, 8],
]

/** Six-node reduction for laptop widths, in a 190x120 space. */
const STAR_NODES_SM: StarNode[] = [
  { x: 16, y: 92, r: 2.75, a: 0.36 },
  { x: 58, y: 44, r: 4, a: 0.54, halo: true },
  { x: 104, y: 86, r: 3, a: 0.42 },
  { x: 118, y: 22, r: 3.5, a: 0.44 },
  { x: 160, y: 60, r: 4.25, a: 0.58 },
  { x: 174, y: 106, r: 3, a: 0.38 },
]

const STAR_EDGES_SM: Array<[number, number]> = [
  [0, 1], [1, 3], [1, 2], [2, 4], [3, 4], [2, 5], [4, 5],
]

/**
 * Purely decorative. Two sizes rather than one: the full figure from 1280px
 * up, and a six-node reduction between 1024 and 1279 so a 13-inch laptop,
 * a very common width, still gets the design element. Below 1024 there is
 * genuinely no room beside the copy, so it is hidden.
 *
 * Each wrapper clips its own overflow, so an absolutely positioned child can
 * never widen the scroll container.
 *
 * Node and edge treatment deliberately mirrors ConstellationCanvas, the
 * animated backdrop on /, /about and /knowledge-base, so the site has one
 * visual language for constellations: filled ink nodes at varying weight
 * rather than hollow rings, edges at the canvas's resting opacity, and a soft
 * accent halo on a minority of nodes. This figure stays static because it is a
 * mark in the header corner, not a backdrop.
 */
function Constellation() {
  const shell = (w: number, h: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    right: 0,
    width: w,
    height: h,
    overflow: 'hidden',
    pointerEvents: 'none',
  })

  const figure = (
    nodes: StarNode[],
    edges: Array<[number, number]>,
    w: number,
    h: number,
  ) => (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(var(--ink-rgb),0.26)"
          strokeWidth="0.75"
        />
      ))}
      {/* Halos first, so every node sits on top of its own wash. */}
      {nodes.map((n, i) =>
        n.halo ? (
          <circle
            key={`halo-${i}`}
            cx={n.x}
            cy={n.y}
            r={n.r + 5}
            fill="rgba(var(--accent-rgb),0.075)"
          />
        ) : null,
      )}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={`rgba(var(--ink-rgb),${n.a})`} />
      ))}
    </svg>
  )

  return (
    <>
      {/* 1280px and up */}
      <div aria-hidden="true" className="hidden xl:block" style={shell(360, 200)}>
        {figure(STAR_NODES, STAR_EDGES, 360, 200)}
      </div>
      {/* 1024px to 1279px */}
      <div aria-hidden="true" className="hidden lg:block xl:hidden" style={shell(190, 120)}>
        {figure(STAR_NODES_SM, STAR_EDGES_SM, 190, 120)}
      </div>
    </>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, accent = false }: { label: string; accent?: boolean }) {
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
          <SectionLabel label="Featured Work" accent />

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
                statusDot={f.statusDot}
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
