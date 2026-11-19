'use client'

import { useEffect, useRef } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { KB_REFLECTION } from '@/lib/kb-agent-data'

/**
 * PROJECT REFLECTION — short closing section after Section 06. Unnumbered.
 *
 * Left: eyebrow, heading, two paragraphs. Right: an illustration of
 * "from documents to collective intelligence". Scattered documents turn, one
 * by one, into knowledge nodes around a shared hub; links draw between them;
 * then mini file icons travel along the links.
 *
 * Motion is one SVG (SMIL) timeline, driven from here:
 *   - paused at t = 0 on mount, so the reveal never runs offscreen;
 *   - plays the first time the figure is meaningfully in view, then keeps
 *     cycling only the pulses; pauses again whenever it leaves the viewport;
 *   - reduced motion: jumps to the settled network and stays paused, and the
 *     pulses are hidden by CSS; turning the preference on mid-play settles it.
 * Without JavaScript the browser simply plays the timeline once on load, and
 * every frame after the reveal is the same settled network.
 *
 * Decorative: the figure has a text description for assistive tech and the
 * SVG itself is aria-hidden. Host tokens and fonts only; rules are scoped
 * under `.kb-agent .kb-reflection` with a `krf-` prefix. No dependencies.
 */

const r = KB_REFLECTION

type Pt = { x: number; y: number }
/** Knowledge nodes. Index 4 is the shared hub (no source document). */
const NODES: Pt[] = [
  { x: 92, y: 86 },
  { x: 232, y: 52 },
  { x: 388, y: 76 },
  { x: 484, y: 178 },
  { x: 300, y: 184 },
  { x: 150, y: 214 },
  { x: 70, y: 306 },
  { x: 262, y: 306 },
  { x: 430, y: 298 },
]
const HUB = 4
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 5], [5, 6], [6, 7], [7, 8], [3, 8],
  [1, 4], [2, 4], [3, 4], [5, 4], [7, 4], [8, 4], [0, 4],
]
/** Edges that carry pulses: [edge index, reverse direction]. */
const PULSES: [number, boolean][] = [
  [8, false], [11, true], [10, true], [12, false], [1, false], [13, true], [4, false], [9, false], [6, true],
]

/** Gentle curve: control point pushed off the chord's midpoint. */
function edgePath([a, b]: [number, number], i: number) {
  const p = NODES[a]
  const q = NODES[b]
  const mx = (p.x + q.x) / 2
  const my = (p.y + q.y) / 2
  const dx = q.x - p.x
  const dy = q.y - p.y
  const len = Math.hypot(dx, dy) || 1
  const bend = (i % 2 ? 1 : -1) * Math.min(22, len * 0.12)
  return `M${p.x} ${p.y} Q${(mx - (dy / len) * bend).toFixed(1)} ${(my + (dx / len) * bend).toFixed(1)} ${q.x} ${q.y}`
}

/* Timeline, seconds. */
const DOC_IN = (i: number) => 0.1 + i * 0.06
const MORPH = (i: number) => 0.8 + i * 0.17
const HUB_IN = 2.05
const EDGE_IN = (j: number) => 1.55 + j * 0.07
const PULSE_IN = (k: number) => 3.3 + k * 0.42
/** Settled network: every node and link drawn, no pulse yet visible. */
export const REFLECTION_SETTLED_T = 3.25
const VIEW_RATIO = 0.35
const EASE = '0.2 0.7 0.3 1'

function Doc() {
  return (
    <>
      <path className="krf-doc-page" d="M-14 -18h20l8 8v28h-28z" />
      <path className="krf-doc-fold" d="M6 -18v8h8" />
      <path className="krf-doc-lines" d="M-9 -6h16M-9 0h18M-9 6h12M-9 12h15" />
    </>
  )
}

