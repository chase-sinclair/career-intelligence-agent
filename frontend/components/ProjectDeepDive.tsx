'use client'

import { useState, useEffect } from 'react'
import { useInView } from '@/hooks/useInView'
import { getProjectDetail, getAdjacentSlugs, type ProjectDetail } from '@/lib/project-details'

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(196,168,130,0.55)' }}>
      {children}
    </p>
  )
}

function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl font-light tracking-[-0.04em] leading-tight ${className}`} style={{ color: '#E2DFD0' }}>
      {children}
    </h2>
  )
}

function Divider() {
  return <div className="my-14 h-px" style={{ background: 'rgba(226,223,208,0.06)' }} />
}

// ── Deep dive content (keyed by slug so useInView resets on navigation) ───────

function DeepDiveContent({
  data,
  allSlugs,
  onNavigate,
}: {
  data: ProjectDetail
  allSlugs: string[]
  onNavigate: (slug: string) => void
}) {
  const { ref: heroRef,    inView: heroIn    } = useInView({ threshold: 0.1 })
  const { ref: problemRef, inView: problemIn } = useInView({ threshold: 0.08 })
  const { ref: solutionRef,inView: solutionIn} = useInView({ threshold: 0.05 })
  const { ref: archRef,    inView: archIn    } = useInView({ threshold: 0.05 })
  const { ref: demoRef,    inView: demoIn    } = useInView({ threshold: 0.2 })
  const { ref: impactRef,  inView: impactIn  } = useInView({ threshold: 0.1 })

  const { prev, next } = getAdjacentSlugs(data.slug, allSlugs)

  return (
    <div className="px-10 pt-10 pb-20 max-w-4xl">

      {/* ── §1 Hero ──────────────────────────────────────────────────────── */}
      <div ref={heroRef}>
        <section
          className={`transition-all duration-700 ease-out ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Category pill + tags */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span
              className="font-mono text-[8px] px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(142,213,255,0.06)',
                border: '0.5px solid rgba(142,213,255,0.18)',
                color: 'rgba(142,213,255,0.65)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {data.category}
            </span>
            {data.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-[8px] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(226,223,208,0.04)',
                  border: '0.5px solid rgba(226,223,208,0.1)',
                  color: 'rgba(226,223,208,0.38)',
                  letterSpacing: '0.06em',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-light tracking-[-0.04em] leading-tight mb-6 max-w-2xl"
            style={{ color: '#E2DFD0' }}
          >
            {data.title}
          </h1>

          {/* Summary */}
          <p className="text-base leading-relaxed max-w-2xl mb-10" style={{ color: 'rgba(226,223,208,0.55)' }}>
            {data.summary}
          </p>

          {/* Stats callouts */}
          <div className="flex gap-12">
            {data.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`transition-all duration-600 ease-out ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: heroIn ? `${300 + i * 120}ms` : '0ms' }}
              >
                <p className="text-3xl font-light mb-1" style={{ color: '#C4A882' }}>
                  {stat.value}
                </p>
                <p
                  className="font-mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: 'rgba(226,223,208,0.35)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Divider />

      {/* ── §2 The Problem ───────────────────────────────────────────────── */}
      <div ref={problemRef}>
        <section>
          <div className={`transition-all duration-600 ease-out ${problemIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Eyebrow>The Problem</Eyebrow>
            <SectionHeading className="mb-6">{data.problem.heading}</SectionHeading>
          </div>
          {data.problem.body.map((para, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed mb-4 max-w-2xl transition-all duration-500 ease-out ${problemIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{
                color: 'rgba(226,223,208,0.45)',
                transitionDelay: problemIn ? `${120 + i * 80}ms` : '0ms',
              }}
            >
              {para}
            </p>
          ))}
        </section>
      </div>

      <Divider />

      {/* ── §3 The Solution ──────────────────────────────────────────────── */}
      <div ref={solutionRef}>
        <section>
          <div className={`transition-all duration-600 ease-out ${solutionIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Eyebrow>The Solution</Eyebrow>
            <SectionHeading className="mb-4">{data.solution.heading}</SectionHeading>
            <p className="text-sm leading-relaxed mb-8 max-w-2xl" style={{ color: 'rgba(226,223,208,0.45)' }}>
              {data.solution.body}
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.solution.features.map((feature, i) => (
              <div
                key={feature.title}
                className={`rounded-xl p-4 transition-all duration-500 ease-out ${solutionIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  background: 'rgba(226,223,208,0.03)',
                  border: '0.5px solid rgba(226,223,208,0.08)',
                  transitionDelay: solutionIn ? `${i * 70}ms` : '0ms',
                }}
              >
                <p
                  className="font-mono text-[8px] tracking-[0.14em] uppercase mb-2"
                  style={{ color: 'rgba(196,168,130,0.6)' }}
                >
                  {feature.title}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.45)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Divider />

      {/* ── §4 Technical Architecture ────────────────────────────────────── */}
      <div ref={archRef}>
        <section>
          <div className={`transition-all duration-600 ease-out ${archIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Eyebrow>Under the Hood</Eyebrow>
            <SectionHeading className="mb-2">{data.architecture.heading}</SectionHeading>
            <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: 'rgba(226,223,208,0.35)' }}>
              Step-by-step breakdown of the technical pipeline.
            </p>
          </div>

          <div className="flex flex-col mb-8">
            {data.architecture.steps.map((step, i) => {
              const isLast = i === data.architecture.steps.length - 1
              return (
                <div
                  key={step.number}
                  className={`flex gap-5 transition-all duration-500 ease-out ${archIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: archIn ? `${i * 100}ms` : '0ms' }}
                >
                  {/* Left rail */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(196,168,130,0.06)',
                        border: '0.5px solid rgba(196,168,130,0.22)',
                      }}
                    >
                      <span className="font-mono text-[9px]" style={{ color: 'rgba(196,168,130,0.65)' }}>
                        {step.number}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className="w-px flex-1 mt-1 min-h-[24px] transition-all duration-700 ease-out"
                        style={{
                          background: 'rgba(196,168,130,0.1)',
                          transformOrigin: 'top',
                          transform: archIn ? 'scaleY(1)' : 'scaleY(0)',
                          transitionDelay: archIn ? `${i * 100 + 200}ms` : '0ms',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                    <p
                      className="text-[12px] font-medium mb-1"
                      style={{ color: 'rgba(226,223,208,0.72)' }}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.38)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stack pills */}
          <div
            className={`flex flex-wrap gap-2 transition-all duration-500 ease-out ${archIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            style={{ transitionDelay: archIn ? '500ms' : '0ms' }}
          >
            {data.architecture.stack.map(tech => (
              <span
                key={tech}
                className="font-mono text-[9px] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(142,213,255,0.05)',
                  border: '0.5px solid rgba(142,213,255,0.14)',
                  color: 'rgba(142,213,255,0.55)',
                  letterSpacing: '0.06em',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </div>

      <Divider />

      {/* ── §5 Demo Video ────────────────────────────────────────────────── */}
      <div ref={demoRef}>
        <section>
          <div className={`transition-all duration-600 ease-out ${demoIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Eyebrow>See It In Action</Eyebrow>
            <SectionHeading className="mb-8">Live Demo</SectionHeading>
          </div>

          <div
            className={`transition-all duration-700 ease-out ${demoIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: demoIn ? '120ms' : '0ms' }}
          >
            <div
              style={{
                aspectRatio: '16 / 9',
                maxWidth: 720,
                border: '1px solid rgba(62,72,79,0.55)',
                borderRadius: 12,
                background: 'rgba(8,9,11,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              {/* Play button */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '1px solid rgba(196,168,130,0.25)',
                  background: 'rgba(196,168,130,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(196,168,130,0.5)">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="font-mono text-[10px]" style={{ color: 'rgba(226,223,208,0.28)' }}>
                Demo video coming soon
              </p>
            </div>
          </div>
        </section>
      </div>

      <Divider />

      {/* ── §6 Impact ────────────────────────────────────────────────────── */}
      <div ref={impactRef}>
        <section>
          <div className={`transition-all duration-600 ease-out ${impactIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Eyebrow>Results</Eyebrow>
          </div>

          {/* Stat callouts */}
          <div className="flex flex-wrap gap-10 mb-10">
            {data.impact.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`transition-all duration-600 ease-out ${impactIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: impactIn ? `${80 + i * 100}ms` : '0ms' }}
              >
                <p className="text-2xl font-light mb-1" style={{ color: '#C4A882' }}>
                  {stat.value}
                </p>
                <p
                  className="font-mono text-[8px] tracking-[0.18em] uppercase"
                  style={{ color: 'rgba(226,223,208,0.32)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Takeaway pull-quote */}
          <div
            className={`border-l-2 pl-5 max-w-2xl transition-all duration-600 ease-out ${impactIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              borderColor: 'rgba(196,168,130,0.4)',
              transitionDelay: impactIn ? '300ms' : '0ms',
            }}
          >
            <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(226,223,208,0.62)' }}>
              {data.impact.takeaway}
            </p>
          </div>
        </section>
      </div>

      {/* ── §7 Prev / Next navigation ────────────────────────────────────── */}
      <div
        className="mt-16 flex justify-between items-center"
        style={{ borderTop: '1px solid rgba(62,72,79,0.35)', paddingTop: '2rem' }}
      >
        {prev ? (
          <button
            onClick={() => onNavigate(prev)}
            className="flex items-center gap-2 text-[11px] transition-colors duration-150"
            style={{ color: 'rgba(226,223,208,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,168,130,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,223,208,0.4)')}
          >
            <span style={{ fontSize: 14 }}>←</span>
            <span>Previous Project</span>
          </button>
        ) : (
          <div />
        )}
        {next ? (
          <button
            onClick={() => onNavigate(next)}
            className="flex items-center gap-2 text-[11px] transition-colors duration-150"
            style={{ color: 'rgba(226,223,208,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,168,130,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,223,208,0.4)')}
          >
            <span>Next Project</span>
            <span style={{ fontSize: 14 }}>→</span>
          </button>
        ) : (
          <div />
        )}
      </div>

    </div>
  )
}

// ── Overlay wrapper ───────────────────────────────────────────────────────────

interface ProjectDeepDiveProps {
  slug: string
  isAnimatingIn: boolean
  onClose: () => void
  allSlugs: string[]
  onNavigate: (slug: string) => void
}

export default function ProjectDeepDive({
  slug,
  isAnimatingIn,
  onClose,
  allSlugs,
  onNavigate,
}: ProjectDeepDiveProps) {
  // Separate display slug so we can fade between projects on navigation
  const [displaySlug, setDisplaySlug] = useState(slug)
  const [contentVisible, setContentVisible] = useState(true)

  useEffect(() => {
    if (slug === displaySlug) return
    setContentVisible(false)
    const t = setTimeout(() => {
      setDisplaySlug(slug)
      setContentVisible(true)
    }, 200)
    return () => clearTimeout(t)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const data = getProjectDetail(displaySlug)
  if (!data) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: '#121315',
        transform: isAnimatingIn ? 'translateY(0)' : 'translateY(100%)',
        transition: isAnimatingIn
          ? 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1)'
          : 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Close bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: '#0d0e10',
          borderBottom: '0.5px solid rgba(62,72,79,0.5)',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[11px] transition-colors duration-150"
          style={{ color: 'rgba(226,223,208,0.45)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,168,130,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,223,208,0.45)')}
        >
          <span style={{ fontSize: 13 }}>←</span>
          <span>Back to Projects</span>
        </button>

        <span className="font-mono text-[9px] tracking-[0.12em]" style={{ color: 'rgba(226,223,208,0.28)' }}>
          {data.title}
        </span>

        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{ color: 'rgba(226,223,208,0.4)', background: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'rgba(226,223,208,0.8)'
            e.currentTarget.style.background = 'rgba(226,223,208,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(226,223,208,0.4)'
            e.currentTarget.style.background = 'transparent'
          }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'auto',
          opacity: contentVisible ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
        className="custom-scrollbar"
      >
        <DeepDiveContent key={displaySlug} data={data} allSlugs={allSlugs} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
