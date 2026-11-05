'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PROJECT_DETAILS } from '@/lib/project-details'

/**
 * A tier-1 editorial band for the two headline projects on /projects.
 *
 * Deliberately not a card: no border, no shadow, just the faintest wash
 * (`--panel-3`) so it reads as a region of the page rather than an object on
 * it. The tier-2 cards carry the border treatment, and the contrast between
 * the two is what creates the hierarchy this page was missing.
 *
 * Long-form content (summary, stats, tags) is pulled from PROJECT_DETAILS by
 * slug rather than duplicated here, so the band and the deep dive cannot drift
 * apart. Only the page-specific framing is passed in.
 */

/** One step in the "How it runs" panel. */
export interface PipelineNode {
  label: string
  /** A --sk-* token for the ring border. Decorative texture, not a code. */
  color: string
}

export interface FeaturedProjectProps {
  slug: string
  /** Zero-based position, rendered as "01", "02". */
  index: number
  /**
   * Project name on its own. Passed explicitly rather than read from
   * PROJECT_DETAILS, whose `title` still joins name and descriptor with an em
   * dash; rendering that here would both break the no-em-dash rule and repeat
   * the descriptor line directly beneath it.
   */
  name: string
  /** Second line under the project name, in place of an em dash title join. */
  descriptor: string
  /** Page-specific framing paragraph, below the shared summary. */
  contextParagraph: string
  statusLabel: string
  /** Filled dot for a shipped thing, hollow for a prototype. */
  statusFilled: boolean
  ctaLabel: string
  nodes: PipelineNode[]
  onOpen?: (slug: string) => void
}

const GH_PATH =
  'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'

const MONO = 'JetBrains Mono, monospace'

export default function FeaturedProject({
  slug,
  index,
  name,
  descriptor,
  contextParagraph,
  statusLabel,
  statusFilled,
  ctaLabel,
  nodes,
  onOpen,
}: FeaturedProjectProps) {
  const router = useRouter()
  const [ctaHovered, setCtaHovered] = useState(false)
  const [ghHovered, setGhHovered] = useState(false)

  const detail = PROJECT_DETAILS[slug]
  if (!detail) return null

  const stats = detail.stats.slice(0, 2)

  const open = () => (onOpen ? onOpen(slug) : router.push(`/projects/${slug}`))

  return (
    <section
      style={{
        background: 'var(--panel-3)',
        borderRadius: 14,
        padding: '34px 36px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 40,
        alignItems: 'flex-start',
      }}
    >
      {/* ── Left: the argument ───────────────────────────────────────────── */}
      <div style={{ flex: '999 1 540px', minWidth: 0 }}>
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(var(--ink-rgb),0.40)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '5px 11px',
              borderRadius: 20,
              background: 'rgba(var(--accent-rgb),0.10)',
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            {detail.category}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(var(--ink-rgb),0.48)',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: statusFilled ? 'var(--accent)' : 'var(--panel-solid)',
                border: statusFilled ? 'none' : '1.5px solid rgba(var(--ink-rgb),0.38)',
                flexShrink: 0,
              }}
            />
            {statusLabel}
          </span>
        </div>

        {/* Name and descriptor */}
        <h2
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: 'rgba(var(--ink-rgb),0.58)',
            margin: '6px 0 20px',
          }}
        >
          {descriptor}
        </p>

        {/* Shared summary, then page-specific context */}
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.65,
            color: 'rgba(var(--ink-rgb),0.76)',
            maxWidth: '62ch',
            margin: '0 0 14px',
          }}
        >
          {detail.summary}
        </p>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.65,
            color: 'rgba(var(--ink-rgb),0.60)',
            maxWidth: '62ch',
            margin: '0 0 20px',
          }}
        >
          {contextParagraph}
        </p>

        {/* Tech chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
          {detail.tags.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                background: 'rgba(var(--ink-rgb),0.04)',
                color: 'rgba(var(--ink-rgb),0.60)',
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* CTA + source */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={open}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--accent)',
              borderBottom: '1px solid rgba(var(--accent-rgb),0.45)',
              paddingBottom: 2,
              transition: 'gap 0.18s ease',
            }}
          >
            {ctaLabel}
            <span
              aria-hidden="true"
              style={{ transform: ctaHovered ? 'translateX(3px)' : 'none', transition: 'transform 0.18s ease' }}
            >
              &#8594;
            </span>
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseEnter={() => setGhHovered(true)}
            onMouseLeave={() => setGhHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: ghHovered ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.50)',
              transition: 'color 0.18s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={GH_PATH} />
            </svg>
            Source
          </a>
        </div>
      </div>

      {/* ── Right: the evidence ──────────────────────────────────────────── */}
      <div style={{ flex: '1 1 320px', minWidth: 300 }}>
        {/* Two headline stats */}
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'var(--accent)',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(var(--ink-rgb),0.48)',
                  marginTop: 6,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* How it runs */}
        <div style={{ background: 'var(--panel)', borderRadius: 12, padding: '16px 18px' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(var(--ink-rgb),0.42)',
              marginBottom: 14,
            }}
          >
            How it runs
          </div>

          {nodes.map((node, i) => {
            const isLast = i === nodes.length - 1
            return (
              <div key={node.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: isLast ? 'var(--accent)' : 'var(--panel-solid)',
                      border: isLast ? 'none' : `1.5px solid ${node.color}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      color: isLast ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.68)',
                      fontWeight: isLast ? 600 : 400,
                    }}
                  >
                    {node.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 1,
                      height: 12,
                      marginLeft: 4,
                      background: 'rgba(var(--ink-rgb),0.16)',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
