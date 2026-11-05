'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * A tier-2 card on /projects: compact, text only, roughly 210-230px tall.
 *
 * The 220px image well this card used to open with was never filled, so it
 * was 220px of empty panel on every card. It is gone, along with the
 * per-category color map that coded six categories with no legend to read
 * them by. Category labels are now uniformly accent, which is one less thing
 * competing with the two featured bands above.
 */
export interface ProjectCardProps {
  title: string
  /** Second line under the name, in place of an em dash title join. */
  descriptor?: string
  category: string
  tagline: string
  stack: string[]
  /** One line of evidence. Was a two-item bullet list. */
  proof: string
  slug: string
  /** Small chip in the meta row, e.g. "Live". */
  statusLabel?: string
  /** `publication` tints the card and swaps the repo icon for a text link. */
  variant?: 'default' | 'publication'
  /** Text link shown instead of the GitHub icon (publications have no repo). */
  linkLabel?: string
  onOpen?: (slug: string) => void
}

const GH_PATH =
  'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'

const MONO = 'JetBrains Mono, monospace'
const MAX_CHIPS = 3

export default function ProjectCard({
  title,
  descriptor,
  category,
  tagline,
  stack,
  proof,
  slug,
  statusLabel,
  variant = 'default',
  linkLabel,
  onOpen,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)
  const router = useRouter()

  const isPublication = variant === 'publication'
  const visibleChips = stack.slice(0, MAX_CHIPS)
  const overflowCount = stack.length - visibleChips.length

  const restingBorder = isPublication
    ? 'rgba(var(--accent-rgb),0.22)'
    : 'rgba(var(--ink-rgb),0.10)'

  return (
    <div
      style={{ cursor: 'pointer', height: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => (onOpen ? onOpen(slug) : router.push(`/projects/${slug}`))}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '18px 18px 20px',
          background: isPublication ? 'rgba(var(--accent-rgb),0.07)' : 'var(--panel)',
          border: `0.5px solid ${isHovered ? 'rgba(var(--accent-rgb),0.30)' : restingBorder}`,
          borderRadius: 12,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 16px 40px rgba(var(--ink-rgb),0.16)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Meta row: category, optional status, repo icon or text link */}
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

          {!isPublication && (
            <a
              href="#"
              aria-label={`${title} source`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseEnter={() => setLinkHovered(true)}
              onMouseLeave={() => setLinkHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: linkHovered ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.45)',
                textDecoration: 'none',
                transition: 'color 0.18s ease',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={GH_PATH} />
              </svg>
            </a>
          )}
        </div>

        {/* Name and descriptor */}
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
            {title}
          </h3>
          {descriptor && (
            <p style={{ fontSize: 12.5, lineHeight: 1.4, color: 'rgba(var(--ink-rgb),0.52)', margin: '3px 0 0' }}>
              {descriptor}
            </p>
          )}
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
              background: isPublication ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(var(--ink-rgb),0.10)',
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
          {isPublication && linkLabel ? (
            <span
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
              <span
                aria-hidden="true"
                style={{ transform: isHovered ? 'translateX(3px)' : 'none', transition: 'transform 0.18s ease' }}
              >
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
    </div>
  )
}
