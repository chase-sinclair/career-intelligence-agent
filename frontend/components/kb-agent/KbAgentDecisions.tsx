'use client'

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { KB_DECISIONS, type KbDecisionStory } from '@/lib/kb-agent-data'

/**
 * SECTION 06 — Engineering Decisions & Reflections.
 *
 * One bordered carousel at full content width. (The "Still open" card was
 * removed; the Project Reflection section follows instead.)
 *
 * Geometry: all three slides are rendered in the same grid cell, so the
 * carousel is always as tall as its tallest story and switching stories never
 * changes the page height (no scroll jump). Inactive slides are
 * `visibility: hidden` + `aria-hidden` + `inert`: not focusable, not announced.
 *
 * Navigation: one active index, default 0, no autoplay, no wrap.
 *   - top tablist (WAI-ARIA tabs, automatic activation; Left/Right/Home/End)
 *   - bottom row: Previous, dots, "01 / 03", Next. At either end the button is
 *     `aria-disabled` rather than `disabled`, so focus is never dropped.
 *   - horizontal touch swipe on the slide area (touch pointers only).
 * Changes made from the bottom row or by swipe are announced once through a
 * polite live region; tab changes are announced by the tab itself.
 *
 * Reading order: each slide is eyebrow, title and opening explanation across
 * the full width, then the narrative (60%, first in the DOM) and the evidence
 * card (40%) beside it.
 *
 * Motion (decorative presentation of recorded results, never a live run):
 * each story's evidence has one cue, driven by a single `motion` record
 * `{ story, stage, id }` derived from the active index.
 *   - `final`  static end state. Server render, inactive slides, reduced motion,
 *              and no IntersectionObserver all use it, so every value and
 *              annotation is present without JavaScript or animation.
 *   - `pre`    armed: the active story is waiting for the carousel to be
 *              meaningfully in view (CSS animations sit paused on frame 0;
 *              Story 01's counters read 0.0%).
 *   - `run`    playing once. A new activation bumps `id`, which remounts the
 *              slide body, cancelling any pending frame and restarting CSS.
 * Scrolling, resizing, focusing, re-selecting the active tab and re-renders
 * never replay. Final values are always in the accessible markup; the counting
 * layer is `aria-hidden`.
 *
 * Styling: host tokens, Inter + JetBrains Mono, existing `.lab` / `.kb-h2` /
 * `Eyebrow`. Every rule is scoped under `.kb-agent .kb-decisions` with a
 * `kde-` prefix. No new dependencies.
 */

type Stage = 'final' | 'pre' | 'run'

const d = KB_DECISIONS
const STORIES = d.stories
const COUNT = STORIES.length
const pad = (n: number) => String(n).padStart(2, '0')

/** Share of the slide area that must be on screen before a story plays. */
const VIEW_RATIO = 0.45

/* -------------------------------------------------------------------------- */
/* Story 01 — synchronized comparison count-up                                 */
/* -------------------------------------------------------------------------- */

const BENCH = d.benchmark.rows
const BENCH_FINAL = BENCH.map((r) => r.value)
const BENCH_ZERO = BENCH.map(() => 0)
/** One shared, eased progress for all three rows: they start and end together,
 *  so the final ranking (95.5 > 91.0 > 90.8) holds on every frame. */
const COUNT_MS = 600
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const pct = (v: number) => `${v.toFixed(1)}%`
const countFrame = (progress: number) => BENCH.map((r) => Math.round(r.value * easeOut(progress) * 10) / 10)

