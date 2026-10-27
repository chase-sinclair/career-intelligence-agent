'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import QueryRewriteScene from './QueryRewriteScene'
import RetrievalScene from './RetrievalScene'
import GateScene from './GateScene'
import GenerationScene from './GenerationScene'
import EvaluationScene from './EvaluationScene'
import { INK, ACCENT, MONO, EASE } from './SceneFrame'

export type PipelineStep = {
  index: string
  title: string
  model: string
  summary: string
  description: string
}

/** Scene for a stage, by position in the graph. */
function StageScene({ i, active }: { i: number; active: boolean }) {
  switch (i) {
    case 0: return <QueryRewriteScene active={active} />
    case 1: return <RetrievalScene active={active} />
    case 2: return <GateScene active={active} />
    case 3: return <GenerationScene active={active} />
    default: return <EvaluationScene active={active} />
  }
}

export default function PipelineSection({ steps }: { steps: readonly PipelineStep[] }) {
  const reduce = useReducedMotion()
  const [activeStep, setActiveStep] = useState(0)
  // Disclosure is independent of scroll activation: scrolling never opens or
  // closes what the reader opened by hand.
  const [expanded, setExpanded] = useState<number | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  /**
   * Pick the step whose centre is nearest a comfortable reading band. A single
   * nearest-match pass rather than per-step sentinels, so fast scrolling can
   * never leave a stage stuck between observation bands.
   */
  const syncActive = useCallback(() => {
    const line = window.innerHeight * 0.45
    let best = 0
    let bestDist = Infinity
    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - line)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setActiveStep(prev => (prev === best ? prev : best))
  }, [])

  useEffect(() => {
    // Throttled on a timestamp rather than a requestAnimationFrame guard.
    // A rAF guard that clears itself inside its own callback deadlocks if the
    // callback never runs — a backgrounded tab suspends rAF entirely, so the
    // guard stays latched and every later scroll is swallowed, leaving the
    // stage frozen even after the reader comes back. Picking an index is not
    // per-frame work, so a plain throttle is both cheaper and recoverable.
    const GAP = 80
    let last = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const run = () => {
      last = Date.now()
      syncActive()
    }
    const onScroll = () => {
      const since = Date.now() - last
      if (since >= GAP) {
        run()
      } else {
        clearTimeout(timer)
        timer = setTimeout(run, GAP - since)
      }
    }
    // Returning to the tab re-syncs, since nothing was tracked while hidden.
    const onVisible = () => {
      if (document.visibilityState === 'visible') run()
    }

    run()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [syncActive])

  return (
    <div className="lg:grid lg:grid-cols-[45fr_55fr] lg:gap-12 lg:items-start">
      {/* ── Left: the five steps ─────────────────────────────────────────── */}
      <ol className="list-none m-0 p-0 flex flex-col">
        {steps.map((step, i) => {
          const isActive = activeStep === i
          const isOpen = expanded === i
          const isLast = i === steps.length - 1

          return (
            <li key={step.index}>
              <div
                ref={el => { stepRefs.current[i] = el }}
                className="relative pl-12 pb-10"
              >
                {/* connector */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 bottom-0 w-px"
                    style={{ background: INK(0.12) }}
                  />
                )}
                {!isLast && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 w-px origin-top"
                    style={{ background: ACCENT(0.5), bottom: 0 }}
                    initial={false}
                    animate={{ scaleY: activeStep > i ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  />
                )}

                {/* number */}
                <button
                  type="button"
                  onClick={() => setActiveStep(i)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Show stage ${step.index}, ${step.title}`}
                  className="absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer"
                  style={{
                    background: isActive ? ACCENT(0.14) : 'var(--panel-2)',
                    border: `1px solid ${isActive ? ACCENT(0.55) : INK(0.12)}`,
                  }}
                >
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: MONO, color: isActive ? 'var(--accent)' : INK(0.6) }}
                  >
                    {step.index}
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.55 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[1.0625rem] font-medium m-0" style={{ color: 'var(--ink)' }}>
                      {step.title}
                    </h3>
                    <code
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{
                        fontFamily: MONO,
                        background: ACCENT(0.08),
                        border: `0.5px solid ${ACCENT(0.2)}`,
                        color: 'var(--accent)',
                      }}
                    >
                      {step.model}
                    </code>
                  </div>

                  <p
                    className="mt-2 text-[1.0625rem] leading-[1.7] max-w-[62ch]"
                    style={{ color: INK(0.72) }}
                  >
                    {step.summary}
                  </p>

                  {/* disclosure — unchanged behaviour, click/keyboard */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`stage-detail-${i}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] rounded px-2 py-1 transition-colors"
                    style={{
                      fontFamily: MONO,
                      color: 'var(--accent)',
                      border: `0.5px solid ${ACCENT(isOpen ? 0.4 : 0.2)}`,
                      background: isOpen ? ACCENT(0.06) : 'transparent',
                    }}
                  >
                    {isOpen ? 'hide detail' : 'technical detail'}
                    <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>

                  <div
                    id={`stage-detail-${i}`}
                    hidden={!isOpen}
                    className="mt-3 text-[0.9375rem] leading-[1.75] max-w-[62ch]"
                    style={{ color: INK(0.66) }}
                  >
                    {step.description}
                  </div>
                </motion.div>

                {/* Mobile: the stage illustration sits with its step. */}
                <div className="lg:hidden mt-5">
                  <StageScene i={i} active={isActive} />
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {/* ── Right: sticky stage, desktop only ────────────────────────────── */}
      <div className="hidden lg:block sticky top-28">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--panel)', border: `1px solid ${INK(0.1)}` }}
        >
          <p className="text-[10px] mb-3" style={{ fontFamily: MONO, letterSpacing: '0.14em', color: INK(0.6) }}>
            STAGE {steps[activeStep]?.index} · {steps[activeStep]?.title.toUpperCase()}
          </p>
          {/* Fixed height keeps the stage from jumping between scenes. */}
          <div className="relative" style={{ minHeight: 320 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: activeStep === i ? 1 : 0,
                  pointerEvents: activeStep === i ? 'auto' : 'none',
                }}
                aria-hidden={activeStep !== i}
              >
                <StageScene i={i} active={activeStep === i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
