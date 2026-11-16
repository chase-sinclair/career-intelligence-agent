'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { ARROW_PATH, CHECK_PATH, EXTERNAL_PATH, Chips, Glyph } from '@/components/case-study/chrome'
import {
  KB_AGENT_REPO,
  KB_AGENT_REPO_RESOLVED,
  KB_CYCLE_MS,
  KB_HERO,
  KB_PREVIEW_STATES,
  KB_WALKTHROUGH_ID,
} from '@/lib/kb-agent-data'

/**
 * Section 01 of the KB Agent case study: the hero.
 *
 * Self-contained on purpose. It owns its copy (via `lib/kb-agent-data.ts`),
 * its markup, and its stylesheet, so the later sections are added to
 * `KbAgentPage` without touching anything here. It adds no
 * color literals and no shared-component changes; everything below is either
 * a chrome atom (`Eyebrow`, `Chips`, `Glyph`) or a `.kb-agent`-scoped rule.
 */

/** Live, two-way reduced-motion preference. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

/**
 * Two-way visibility. The shared `useInView` latches on first intersection,
 * which is right for reveals and wrong here: the cycle has to stop again when
 * the preview scrolls away.
 */
function useIsVisible<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

/** Generic message glyph for the panel header. Not a third-party mark. */
function MessageMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

function PlayMark() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7Z" />
    </svg>
  )
}

/**
 * The rotating capability preview.
 *
 * Presentational only: every string is a locally defined approved example and
 * no network call of any kind is made. All four panels stay mounted and are
 * stacked in one grid cell, which is what makes the panel height constant
 * across states — the stage is always as tall as the tallest state, so a
 * transition can never move the hero around it.
 */
