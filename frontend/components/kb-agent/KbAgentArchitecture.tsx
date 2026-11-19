'use client'

import { Fragment, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { KB_ARCH, KB_ARCH_VIEWS } from '@/lib/kb-agent-data'
import type { KbArchView } from '@/lib/kb-agent-data'

/**
 * Section 05 of the KB Agent case study: System Architecture.
 *
 * Ported from the reviewed Codex component
 * (`KB-Agent-Section-05-Site-Handoff/source/ArchitectureSection.jsx`) into the
 * host's conventions: TSX, copy in `lib/kb-agent-data.ts`, the page's
 * `Eyebrow` / `.kb-h2` / lede metrics, host tokens and fonts, and one scoped
 * stylesheet string (`KB_ARCH_CSS`) composed through `CaseStudyShell`.
 *
 * One component tree, one state value. The architecture map is a single CSS
 * grid; both views render into the same cells. Every box holds both variants
 * of its text stacked in one grid area (`Dual`), with only the active one
 * visible. Each box is therefore always as tall as its longer variant, so
 * toggling changes content, never geometry: no fixed row heights to clip
 * text, and nothing moves.
 *
 * Connectors are small inline SVGs in their own grid cells, so they follow
 * the grid at any width and sit on identical routes in both views. All of
 * them are decorative (aria-hidden); direction is also carried by labels.
 *
 * Static apart from the view selector: no network requests, no timers, and
 * the only motion is an optional 180ms crossfade, removed under reduced
 * motion.
 */

// ── Icons and small drawings (from the Codex source) ────────────────────────

const ICON_PATHS = {
  layers: 'm3 8 9-5 9 5-9 5z M3 12l9 5 9-5 M3 16l9 5 9-5',
  search: 'M15.8 15.8 21 21 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  route: 'M6 5v14 M6 8h9q3 0 3-3 M6 16h9q3 0 3 3 M3 3h6v4H3z M15 1h6v4h-6z M15 19h6v4h-6z',
  code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 4l-4 16',
  store: 'M4 6c0-5 16-5 16 0s-16 5-16 0z M4 6v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0',
  loop: 'M3 10a9 9 0 0 1 15-5l3 3 M21 3v5h-5 M21 14a9 9 0 0 1-15 5l-3-3 M3 21v-5h5',
  slack: 'M9 3v11 M15 10v11 M3 9h11 M10 15h11',
  reply: 'M3 4h18v13H9l-6 4z M7 8h10 M7 12h6',
  task: 'M5 4h14v17H5z M9 2h6v4H9z M8 13l3 3 5-6',
} as const
type IconName = keyof typeof ICON_PATHS

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}

/**
 * Miniature diagram illustrations. Same slot in both views. Fills are light
 * tints of the site accent; the single amber element marks the illustrative
 * evidence chain (highlighted passage on the shelf, top of the merged list).
 */
