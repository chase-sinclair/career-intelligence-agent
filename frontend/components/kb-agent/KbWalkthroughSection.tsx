'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import SlackWalkthroughSection04, {
  DEMO_STEPS,
  SlackCommandPills,
} from '@/components/kb-agent/SlackWalkthroughSection04'
import StepExplanationPanel from '@/components/kb-agent/StepExplanationPanel'
import { STEP_TICKET, useWalkthroughReplay } from '@/components/kb-agent/useWalkthroughReplay'
import { KB_WALKTHROUGH, KB_WALKTHROUGH_ID } from '@/lib/kb-agent-data'

/**
 * Section 04 of the KB Agent case study: the interactive walkthrough.
 *
 *   KbWalkthroughSection (site theme; owns replay state and layout)
 *   ├── SlackWalkthroughSection04 (approved Slack replay, now controlled)
 *   └── StepExplanationPanel (portfolio-authored explanation)
 *
 * `useWalkthroughReplay` is the only state machine. Both children render from
 * the same object, so the panel cannot reveal a finding before the Slack
 * output that supports it is on screen, and cannot lag behind it either.
 *
 * The eight command pills sit in one row above both columns; the Slack window
 * has a fixed height with an internally scrolling history (see
 * `.kb-slack-frame`).
 *
 * Expand Slack is a class change on the grid, not a second component: both
 * children stay mounted in the same tree positions, so the selected step,
 * playback, Step 07 subcommand and Step 08 stage all survive the toggle.
 *
 * Nothing here makes a network request. Every result is prepared data.
 */

function ExpandGlyph({ wide }: { wide: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {wide ? (
        <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
      ) : (
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      )}
    </svg>
  )
}

/** Where Expand Slack parks the command row: 64px TopNav + 12px breathing room. */
const EXPAND_OFFSET = 76

/** Expanded window height bounds. 640px is the approved size where it fits. */
const WIDE_MAX = 640
const WIDE_MIN = 420
/** Breathing room kept under the window's bottom edge when expanded. */
const WIDE_BOTTOM_GAP = 12

/**
 * Expanded mode sizes the Slack window to the viewport: with the command row
 * parked at EXPAND_OFFSET, the window gets whatever height is left above the
 * fold, capped at 640px. Only the scrollable history shrinks (the composer
 * keeps its natural height, including multi-line commands), so fonts, tables
 * and the composer are untouched. Re-measured on resize and whenever the
 * space between the command row and the window changes (Step 07's
 * subcommand card).
 */
function useWideHeight(
  wide: boolean,
  barRef: RefObject<HTMLDivElement>,
  gridRef: RefObject<HTMLDivElement>,
  layoutKey: string,
) {
  const [height, setHeight] = useState<number>(WIDE_MAX)
  useEffect(() => {
    if (!wide) return
    const measure = () => {
      const bar = barRef.current
      const frame = gridRef.current?.querySelector<HTMLElement>('.kb-slack-frame')
      if (!bar || !frame) return
      const above = frame.getBoundingClientRect().top - bar.getBoundingClientRect().top
      const room = window.innerHeight - EXPAND_OFFSET - above - WIDE_BOTTOM_GAP
      setHeight(Math.round(Math.max(WIDE_MIN, Math.min(WIDE_MAX, room))))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [wide, barRef, gridRef, layoutKey])
  return height
}

/** Offset below the fixed TopNav (64px) the sticky panel rests at. */
const STICKY_TOP = 88

/**
 * Sticky only while the panel fits on screen. A sticky element taller than
 * the viewport would hide its own bottom until the section ends, so in that
 * case it stays in normal flow instead (handoff §3).
 */
function useFitsSticky() {
  const ref = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setFits(el.offsetHeight <= window.innerHeight - STICKY_TOP - 16)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return { ref, fits }
}

/** Polite screen-reader narration of replay progress. */
function useAnnouncement(stepIdx: number, sub: 0 | 1, status: string, stage: string) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const step = DEMO_STEPS[stepIdx]
    const command = step.subCommands ? step.subCommands[sub].commandShort : step.commandShort
    if (status === 'reasoning') setMessage(`Replaying ${command}.`)
    else if (status === 'done') {
      if (stepIdx === STEP_TICKET) {
        setMessage(
          stage === 'modal'
            ? 'Recorded review form shown. Explanation updates after the recorded confirmation.'
            : stage === 'confirmed'
              ? 'Recorded Slack confirmation shown. Explanation updated.'
              : 'Verified Notion task record shown.',
        )
      } else setMessage(`Recorded result for ${command} shown. Explanation updated.`)
    } else setMessage('')
  }, [stepIdx, sub, status, stage])
  return message
}