function Graphic({ uid }: { uid: string }) {
  return (
    <svg className="krf-svg" viewBox="0 0 560 360" aria-hidden="true" focusable="false">
      <defs>
        {EDGES.map((e, j) => (
          <path key={j} id={`${uid}-e${j}`} d={edgePath(e, j)} />
        ))}
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint field behind the hub */}
      <circle className="krf-field" cx={NODES[HUB].x} cy={NODES[HUB].y} r="150" fill={`url(#${uid}-glow)`} opacity="0">
        <animate attributeName="opacity" values="0;1" begin={`${HUB_IN}s`} dur="1.2s" fill="freeze" />
      </circle>

      {/* links */}
      {EDGES.map((e, j) => (
        <path
          key={j}
          className={e.includes(HUB) ? 'krf-edge is-hub' : 'krf-edge'}
          d={edgePath(e, j)}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        >
          <animate attributeName="stroke-dashoffset" values="1;0" begin={`${EDGE_IN(j)}s`} dur="0.7s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines={EASE} />
        </path>
      ))}

      {/* documents → nodes */}
      {NODES.map((n, i) => {
        if (i === HUB) return null
        const k = i > HUB ? i - 1 : i
        return (
          <g key={i} transform={`translate(${n.x} ${n.y})`}>
            <g className="krf-doc" opacity="0">
              <animate attributeName="opacity" values="0;1" begin={`${DOC_IN(k)}s`} dur="0.35s" fill="freeze" />
              <animate attributeName="opacity" values="1;0" begin={`${MORPH(k)}s`} dur="0.45s" fill="freeze" />
              <animateTransform attributeName="transform" type="scale" values="1;0.35" begin={`${MORPH(k)}s`} dur="0.45s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines={EASE} />
              <g transform={`rotate(${(k % 3) * 5 - 5}) scale(1.18)`}>
                <Doc />
              </g>
            </g>
            <circle className="krf-ripple" r="7" opacity="0">
              <animate attributeName="r" values="7;24" begin={`${MORPH(k) + 0.2}s`} dur="0.8s" fill="freeze" />
              <animate attributeName="opacity" values="0.5;0" begin={`${MORPH(k) + 0.2}s`} dur="0.8s" fill="freeze" />
            </circle>
            <g transform="scale(0)">
              <animateTransform attributeName="transform" type="scale" values="0;1.18;1" keyTimes="0;0.65;1" begin={`${MORPH(k) + 0.18}s`} dur="0.5s" fill="freeze" />
              <circle className="krf-node-halo" r="11" />
              <circle className="krf-node" r="6.5" />
            </g>
          </g>
        )
      })}

      {/* shared hub */}
      <g transform={`translate(${NODES[HUB].x} ${NODES[HUB].y})`}>
        <circle className="krf-ripple is-hub" r="12" opacity="0">
          <animate attributeName="r" values="12;44" begin={`${HUB_IN}s`} dur="1s" fill="freeze" />
          <animate attributeName="opacity" values="0.45;0" begin={`${HUB_IN}s`} dur="1s" fill="freeze" />
        </circle>
        <g transform="scale(0)">
          <animateTransform attributeName="transform" type="scale" values="0;1.15;1" keyTimes="0;0.6;1" begin={`${HUB_IN}s`} dur="0.6s" fill="freeze" />
          <circle className="krf-hub-ring" r="22" />
          <circle className="krf-hub" r="13" />
          <circle className="krf-hub-core" r="4.5" />
        </g>
      </g>

      {/* pulses: mini files travelling across the team */}
      {PULSES.map(([e, rev], k) => {
        const begin = `${PULSE_IN(k)}s`
        const dur = `${2.1 + (k % 3) * 0.35}s`
        return (
          <g key={k} className="krf-pulse" opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" begin={begin} dur={dur} repeatCount="indefinite" />
            <animateMotion begin={begin} dur={dur} repeatCount="indefinite" keyPoints={rev ? '1;0' : '0;1'} keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
              <mpath href={`#${uid}-e${e}`} />
            </animateMotion>
            {/* mini file icon, kept upright while it travels */}
            <circle className="krf-pulse-glow" r="10" />
            <path className="krf-pulse-page" d="M-5 -6.5h6.5l3.5 3.5v10h-10z" />
            <path className="krf-pulse-fold" d="M1.5 -6.5v3.5h3.5" />
            <path className="krf-pulse-lines" d="M-2.8 -0.8h5.6M-2.8 1.9h5.6M-2.8 4.6h3.6" />
          </g>
        )
      })}
    </svg>
  )
}