function Drawing({ name }: { name: 'sources' | 'change' | 'index' | 'library' | 'merge' }) {
  const page = (
    <>
      <path d="M0 0h19l7 7v29H0z" fill="#fbfdfd" />
      <path d="M19 0v7h7M5 14h15M5 19h12M5 24h14" />
    </>
  )
  const art: Record<typeof name, ReactNode> = {
    sources: (
      <>
        <path d="M6 16h20l5 5h39v23H6z" fill="#c9e0db" />
        <g transform="translate(23 6) rotate(-7 13 18)">{page}</g>
        <g transform="translate(42 4) rotate(5 13 18)">{page}</g>
        <path d="M7 24h68l-6 23H3z" fill="#deedea" />
        <path d="M10 28h58" />
      </>
    ),
    change: (
      <>
        <g transform="translate(5 11) scale(.85)">{page}</g>
        <g transform="translate(62 11) scale(.85)">{page}</g>
        <path d="M28 14q15-14 30 0m-7-1 7 1-1-6M60 40q-15 14-30 0m7 1-7-1 1 6" />
        <path d="m36 26 5 5 10-12" strokeWidth="2.5" />
      </>
    ),
    index: (
      <>
        <g transform="translate(7 8)">{page}</g>
        <path d="M35 25h13m0-12v25m0-25h12m-12 12h12m-12 13h12" />
        {[9, 21, 34].map((y) => (
          <g key={y}>
            <rect x="60" y={y} width="30" height="8" rx="2" fill="#deedea" />
            <path d={`M65 ${y + 4}h15`} />
          </g>
        ))}
      </>
    ),
    library: (
      <>
        <path d="M2 45h97v3H2z" fill="#b2d3cc" />
        {[7, 20, 33, 52, 65, 80].map((x, i) => (
          <g key={x} transform={i === 2 ? 'rotate(9 40 44)' : undefined} stroke={i === 3 ? '#8f5a17' : undefined}>
            <rect x={x} y={i % 2 ? 8 : 13} width={i === 3 ? 11 : 9} height={i % 2 ? 36 : 31} rx="1.5" fill={i === 3 ? '#f3d9a8' : i % 2 ? '#deedea' : '#f4f8f7'} />
            <path d={`M${x + 2} 20h5 M${x + 2} 37h5`} />
          </g>
        ))}
      </>
    ),
    merge: (
      <>
        {[5, 30].map((y, i) => (
          <g key={y}>
            {[0, 5, 10].map((s, j) => (
              <path key={s} d={`M5 ${y + s}h${18 - j * 3}`} stroke={i ? '#5f8f87' : '#0a6059'} />
            ))}
            <path d={i ? 'M28 36h9l12-13h12' : 'M28 10h9l12 13h12'} />
          </g>
        ))}
        <path d="m56 19 5 4-5 4" />
        {[0, 7, 14].map((dy, i) => (
          <rect key={dy} x="69" y={13 + dy} width={22 - i * 3} height="4" rx="1" fill={i ? '#c6ddd7' : '#f3d9a8'} stroke={i ? undefined : '#8f5a17'} />
        ))}
      </>
    ),
  }
  return (
    <svg className="kar-drawing" viewBox="0 0 104 52" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" focusable="false">
      {art[name]}
    </svg>
  )
}

/** One straight connector filling its grid cell. */
function Flow({ back = false, kind = 'normal', vertical = false }: { back?: boolean; kind?: 'normal' | 'system' | 'evidence'; vertical?: boolean }) {
  const arrow = useId().replace(/:/g, '')
  return (
    <svg aria-hidden="true" focusable="false" className={`kar-flow is-${kind}`} width="100%" height="100%">
      <defs>
        <marker id={arrow} markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="m2 1 5.5 3.5L2 8" />
        </marker>
      </defs>
      <line
        x1={vertical ? '50%' : back ? '100%' : '0%'}
        x2={vertical ? '50%' : back ? '0%' : '100%'}
        y1={vertical ? (back ? '100%' : '0%') : '50%'}
        y2={vertical ? (back ? '0%' : '100%') : '50%'}
        markerEnd={`url(#${arrow})`}
      />
    </svg>
  )
}

/**
 * Both variants in one grid area; only the active one is visible. The hidden
 * one keeps reserving its height and is removed from the accessibility tree
 * (visibility: hidden + aria-hidden), so it is never read or selected.
 */
function Dual({ tech, overview, technical }: { tech: boolean; overview: ReactNode; technical: ReactNode }) {
  return (
    <div className="kar-dual">
      <div className={tech ? undefined : 'is-on'} aria-hidden={tech || undefined}>
        {overview}
      </div>
      <div className={tech ? 'is-on' : undefined} aria-hidden={!tech || undefined}>
        {technical}
      </div>
    </div>
  )
}

/** Renders `{code}` in a copy string as an inline code element. */
function withCode(text: string, code?: string) {
  if (!code || !text.includes('{code}')) return text
  const [a, b] = text.split('{code}')
  return (
    <>
      {a}
      <code>{code}</code>
      {b}
    </>
  )
}

// ── The map ─────────────────────────────────────────────────────────────────