export default function KbWalkthroughSection() {
  const { state, actions } = useWalkthroughReplay()
  const [wide, setWide] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const { ref: sideRef, fits } = useFitsSticky()
  const wideHeight = useWideHeight(wide, barRef, gridRef, `${state.stepIdx}-${state.sub}`)

  /**
   * Expand: bring the command row to just under the TopNav, with the 640px
   * window directly below it, so commands, output, composer and Send share one
   * 1440x900 viewport. Return: hold the command row exactly where it is on
   * screen, so the layout change reads as the window narrowing in place.
   * Nothing remounts, so step, result, activity disclosure and the history's
   * own scroll position all carry across.
   */
  const toggleWide = () => {
    const bar = barRef.current
    const before = bar ? bar.getBoundingClientRect().top : 0
    const next = !wide
    setWide(next)
    requestAnimationFrame(() => {
      if (!bar) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (next) {
        const top = bar.getBoundingClientRect().top + window.scrollY - EXPAND_OFFSET
        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
      } else {
        window.scrollBy({ top: bar.getBoundingClientRect().top - before, behavior: 'auto' })
      }
    })
  }

  const announcement = useAnnouncement(state.stepIdx, state.sub, state.status, state.stage)

  /** Only Step 04 carries an editorial note (the composite-score caveat). */
  const note = state.status === 'done' ? KB_WALKTHROUGH.replayNotes[state.stepIdx] : undefined

  return (
    <section id={KB_WALKTHROUGH_ID} className="kb-wt" aria-labelledby="kb-wt-h">
      <div className="kb-wt-head">
        <Eyebrow>{KB_WALKTHROUGH.eyebrow}</Eyebrow>
        <h2 id="kb-wt-h" className="kb-h2">
          {KB_WALKTHROUGH.heading}
        </h2>
        <p className="lede kb-wt-intro">{KB_WALKTHROUGH.intro}</p>
        <div className="kb-wt-disc" role="note" aria-labelledby="kb-wt-disc-h">
          <p id="kb-wt-disc-h" className="kb-wt-disc-h">
            {KB_WALKTHROUGH.disclosure.title}
          </p>
          <p>{KB_WALKTHROUGH.disclosure.text}</p>
        </div>
      </div>

      {/* Command row: full content width, above both columns. */}
      <div ref={barRef} className="kb-wt-bar">
        <p id="kb-wt-pills-label" className="lab">
          Prepared commands · select any step, then press Send
        </p>
        <button
          ref={toggleRef}
          type="button"
          className="kb-wt-toggle"
          aria-pressed={wide}
          aria-controls="kb-wt-grid"
          onClick={toggleWide}
        >
          <ExpandGlyph wide={wide} />
          {wide ? KB_WALKTHROUGH.collapseLabel : KB_WALKTHROUGH.expandLabel}
        </button>
      </div>
      <div className="kb-wt-pills">
        <SlackCommandPills stepIdx={state.stepIdx} onSelect={actions.selectStep} labelledBy="kb-wt-pills-label" />
      </div>

      <div
        id="kb-wt-grid"
        ref={gridRef}
        className={`kb-wt-grid${wide ? ' is-wide' : ''}`}
        style={wide ? ({ '--kb-wide-h': `${wideHeight}px` } as CSSProperties) : undefined}
      >
        <div className="kb-wt-main">
          <SlackWalkthroughSection04 state={state} actions={actions} />

          <ul className="kb-wt-legend" aria-label="Key">
            {KB_WALKTHROUGH.legend.map((item) => (
              <li key={item.kind}>
                <i className={`kb-wt-key ${item.kind}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>

          {note && (
            <div className="kb-wt-note" key={`note-${state.stepIdx}`}>
              <p className="lab">Editorial note</p>
              <p>{note}</p>
            </div>
          )}
        </div>

        <div ref={sideRef} className={`kb-wt-side${fits ? ' can-stick' : ''}`}>
          <StepExplanationPanel state={state} />
        </div>
      </div>

      <p className="kb-sr" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  )
}

/**
 * Section 04's stylesheet, appended to the shared sheet by `KbAgentPage` via
 * `CaseStudyShell`'s `extraCss`. Scoped under `.kb-agent`; tokens only. The
 * Slack replay itself is styled with Tailwind utilities, as supplied.
 */
export const KB_WALKTHROUGH_CSS = `
.kb-agent .kb-wt { scroll-margin-top: 84px; }
.kb-agent .kb-wt-head { margin-bottom: 30px; }
.kb-agent .kb-wt-intro {
  /* Full metrics set here: the shared sheet styles .lede only inside .hero. */
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(var(--ink-rgb), 0.72);
  max-width: 62ch;
  text-wrap: pretty;
}
.kb-agent .kb-wt-disc {
  max-width: 78ch;
  margin-top: 20px;
  padding: 12px 15px 13px;
  border-radius: 12px;
  background: var(--panel-3);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
}
.kb-agent .kb-wt-disc-h {
  margin-bottom: 4px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(var(--ink-rgb), 0.86);
}
.kb-agent .kb-wt-disc-h + p {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.72);
  text-wrap: pretty;
}

/* two synchronized columns, ~70 / 30 */
.kb-agent .kb-wt-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(300px, 3fr);
  gap: 28px;
  align-items: start;
}
.kb-agent .kb-wt-grid.is-wide { grid-template-columns: minmax(0, 1fr); }
.kb-agent .kb-wt-main { min-width: 0; }
.kb-agent .kb-wt-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
  margin-bottom: 9px;
}
.kb-agent .kb-wt-pills { margin-bottom: 14px; }

/* Fixed-height Slack window: history scrolls inside, composer stays pinned.
   Taller when expanded, since that mode exists for dense outputs. */
.kb-agent .kb-slack-frame { height: 560px; transition: height 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
/* Pass 3: compact before anything has been replayed for the loaded command.
   It only grows downward, so nothing above it (or the page scroll) moves. */
.kb-agent .kb-slack-frame[data-compact='true'] { height: 400px; }
.kb-agent .kb-wt-grid.is-wide .kb-slack-frame,
.kb-agent .kb-wt-grid.is-wide .kb-slack-frame[data-compact='true'] { height: var(--kb-wide-h, 640px); }
.kb-agent .kb-wt-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  line-height: 1;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  border: 0.5px solid rgba(var(--ink-rgb), 0.22);
  color: rgba(var(--ink-rgb), 0.7);
  transition: background 0.18s, border-color 0.18s, color 0.18s;
}
.kb-agent .kb-wt-toggle:hover,
.kb-agent .kb-wt-toggle[aria-pressed='true'] {
  background: rgba(var(--accent-rgb), 0.07);
  border-color: rgba(var(--accent-rgb), 0.4);
  color: var(--accent);
}
.kb-agent .kb-wt-toggle:focus-visible {
  outline: 2px solid rgba(var(--accent-rgb), 0.55);
  outline-offset: 2px;
}

/* editorial note under the frame, outside the bot message */
.kb-agent .kb-wt-note {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: baseline;
  margin-top: 14px;
  padding: 12px 15px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
  border-left: 2px solid rgba(var(--accent-rgb), 0.55);
  animation: kb-xp-in 0.32s ease both;
}
.kb-agent .kb-wt-note .lab { color: var(--accent); white-space: nowrap; }
.kb-agent .kb-wt-note p + p {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}

/* one understated key line, 18px under the Slack window */
.kb-agent .kb-wt-legend {
  list-style: none;
  margin: 18px 0 0;
  padding: 0 2px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 22px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(var(--ink-rgb), 0.64);
}
.kb-agent .kb-wt-legend li { display: inline-flex; align-items: center; gap: 7px; }
.kb-agent .kb-wt-key { flex: none; width: 8px; height: 8px; border-radius: 50%; }
.kb-agent .kb-wt-key.recorded { background: var(--accent); }
.kb-agent .kb-wt-key.synthetic {
  background: repeating-linear-gradient(135deg, rgba(var(--ink-rgb), 0.5) 0 1.5px, transparent 1.5px 3px);
  box-shadow: inset 0 0 0 1px rgba(var(--ink-rgb), 0.42);
}
.kb-agent .kb-wt-key.reconstructed { border: 1px dashed rgba(var(--ink-rgb), 0.55); }

/* explanation panel */
.kb-agent .kb-wt-side { min-width: 0; }
/* Split view only, and only while the panel fits on screen (useFitsSticky).
   Its containing block is the grid, so it can never travel into Section 05. */
.kb-agent .kb-wt-grid:not(.is-wide) .kb-wt-side.can-stick { position: sticky; top: 88px; }
.kb-agent .kb-wt-grid.is-wide .kb-wt-side { padding-top: 2px; }
.kb-agent .kb-wt-grid.is-wide .kb-xp { max-width: 760px; }
.kb-agent .kb-xp {
  border-radius: 16px;
  padding: 24px 24px 24px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.kb-agent .kb-xp-lab { color: rgba(var(--ink-rgb), 0.62); }
.kb-agent .kb-xp-num { color: var(--accent); }
.kb-agent .kb-xp-part { color: rgba(var(--ink-rgb), 0.62); }
.kb-agent .kb-xp-h {
  font-weight: 300;
  font-size: 1.5rem;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--ink);
  text-wrap: balance;
}
.kb-agent .kb-xp-lab + .kb-xp-h { margin-top: 11px; }
.kb-agent .kb-xp-h + .kb-xp-p { margin-top: 14px; }
.kb-agent .kb-xp-k { margin: 20px 0 8px; color: var(--accent); }
.kb-agent .kb-xp-rule + .kb-xp-k { margin-top: 18px; }
.kb-agent .kb-xp-p {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgba(var(--ink-rgb), 0.76);
  text-wrap: pretty;
}
.kb-agent .kb-xp-matters { color: rgba(var(--ink-rgb), 0.9); }
.kb-agent .kb-xp-rule { height: 1px; margin-top: 20px; background: rgba(var(--ink-rgb), 0.09); }
.kb-agent .kb-xp-sub {
  margin: 18px 0 6px;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(var(--ink-rgb), 0.88);
}
.kb-agent .kb-xp-pending {
  margin-top: 18px;
  padding-top: 13px;
  border-top: 1px dashed rgba(var(--ink-rgb), 0.16);
  font-size: 12.5px;
  line-height: 1.5;
  color: rgba(var(--ink-rgb), 0.66);
}
.kb-agent .kb-xp-in,
.kb-agent .kb-xp-fade,
.kb-agent .kb-xp-pending { animation: kb-xp-in 0.32s ease both; }
@keyframes kb-xp-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .kb-agent .kb-xp-in,
  .kb-agent .kb-xp-fade,
  .kb-agent .kb-xp-pending,
  .kb-agent .kb-wt-note { animation: none; }
  .kb-agent .kb-slack-frame { transition: none; }
}
`
