'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const HOVER_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const RETURN_EASE = 'cubic-bezier(0.445, 0.05, 0.55, 0.95)'

export interface ProjectCardProps {
  number: string
  title: string
  category: string
  categoryTag: string
  description: string
  highlights: string[]
  tags: string[]
  impactLine: string
  badge?: string
  slug: string
  bgImage?: string
  onOpen?: (slug: string) => void
}

export default function ProjectCard({ title, category, description, slug, bgImage, onOpen }: ProjectCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [ease, setEase] = useState(RETURN_EASE)
  const [githubHovered, setGithubHovered] = useState(false)
  const router = useRouter()

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMouseX((e.clientX - rect.left - rect.width / 2) / rect.width)
    setMouseY((e.clientY - rect.top - rect.height / 2) / rect.height)
  }

  function handleMouseEnter() {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    setEase(HOVER_EASE)
    setIsHovered(true)
  }

  function handleMouseLeave() {
    setEase(RETURN_EASE)
    setIsHovered(false)
    resetTimerRef.current = setTimeout(() => {
      setMouseX(0)
      setMouseY(0)
    }, 1000)
  }

  return (
    // card-wrap: perspective container + handlers
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen ? onOpen(slug) : router.push(`/projects/${slug}`)}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d', cursor: 'pointer' }}
    >
      {/* card: subtle 3D tilt surface */}
      <div
        style={{
          height: 280,
          borderRadius: 12,
          position: 'relative',
          overflow: 'hidden',
          transform: `rotateY(${mouseX * 8}deg) rotateX(${mouseY * -8}deg)`,
          transition: `transform 0.4s ${ease}, border-color 0.25s ease, box-shadow 0.25s ease`,
          border: `1px solid ${isHovered ? 'rgba(196,168,130,0.45)' : 'rgba(62,72,79,0.5)'}`,
          boxShadow: `inset rgba(255,255,255,0.08) 0 0 0 1px${isHovered ? ', 0 20px 48px rgba(0,0,0,0.65)' : ''}`,
          background: '#1b1c1e',
        }}
      >
        {/* card-bg: parallax image layer */}
        <div
          style={{
            position: 'absolute',
            inset: '-20px',
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: bgImage ? undefined : 'rgba(36,38,42,0)',
            opacity: isHovered ? 0.65 : 0.4,
            transform: `translateX(${mouseX * -15}px) translateY(${mouseY * -15}px)`,
            transition: `opacity 4s ${HOVER_EASE}, transform 0.4s ${ease}`,
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.92) 100%)',
          }}
        />

        {/* Content overlay — always visible, no transforms */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 14px 14px',
            background: 'rgba(8,9,11,0.82)',
            backdropFilter: 'blur(10px)',
            borderTop: '0.5px solid rgba(226,223,208,0.07)',
            zIndex: 2,
          }}
        >
          {/* Category pill + GitHub icon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8,
                padding: '2px 7px',
                borderRadius: 4,
                background: 'rgba(142,213,255,0.06)',
                border: '0.5px solid rgba(142,213,255,0.14)',
                color: 'rgba(142,213,255,0.6)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {category}
            </span>

            <a
              href="#"
              onClick={e => e.stopPropagation()}
              onMouseEnter={() => setGithubHovered(true)}
              onMouseLeave={() => setGithubHovered(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(226,223,208,0.05)',
                border: `0.5px solid ${githubHovered ? 'rgba(196,168,130,0.5)' : 'rgba(226,223,208,0.12)'}`,
                transition: 'border-color 0.2s ease',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(226,223,208,0.5)">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.3,
              color: isHovered ? '#C4A882' : '#e3e2e5',
              marginBottom: 5,
              transition: `color 0.25s ${HOVER_EASE}`,
            }}
          >
            {title}
          </h3>

          {/* Description — 2-line clamp via Tailwind */}
          <p
            className="line-clamp-2"
            style={{
              fontSize: 11,
              lineHeight: 1.55,
              color: 'rgba(226,223,208,0.4)',
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
