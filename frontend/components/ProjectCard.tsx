'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ProjectCardProps {
  title: string
  category: string
  categoryTag: string
  tagline: string
  stack: string[]
  bullets: string[]
  slug: string
  bgImage?: string
  onOpen?: (slug: string) => void
}

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  rag:            { color: '#8ed5ff', bg: 'rgba(142,213,255,0.07)', border: 'rgba(142,213,255,0.22)' },
  'multi-agent':  { color: '#b69cf0', bg: 'rgba(168,140,220,0.08)', border: 'rgba(168,140,220,0.24)' },
  'full-stack':   { color: '#5fd9c6', bg: 'rgba(68,226,205,0.07)',  border: 'rgba(68,226,205,0.22)'  },
  workflow:       { color: '#ffb877', bg: 'rgba(255,165,90,0.08)',  border: 'rgba(255,165,90,0.22)'  },
  'data-eng':     { color: '#5fd9c6', bg: 'rgba(68,226,205,0.07)',  border: 'rgba(68,226,205,0.22)'  },
  published:      { color: '#d6b988', bg: 'rgba(196,168,130,0.10)', border: 'rgba(196,168,130,0.30)' },
}
const DEFAULT_CAT = { color: '#8ed5ff', bg: 'rgba(142,213,255,0.07)', border: 'rgba(142,213,255,0.22)' }

const GH_PATH = 'M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z'

export default function ProjectCard({
  title, category, categoryTag, tagline, stack, bullets, slug, onOpen,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [ghHovered, setGhHovered] = useState(false)
  const router = useRouter()

  const cat = CAT_COLORS[categoryTag] ?? DEFAULT_CAT

  return (
    <div
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen ? onOpen(slug) : router.push(`/projects/${slug}`)}
    >
      <div
        style={{
          background: '#141414',
          border: `0.5px solid ${isHovered ? 'rgba(196,168,130,0.30)' : 'rgba(255,255,255,0.09)'}`,
          borderRadius: 12,
          overflow: 'hidden',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 16px 40px rgba(0,0,0,0.5)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Empty visual zone */}
        <div style={{ height: 220, background: '#0e0e0e' }} />

        {/* Card body */}
        <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Category pill + GitHub button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              border: `0.5px solid ${cat.border}`,
              background: cat.bg,
              color: cat.color,
            }}>
              {category}
            </span>
            <a
              href="#"
              onClick={e => e.stopPropagation()}
              onMouseEnter={() => setGhHovered(true)}
              onMouseLeave={() => setGhHovered(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: ghHovered ? 'rgba(196,168,130,0.05)' : 'transparent',
                border: `0.5px solid ${ghHovered ? 'rgba(196,168,130,0.55)' : 'rgba(226,223,208,0.16)'}`,
                color: ghHovered ? '#C4A882' : 'rgba(226,223,208,0.6)',
                textDecoration: 'none',
                transition: 'border-color 0.18s ease, color 0.18s ease, background 0.18s ease',
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d={GH_PATH} />
              </svg>
            </a>
          </div>

          {/* Title + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#f0ede0',
              margin: 0,
              letterSpacing: '-0.012em',
            }}>
              {title}
            </h3>
            <p style={{
              fontSize: 13.5,
              lineHeight: 1.55,
              color: 'rgba(226,223,208,0.72)',
              margin: 0,
            }}>
              {tagline}
            </p>
          </div>

          {/* Stack tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stack.map(s => (
              <span key={s} style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                border: '0.5px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.015)',
                color: 'rgba(226,223,208,0.55)',
                whiteSpace: 'nowrap',
              }}>
                {s}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Bullets */}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{
                position: 'relative',
                paddingLeft: 18,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: 'rgba(226,223,208,0.65)',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  color: '#c4a882',
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.4,
                }}>›</span>
                {b}
              </li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  )
}