function ArchitectureMap({ tech, id }: { tech: boolean; id: string }) {
  const a = KB_ARCH
  const o = a.orchestration
  return (
    <div className="kar-map" id={id} role="group" aria-label={`${a.figureTitle}: ${tech ? 'Technical Architecture' : 'System Overview'}`}>
      <div className="kar-band is-top" aria-hidden="true" />
      <div className="kar-band is-bottom" aria-hidden="true" />

      <header className="kar-tophead">
        <span className="kar-label">{a.ingestLane.label}</span>
        <h4>{a.ingestLane.title}</h4>
        <span className="kar-sub">{a.ingestLane.trigger}</span>
      </header>

      {a.ingest.map((n, i) => (
        <Fragment key={n.id}>
          <article className={`kar-box kar-node is-${n.id}`} style={{ gridColumn: 2 * i + 1 }}>
            <Drawing name={n.id} />
            <Dual tech={tech} overview={<h5>{n.overview.title}</h5>} technical={<h5>{n.technical.title}</h5>} />
            <div className="kar-node-body">
              <Dual
                tech={tech}
                overview={<p>{n.overview.body}</p>}
                technical={<p>{withCode(n.technical.body, n.technical.code)}</p>}
              />
            </div>
          </article>
          {i < 3 && (
            <div className="kar-upper-arrow" style={{ gridColumn: 2 * i + 2 }}>
              <Flow />
            </div>
          )}
        </Fragment>
      ))}

      <aside className="kar-state">
        <Icon name="store" size={16} />
        <Dual
          tech={tech}
          overview={
            <p>
              <strong>{a.state.overview.title}</strong>
              {a.state.overview.body}
            </p>
          }
          technical={
            <p>
              <strong>{a.state.technical.title}</strong>
              {a.state.technical.body}
            </p>
          }
        />
      </aside>

      <h4 className="kar-lowerhead">
        {a.analysisLane.title} <span className="kar-sub">{a.analysisLane.trigger}</span>
      </h4>

      <div className="kar-bridge">
        <Flow vertical back kind="system" />
        <div>
          <span>{a.bridge.up}</span>
          <span>{a.bridge.down}</span>
        </div>
        <Flow vertical kind="evidence" />
      </div>

      <article className="kar-box kar-request">
        <span className="kar-label">
          <Icon name="slack" size={14} /> {a.request.label}
        </span>
        <Dual
          tech={tech}
          overview={
            <>
              <h5>{a.request.overview.title}</h5>
              <p>{a.request.overview.body}</p>
              <small>{a.request.overview.note}</small>
            </>
          }
          technical={
            <>
              <h5>{a.request.technical.title}</h5>
              <p>{withCode(a.request.technical.body, a.request.technical.code)}</p>
            </>
          }
        />
      </article>
      <div className="kar-request-arrow">
        <Flow />
      </div>

      <article className="kar-box kar-answer">
        <span className="kar-label">
          <Icon name="reply" size={14} /> {a.response.label}
        </span>
        <Dual
          tech={tech}
          overview={
            <>
              <h5>{a.response.overview.title}</h5>
              <p>{a.response.overview.body}</p>
              <small>{a.response.overview.qualifier}</small>
              {/* The source chip runs inline after the example, so it shares
                  the example's last line instead of taking a row of its own. */}
              <p className="kar-example">
                {a.response.overview.example} <span className="kar-citation">{a.response.overview.source}</span>
              </p>
            </>
          }
          technical={
            <>
              <h5>{a.response.technical.title}</h5>
              <p>{a.response.technical.body}</p>
            </>
          }
        />
      </article>
      <div className="kar-answer-arrow">
        <Flow back />
      </div>

      <article className="kar-orchestration">
        <span className="kar-label">{o.label}</span>
        <h5>{o.title}</h5>
        <p className="kar-orch-sub">{o.body}</p>
        <div className="kar-path">
          <Icon name="route" />
          <div>
            <h6>{o.dedicated.title}</h6>
            <Dual
              tech={tech}
              overview={
                <>
                  <p>{o.dedicated.overview}</p>
                  <code>{o.dedicated.code}</code>
                </>
              }
              technical={
                <>
                  <p>{o.dedicated.technical}</p>
                  <code>{o.dedicated.code}</code>
                </>
              }
            />
          </div>
        </div>
        <div className="kar-path">
          <Icon name="loop" />
          <div>
            <h6>{o.agent.title}</h6>
            <Dual
              tech={tech}
              overview={
                <>
                  <p>{o.agent.overview}</p>
                  <code>{o.agent.code.overview}</code>
                </>
              }
              technical={
                <>
                  <p>{o.agent.technical}</p>
                  <code>{o.agent.code.technical}</code>
                </>
              }
            />
          </div>
        </div>
      </article>

      <div className="kar-exchange">
        <Flow kind="system" />
        <Flow back kind="evidence" />
      </div>

      <article className="kar-box kar-retrieval">
        <span className="kar-label">{a.retrieval.label}</span>
        <div className="kar-ret-head">
          <Drawing name="merge" />
          <Dual tech={tech} overview={<h5>{a.retrieval.overview.title}</h5>} technical={<h5>{a.retrieval.technical.title}</h5>} />
        </div>
        <Dual tech={tech} overview={<p>{a.retrieval.overview.body}</p>} technical={<p>{a.retrieval.technical.body}</p>} />
        <div className="kar-rank-note">
          <Dual tech={tech} overview={a.retrieval.overview.note} technical={a.retrieval.technical.note} />
        </div>
      </article>

      <aside className="kar-state-note">
        <Dual tech={tech} overview={a.stateNote.overview} technical={a.stateNote.technical} />
      </aside>
    </div>
  )
}

