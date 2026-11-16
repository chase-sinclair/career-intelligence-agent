'use client'

import { useEffect, useRef, useState } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { KB_BUILD, KB_BUILD_CYCLE_MS, KB_LIBRARY, KB_LIBRARY_WINDOW } from '@/lib/kb-agent-data'

/**
 * Section 03 of the KB Agent case study: The Build.
 *
 * Two columns: the approved heading and paragraphs on the left, a compact
 * vertical system overview on the right. The graphic stacks library -> agent
 * -> a Slack/Notion pair, joined by short labelled connectors, and stands
 * about 450px tall so the section stays shallow ahead of the full-width
 * section that follows.
 *
 * The library card shows three of six categories at a time: the window slides
 * so the active category is always the middle row. That keeps the card three
 * rows tall without dropping any category from the cycle.
 *
 * Slack and Notion sit side by side at the bottom, Slack solid and primary,
 * Notion on a dashed card marked OPTIONAL and joined to Slack by a dashed
 * connector. Notion is never drawn as a second output of the agent, because a
 * Notion task is started from Slack and a person has to confirm it.
 *
 * Motion is confined to the library card and the library -> agent connector.
 * Slack and Notion never animate: Slack actions are user invoked and a Notion
 * task needs a person to submit it, so animating that side would state
 * something untrue.
 *
 * The two small hooks below are duplicated from `KbAgentHero` on purpose:
 * Sections 01 and 02 are approved and must not be touched, and a shared-hook
 * refactor would edit the hero.
 */

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

function useIsVisible<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

/** Phases of one illustrative watch-and-index cycle. */
type Phase = 'settled' | 'cue' | 'pulse' | 'indexed' | 'relay'

/** Offsets within a cycle, in ms. Roughly 8s end to end. */
const PHASES: ReadonlyArray<[number, Phase]> = [
  [0, 'settled'],
  [950, 'cue'],
  [1550, 'pulse'],
  [2650, 'indexed'],
  [3400, 'relay'],
  [4650, 'settled'],
]

/** How long the row names stay faded while the window slides. */
const SWAP_MS = 320

function FileGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </svg>
  )
}

function FolderGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z" />
    </svg>
  )
}

function HubGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v5.3M12 16.7V22M2 12h5.3M16.7 12H22" />
    </svg>
  )
}

function SlackGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
    </svg>
  )
}

/** The site's checked bullet, reused from the hero's benefit rows. */
function CheckBullet() {
  return (
    <i className="kb-chk" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
        <path d="m5 13 4 4 10-10" />
      </svg>
    </i>
  )
}

function NotionGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l2 2 4-4" />
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
    </svg>
  )
}

/**
 * The system overview.
 *
 * Presentational. No network calls and no product state; every string is a
 * local constant describing the fictional test library.
 */