function KbPreview() {
  const { ref: viewRef, visible } = useIsVisible<HTMLDivElement>(0.4)
  const reduced = usePrefersReducedMotion()

  const [active, setActive] = useState(0)
  const [manual, setManual] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const count = KB_PREVIEW_STATES.length
  const running = visible && !manual && !hovered && !focused && !reduced

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % count), KB_CYCLE_MS)
    return () => window.clearInterval(id)
  }, [running, count])

  /** A selector press switches immediately and stops autoplay until Resume. */
  const select = useCallback((i: number) => {
    setActive(i)
    setManual(true)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % count,
      ArrowDown: (active + 1) % count,
      ArrowLeft: (active - 1 + count) % count,
      ArrowUp: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }
    const next = keys[e.key]
    if (next === undefined) return
    e.preventDefault()
    select(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      ref={viewRef}
      className="kb-prev"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <div className="kb-prev-hd">
        <span className="kb-mark" aria-hidden="true">
          <MessageMark />
        </span>
        <b>KB Agent</b>
        <em>App</em>
        <span className="kb-count">
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        {manual && !reduced && (
          <button type="button" className="kb-resume" onClick={() => setManual(false)}>
            <PlayMark />
            Resume
          </button>
        )}
      </div>

      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- roving
          tabindex lives on the child tabs, which is the documented pattern. */}
      <div className="kb-tabs" role="tablist" aria-label="KB Agent capability examples" onKeyDown={onKeyDown}>
        {KB_PREVIEW_STATES.map((state, i) => (
          <button
            key={state.id}
            type="button"
            role="tab"
            id={`kb-tab-${state.id}`}
            className="kb-tab"
            aria-controls={`kb-panel-${state.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            onClick={() => select(i)}
          >
            {state.tab}
          </button>
        ))}
      </div>

      {!reduced && (
        <div className="kb-prog" aria-hidden="true">
          <i
            key={`${active}-${String(running)}`}
            style={{ animationDuration: `${KB_CYCLE_MS}ms`, animationPlayState: running ? 'running' : 'paused' }}
          />
        </div>
      )}

      <div className="kb-stage">
        {KB_PREVIEW_STATES.map((state, i) => (
          <div
            key={state.id}
            role="tabpanel"
            id={`kb-panel-${state.id}`}
            aria-labelledby={`kb-tab-${state.id}`}
            className={`kb-state${i === active ? ' on' : ''}`}
            aria-hidden={i !== active}
          >
            {state.watcher && (
              <p className="kb-watch">
                <i aria-hidden="true" />
                {state.watcher}
              </p>
            )}
            <p className="lab">{state.label}</p>
            <div className="kb-cmd">
              <code>{state.command}</code>
            </div>
            <p className="lab kb-bl">What it helps you do</p>
            <ul className="kb-bens">
              {state.benefits.map((benefit) => (
                <li key={benefit}>
                  <i aria-hidden="true">
                    <Glyph d={CHECK_PATH} size={10} width={2.8} />
                  </i>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="kb-disc">Illustrative example · not a recorded response</p>
    </div>
  )
}

export default function KbAgentHero() {
  return (
    <header id="kb-hero" className="kb-hero">
      <div className="kb-copy">
        <Eyebrow>{KB_HERO.eyebrow}</Eyebrow>
        <h1 className="kb-h1">{KB_HERO.headline}</h1>
        {KB_HERO.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="lede">
            {paragraph}
          </p>
        ))}
        <Chips items={KB_HERO.chips} />
        <div className="kb-ctas">
          <a className="kb-cta pri" href={`#${KB_WALKTHROUGH_ID}`}>
            {KB_HERO.primaryCta}
            <Glyph d={ARROW_PATH} size={12} width={2.2} />
          </a>
          <a
            className="kb-cta sec"
            href={KB_AGENT_REPO}
            {...(KB_AGENT_REPO_RESOLVED
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            aria-label={
              KB_AGENT_REPO_RESOLVED
                ? 'View KB Agent source on GitHub, opens in a new tab'
                : 'View KB Agent source'
            }
          >
            {KB_HERO.secondaryCta}
            <Glyph d={EXTERNAL_PATH} size={11} width={2.2} />
          </a>
        </div>
      </div>
      <KbPreview />
    </header>
  )
}

/**
 * Section 01's stylesheet, composed into the shared sheet by `KbAgentPage`
 * through `CaseStudyShell`'s `extraCss`. Every rule is scoped under
 * `.kb-agent`, so nothing here can reach another route. Tokens only.
 */
export const KB_HERO_CSS = `
.kb-agent .kb-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.26fr) minmax(0, 1fr);
  gap: 52px;
  align-items: center;
}
@media (max-width: 1060px) {
  .kb-agent .kb-hero { grid-template-columns: minmax(0, 1fr); gap: 36px; align-items: start; }
}
.kb-agent .kb-h1 {
  font-weight: 300;
  font-size: clamp(2.1rem, 3.3vw, 3.4rem);
  line-height: 1.06;
  letter-spacing: -0.04em;
  color: var(--ink);
  max-width: 21ch;
  margin-bottom: 20px;
  text-wrap: balance;
}
.kb-agent .kb-copy .lede + .lede { margin-top: 14px; }
.kb-agent .kb-copy .lede { max-width: 56ch; }

/* calls to action */
.kb-agent .kb-ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 30px; }
.kb-agent .kb-cta {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  border-radius: 10px;
  transition: background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
}
.kb-agent .kb-cta:focus-visible {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 3px;
}
/* Accent is dark, so the filled button takes light accent-ink text. */
.kb-agent .kb-cta.pri {
  padding: 15px 22px;
  background: var(--accent);
  border: 0.5px solid var(--accent);
  color: var(--accent-ink);
  box-shadow: 0 2px 10px rgba(var(--accent-rgb), 0.2);
}
.kb-agent .kb-cta.pri:hover {
  box-shadow: 0 5px 16px rgba(var(--accent-rgb), 0.28);
  transform: translateY(-1px);
}
.kb-agent .kb-cta.sec {
  padding: 15px 18px;
  background: transparent;
  border: 0.5px solid rgba(var(--ink-rgb), 0.2);
  color: rgba(var(--ink-rgb), 0.64);
}
.kb-agent .kb-cta.sec:hover {
  background: rgba(var(--accent-rgb), 0.05);
  border-color: rgba(var(--accent-rgb), 0.4);
  color: var(--accent);
}

/* rotating preview panel */
.kb-agent .kb-prev {
  width: 100%;
  max-width: 470px;
  justify-self: end;
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04), 0 12px 30px rgba(var(--ink-rgb), 0.05);
}
@media (max-width: 1060px) {
  .kb-agent .kb-prev { justify-self: start; }
}
.kb-agent .kb-prev-hd {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px 16px;
  background: var(--panel-2);
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.09);
}
.kb-agent .kb-mark {
  width: 21px;
  height: 21px;
  flex: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}
.kb-agent .kb-prev-hd b {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: rgba(var(--ink-rgb), 0.82);
}
.kb-agent .kb-prev-hd em {
  font-style: normal;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 5px;
  border-radius: 3px;
  background: rgba(var(--ink-rgb), 0.07);
  color: rgba(var(--ink-rgb), 0.46);
}
.kb-agent .kb-count {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.12em;
  color: rgba(var(--ink-rgb), 0.4);
  font-variant-numeric: tabular-nums;
}
.kb-agent .kb-resume {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(var(--accent-rgb), 0.09);
  border: 0.5px solid rgba(var(--accent-rgb), 0.3);
  color: var(--accent);
  transition: background 0.18s, color 0.18s;
}
.kb-agent .kb-resume:hover { background: var(--accent); color: var(--accent-ink); }
.kb-agent .kb-resume:focus-visible {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 2px;
}

.kb-agent .kb-tabs { display: flex; flex-wrap: wrap; gap: 6px; padding: 13px 16px 0; }
.kb-agent .kb-tab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.05em;
  padding: 8px 12px;
  border-radius: 7px;
  cursor: pointer;
  background: rgba(var(--ink-rgb), 0.04);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  color: rgba(var(--ink-rgb), 0.62);
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.kb-agent .kb-tab:hover {
  background: rgba(var(--accent-rgb), 0.09);
  border-color: rgba(var(--accent-rgb), 0.26);
  color: var(--accent);
}
.kb-agent .kb-tab[aria-selected='true'] {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}
.kb-agent .kb-tab:focus-visible {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 2px;
}

.kb-agent .kb-prog {
  height: 2px;
  margin: 13px 16px 0;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(var(--ink-rgb), 0.08);
}
.kb-agent .kb-prog i {
  display: block;
  height: 100%;
  width: 0;
  background: rgba(var(--accent-rgb), 0.45);
  animation-name: kb-prog-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes kb-prog-fill { from { width: 0; } to { width: 100%; } }

/* All four states occupy one grid cell, so the stage height is the tallest
   state's height at every width and a transition never reflows the hero. */
.kb-agent .kb-stage { display: grid; padding: 16px; }
.kb-agent .kb-state {
  grid-area: 1 / 1;
  min-width: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.42s ease, visibility 0s linear 0.42s;
}
.kb-agent .kb-state.on { opacity: 1; visibility: visible; transition: opacity 0.42s ease, visibility 0s; }
.kb-agent .kb-state .lab { margin-bottom: 9px; }
.kb-agent .kb-state .lab.kb-bl { margin-top: 16px; margin-bottom: 11px; }

/* Neutral and dashed, so the background watcher reads as a separate thing
   from the accent-tinted command a person types. */
.kb-agent .kb-watch {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 11px;
  padding: 6px 9px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  background: rgba(var(--ink-rgb), 0.045);
  border: 0.5px dashed rgba(var(--ink-rgb), 0.2);
  color: rgba(var(--ink-rgb), 0.5);
}
.kb-agent .kb-watch i {
  width: 5px;
  height: 5px;
  flex: none;
  border-radius: 50%;
  background: rgba(var(--ink-rgb), 0.32);
}

.kb-agent .kb-cmd {
  border-radius: 10px;
  padding: 12px 13px;
  background: rgba(var(--accent-rgb), 0.06);
  border: 0.5px solid rgba(var(--accent-rgb), 0.24);
}
.kb-agent .kb-cmd code {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--accent);
  overflow-wrap: break-word;
}

.kb-agent .kb-bens { display: flex; flex-direction: column; gap: 9px; margin: 0; padding: 0; list-style: none; }
.kb-agent .kb-bens li { display: flex; align-items: flex-start; gap: 9px; }
.kb-agent .kb-bens li i {
  width: 15px;
  height: 15px;
  flex: none;
  margin-top: 1px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}
.kb-agent .kb-bens li span {
  font-size: 12.5px;
  line-height: 1.55;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}

.kb-agent .kb-disc {
  padding: 0 16px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1.5;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.68);
}

/* staged target for the primary CTA; replaced by Section 04 */
.kb-agent .kb-staged {
  scroll-margin-top: 84px;
  border-radius: 14px;
  padding: 20px;
  background: transparent;
  border: 1px dashed rgba(var(--ink-rgb), 0.22);
}
.kb-agent .kb-staged .lab { margin-bottom: 10px; }
.kb-agent .kb-staged p + p {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgba(var(--ink-rgb), 0.6);
  max-width: 68ch;
  text-wrap: pretty;
}

@media (prefers-reduced-motion: reduce) {
  .kb-agent .kb-cta.pri:hover { transform: none; }
  .kb-agent .kb-state { transition: none; }
}
`