export default function KbAgentArchitecture() {
  const a = KB_ARCH
  const [view, setView] = useState<KbArchView>('overview')
  const uid = useId().replace(/:/g, '')
  const tech = view === 'technical'
  const mapId = `kar-map-${uid}`

  return (
    <section id="kb-architecture" className="kb-arch" aria-labelledby="kb-arch-h">
      <div className="kb-arch-head">
        <Eyebrow>{a.eyebrow}</Eyebrow>
        <h2 id="kb-arch-h" className="kb-h2">
          {a.heading}
        </h2>
        <div className="kar-intro">
          {a.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>

      <figure className="kar-figure" aria-describedby={`kar-desc-${uid}`}>
        <p id={`kar-desc-${uid}`} className="kb-sr">
          {a.diagramSummary}
        </p>
        <figcaption className="kar-caption">
          <span className="kar-title">
            <Icon name="layers" size={20} />
            <span>{a.figureTitle}</span>
          </span>
          <fieldset className="kar-toggle">
            <legend>{a.viewLegend}</legend>
            {KB_ARCH_VIEWS.map((v) => (
              <label key={v.id}>
                <input
                  type="radio"
                  name={`kar-view-${uid}`}
                  value={v.id}
                  checked={view === v.id}
                  onChange={() => setView(v.id)}
                  aria-controls={mapId}
                />
                <span>
                  <Icon name={v.id === 'technical' ? 'code' : 'layers'} size={14} />
                  {v.label}
                </span>
              </label>
            ))}
          </fieldset>
        </figcaption>

        <ArchitectureMap tech={tech} id={mapId} />

        <footer className="kar-handoff">
          <span className="kar-label">
            <Icon name="task" size={15} />
            {a.handoff.label}
          </span>
          <div className="kar-handoff-flow">
            <code>{a.handoff.command}</code>
            <i aria-hidden="true" />
            <Dual tech={tech} overview={<span>{a.handoff.review.overview}</span>} technical={<span>{a.handoff.review.technical}</span>} />
            <i aria-hidden="true" />
            <span>{a.handoff.create}</span>
          </div>
          <small>{a.handoff.note}</small>
        </footer>
      </figure>

      <div className="kar-cards">
        {a.cards.map((c) => (
          <article key={c.eyebrow} className="kar-card">
            <header className="kar-card-head">
              <span className="kar-card-icon">
                <Icon name={c.icon} size={18} />
              </span>
              <div>
                <p className="lab">{c.eyebrow}</p>
                <h3>{c.heading}</h3>
              </div>
            </header>
            <p className="kar-card-body">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/**
 * Section 05's stylesheet, appended to the shared sheet by `KbAgentPage` via
 * `CaseStudyShell`'s `extraCss`. Every rule is scoped under `.kb-agent .kb-arch`
 * with a `kar-` prefix, so nothing reaches other sections. Host tokens and
 * fonts only; amber is a section-local custom property.
 */
export const KB_ARCH_CSS = `
.kb-agent .kb-arch {
  --kar-amber: #8f5a17;
  --kar-amber-ink: #6c430d;
  /* one amber family: the shelf's highlighted passage, the merged list's top
     result, the return arrows and the source chip all use these values */
  --kar-amber-wash: #f3d9a8;
  scroll-margin-top: 84px;
}
.kb-agent .kb-arch-head { margin-bottom: 28px; }
.kb-agent .kb-arch-head .kb-h2 { margin-bottom: 18px; }

/* two-column intro, ~40 / 60, lede metrics */
.kb-agent .kar-intro {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 32px;
}
.kb-agent .kar-intro p {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(var(--ink-rgb), 0.72);
  text-wrap: pretty;
}
.kb-agent .kar-intro p + p { border-left: 1px solid rgba(var(--ink-rgb), 0.12); padding-left: 32px; }

/* figure shell */
.kb-agent .kar-figure {
  margin: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04), 0 10px 28px rgba(var(--ink-rgb), 0.04);
}
.kb-agent .kar-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 14px 7px 20px;
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.kb-agent .kar-title { display: inline-flex; align-items: center; gap: 9px; color: var(--accent); }
.kb-agent .kar-title span { font-size: 15px; font-weight: 500; letter-spacing: -0.01em; }

/* segmented control: native radios, styled like the page's other selectors */
.kb-agent .kar-toggle {
  display: flex;
  gap: 3px;
  margin: 0;
  padding: 3px;
  border: 0.5px solid rgba(var(--ink-rgb), 0.16);
  border-radius: 9px;
  background: rgba(var(--ink-rgb), 0.035);
  min-inline-size: 0;
}
.kb-agent .kar-toggle legend,
.kb-agent .kar-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  border: 0;
  white-space: nowrap;
}
.kb-agent .kar-toggle label { position: relative; cursor: pointer; }
.kb-agent .kar-toggle label span {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 7px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.04em;
  color: rgba(var(--ink-rgb), 0.66);
  transition: background 0.18s, color 0.18s;
}
.kb-agent .kar-toggle label:hover span { color: var(--accent); background: rgba(var(--accent-rgb), 0.07); }
.kb-agent .kar-toggle input:checked + span { color: var(--accent-ink); background: var(--accent); }
.kb-agent .kar-toggle input:focus-visible + span { outline: 2px solid rgba(var(--accent-rgb), 0.6); outline-offset: 2px; }

/* the shared grid */
.kb-agent .kar-map {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns:
    minmax(0, 1.26fr) 28px minmax(0, 0.92fr) 28px minmax(0, 1.02fr) 40px minmax(0, 1fr);
  grid-template-rows: 40px auto 42px 38px auto 8px auto auto;
  padding: 0 20px;
}
.kb-agent .kar-map :is(h4, h5, h6, p) { margin: 0; }
.kb-agent .kar-band { grid-column: 1 / -1; margin-inline: -20px; z-index: -1; }
.kb-agent .kar-band.is-top { grid-row: 1 / 4; background: rgba(var(--ink-rgb), 0.022); }
.kb-agent .kar-band.is-bottom {
  grid-row: 4 / 9;
  background: rgba(var(--accent-rgb), 0.055);
  border-top: 0.5px solid rgba(var(--accent-rgb), 0.2);
}

.kb-agent .kar-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}
.kb-agent .kar-sub { font-size: 12.5px; font-weight: 400; letter-spacing: 0; color: rgba(var(--ink-rgb), 0.62); }
.kb-agent .kar-tophead,
.kb-agent .kar-lowerhead { display: flex; align-items: center; gap: 13px; grid-column: 1 / 7; }
.kb-agent .kar-tophead { grid-row: 1; }
.kb-agent .kar-tophead .kar-label { padding-right: 13px; border-right: 1px solid rgba(var(--ink-rgb), 0.16); }
.kb-agent .kar-lowerhead { grid-row: 4; }
.kb-agent .kar-map h4 { font-size: 16px; font-weight: 500; line-height: 1.2; letter-spacing: -0.015em; color: rgba(var(--ink-rgb), 0.9); }

/* boxes */
.kb-agent .kar-box,
.kb-agent .kar-orchestration { border-radius: 10px; }
.kb-agent .kar-box {
  background: var(--panel-solid);
  border: 0.5px solid rgba(var(--ink-rgb), 0.16);
  box-shadow: 0 1px 2px rgba(var(--ink-rgb), 0.03);
}
.kb-agent .kar-map h5 { font-size: 15.5px; font-weight: 500; line-height: 1.2; letter-spacing: -0.012em; color: rgba(var(--ink-rgb), 0.92); }
.kb-agent .kar-map p { margin-top: 5px; font-size: 13.5px; line-height: 1.45; color: rgba(var(--ink-rgb), 0.68); text-wrap: pretty; }
.kb-agent .kar-map code,
.kb-agent .kar-handoff code,
.kb-agent .kar-citation { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; line-height: 1.4; overflow-wrap: anywhere; }
.kb-agent .kar-map p code { font-size: 11.5px; color: rgba(var(--ink-rgb), 0.78); }
.kb-agent .kar-map small { display: block; margin-top: 5px; font-size: 11.5px; line-height: 1.35; color: rgba(var(--ink-rgb), 0.6); }

.kb-agent .kar-node {
  grid-row: 2;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  align-items: center;
  column-gap: 10px;
  padding: 10px 13px 11px;
}
.kb-agent .kar-drawing { display: block; width: 54px; height: 27px; color: var(--accent); }
.kb-agent .kar-node-body { grid-column: 1 / -1; align-self: start; }
/* Every node's header row reserves two title lines, centred on its drawing,
   so all four bodies start on the same line in both views. */
.kb-agent .kar-node > .kar-dual { min-height: 40px; align-items: center; }
.kb-agent .kar-node > .kar-dual > * { align-self: center; }
.kb-agent .kar-map .kar-node-body p { margin-top: 6px; }
/* the shelf keeps its prominence: a larger drawing beside the title */
.kb-agent .kar-node.is-library { background: rgba(var(--accent-rgb), 0.075); border: 1px solid rgba(var(--accent-rgb), 0.38); }
.kb-agent .kar-node.is-library .kar-drawing { width: 76px; height: 38px; }
.kb-agent .kar-upper-arrow { grid-row: 2; }
/* Arrow cells never size their rows: an SVG at 100% height in an auto row
   would otherwise fall back to its 150px intrinsic height. */
.kb-agent .kar-upper-arrow,
.kb-agent .kar-request-arrow,
.kb-agent .kar-answer-arrow { position: relative; }
.kb-agent .kar-upper-arrow > svg,
.kb-agent .kar-request-arrow > svg,
.kb-agent .kar-answer-arrow > svg { position: absolute; inset: 0; }

/* connectors */
.kb-agent .kar-flow { display: block; overflow: visible; fill: none; stroke: currentColor; stroke-width: 1.45; color: rgba(var(--ink-rgb), 0.45); }
.kb-agent .kar-flow line,
.kb-agent .kar-flow path { vector-effect: non-scaling-stroke; }
.kb-agent .kar-flow.is-system { color: var(--accent); }
.kb-agent .kar-flow.is-evidence { color: var(--kar-amber); }

/* SQLite / ingestion state inset */
.kb-agent .kar-state {
  position: relative;
  grid-row: 3;
  grid-column: 3 / 6;
  align-self: center;
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 9px;
  width: min(100%, 540px);
  min-height: 30px;
  padding: 4px 10px;
  border: 1px dashed rgba(var(--ink-rgb), 0.24);
  border-radius: 7px;
  background: rgba(251, 253, 253, 0.8);
  color: rgba(var(--ink-rgb), 0.6);
}
.kb-agent .kar-state::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 30px;
  height: 7px;
  border-left: 1px dashed rgba(var(--ink-rgb), 0.3);
}
.kb-agent .kar-state svg { flex: none; }
.kb-agent .kar-map .kar-state p { margin: 0; font-size: 12px; line-height: 1.35; color: rgba(var(--ink-rgb), 0.66); }
.kb-agent .kar-state strong { margin-right: 7px; font-weight: 500; color: rgba(var(--ink-rgb), 0.86); }

/* knowledge base <-> retrieval */
.kb-agent .kar-bridge {
  grid-row: 3 / 5;
  grid-column: 7;
  display: grid;
  grid-template-columns: 12px auto 12px;
  grid-template-rows: minmax(0, 1fr);
  align-items: stretch;
  justify-content: center;
  gap: 8px;
}
.kb-agent .kar-bridge svg { min-height: 0; }
.kb-agent .kar-bridge > div {
  align-self: center;
  display: grid;
  gap: 4px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  line-height: 1.3;
  color: var(--accent);
}
.kb-agent .kar-bridge span:last-child { color: var(--kar-amber); }

/* Slack request / response */
.kb-agent .kar-request,
.kb-agent .kar-answer { grid-column: 1; align-self: stretch; padding: 8px 13px 9px; }
.kb-agent .kar-request { grid-row: 5; }
.kb-agent .kar-answer { grid-row: 7; }
.kb-agent .kar-request h5,
.kb-agent .kar-answer h5,
.kb-agent .kar-orchestration h5 { margin-top: 5px; }
.kb-agent .kar-request p,
.kb-agent .kar-answer p { margin-top: 3px; }
.kb-agent .kar-request small,
.kb-agent .kar-answer small { margin-top: 3px; }
.kb-agent .kar-map p.kar-example { margin-top: 3px; font-size: 12.5px; font-style: italic; color: rgba(var(--ink-rgb), 0.74); }
.kb-agent .kar-citation {
  display: inline-block;
  max-width: 100%;
  margin-top: 2px;
  padding: 1px 4px;
  border-radius: 4px;
  font-style: normal;
  vertical-align: baseline;
  font-size: 10.5px;
  color: var(--kar-amber-ink);
  background: var(--kar-amber-wash);
  box-shadow: inset 0 0 0 0.5px rgba(143, 90, 23, 0.55);
}
.kb-agent .kar-request-arrow,
.kb-agent .kar-answer-arrow { grid-column: 2; }
.kb-agent .kar-request-arrow { grid-row: 5; }
.kb-agent .kar-answer-arrow { grid-row: 7; }

/* orchestration */
.kb-agent .kar-orchestration {
  grid-column: 3 / 6;
  grid-row: 5 / 8;
  padding: 10px 14px 12px;
  background: rgba(var(--accent-rgb), 0.05);
  border: 1px solid rgba(var(--accent-rgb), 0.34);
}
.kb-agent .kar-map p.kar-orch-sub { margin: 2px 0 2px; }
.kb-agent .kar-path {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 7px;
  padding: 8px 11px 9px;
  border-radius: 8px;
  background: var(--panel-solid);
  border: 0.5px solid rgba(var(--accent-rgb), 0.24);
}
.kb-agent .kar-path > svg { flex: none; margin-top: 2px; color: var(--accent); }
.kb-agent .kar-path > div { min-width: 0; }
.kb-agent .kar-map h6 { font-size: 14.5px; font-weight: 500; line-height: 1.25; color: rgba(var(--ink-rgb), 0.9); }
.kb-agent .kar-map .kar-path p { margin: 2px 0 3px; font-size: 13px; }
.kb-agent .kar-path code { display: block; color: var(--accent); font-size: 11px; }
.kb-agent .kar-exchange { grid-column: 6; grid-row: 5 / 8; display: flex; flex-direction: column; justify-content: center; gap: 9px; }
.kb-agent .kar-exchange svg { height: 8px; }

/* retrieval */
.kb-agent .kar-retrieval {
  grid-column: 7;
  grid-row: 5 / 8;
  padding: 10px 14px 12px;
  border: 1px solid rgba(var(--accent-rgb), 0.32);
}
.kb-agent .kar-ret-head { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 10px; margin-top: 7px; }
.kb-agent .kar-retrieval .kar-drawing { width: 68px; height: 34px; }
.kb-agent .kar-retrieval .kar-ret-head + .kar-dual p { margin-top: 6px; }
.kb-agent .kar-rank-note {
  margin-top: 10px;
  padding-top: 7px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.14);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  color: var(--kar-amber-ink);
}
.kb-agent .kar-state-note {
  grid-column: 1 / -1;
  grid-row: 8;
  align-self: center;
  padding: 7px 0 8px;
  font-size: 12.5px;
  line-height: 1.4;
  color: rgba(var(--ink-rgb), 0.64);
}

/* both variants share one grid area; the hidden one only reserves space */
.kb-agent .kar-dual { display: grid; }
.kb-agent .kar-dual > * {
  grid-area: 1 / 1;
  min-width: 0;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.18s ease, visibility 0s linear 0.18s;
}
.kb-agent .kar-dual > .is-on { visibility: visible; opacity: 1; transition: opacity 0.18s ease, visibility 0s; }

/* optional handoff footer */
.kb-agent .kar-handoff {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 24px;
  padding: 9px 20px;
  border-top: 1px dashed rgba(var(--ink-rgb), 0.22);
}
.kb-agent .kar-handoff .kar-label { color: rgba(var(--ink-rgb), 0.66); }
.kb-agent .kar-handoff-flow { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 13px; color: rgba(var(--ink-rgb), 0.8); }
.kb-agent .kar-handoff-flow .kar-dual > * { white-space: nowrap; }
.kb-agent .kar-handoff i { position: relative; width: 24px; border-top: 1px dashed rgba(var(--ink-rgb), 0.45); }
.kb-agent .kar-handoff i::after {
  content: '';
  position: absolute;
  top: -3.5px;
  right: 0;
  width: 5px;
  height: 5px;
  border-top: 1px solid rgba(var(--ink-rgb), 0.5);
  border-right: 1px solid rgba(var(--ink-rgb), 0.5);
  transform: rotate(45deg);
}
.kb-agent .kar-handoff small { margin-left: auto; font-size: 12px; color: rgba(var(--ink-rgb), 0.6); }

/* supporting cards: icon beside eyebrow + heading, body at full card width */
.kb-agent .kar-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 18px; }
.kb-agent .kar-card {
  padding: 14px 18px 15px;
  border-radius: 14px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.kb-agent .kar-card-head { display: flex; align-items: center; gap: 11px; margin-bottom: 8px; }
.kb-agent .kar-card-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent);
}
.kb-agent .kar-card .lab { color: var(--accent); }
.kb-agent .kar-card h3 {
  margin-top: 5px;
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: rgba(var(--ink-rgb), 0.92);
}
.kb-agent .kar-card-body { font-size: 0.90625rem; line-height: 1.5; color: rgba(var(--ink-rgb), 0.72); text-wrap: pretty; }

@media (prefers-reduced-motion: reduce) {
  .kb-agent .kar-dual > *,
  .kb-agent .kar-dual > .is-on,
  .kb-agent .kar-toggle label span { transition: none; }
}
@media (forced-colors: active) {
  .kb-agent .kar-toggle input:checked + span { outline: 2px solid Highlight; }
}
`
