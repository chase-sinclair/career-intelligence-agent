'use client'

import { useRouter } from 'next/navigation'

/**
 * A tier-2 card on /projects: compact, text only, roughly 210-230px tall.
 *
 * The 220px image well this card used to open with was never filled, so it
 * was 220px of empty panel on every card. It is gone, along with the
 * per-category color map that coded six categories with no legend to read
 * them by. Category labels are now uniformly accent, which is one less thing
 * competing with the two featured bands above.
 *
 * The card's surface, hover lift, focus ring and the stretched-link overlay
 * live in the `.projects-index` sheet in `app/projects/page.tsx`, under the
 * `pj-card` / `pj-stretch` class names used below. They need pseudo-classes,
 * which an inline style cannot express, and the lift is now driven by
 * `:hover, :focus-within` so keyboard focus looks the same as a cursor.
 */
export interface ProjectCardProps {
  title: string
  category: string
  tagline: string
  stack: string[]
  /** One line of evidence. Was a two-item bullet list. */
  proof: string
  slug: string
  /** Small chip in the meta row, e.g. "Live". */
  statusLabel?: string
  /**
   * Text link shown in place of the GitHub icon, for work with no repo.
   * Its presence is what swaps the two; there is no separate variant, and
   * the card's surface is identical either way. Decorative: the card itself
   * is the link, so this is hidden from assistive technology.
   */
  linkLabel?: string
  onOpen?: (slug: string) => void
}

const GH_PATH =
  'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'

const MONO = 'JetBrains Mono, monospace'
/**
 * Every current card's stack fits in five, so the overflow branch below is
 * dead at today's content. It is kept because it is correct for a future
 * entry with a longer stack. At three, five of six cards carried an identical
 * "+2" that conveyed nothing and read as truncation.
 */
const MAX_CHIPS = 5

export default function ProjectCard({
  title,
  category,
  tagline,
  stack,
  proof,
  slug,
  statusLabel,
  linkLabel,
  onOpen,
}: ProjectCardProps) {
  const router = useRouter()

  const visibleChips = stack.slice(0, MAX_CHIPS)
  const overflowCount = stack.length - visibleChips.length

  /**
   * Only a plain left click is intercepted for client-side routing; ⌘-click,
   * middle click and the rest fall through to the anchor's real href so they
   * open a new tab the way any other link does.
   */
  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (onOpen) onOpen(slug)
    else router.push(`/projects/${slug}`)
  }

  return (
    // Cards are opaque panels, so the whole card is masked out of the
    // constellation field, the way /about masks its sections.
    <div
      className="pj-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '18px 18px 20px',
      }}
      data-constellation-mask
    >
      {/* Meta row: category, optional status, repo icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            {category}
          </span>
          {statusLabel && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 20,
                background: 'rgba(var(--accent-rgb),0.10)',
                color: 'var(--accent)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }}
              />
              {statusLabel}
            </span>
          )}
        </div>

        {!linkLabel && (
          <a
            className="pj-gh"
            href="#"
            aria-label={`${title} source`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={GH_PATH} />
            </svg>
          </a>
        )}
      </div>

      {/* Name — the card's only anchor, stretched over the whole surface */}
      <div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.012em',
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          <a className="pj-stretch" href={`/projects/${slug}`} onClick={handleClick}>
            {title}
          </a>
        </h3>
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(var(--ink-rgb),0.70)', margin: 0 }}>
        {tagline}
      </p>

      {/* Proof line, pushed to the bottom so cards align on a ragged grid */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            height: 1,
            background: 'rgba(var(--ink-rgb),0.10)',
          }}
        />
        <p
          style={{
            position: 'relative',
            paddingLeft: 16,
            fontSize: 12.5,
            lineHeight: 1.5,
            color: 'rgba(var(--ink-rgb),0.65)',
            margin: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{ position: 'absolute', left: 0, top: 0, color: 'var(--accent)', fontWeight: 700 }}
          >
            +
          </span>
          {proof}
        </p>

        {/* Chips, capped, or the publication text link */}
        {linkLabel ? (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {linkLabel}
            <span className="pj-arrow" aria-hidden="true">
              &#8594;
            </span>
          </span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {visibleChips.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  padding: '4px 9px',
                  borderRadius: 6,
                  border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                  background: 'rgba(var(--ink-rgb),0.04)',
                  color: 'rgba(var(--ink-rgb),0.60)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </span>
            ))}
            {overflowCount > 0 && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  padding: '4px 9px',
                  borderRadius: 6,
                  color: 'rgba(var(--ink-rgb),0.45)',
                  whiteSpace: 'nowrap',
                }}
              >
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