export default function KbAgentReflection() {
  const figRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const fig = figRef.current
    const svg = fig?.querySelector('svg') ?? null
    svgRef.current = svg
    if (!fig || !svg || typeof svg.pauseAnimations !== 'function') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let started = false
    let inView = false
    const settle = () => {
      svg.pauseAnimations()
      svg.setCurrentTime(REFLECTION_SETTLED_T)
      fig.dataset.motion = 'static'
    }
    const sync = () => {
      if (mq.matches) return settle()
      if (inView) {
        if (!started) {
          started = true
          svg.setCurrentTime(0)
        }
        svg.unpauseAnimations()
        fig.dataset.motion = 'playing'
      } else {
        svg.pauseAnimations()
        fig.dataset.motion = started ? 'paused' : 'armed'
      }
    }

    // Arm: hold the reveal at its first frame until the figure is seen.
    if (mq.matches) settle()
    else {
      svg.pauseAnimations()
      svg.setCurrentTime(0)
      fig.dataset.motion = 'armed'
    }

    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver === 'undefined') {
      inView = true
      sync()
    } else {
      io = new IntersectionObserver(
        ([e]) => {
          inView = e.isIntersecting && e.intersectionRatio >= VIEW_RATIO
          sync()
        },
        { threshold: [0, VIEW_RATIO, 1] },
      )
      io.observe(fig)
    }
    const onMq = () => sync()
    mq.addEventListener('change', onMq)
    return () => {
      io?.disconnect()
      mq.removeEventListener('change', onMq)
    }
  }, [])

  return (
    <section id="kb-reflection" className="kb-reflection" aria-labelledby="kb-reflection-h">
      <div className="krf-copy">
        <Eyebrow>{r.eyebrow}</Eyebrow>
        <h2 id="kb-reflection-h" className="kb-h2">
          {r.heading}
        </h2>
        {r.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="krf-text">
            {p}
          </p>
        ))}
      </div>

      <figure ref={figRef} className="krf-figure" aria-label={r.figure.description} data-motion="static">
        <div className="krf-canvas">
          <Graphic uid="krf" />
        </div>
        <figcaption className="lab">{r.figure.caption}</figcaption>
      </figure>
    </section>
  )
}

/**
 * Project Reflection stylesheet, appended to the shared sheet by `KbAgentPage`
 * via `CaseStudyShell`'s `extraCss`. Scoped under `.kb-agent .kb-reflection`.
 */
export const KB_REFLECTION_CSS = `
.kb-agent .kb-reflection {
  display: grid;
  grid-template-columns: minmax(0, 11fr) minmax(0, 10fr);
  gap: 56px;
  align-items: center;
  scroll-margin-top: 84px;
}
.kb-agent .krf-copy .kb-h2 { margin-bottom: 18px; }
.kb-agent .krf-text {
  max-width: 60ch;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(var(--ink-rgb), 0.72);
  text-wrap: pretty;
}
.kb-agent .krf-text + .krf-text { margin-top: 14px; }

.kb-agent .krf-figure { margin: 0; }
.kb-agent .krf-canvas {
  border-radius: 16px;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 50% 45%, rgba(var(--accent-rgb), 0.05), transparent 70%),
    var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04), 0 10px 28px rgba(var(--ink-rgb), 0.04);
}
.kb-agent .krf-svg { display: block; width: 100%; height: auto; color: var(--accent); }
.kb-agent .krf-figure figcaption {
  margin-top: 12px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-align: center;
  color: rgba(var(--ink-rgb), 0.55);
}

/* documents */
.kb-agent .krf-doc-page { fill: var(--panel-solid); stroke: rgba(var(--ink-rgb), 0.38); stroke-width: 1.1; stroke-linejoin: round; }
.kb-agent .krf-doc-fold { fill: none; stroke: rgba(var(--ink-rgb), 0.38); stroke-width: 1.1; stroke-linejoin: round; }
.kb-agent .krf-doc-lines { fill: none; stroke: rgba(var(--ink-rgb), 0.28); stroke-width: 1.4; stroke-linecap: round; }

/* links */
.kb-agent .krf-edge { fill: none; stroke: rgba(var(--ink-rgb), 0.2); stroke-width: 1.1; stroke-linecap: round; }
.kb-agent .krf-edge.is-hub { stroke: rgba(var(--accent-rgb), 0.38); stroke-width: 1.3; }

/* nodes */
.kb-agent .krf-node { fill: var(--accent); }
.kb-agent .krf-node-halo { fill: rgba(var(--accent-rgb), 0.14); }
.kb-agent .krf-ripple { fill: none; stroke: var(--accent); stroke-width: 1.2; }
.kb-agent .krf-hub { fill: var(--accent); }
.kb-agent .krf-hub-ring { fill: rgba(var(--accent-rgb), 0.12); stroke: rgba(var(--accent-rgb), 0.35); stroke-width: 1; }
.kb-agent .krf-hub-core { fill: var(--panel-solid); }

/* pulses */
.kb-agent .krf-pulse-glow { fill: rgba(var(--accent-rgb), 0.16); }
.kb-agent .krf-pulse-page { fill: var(--panel-solid); stroke: var(--accent); stroke-width: 1.1; stroke-linejoin: round; }
.kb-agent .krf-pulse-fold { fill: rgba(var(--accent-rgb), 0.18); stroke: var(--accent); stroke-width: 1.1; stroke-linejoin: round; }
.kb-agent .krf-pulse-lines { fill: none; stroke: rgba(var(--accent-rgb), 0.7); stroke-width: 1; stroke-linecap: round; }

@media (prefers-reduced-motion: reduce) {
  .kb-agent .krf-pulse { display: none; }
}
`