function BenchmarkArtifact({ stage }: { stage: Stage }) {
  const b = d.benchmark
  const [vals, setVals] = useState<readonly number[]>(stage === 'pre' ? BENCH_ZERO : BENCH_FINAL)

  useEffect(() => {
    if (stage !== 'run') {
      setVals(stage === 'pre' ? BENCH_ZERO : BENCH_FINAL)
      return
    }
    let raf = 0
    let t0 = -1
    const tick = (now: number) => {
      if (t0 < 0) t0 = now
      const p = (now - t0) / COUNT_MS
      if (p >= 1) {
        setVals(BENCH_FINAL)
        return
      }
      setVals(countFrame(p))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stage])

  return (
    <>
      <div className="kde-art-top">
        <p className="lab">{b.label}</p>
        <p className="kde-art-title">{b.title}</p>
      </div>
      <dl className="kde-rows">
        {BENCH.map((r, i) => (
          <div key={r.label} className={r.emphasis ? 'kde-row is-em' : 'kde-row'}>
            <dt>{r.label}</dt>
            <dd>
              <span className="kb-sr">{pct(r.value)}</span>
              <span className="kde-num" aria-hidden="true">
                {pct(vals[i])}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="kde-art-note">{b.baseline}</p>
      <p className="kde-art-fine">{b.weights}</p>
      <p className="kde-art-fine">{b.scope}</p>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Story 02 — correction, then the filename-match caveat (CSS-staged)          */
/* -------------------------------------------------------------------------- */

function EvaluationArtifact() {
  const { refusal: r, chunk: c } = d.evaluation
  return (
    <>
      <div className="kde-art-block">
        <p className="lab">{r.label}</p>
        <p className="kde-figure">
          <span>{r.from}</span>
          <svg className="kde-fix-arrow" width="30" height="12" viewBox="0 0 30 12" aria-hidden="true" focusable="false">
            <path d="M1 6h26M22 1.5 27.5 6 22 10.5" pathLength={1} />
          </svg>
          <span className="kb-sr">to</span>
          <span className="kde-fix-to">{r.to}</span>
        </p>
        <p className="kde-art-cap">{r.caption}</p>
        <p className="kde-inline">
          <span className="kde-figure-sm kde-fix-count">{r.count}</span>
          <span className="kde-art-cap">{r.countCaption}</span>
        </p>
      </div>
      <div className="kde-art-block">
        <p className="lab">{c.label}</p>
        <p className="kde-figure kde-match">
          {c.value}
          <span className="kde-unit">{c.unit}</span>
        </p>
        <p className="kde-art-cap kde-caveat">{c.caption}</p>
        <p className="kde-art-tech">{c.technical}</p>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* Story 03 — incident, then the separate audit (CSS-staged)                   */
/* -------------------------------------------------------------------------- */

function ReliabilityArtifact() {
  const { incident: i, audit: a } = d.reliability
  const recordedPct = (a.recorded / a.expected) * 100
  return (
    <>
      <div className="kde-art-block kde-incident">
        <div className="kde-art-top">
          <p className="lab">{i.label}</p>
          <code className="kde-error">{i.error}</code>
        </div>
        <p className="kde-figure">{i.value}</p>
        <p className="kde-art-cap">{i.caption}</p>
      </div>
      <div className="kde-art-block kde-audit">
        <p className="lab">{a.label}</p>
        <dl className="kde-counts">
          {a.rows.map((r) => (
            <div key={r.text} className={r.tone === 'warn' ? 'kde-count-row is-warn' : 'kde-count-row'}>
              <dt>{r.value}</dt>
              <dd>{r.text}</dd>
            </div>
          ))}
        </dl>
        {/* Static reconciliation strip: 213 recorded + 61 missing of 274 expected.
            Decorative; the counts above carry the meaning. */}
        <div className="kde-strip" aria-hidden="true">
          <div className="kde-strip-bar">
            <span className="kde-strip-ok" style={{ width: `${recordedPct}%` }} />
            <span className="kde-strip-miss" />
          </div>
          <div className="kde-strip-labels">
            <span style={{ width: `${recordedPct}%` }}>{a.recorded} recorded</span>
            <span>{a.missing} missing</span>
          </div>
        </div>
      </div>
    </>
  )
}

const ARTIFACTS: Record<KbDecisionStory['id'], (p: { stage: Stage }) => ReactNode> = {
  experimentation: BenchmarkArtifact,
  evaluation: EvaluationArtifact,
  reliability: ReliabilityArtifact,
}

/* -------------------------------------------------------------------------- */
/* Slide: header full width, then narrative (60%, first in DOM) and evidence    */
/* -------------------------------------------------------------------------- */

function Slide({
  story,
  active,
  stage,
  motionKey,
  tabId,
  panelId,
}: {
  story: KbDecisionStory
  active: boolean
  stage: Stage
  motionKey: string
  tabId: string
  panelId: string
}) {
  const Artifact = ARTIFACTS[story.id]
  const c = story.context
  // React 18 has no typed `inert` prop; an empty string attribute is the
  // standard boolean form and is passed through to the DOM unchanged.
  const inert = active ? {} : ({ inert: '' } as Record<string, string>)
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      aria-hidden={active ? undefined : true}
      tabIndex={active ? 0 : -1}
      className={active ? 'kde-slide is-on' : 'kde-slide'}
      data-story={story.id}
      {...inert}
    >
      <header className="kde-slide-head">
        <p className="lab">{story.eyebrow}</p>
        <h3>{story.title}</h3>
        <p className="kde-opening">{story.opening}</p>
      </header>

      <div key={motionKey} className="kde-slide-body" data-stage={stage}>
        <div className="kde-narrative">
          <p className="lab">{c.label}</p>
          {c.lead && <p>{c.lead}</p>}
          {c.configs && (
            <ol className="kde-configs">
              {c.configs.map((cfg) => (
                <li key={cfg.name}>
                  <strong>{cfg.name}</strong> {cfg.text}
                </li>
              ))}
            </ol>
          )}
          {c.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <div className="kde-conclusion">
            <p className="lab">{story.conclusion.label}</p>
            <p>{story.conclusion.text}</p>
          </div>
        </div>
        <aside className="kde-artifact" aria-label="Evidence">
          <Artifact stage={stage} />
        </aside>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

const SWIPE_MIN = 48

export default function KbAgentDecisions() {
  const [active, setActive] = useState(0)
  const [announce, setAnnounce] = useState('')
  const [motion, setMotion] = useState<{ story: number; stage: Stage; id: number }>({ story: 0, stage: 'final', id: 0 })
  const uid = useId().replace(/:/g, '')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const slidesRef = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null)
  const activeRef = useRef(0)
  const inViewRef = useRef(false)
  const reducedRef = useRef(true) // until measured: static

  const tabId = (i: number) => `kde-tab-${uid}-${i}`
  const panelId = (i: number) => `kde-panel-${uid}-${i}`

  // Reduced-motion preference, followed live. Turning it on settles everything
  // to the final state; turning it off does not replay anything.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const noIO = typeof IntersectionObserver === 'undefined'
    reducedRef.current = mq.matches || noIO
    if (!reducedRef.current) setMotion((m) => ({ ...m, stage: inViewRef.current ? 'run' : 'pre' }))
    const onChange = () => {
      reducedRef.current = mq.matches || noIO
      if (mq.matches) setMotion((m) => ({ ...m, stage: 'final' }))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // First meaningful entry plays an armed story; later scrolling never replays.
  useEffect(() => {
    const el = slidesRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting && e.intersectionRatio >= VIEW_RATIO
        if (inViewRef.current) setMotion((m) => (m.stage === 'pre' ? { ...m, stage: 'run' } : m))
      },
      { threshold: [0, VIEW_RATIO, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const go = useCallback((next: number, opts: { focusTab?: boolean; speak?: boolean } = {}) => {
    const i = Math.max(0, Math.min(COUNT - 1, next))
    if (opts.focusTab) tabRefs.current[i]?.focus()
    if (i === activeRef.current) return // re-selecting the active story is a no-op
    activeRef.current = i
    setActive(i)
    setMotion((m) => ({ story: i, id: m.id + 1, stage: reducedRef.current ? 'final' : inViewRef.current ? 'run' : 'pre' }))
    if (opts.speak) setAnnounce(`Story ${i + 1} of ${COUNT}: ${STORIES[i].title}`)
  }, [])

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: COUNT - 1 }
    if (!(e.key in map)) return
    e.preventDefault()
    go(map[e.key], { focusTab: true })
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return
    swipe.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current
    swipe.current = null
    if (!s || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return
    const next = activeRef.current + (dx < 0 ? 1 : -1)
    if (next < 0 || next >= COUNT) return
    go(next, { speak: true })
  }

  const atStart = active === 0
  const atEnd = active === COUNT - 1

  return (
    <section id="kb-decisions" className="kb-decisions" aria-labelledby="kb-decisions-h">
      <div className="kde-head">
        <Eyebrow>{d.eyebrow}</Eyebrow>
        <h2 id="kb-decisions-h" className="kb-h2">
          {d.heading}
        </h2>
        <div className="kde-intro">
          {d.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>

      <div className="kde-carousel" data-active={active}>
        <div className="kde-tabs" role="tablist" aria-label={d.tablistLabel}>
          {STORIES.map((s, i) => (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={panelId(i)}
              tabIndex={i === active ? 0 : -1}
              className="kde-tab"
              onClick={() => go(i)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              <span className="kde-tab-num">{pad(i + 1)}</span>
              <span>{s.tab}</span>
            </button>
          ))}
        </div>

        <div
          ref={slidesRef}
          className="kde-slides"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerEnd}
          onPointerCancel={() => {
            swipe.current = null
          }}
        >
          {STORIES.map((s, i) => {
            const mine = motion.story === i && i === active
            return (
              <Slide
                key={s.id}
                story={s}
                active={i === active}
                stage={mine ? motion.stage : 'final'}
                motionKey={mine ? `m${motion.id}` : 'static'}
                tabId={tabId(i)}
                panelId={panelId(i)}
              />
            )
          })}
        </div>

        <div className="kde-nav">
          <button
            type="button"
            className="kde-step"
            aria-disabled={atStart || undefined}
            onClick={() => !atStart && go(active - 1, { speak: true })}
          >
            <span aria-hidden="true">←</span> Previous
          </button>
          <div className="kde-progress">
            <span className="kde-dots" aria-hidden="true">
              {STORIES.map((s, i) => (
                <span key={s.id} className={i === active ? 'is-on' : undefined} onClick={() => go(i)} />
              ))}
            </span>
            <span className="kde-count" aria-hidden="true">
              {pad(active + 1)} / {pad(COUNT)}
            </span>
          </div>
          <button
            type="button"
            className="kde-step"
            aria-disabled={atEnd || undefined}
            onClick={() => !atEnd && go(active + 1, { speak: true })}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="kb-sr" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      </div>
    </section>
  )
}

/**
 * Section 06's stylesheet, appended to the shared sheet by `KbAgentPage` via
 * `CaseStudyShell`'s `extraCss`. Scoped under `.kb-agent .kb-decisions`.
 *
 * Motion rules only ever animate opacity, transform, colour, background and
 * stroke offset. Base rules are the final state; each animation's `both` fill
 * shows its first frame while armed (`pre`, paused) and its last frame after.
 */
export const KB_DECISIONS_CSS = `
.kb-agent .kb-decisions {
  --kde-amber: #8f5a17;
  --kde-amber-rgb: 143, 90, 23;
  scroll-margin-top: 84px;
}
.kb-agent .kb-decisions .lab { font-size: 9.5px; }
.kb-agent .kde-head { margin-bottom: 20px; }
.kb-agent .kde-head .kb-h2 { margin-bottom: 14px; }

/* two-column intro, Section 05 editorial style */
.kb-agent .kde-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
}
.kb-agent .kde-intro p {
  font-size: 1.0625rem;
  line-height: 1.62;
  color: rgba(var(--ink-rgb), 0.72);
  text-wrap: pretty;
}
.kb-agent .kde-intro p + p { border-left: 1px solid rgba(var(--ink-rgb), 0.12); padding-left: 32px; }

/* ---- carousel surface ---- */
.kb-agent .kde-carousel {
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04), 0 10px 28px rgba(var(--ink-rgb), 0.04);
}

/* tabs */
.kb-agent .kde-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.kb-agent .kde-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 22px 12px;
  font: 500 13.5px/1.2 Inter, system-ui, sans-serif;
  color: rgba(var(--ink-rgb), 0.64);
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  transition: color .16s ease, background-color .16s ease;
}
.kb-agent .kde-tab + .kde-tab { border-left: 0.5px solid rgba(var(--ink-rgb), 0.1); }
.kb-agent .kde-tab::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -0.5px;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transition: transform .2s ease;
}
.kb-agent .kde-tab:hover { color: rgba(var(--ink-rgb), 0.86); background: rgba(var(--ink-rgb), 0.02); }
.kb-agent .kde-tab[aria-selected="true"] { color: var(--ink); background: var(--panel-solid); }
.kb-agent .kde-tab[aria-selected="true"]::after { transform: scaleX(1); }
.kb-agent .kde-tab-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: rgba(var(--ink-rgb), 0.5);
}
.kb-agent .kde-tab[aria-selected="true"] .kde-tab-num { color: var(--accent); }
.kb-agent .kde-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -3px; }

/* slides: stacked in one cell, so height = tallest story */
.kb-agent .kde-slides { display: grid; touch-action: pan-y; background: var(--panel-solid); }
.kb-agent .kde-slide {
  grid-area: 1 / 1;
  min-width: 0;
  padding: 18px 26px 20px;
  visibility: hidden;
  opacity: 0;
  transition: opacity .22s ease, visibility 0s linear .22s;
}
.kb-agent .kde-slide.is-on { visibility: visible; opacity: 1; transition: opacity .22s ease, visibility 0s; }
.kb-agent .kde-slide:focus-visible { outline: 2px solid var(--accent); outline-offset: -4px; border-radius: 4px; }

/* header: eyebrow, title, opening explanation, full width */
.kb-agent .kde-slide-head { margin-bottom: 16px; }
.kb-agent .kde-slide-head .lab { color: var(--accent); margin-bottom: 8px; letter-spacing: 0.14em; }
.kb-agent .kde-slide-head h3 {
  font-weight: 400;
  font-size: 1.4375rem;
  line-height: 1.16;
  letter-spacing: -0.022em;
  color: var(--ink);
  margin-bottom: 7px;
}
.kb-agent .kde-opening {
  max-width: 1000px;
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(var(--ink-rgb), 0.8);
  text-wrap: pretty;
}

/* body: narrative (60%, first in reading order) | evidence (40%) */
.kb-agent .kde-slide-body {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 4fr);
  column-gap: 36px;
  align-items: start;
}

/* narrative */
.kb-agent .kde-narrative > .lab,
.kb-agent .kde-conclusion .lab { color: var(--accent); margin-bottom: 6px; letter-spacing: 0.14em; }
.kb-agent .kde-narrative > p:not(.lab),
.kb-agent .kde-configs li {
  font-size: 14.5px;
  line-height: 1.56;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}
.kb-agent .kde-narrative > p:not(.lab) + p:not(.lab),
.kb-agent .kde-configs + p { margin-top: 7px; }
.kb-agent .kde-configs {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  counter-reset: kde-cfg;
}
.kb-agent .kde-configs li {
  position: relative;
  padding: 2px 0 2px 26px;
  counter-increment: kde-cfg;
}
.kb-agent .kde-configs li::before {
  content: counter(kde-cfg);
  position: absolute;
  left: 0; top: 4px;
  width: 17px; height: 17px;
  border-radius: 999px;
  font: 500 10px/17px 'JetBrains Mono', monospace;
  text-align: center;
  color: rgba(var(--ink-rgb), 0.62);
  background: rgba(var(--ink-rgb), 0.06);
}
.kb-agent .kde-configs li:last-child::before { color: var(--accent); background: rgba(var(--accent-rgb), 0.1); }
.kb-agent .kde-configs strong { font-weight: 600; color: var(--ink); }
.kb-agent .kde-conclusion {
  margin-top: 12px;
  padding-top: 11px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.kb-agent .kde-conclusion p:last-child { font-size: 14.5px; line-height: 1.56; color: var(--ink); text-wrap: pretty; }

/* evidence artifact (40%) */
.kb-agent .kde-artifact {
  border-radius: 12px;
  padding: 14px 16px 14px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.kb-agent .kde-artifact .lab { margin-bottom: 7px; color: rgba(var(--ink-rgb), 0.58); }
.kb-agent .kde-art-title { font-size: 12.5px; font-weight: 500; color: rgba(var(--ink-rgb), 0.8); }
.kb-agent .kde-rows { margin: 0 0 8px; }
.kb-agent .kde-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 8px;
  margin: 0 -8px;
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.09);
  font-size: 13.5px;
}
.kb-agent .kde-row:last-child { border-bottom: 0; }
.kb-agent .kde-row dt { color: rgba(var(--ink-rgb), 0.76); }
.kb-agent .kde-row dd {
  flex: none;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--ink-rgb), 0.86);
}
/* fixed-width counter: the % sign and row never move while counting */
.kb-agent .kde-num { display: inline-block; min-width: 5ch; text-align: right; white-space: nowrap; }
.kb-agent .kde-row.is-em { background: rgba(var(--accent-rgb), 0.07); border-radius: 6px; border-bottom-color: transparent; }
.kb-agent .kde-row.is-em dt { color: var(--accent); font-weight: 500; }
.kb-agent .kde-row.is-em dd { color: var(--accent); font-weight: 500; }
.kb-agent .kde-art-note {
  font-size: 12px;
  line-height: 1.45;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--ink-rgb), 0.74);
  margin-bottom: 6px;
}
.kb-agent .kde-art-fine { font-size: 11.5px; line-height: 1.45; color: rgba(var(--ink-rgb), 0.6); text-wrap: pretty; }
.kb-agent .kde-art-fine + .kde-art-fine { margin-top: 3px; }

.kb-agent .kde-art-block + .kde-art-block {
  position: relative;
  margin-top: 12px;
  padding-top: 12px;
}
/* separator as a drawable line (Story 03 draws it) */
.kb-agent .kde-art-block + .kde-art-block::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 0.5px;
  background: rgba(var(--ink-rgb), 0.16);
  transform-origin: left center;
}
.kb-agent .kde-figure {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
  margin-bottom: 4px;
}
.kb-agent .kde-inline { display: flex; align-items: baseline; gap: 8px; margin-top: 9px; }
.kb-agent .kde-figure-sm {
  flex: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}
.kb-agent .kde-art-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.kb-agent .kde-art-top .lab { margin-bottom: 0; }
.kb-agent .kde-unit {
  font-family: Inter, system-ui, sans-serif;
  font-size: 13px;
  letter-spacing: 0;
  color: rgba(var(--ink-rgb), 0.7);
}
.kb-agent .kde-art-cap { font-size: 13px; line-height: 1.45; color: rgba(var(--ink-rgb), 0.7); text-wrap: pretty; }
.kb-agent .kde-art-tech {
  margin-top: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.02em;
  color: rgba(var(--ink-rgb), 0.52);
}
.kb-agent .kde-error {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  padding: 3px 7px;
  margin: 0;
  border-radius: 5px;
  color: rgba(var(--ink-rgb), 0.8);
  background: rgba(var(--ink-rgb), 0.05);
  border: 0.5px solid rgba(var(--ink-rgb), 0.16);
}

/* Story 02 final state */
.kb-agent .kde-fix-arrow { flex: none; overflow: visible; }
.kb-agent .kde-fix-arrow path {
  fill: none;
  stroke: rgba(var(--ink-rgb), 0.45);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}
.kb-agent .kde-fix-to { color: var(--accent); background: rgba(var(--accent-rgb), 0.08); border-radius: 6px; padding: 1px 6px; margin-left: -2px; }
.kb-agent .kde-fix-count {
  padding-bottom: 1px;
  background: linear-gradient(rgba(var(--accent-rgb), 0.45), rgba(var(--accent-rgb), 0.45)) 0 100% / 100% 2px no-repeat;
}
.kb-agent .kde-match { align-items: baseline; }
/* the caveat, not the 1.00, carries the amber */
.kb-agent .kde-caveat {
  position: relative;
  padding-left: 11px;
  color: rgba(var(--ink-rgb), 0.78);
}
.kb-agent .kde-caveat::before {
  content: '';
  position: absolute;
  left: 0; top: 2px; bottom: 2px;
  width: 2px;
  border-radius: 2px;
  background: var(--kde-amber);
  transform-origin: center top;
}

/* Story 03 final state */
.kb-agent .kde-counts { margin: 0; }
.kb-agent .kde-count-row {
  display: grid;
  grid-template-columns: 3.4ch minmax(0, 1fr);
  column-gap: 10px;
  align-items: baseline;
  padding: 2px 0;
}
.kb-agent .kde-count-row dt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--ink);
}
.kb-agent .kde-count-row dd { margin: 0; font-size: 13px; line-height: 1.4; color: rgba(var(--ink-rgb), 0.72); }
.kb-agent .kde-count-row.is-warn dt,
.kb-agent .kde-count-row.is-warn dd { color: var(--kde-amber); font-weight: 500; }
.kb-agent .kde-strip { margin-top: 9px; }
.kb-agent .kde-strip-bar {
  display: flex;
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(var(--ink-rgb), 0.06);
}
.kb-agent .kde-strip-ok { background: rgba(var(--ink-rgb), 0.22); }
.kb-agent .kde-strip-miss { flex: 1; background: rgba(var(--kde-amber-rgb), 0.75); }
.kb-agent .kde-strip-labels {
  display: flex;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.02em;
  color: rgba(var(--ink-rgb), 0.55);
}
.kb-agent .kde-strip-labels span:last-child { flex: 1; text-align: right; color: var(--kde-amber); }

/* ---- motion: armed (paused on frame 0) and running ---- */
.kb-agent .kde-slide-body[data-stage="pre"] *,
.kb-agent .kde-slide-body[data-stage="pre"] *::before { animation-play-state: paused !important; }

/* Story 01: once all three counters land together, the winning row settles teal */
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-row.is-em { animation: kde-wash 300ms ease-out 600ms both; }
@keyframes kde-wash {
  0% { background-color: rgba(var(--accent-rgb), 0); }
  40% { background-color: rgba(var(--accent-rgb), 0.17); }
  100% { background-color: rgba(var(--accent-rgb), 0.07); }
}

/* Story 02: arrow draws, corrected score takes the accent, 4 of 6, amber caveat */
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-fix-arrow path { animation: kde-draw 220ms ease-out 0ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-fix-to { animation: kde-fix-to 220ms ease-out 180ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-fix-count { animation: kde-underline 200ms ease-out 390ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-caveat::before { animation: kde-rule-y 220ms ease-out 560ms both; }
@keyframes kde-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes kde-fix-to {
  from { color: var(--ink); background-color: rgba(var(--accent-rgb), 0); }
  to { color: var(--accent); background-color: rgba(var(--accent-rgb), 0.08); }
}
@keyframes kde-underline { from { background-size: 0% 2px; } to { background-size: 100% 2px; } }

/* Story 03: incident first, then the divider, then the separate audit's 61 */
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-incident .lab { animation: kde-fade-up 200ms ease-out 0ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-error { animation: kde-outline 220ms ease-out 40ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-audit::before { animation: kde-rule-x 200ms ease-out 240ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-count-row.is-warn dt,
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-count-row.is-warn dd { animation: kde-warn 260ms ease-out 420ms both; }
.kb-agent :is([data-stage="pre"], [data-stage="run"]) .kde-strip-miss { animation: kde-miss 280ms ease-out 440ms both; }
@keyframes kde-fade-up { from { opacity: 0.45; } to { opacity: 1; } }
@keyframes kde-outline {
  from { opacity: 0.4; border-color: rgba(var(--ink-rgb), 0); }
  to { opacity: 1; border-color: rgba(var(--ink-rgb), 0.16); }
}
@keyframes kde-rule-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes kde-rule-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes kde-warn { from { color: var(--ink); } to { color: var(--kde-amber); } }
@keyframes kde-miss { from { opacity: 0.15; } to { opacity: 1; } }

/* bottom navigation */
.kb-agent .kde-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 12px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.kb-agent .kde-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font: 500 13px/1 Inter, system-ui, sans-serif;
  color: var(--ink);
  background: var(--panel-solid);
  border: 0.5px solid rgba(var(--ink-rgb), 0.18);
  cursor: pointer;
  transition: border-color .16s ease, color .16s ease, background-color .16s ease;
}
.kb-agent .kde-step:hover:not([aria-disabled="true"]) { border-color: rgba(var(--accent-rgb), 0.55); color: var(--accent); }
.kb-agent .kde-step:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.kb-agent .kde-step[aria-disabled="true"] { color: rgba(var(--ink-rgb), 0.32); border-color: rgba(var(--ink-rgb), 0.1); background: transparent; cursor: default; }
.kb-agent .kde-progress { display: inline-flex; align-items: center; gap: 14px; }
.kb-agent .kde-dots { display: inline-flex; gap: 7px; }
.kb-agent .kde-dots > span {
  width: 7px; height: 7px;
  border-radius: 999px;
  background: rgba(var(--ink-rgb), 0.18);
  cursor: pointer;
  transition: background-color .2s ease, width .2s ease;
}
.kb-agent .kde-dots > span.is-on { width: 20px; background: var(--accent); }
.kb-agent .kde-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--ink-rgb), 0.56);
}

@media (prefers-reduced-motion: reduce) {
  .kb-agent .kde-slide,
  .kb-agent .kde-slide.is-on,
  .kb-agent .kde-tab,
  .kb-agent .kde-tab::after,
  .kb-agent .kde-dots > span,
  .kb-agent .kde-step { transition: none; }
  .kb-agent .kde-slide-body *,
  .kb-agent .kde-slide-body *::before { animation: none !important; }
}
`
