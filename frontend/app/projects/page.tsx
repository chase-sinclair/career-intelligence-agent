'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import ConstellationCanvas from '@/components/ConstellationCanvas'
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
  nodes: string[]
}

const FEATURED: FeaturedEntry[] = [
  {
    slug: 'kb-agent',
    name: 'KB Agent',
    descriptor: 'Slack-Native Proposal Intelligence',
    contextParagraph:
      'Local and OneDrive watchers keep the knowledge base indexed as files change. Hybrid dense and sparse retrieval with custom RRF powers Claude’s MCP-enabled analysis, while version tracking explains document revisions. Unsupported claims are flagged with [EVIDENCE MISSING], and unresolved issues can become assigned Notion tasks after human review.',
    statusLabel: 'Working prototype',
    statusDot: 'hollow',
    nodes: [
      'Watch shared folders',
      'Index document changes',
      'Retrieve and fuse evidence',
      'Claude investigates with MCP',
      'Slack insights · Notion handoff',
    ],
  },
  {
    slug: 'deallens',
    name: 'DealLens',
    descriptor: 'Automated Private Equity Deal Screening',
    contextParagraph:
      'PDF.co extracts document text, while an OpenAI large language model (LLM) uses a defined JSON schema to structure financials, score the opportunity, and flag missing information. Three independently triggered Zapier workflows populate seven linked Airtable tables, generate Google Docs memos and Slack alerts, and create diligence questions and investment criteria. Two custom Airtable interfaces support portfolio-level comparison and individual deal review.',
    statusLabel: 'Working prototype',
    statusDot: 'hollow',
    nodes: [
      'Upload a company-sale PDF to Google Drive',
      'Extract text and structure deal information with AI',
      'Create the connected Airtable deal record',
      'Draft an investment memo and send a Slack alert',
      'Generate tailored questions and investment criteria',
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

// ── Page stylesheet ───────────────────────────────────────────────────────────

/**
 * Scoped under `.projects-index`, the page wrapper, so none of it can reach
 * another route. Everything here is something an inline style cannot express:
 * the stretched-link `::after`, `:hover` / `:focus-within` surfaces, and the
 * two breakpoints.
 *
 * The card and band surfaces (background, border, shadow, transform) live here
 * rather than inline for a specific reason: an inline declaration beats a
 * stylesheet rule at any specificity, so a base value set inline would make
 * its own `:hover` rule dead. Layout and typography stay inline.
 */
const PAGE_CSS = `
/* Container. Here rather than inline so the narrow-viewport padding
   reduction can actually override it. */
.projects-index {
  padding: 88px 28px 40px;
  max-width: 1320px;
  margin: 0 auto;
  overflow-x: hidden;
}
@media (max-width: 767px) {
  .projects-index { padding-left: 20px; padding-right: 20px; }
}

/* Stretched link: one real anchor per project, its ::after covering the whole
   band or card. Keyboard, middle click and ⌘-click all work, and there is no
   nested anchor, so the Source link beside it stays valid and clickable. */
.projects-index .pj-stretch { color: inherit; text-decoration: none; }
.projects-index .pj-stretch:hover { color: inherit; }
.projects-index .pj-stretch:focus { outline: none; }
.projects-index .pj-stretch::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}
/* Above the overlay, so they keep their own click target. */
.projects-index .pj-band-actions,
.projects-index .pj-gh { position: relative; z-index: 2; }

/* The implicit column of the featured grid is an auto-sized track, whose floor is
   the band's min-content width. The stats row is nowrap, so at phone widths
   that floor exceeds the container and the track grows past it, pushing the
   band's right edge under the wrapper's overflow clip. An explicit
   minmax(0, 1fr) track holds the band to the container at every width; above
   about 465px it resolves identically to the auto track. */
.projects-index .pj-featured-stack { grid-template-columns: minmax(0, 1fr); }

/* ── Tier 1 band ─────────────────────────────────────────────────────────── */
.projects-index .pj-band {
  position: relative;
  background: var(--panel-3);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.projects-index .pj-band:hover {
  background: rgba(251, 253, 253, 0.62);
  box-shadow: 0 10px 30px rgba(var(--ink-rgb), 0.07);
}
.projects-index .pj-band:focus-within {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 3px;
}
.projects-index .pj-src {
  color: rgba(var(--ink-rgb), 0.50);
  transition: color 0.18s ease;
}
.projects-index .pj-src:hover { color: var(--accent); }

/* Equal-height bands, and the right column's nudge off the band edge. Gated
   at 1100px: below it the columns stack, where equal rows pad the shorter band
   and an auto left margin would push the stacked column off the left edge. */
@media (min-width: 1100px) {
  .projects-index .pj-featured-stack { grid-auto-rows: 1fr; }
  .projects-index .pj-band { height: 100%; }
  .projects-index .pj-band-left { display: flex; flex-direction: column; }
  .projects-index .pj-band-actions { margin-top: auto; }
  .projects-index .pj-band-right {
    max-width: 520px;
    margin-left: auto;
    margin-right: 14px;
  }
}

/* The two stats stay side by side and never wrap to a second row, which is
   the point of the row. Below 480px the pair physically does not fit: at
   390px the band's content box is 266px and the row's min-content is 363px,
   so "Schema-Driven AI" lost 48px off its right edge to the wrapper's clip.
   Phones stack the stats instead; every width where both fit is unchanged. */
.projects-index .pj-stat-row { flex-wrap: nowrap; }
@media (max-width: 479px) {
  .projects-index .pj-stat-row { flex-wrap: wrap; }
}

/* ── Tier 2 card ─────────────────────────────────────────────────────────── */
.projects-index .pj-card {
  position: relative;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.10);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.projects-index .pj-card:hover,
.projects-index .pj-card:focus-within {
  border-color: rgba(var(--accent-rgb), 0.30);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(var(--ink-rgb), 0.16);
}
.projects-index .pj-card:focus-within {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 3px;
}
.projects-index .pj-gh {
  color: rgba(var(--ink-rgb), 0.45);
  transition: color 0.18s ease;
}
.projects-index .pj-gh:hover { color: var(--accent); }
.projects-index .pj-arrow { transition: transform 0.18s ease; }
.projects-index .pj-card:hover .pj-arrow,
.projects-index .pj-card:focus-within .pj-arrow { transform: translateX(3px); }
`

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
      {/* Live field behind the page, in the Architect Profile configuration.
          `sqrtDensity` is this page's only departure from /about: the two
          stacked bands leave far less open ground than /about's grid, and
          linear scaling by open area reads as empty here. */}
      <ConstellationCanvas
        className="fixed inset-0 w-full h-full"
        enhanced
        quietZoneSelector="[data-quiet-zone]"
        maskSelector="[data-constellation-mask]"
        densityScale={2.3}
        sqrtDensity
      />
      <TopNav subtitle="Technical Projects" />

      {/* Background content — dims and scales when overlay opens */}
      <main
        className="pl-5 h-screen overflow-y-auto custom-scrollbar relative z-10"
        style={{
          transform: isAnimatingIn ? 'scale(0.97)' : 'scale(1)',
          opacity: isAnimatingIn ? 0.4 : 1,
          transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1), opacity 400ms cubic-bezier(0.32, 0.72, 0, 1)',
          transformOrigin: 'top center',
          pointerEvents: activeSlug ? 'none' : 'auto',
        }}
      >
        <div className="projects-index">

          {/* Page header */}
          <header className="mb-10" data-quiet-zone>
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

          <div className="pj-featured-stack" style={{ display: 'grid', gap: 20, marginBottom: 44 }}>
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

      {/* A plain <style> rather than styled-jsx: the sheet is a module
          constant, and styled-jsx only accepts a statically analyzable
          template literal in place. Same approach as /about. */}
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
    </>
  )
}
