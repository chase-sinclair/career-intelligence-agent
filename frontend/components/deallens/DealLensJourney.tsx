'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { journey } from '@/lib/deallens-data'
import JourneyScene from './JourneyScenes'
import { button, focus, Label, CopyBlock, Disclosure } from './Primitives'
import { SourceBadge } from './StoryParts'

function InlineScene({ stage, replay }: { stage: number; replay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const entered = useInView(ref, { once: true, amount: 0.15 })
  return (
    <div
      ref={ref}
      className="mt-6 rounded-xl border border-outline-variant bg-surface-container-low p-3 sm:p-5"
    >
      <SourceBadge comparison={stage === 5} />
      <JourneyScene
        key={`${entered}-${replay}`}
        stage={stage}
        animate={entered}
      />
    </div>
  )
}

export default function DealLensJourney() {
  const [active, setActive] = useState(0)
  const [replays, setReplays] = useState(() => journey.map(() => 0))
  const [desktop, setDesktop] = useState(false)
  const [animate, setAnimate] = useState(false)
  const reduced = useReducedMotion()
  const sections = useRef<(HTMLElement | null)[]>([])
  const visited = useRef(new Set<number>())
  const current = useRef(-1)
  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 1200px) and (min-height: 800px), (min-width: 1024px) and (min-height: 900px)',
    )
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    let frame = 0
    // Rank all actual articles once per scroll frame; observer entry ordering cannot race.
    const resolve = () => {
      frame = 0
      const band = Math.max(180, window.innerHeight * 0.4)
      const rects = sections.current.map((el) => el?.getBoundingClientRect())
      let next = 0
      rects.forEach((rect, i) => {
        if (rect && rect.top <= band) next = i
      })
      if (
        next !== current.current ||
        (!visited.current.has(next) && rects[next] && rects[next]!.top <= band)
      ) {
        setAnimate(
          !!rects[next] &&
            rects[next]!.top <= band &&
            !visited.current.has(next) &&
            Math.abs(next - current.current) <= 1,
        )
        if (rects[next] && rects[next]!.top < window.innerHeight)
          visited.current.add(next)
        current.current = next
        setActive(next)
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(resolve)
    }
    const observer = new IntersectionObserver(schedule, {
      rootMargin: '-20% 0px -45% 0px',
    })
    sections.current.forEach((el) => el && observer.observe(el))
    const resize = new ResizeObserver(schedule)
    sections.current.forEach((el) => el && resize.observe(el))
    const visibility = () => {
      if (document.hidden) setAnimate(false)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', visibility)
    const hash = () => {
      const target = document.getElementById(location.hash.slice(1))
      if (target && location.hash.startsWith('#cim-'))
        target.scrollIntoView({ behavior: 'instant' })
      schedule()
    }
    window.addEventListener('hashchange', hash)
    hash()
    return () => {
      observer.disconnect()
      resize.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', hash)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [desktop])
  function navigate(index: number) {
    const target =
      index === 6
        ? document.getElementById('data-model')
        : sections.current[index]
    if (!target) return
    history.pushState(null, '', `#${target.id}`)
    target.scrollIntoView({
      behavior: reduced ? 'instant' : 'smooth',
      block: 'start',
    })
    target.focus({ preventScroll: true })
  }
  function replay(index: number) {
    setAnimate(true)
    setReplays((values) =>
      values.map((value, i) => (i === index ? value + 1 : value)),
    )
  }
  return (
    <section
      id="walkthrough"
      aria-labelledby="journey-heading"
      className="scroll-mt-24 border-t border-outline-variant pb-20 pt-12"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="journey-heading"
          className="text-2xl font-medium tracking-tight"
        >
          Follow a CIM
        </h2>
        <p className="text-sm text-on-surface-variant">
          One document. Six stages. Scroll to follow.
        </p>
      </div>
      <nav
        aria-label="CIM walkthrough stages"
        className="sticky top-[65px] z-20 grid grid-cols-3 gap-1 rounded-lg border border-outline-variant bg-[var(--panel-solid)] p-1.5 shadow-sm sm:grid-cols-6"
      >
        {journey.map((stage, i) => (
          <a
            key={stage.id}
            href={`#cim-${stage.id}`}
            aria-current={active === i ? 'step' : undefined}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                navigate(i)
              }
            }}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs sm:text-sm ${focus} ${active === i ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="font-mono text-[10px]">0{i + 1}</span>
            {stage.short}
          </a>
        ))}
      </nav>
      <div
        className={`relative mt-5 ${desktop ? 'grid grid-cols-[.82fr_1.18fr] gap-10' : ''}`}
      >
        <div>
          {journey.map((stage, i) => (
            <article
              key={stage.id}
              id={`cim-${stage.id}`}
              data-stage={i}
              ref={(el) => {
                sections.current[i] = el
              }}
              tabIndex={-1}
              className={`scroll-mt-40 border-b border-outline-variant py-10 outline-none last:border-0 ${desktop ? `flex flex-col justify-center py-14 ${i === 1 ? 'min-h-[60vh]' : i === 2 || i === 5 ? 'min-h-[88vh]' : 'min-h-[75vh]'}` : ''}`}
            >
              <Label>{stage.eyebrow}</Label>
              <h3 className="mb-5 mt-4 text-3xl font-medium leading-[1.13] tracking-[-.04em] xl:text-4xl">
                {stage.title}
              </h3>
              <CopyBlock paragraphs={stage.body} />
              {i === 0 && (
                <p className="mt-5 text-xs leading-6 text-primary">
                  What carries forward: File name · Original document link ·
                  Upload timestamp
                </p>
              )}
              {i === 5 && (
                <p className="mt-5 text-sm italic text-primary">
                  An analyst reviews the findings and makes the final decision.
                </p>
              )}
              <Disclosure paragraphs={stage.detail} />
              <a
                href={i === 5 ? '#data-model' : `#cim-${journey[i + 1].id}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(i + 1)
                }}
                className={`mt-6 w-fit text-sm font-medium leading-6 text-primary ${focus}`}
              >
                {stage.transition}
              </a>
              {!desktop && (
                <>
                  <InlineScene stage={i} replay={replays[i]} />
                  <button
                    type="button"
                    onClick={() => replay(i)}
                    className={`${button} mt-3 self-start`}
                  >
                    <RotateCcw size={14} />
                    Replay stage
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
        {desktop && (
          <div
            data-testid="sticky-canvas"
            className="sticky top-[128px] self-start"
          >
            <div className="rounded-xl border border-outline-variant bg-surface-container-low shadow-[0_12px_40px_rgba(19,23,26,.04)]">
              <div className="flex items-center justify-between gap-2 border-b border-outline-variant px-5 py-3">
                <SourceBadge comparison={active === 5} />
                <span className="shrink-0 font-mono text-xs text-on-surface-variant">
                  0{active + 1} / 06
                </span>
              </div>
              <div
                className="flex min-h-[430px] flex-col justify-center px-5"
                data-active-stage={active}
              >
                <JourneyScene
                  key={`${active}-${replays[active]}-${animate}`}
                  stage={active}
                  animate={animate}
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-outline-variant px-4 py-1">
                <button
                  type="button"
                  onClick={() => replay(active)}
                  className={`${button} border-transparent px-2`}
                >
                  <RotateCcw size={14} />
                  Replay stage
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(active - 1)}
                    disabled={active === 0}
                    className={`${button} border-transparent px-2 disabled:opacity-30`}
                    aria-label="Previous stage"
                  >
                    <ArrowLeft size={15} />
                    <span className="hidden xl:inline">Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(active + 1)}
                    className={`${button} border-transparent px-2`}
                    aria-label={
                      active === 5 ? 'Next: Connected Data' : 'Next stage'
                    }
                  >
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">
              Illustrative workflow · Synthetic example · No live upload
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
