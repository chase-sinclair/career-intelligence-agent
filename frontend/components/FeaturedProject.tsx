'use client'

import { useEffect, useRef, useState } from 'react'
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
 *
 * The band's surface, hover, focus ring and the >=1100px layout rules live in
 * the `.projects-index` sheet in `app/projects/page.tsx`, under the `pj-band*`
 * class names used below. They need pseudo-classes and media queries, which an
 * inline style cannot express, and an inline base value would override its own
 * hover rule.
 */

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
  /**
   * Dots on this page mean deployment status and nothing else: filled for
   * live, hollow for a prototype. A chip that says something other than
   * deployment status, such as how to read the page, takes 'none' rather
   * than borrowing a dot that already means something.
   */
  statusDot: 'filled' | 'hollow' | 'none'
  /**
   * Step labels, in order. The last one is the pipeline's endpoint and keeps a
   * bolder label, but it carries no standing colour: every dot, including that
   * one, fills only when the cycle reaches it.
   */
  nodes: string[]
  onOpen?: (slug: string) => void
}

const GH_PATH =
  'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'

const MONO = 'JetBrains Mono, monospace'

// "How it runs" cycle: one step per STEP_MS, hold on the complete pipeline,
// clear, pause, repeat.
const STEP_MS = 620
const HOLD_MS = 1600
const CLEAR_MS = 420
const START_MS = 300

export default function FeaturedProject({
  slug,
  index,
  name,
  descriptor,
  contextParagraph,
  statusLabel,
  statusDot,
  nodes,
  onOpen,
}: FeaturedProjectProps) {
  const router = useRouter()

  const total = nodes.length
  const runsRef = useRef<HTMLDivElement>(null)
  /** How many leading steps are currently marked complete. */
  const [doneCount, setDoneCount] = useState(0)

  useEffect(() => {
    const panel = runsRef.current
    if (!panel) return

    // Reduced motion: show the finished pipeline and never cycle.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDoneCount(total)
      return
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    let i = 0
    let running = false

    const tick = () => {
      if (i < total) {
        i += 1
        setDoneCount(i)
        timer = setTimeout(tick, i === total ? HOLD_MS : STEP_MS)
      } else {
        i = 0
        setDoneCount(0)
        timer = setTimeout(tick, CLEAR_MS)
      }
    }

    const play = () => {
      if (running) return
      running = true
      timer = setTimeout(tick, START_MS)
    }
    // Leaves `i` where it is, so scrolling back resumes rather than restarts.
    const pause = () => {
      running = false
      clearTimeout(timer)
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? play() : pause())),
      { threshold: 0.3 },
    )
    io.observe(panel)

    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [total])

  const detail = PROJECT_DETAILS[slug]
  if (!detail) return null

  const stats = detail.stats.slice(0, 2)

  /**
   * The whole band is a link, so modified clicks have to reach the browser:
   * only a plain left click is intercepted for client-side routing. Everything
   * else (new tab, new window, download) falls through to the real href.
   */
  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (onOpen) onOpen(slug)
    else router.push(`/projects/${slug}`)
  }

  return (
    <section
      className="pj-band"
      style={{
        padding: '28px 30px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 36,
        alignItems: 'flex-start',
      }}
    >
      {/* ── Left: the argument ───────────────────────────────────────────── */}
      {/* Masked per inner block rather than on the <section>: the band is a
          0.35-alpha wash, not an opaque panel, so masking the whole thing
          would tile the canvas and leave the field nothing to draw in. */}
      <div className="pj-band-left" style={{ flex: '1 1 620px', minWidth: 0 }} data-constellation-mask>
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
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
            {statusDot !== 'none' && (
              <span
                aria-hidden="true"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: statusDot === 'filled' ? 'var(--accent)' : 'var(--panel-solid)',
                  border: statusDot === 'filled' ? 'none' : '1.5px solid rgba(var(--ink-rgb),0.38)',
                  flexShrink: 0,
                }}
              />
            )}
            {statusLabel}
          </span>
        </div>

        {/* Name and descriptor. The name carries the band's only anchor. */}
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
          <a className="pj-stretch" href={`/projects/${slug}`} onClick={handleClick}>
            {name}
          </a>
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: 'rgba(var(--ink-rgb),0.58)',
            margin: '5px 0 16px',
          }}
        >
          {descriptor}
        </p>

        {/* Shared summary, then page-specific context */}
        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.6,
            color: 'rgba(var(--ink-rgb),0.76)',
            maxWidth: '92ch',
            margin: '0 0 10px',
          }}
        >
          {detail.summary}
        </p>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'rgba(var(--ink-rgb),0.60)',
            maxWidth: '92ch',
            margin: '0 0 16px',
          }}
        >
          {contextParagraph}
        </p>

        {/* Tech chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
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

        {/* Source link. Sits above the stretched overlay, and at >=1100px this
            row is what absorbs the shorter band's slack. */}
        <div
          className="pj-band-actions"
          style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}
        >
          <a
            className="pj-src"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
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
      {/* minWidth 0 rather than a 300px floor: at 390px the band's inner width
          is narrower than that, and a hard floor overflowed into the wrapper's
          overflowX: hidden, clipping the stats and pipeline silently. */}
      <div className="pj-band-right" style={{ flex: '1 1 380px', minWidth: 0 }}>
        {/* Two headline stats, side by side at every width the pair fits in.
            Below 480px they stack: see the pj-stat-row rule in the page sheet. */}
        <div className="pj-stat-row" style={{ display: 'flex', gap: 28, marginBottom: 20 }} data-constellation-mask>
          {stats.map((s) => (
            <div key={s.label} style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'var(--accent)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  lineHeight: 1.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(var(--ink-rgb),0.48)',
                  marginTop: 6,
                  textWrap: 'pretty',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* How it runs */}
        <div
          ref={runsRef}
          style={{ background: 'var(--panel)', borderRadius: 12, padding: '16px 18px' }}
          data-constellation-mask
        >
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

          {nodes.map((label, i) => {
            const isLast = i === total - 1
            const done = i < doneCount
            return (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'relative',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      flexShrink: 0,
                      // Monochrome until the cycle reaches this step. A hue on
                      // a resting dot would read as a code with no legend; the
                      // only colour here means "the run has got this far".
                      background: done ? 'var(--accent)' : 'var(--panel-solid)',
                      border: `1.5px solid ${done ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.30)'}`,
                      transition: 'background 0.25s ease, border-color 0.25s ease',
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        opacity: done ? 1 : 0,
                        transform: done ? 'scale(1)' : 'scale(0.6)',
                        transition:
                          'opacity 0.22s ease, transform 0.22s cubic-bezier(.34,1.56,.64,1)',
                      }}
                    >
                      <path
                        d="M2.5 6.4 4.8 8.7 9.5 3.6"
                        stroke="var(--accent-ink)"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.4,
                      color: done ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.68)',
                      fontWeight: isLast ? 600 : 400,
                      transition: 'color 0.25s ease',
                    }}
                  >
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 1,
                      height: 10,
                      marginLeft: 7.5,
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