function KbSystem() {
  const { ref, visible } = useIsVisible<HTMLDivElement>(0.25)
  const reduced = usePrefersReducedMotion()

  const [cycle, setCycle] = useState(0)
  /** The window the rows currently render; lags `cycle` by one fade. */
  const [shown, setShown] = useState(0)
  const [swapping, setSwapping] = useState(false)
  const [phase, setPhase] = useState<Phase>('settled')
  const running = visible && !reduced

  useEffect(() => {
    if (!running) {
      setPhase('settled')
      setSwapping(false)
      return
    }
    const timeouts: number[] = []
    const run = (next: number) => {
      setSwapping(true)
      timeouts.push(
        window.setTimeout(() => {
          setShown(next)
          setSwapping(false)
        }, SWAP_MS),
      )
      PHASES.forEach(([at, p]) => {
        timeouts.push(window.setTimeout(() => setPhase(p), at))
      })
    }
    run(cycle)
    const id = window.setInterval(() => {
      setCycle((c) => {
        run(c + 1)
        return c + 1
      })
    }, KB_BUILD_CYCLE_MS)
    return () => {
      window.clearInterval(id)
      timeouts.forEach(window.clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  /**
   * Three rows on screen out of six categories. The active one is the middle
   * row and the window slides with it, so no category leaves the cycle.
   */
  const activeIdx = reduced ? 1 : shown % KB_LIBRARY.length
  const windowRows = Array.from({ length: KB_LIBRARY_WINDOW }, (_, i) => {
    const at = (activeIdx + i - 1 + KB_LIBRARY.length) % KB_LIBRARY.length
    return KB_LIBRARY[at]
  })
  const middle = Math.floor(KB_LIBRARY_WINDOW / 2)
  const cueOn =
    reduced || phase === 'cue' || phase === 'pulse' || phase === 'indexed' || phase === 'relay'
  const indexedOn = reduced || phase === 'indexed' || phase === 'relay'

  return (
    <div className="kb-stack" ref={ref}>
      {/* TOP — the watched library, three rows of six categories */}
      <div className="kb-card kb-lib">
        <div className="kb-card-hd">
          <span className="kb-card-ic" aria-hidden="true">
            <FolderGlyph />
          </span>
          <p className="kb-card-nm">{KB_BUILD.libraryName}</p>
        </div>
        <ul className="kb-rows">
          {windowRows.map((row, i) => (
            <li
              key={`slot-${i}`}
              className={`kb-row${i === middle ? ' on' : ''}${swapping ? ' swap' : ''}`}
            >
              <span className="kb-row-ic" aria-hidden="true">
                <FileGlyph />
              </span>
              <span className="kb-row-nm">{row.name}</span>
              <span className={`kb-cue${i === middle && cueOn ? ' on' : ''}`}>{row.cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CONNECTOR A — the only animated one */}
      <div className="kb-vlink">
        <i className="kb-vwire" aria-hidden="true" />
        <i className="kb-varrow" aria-hidden="true" />
        {!reduced && (
          <i
            key={`${cycle}-${phase}`}
            className={`kb-vpulse${phase === 'pulse' ? ' on' : ''}`}
            aria-hidden="true"
          />
        )}
        {/* Shines as the cue travels down the wire. */}
        <p
          key={`mon-${cycle}-${phase === 'pulse'}`}
          className={`kb-vlink-lab${phase === 'pulse' ? ' shine' : ''}`}
        >
          {KB_BUILD.linkMonitor}
        </p>
      </div>

      {/* MIDDLE — the agent. One capability line; the acknowledgement rides in
          the header, so there is no persistent status band to pad the card. */}
      <div className="kb-card kb-hub">
        <div className="kb-card-hd">
          <span className="kb-card-ic" aria-hidden="true">
            <HubGlyph />
          </span>
          <p className="kb-card-nm">{KB_BUILD.hubName}</p>
          <span className={`kb-indexed${indexedOn ? ' on' : ''}`} aria-hidden={!indexedOn}>
            {KB_BUILD.indexedCue}
          </span>
        </div>
        <ul className="kb-bul">
          {KB_BUILD.hubCapabilities.map((cap) => (
            <li key={cap}>
              <CheckBullet />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CONNECTOR B — never animated */}
      <div className="kb-vlink">
        <i className="kb-vwire" aria-hidden="true" />
        <i className="kb-varrow" aria-hidden="true" />
        {/* Shines just after the acknowledgement, handing off to Slack. */}
        <p
          key={`ask-${cycle}-${phase === 'relay'}`}
          className={`kb-vlink-lab${phase === 'relay' ? ' shine' : ''}`}
        >
          {KB_BUILD.linkAsk}
        </p>
      </div>

      {/* BOTTOM — Slack primary, Notion optional and joined to Slack */}
      <div className="kb-pair">
        <i className="kb-pair-link" aria-hidden="true" />
        <div className="kb-card">
          <div className="kb-card-hd">
            <span className="kb-card-ic" aria-hidden="true">
              <SlackGlyph />
            </span>
            <p className="kb-card-nm">{KB_BUILD.slackName}</p>
          </div>
          <ul className="kb-acts">
            {KB_BUILD.slackActions.map((action) => (
              <li key={action}>
                <CheckBullet />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="kb-card kb-notion">
          <div className="kb-card-hd">
            <span className="kb-card-ic" aria-hidden="true">
              <NotionGlyph />
            </span>
            <p className="kb-card-nm">{KB_BUILD.notionName}</p>
            <span className="kb-opt">{KB_BUILD.notionGate}</span>
          </div>
          <ul className="kb-acts one">
            {KB_BUILD.notionActions.map((action) => (
              <li key={action}>
                <CheckBullet />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="kb-note">{KB_BUILD.notionNote}</p>

      {/* The diagram's meaning in words, for screen readers and as the honest
          summary of what the picture claims. */}
      <p className="kb-sr">{KB_BUILD.diagramSummary}</p>
    </div>
  )
}

export default function KbAgentBuild() {
  return (
    <section id="kb-build" className="kb-build" aria-labelledby="kb-build-h">
      <div className="kb-build-grid">
        <div className="kb-build-text">
          <Eyebrow>{KB_BUILD.eyebrow}</Eyebrow>
          <h2 id="kb-build-h" className="kb-h2">
            {KB_BUILD.heading}
          </h2>
          {KB_BUILD.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="lede">
              {paragraph}
            </p>
          ))}
        </div>
        <KbSystem />
      </div>
    </section>
  )
}

/**
 * Section 03's stylesheet, appended by `KbAgentPage` via `extraCss`. Scoped
 * under `.kb-agent`; tokens only, no new colour literals. Text sizes match
 * the approved revision: the height came out of the layout, not the type.
 */
export const KB_BUILD_CSS = `
.kb-agent .kb-build-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 460px);
  gap: 40px;
  align-items: start;
}
@media (max-width: 1060px) {
  .kb-agent .kb-build-grid { grid-template-columns: minmax(0, 1fr); gap: 36px; }
}
.kb-agent .kb-build-text .kb-h2 { margin-bottom: 22px; }
.kb-agent .kb-build-text .lede { max-width: 58ch; }
.kb-agent .kb-build-text .lede + .lede { margin-top: 16px; }

.kb-agent .kb-stack { position: relative; display: flex; flex-direction: column; align-items: stretch; }

/* cards */
.kb-agent .kb-card {
  border-radius: 11px;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
  box-shadow: 0 1px 2px rgba(var(--ink-rgb), 0.03);
  overflow: hidden;
}
.kb-agent .kb-card-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.09);
}
.kb-agent .kb-card-ic { display: flex; flex: none; color: var(--accent); }
.kb-agent .kb-card-nm {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  white-space: nowrap;
  color: rgba(var(--ink-rgb), 0.88);
}

/* top card — three rows visible, six categories cycling through them */
.kb-agent .kb-rows { list-style: none; margin: 0; padding: 5px; }
.kb-agent .kb-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 29px;
  padding: 0 8px;
  border-radius: 6px;
  transition: background 0.4s ease, box-shadow 0.4s ease;
}
.kb-agent .kb-row-ic { display: flex; flex: none; color: rgba(var(--ink-rgb), 0.3); transition: color 0.4s ease; }
.kb-agent .kb-row-nm {
  font-size: 12.5px;
  line-height: 1;
  white-space: nowrap;
  color: rgba(var(--ink-rgb), 0.62);
  transition: color 0.35s ease, opacity 0.35s ease;
}
.kb-agent .kb-row.on {
  background: rgba(var(--accent-rgb), 0.08);
  box-shadow: inset 0 0 0 0.5px rgba(var(--accent-rgb), 0.26);
}
.kb-agent .kb-row.on .kb-row-ic { color: var(--accent); }
.kb-agent .kb-row.on .kb-row-nm { color: rgba(var(--ink-rgb), 0.9); }
/* The window slides while the names are faded out, so no row ever jumps. */
.kb-agent .kb-row.swap .kb-row-nm { opacity: 0; }
.kb-agent .kb-cue {
  margin-left: auto;
  flex: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  padding: 4px 6px;
  border-radius: 4px;
  background: rgba(var(--accent-rgb), 0.13);
  color: var(--accent);
  opacity: 0;
  transition: opacity 0.45s ease;
}
.kb-agent .kb-cue.on { opacity: 1; }

/* middle card — one capability line, acknowledgement in the header */
.kb-agent .kb-hub {
  background: var(--panel-solid);
  border: 1px solid rgba(var(--accent-rgb), 0.32);
  box-shadow: 0 2px 6px rgba(var(--accent-rgb), 0.06), 0 8px 20px rgba(var(--accent-rgb), 0.05);
}
.kb-agent .kb-hub .kb-card-hd {
  padding: 10px 13px;
  background: rgba(var(--accent-rgb), 0.07);
  border-bottom: 0.5px solid rgba(var(--accent-rgb), 0.18);
  border-radius: 10px 10px 0 0;
}
.kb-agent .kb-hub .kb-card-ic {
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(var(--accent-rgb), 0.13);
}
.kb-agent .kb-hub .kb-card-nm { font-size: 13.5px; color: var(--accent); }
.kb-agent .kb-indexed {
  margin-left: auto;
  flex: none;
  display: inline-flex;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  white-space: nowrap;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4.5px 8px;
  border-radius: 20px;
  background: var(--accent);
  color: var(--accent-ink);
  opacity: 0;
  transition: opacity 0.5s ease;
}
.kb-agent .kb-indexed.on { opacity: 1; }
/* checked bullets, shared by the agent, Slack and Notion cards */
.kb-agent .kb-chk {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  margin-top: 1px;
  border-radius: 50%;
  background: rgba(var(--accent-rgb), 0.13);
  color: var(--accent);
}
/* Three capabilities, one per row. */
.kb-agent .kb-bul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 11px 13px 12px;
}
.kb-agent .kb-bul li {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12.5px;
  line-height: 1.3;
  white-space: nowrap;
  color: rgba(var(--ink-rgb), 0.74);
}

/* bottom pair — Slack primary, Notion subdued and optional */
.kb-agent .kb-pair {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}
/* Dashed Slack -> Notion link, level with both card headers. */
.kb-agent .kb-pair-link {
  position: absolute;
  top: 19px;
  left: 50%;
  width: 20px;
  transform: translateX(-50%);
  border-top: 1px dashed rgba(var(--ink-rgb), 0.28);
}
.kb-agent .kb-pair-link::after {
  content: '';
  position: absolute;
  top: -2.5px;
  right: 0;
  width: 4px;
  height: 4px;
  border-top: 1px solid rgba(var(--ink-rgb), 0.36);
  border-right: 1px solid rgba(var(--ink-rgb), 0.36);
  transform: rotate(45deg);
}
/* Slack: two rows of two. Notion: two rows of one. */
.kb-agent .kb-acts {
  list-style: none;
  margin: 0;
  display: grid;
  grid-template-columns: max-content max-content;
  justify-content: start;
  gap: 9px 12px;
  padding: 10px 11px 12px;
}
.kb-agent .kb-acts.one { grid-template-columns: max-content; }
.kb-agent .kb-acts li {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 12.5px;
  line-height: 1.3;
  white-space: nowrap;
  color: rgba(var(--ink-rgb), 0.7);
}
.kb-agent .kb-notion { background: var(--panel-2); border-style: dashed; box-shadow: none; }
.kb-agent .kb-notion .kb-card-nm { color: rgba(var(--ink-rgb), 0.7); }
.kb-agent .kb-notion .kb-card-ic { color: rgba(var(--accent-rgb), 0.6); }
.kb-agent .kb-notion .kb-acts li { color: rgba(var(--ink-rgb), 0.62); }
.kb-agent .kb-notion .kb-chk { background: rgba(var(--accent-rgb), 0.09); color: rgba(var(--accent-rgb), 0.72); }
.kb-agent .kb-opt {
  margin-left: auto;
  flex: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  line-height: 1;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.48);
}
.kb-agent .kb-note {
  margin-top: 13px;
  font-size: 11.5px;
  line-height: 1.55;
  color: rgba(var(--ink-rgb), 0.56);
  text-wrap: pretty;
}

/* vertical connectors */
.kb-agent .kb-vlink { position: relative; display: flex; align-items: center; min-height: 26px; padding-left: 19px; }
.kb-agent .kb-vwire { position: absolute; left: 19px; top: 0; bottom: 0; width: 1px; background: rgba(var(--ink-rgb), 0.2); }
.kb-agent .kb-varrow {
  position: absolute;
  left: 16.5px;
  bottom: 0;
  width: 5px;
  height: 5px;
  border-right: 1px solid rgba(var(--ink-rgb), 0.36);
  border-bottom: 1px solid rgba(var(--ink-rgb), 0.36);
  transform: rotate(45deg);
}
.kb-agent .kb-vlink-lab {
  margin-left: 13px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1.4;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.62);
}
/* One-shot shine on a connector label. */
.kb-agent .kb-vlink-lab.shine { animation: kb-lab-shine 1.15s cubic-bezier(0.3, 0, 0.2, 1) both; }
@keyframes kb-lab-shine {
  0% { color: rgba(var(--ink-rgb), 0.62); text-shadow: none; letter-spacing: 0.11em; }
  18% {
    color: var(--accent);
    text-shadow: 0 0 14px rgba(var(--accent-rgb), 0.62), 0 0 4px rgba(var(--accent-rgb), 0.5);
    letter-spacing: 0.135em;
  }
  62% { color: var(--accent); text-shadow: 0 0 10px rgba(var(--accent-rgb), 0.34); letter-spacing: 0.12em; }
  100% { color: rgba(var(--ink-rgb), 0.62); text-shadow: none; letter-spacing: 0.11em; }
}
.kb-agent .kb-vpulse {
  position: absolute;
  left: -1.5px;
  top: 0;
  width: 4px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(var(--accent-rgb), 0) 0%, rgba(var(--accent-rgb), 0.62) 60%, rgba(var(--accent-rgb), 0) 100%);
  opacity: 0;
}
.kb-agent .kb-vpulse.on { animation: kb-pulse-run 1.1s cubic-bezier(0.4, 0, 0.3, 1) both; }
@keyframes kb-pulse-run {
  0% { top: -24%; opacity: 0; }
  18% { opacity: 1; }
  82% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.kb-agent .kb-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .kb-agent .kb-row, .kb-agent .kb-row-nm, .kb-agent .kb-cue, .kb-agent .kb-indexed { transition: none; }
  .kb-agent .kb-vlink-lab.shine { animation: none; }
}
`
