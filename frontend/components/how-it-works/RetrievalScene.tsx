'use client'

import { useEffect, useState } from 'react'

/**
 * Stage 02 — Evidence Retrieval.
 *
 * An illustration of semantic search: a scan passes over the indexed chunk
 * space, a few chunks match, and the matches travel into a ranked evidence
 * stack. It is a metaphor for vector similarity over the query and the index,
 * not a literal depiction of the system reading documents one by one at
 * inference time, and it never shows real corpus text.
 *
 * One-shot: the sequence plays once when `active` first becomes true and then
 * rests in its completed state. Under prefers-reduced-motion it renders the
 * completed state immediately with no motion at all.
 */

const CARD_W = 86
const CARD_H = 30
const COL_X = [24, 120, 216, 312]
const ROW_Y = [70, 112, 154]

type Chunk = {
  id: string
  col: number
  row: number
  /** Rank it takes in the evidence stack, if it is one of the matches. */
  rank?: 0 | 1 | 2
  match?: boolean
}

// Four chunks match; three of them resolve into visible ranked rows. The
// remaining retrieved chunks are represented by the "+ 9 more" row rather than
// drawn individually, so the picture never implies the top-12 is only three.
const CHUNKS: Chunk[] = [
  { id: 'A', col: 0, row: 0 },
  { id: 'B', col: 1, row: 0, match: true, rank: 0 },
  { id: 'C', col: 2, row: 0 },
  { id: 'D', col: 3, row: 0 },
  { id: 'E', col: 0, row: 1 },
  { id: 'F', col: 1, row: 1 },
  { id: 'G', col: 2, row: 1, match: true, rank: 1 },
  { id: 'H', col: 3, row: 1 },
  { id: 'I', col: 0, row: 2, match: true, rank: 2 },
  { id: 'J', col: 1, row: 2 },
  { id: 'K', col: 2, row: 2 },
  { id: 'L', col: 3, row: 2, match: true },
]

const STACK_X = 430
const STACK_Y = [76, 118, 160]

export default function RetrievalScene({ active = false }: { active?: boolean }) {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [played, setPlayed] = useState(false)

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(q.matches)
    sync()
    q.addEventListener('change', sync)
    return () => q.removeEventListener('change', sync)
  }, [])

  // Latch: once it has played it stays settled, so re-entering the section
  // does not restart a 3s sequence on every intersection flicker.
  useEffect(() => {
    if (active) setPlayed(true)
  }, [active])

  const settled = reduceMotion || !active ? true : played
  const playing = !reduceMotion && played

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 620 300"
        className={`hiw-scene w-full h-auto${playing ? ' play' : ''}${reduceMotion ? ' still' : ''}`}
        role="img"
        aria-label="Illustrative pipeline visualization: a scan passes over indexed document chunks, the closest matches are selected, and they settle into a ranked list of retrieved evidence."
      >
        {/* ── Indexed chunk space ─────────────────────────────────────────── */}
        <text x={24} y={44} className="hiw-label">INDEXED DOCUMENT CHUNKS</text>
        <rect
          x={12} y={54} width={386} height={190} rx={12}
          className="hiw-panel"
        />

        {/* Scan field — sweeps once, left to right */}
        <circle className="hiw-scan" cx={0} cy={149} r={62} />

        {CHUNKS.map(c => {
          const x = COL_X[c.col]
          const y = ROW_Y[c.row]
          const dx = c.rank !== undefined ? STACK_X + 8 - x : 0
          const dy = c.rank !== undefined ? STACK_Y[c.rank] + 2 - y : 0
          return (
            <g
              key={c.id}
              className={`hiw-chunk${c.match ? ' is-match' : ''}${c.rank !== undefined ? ' travels' : ''}`}
              style={
                {
                  '--dx': `${dx}px`,
                  '--dy': `${dy}px`,
                  '--i': c.rank ?? 0,
                } as React.CSSProperties
              }
            >
              <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={7} />
              <text x={x + 14} y={y + 19}>Chunk {c.id}</text>
              {c.match && (
                <path
                  className="hiw-tick"
                  d={`M${x + CARD_W - 22} ${y + 15} l4 4 l7 -8`}
                  fill="none"
                />
              )}
            </g>
          )
        })}

        {/* ── Transfer arrow ──────────────────────────────────────────────── */}
        <text x={408} y={140} className="hiw-select">select</text>
        <path className="hiw-arrow" d="M404 152 H424" fill="none" />

        {/* ── Ranked evidence ─────────────────────────────────────────────── */}
        <text x={430} y={44} className="hiw-label">RANKED RETRIEVED EVIDENCE</text>
        <rect x={420} y={54} width={188} height={190} rx={12} className="hiw-panel" />

        {STACK_Y.map((y, i) => (
          <g key={i} className="hiw-slot" style={{ '--i': i } as React.CSSProperties}>
            <rect x={STACK_X} y={y} width={168} height={30} rx={7} />
          </g>
        ))}
        {STACK_Y.map((y, i) => (
          <text
            key={`t${i}`}
            x={STACK_X + 12}
            y={y + 19}
            className="hiw-rank"
            style={{ '--i': i } as React.CSSProperties}
          >
            {`0${i + 1}`} · passage
          </text>
        ))}
        <text x={STACK_X} y={222} className="hiw-more">+ 9 more, to top-12</text>

        {/* ── Status line ─────────────────────────────────────────────────── */}
        <text x={24} y={272} className="hiw-status hiw-status-a">Selecting relevant passages…</text>
        <text x={24} y={272} className="hiw-status hiw-status-b">Top-12 retrieved chunks (configured k = 12)</text>
      </svg>

      <figcaption className="mt-2 font-mono text-[10px]" style={{ color: 'rgba(var(--ink-rgb),0.70)' }}>
        Illustrative pipeline visualization — not live data.
      </figcaption>

      <style jsx>{`
        .hiw-scene :global(.hiw-panel) {
          fill: var(--panel-2);
          stroke: rgba(var(--ink-rgb), 0.10);
          stroke-width: 1;
        }
        .hiw-scene :global(.hiw-label) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          fill: rgba(var(--ink-rgb), 0.62);
        }
        .hiw-scene :global(.hiw-chunk rect) {
          fill: rgba(var(--ink-rgb), 0.04);
          stroke: rgba(var(--ink-rgb), 0.12);
          stroke-width: 1;
          transition: fill 320ms ease, stroke 320ms ease;
        }
        .hiw-scene :global(.hiw-chunk text) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          fill: rgba(var(--ink-rgb), 0.62);
          transition: fill 320ms ease;
        }
        .hiw-scene :global(.hiw-tick) {
          stroke: var(--accent);
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0;
        }

        /* Resting (and reduced-motion) state: the finished picture. */
        .hiw-scene :global(.hiw-chunk.is-match rect) {
          fill: rgba(var(--accent-rgb), 0.10);
          stroke: rgba(var(--accent-rgb), 0.55);
        }
        .hiw-scene :global(.hiw-chunk.is-match text) { fill: var(--accent); }
        .hiw-scene :global(.hiw-chunk.is-match .hiw-tick) { opacity: 1; }
        .hiw-scene :global(.hiw-chunk.travels) {
          transform: translate(var(--dx), var(--dy));
          opacity: 0;
        }

        .hiw-scene :global(.hiw-scan) {
          fill: none;
          stroke: rgba(var(--accent-rgb), 0.45);
          stroke-width: 1.2;
          stroke-dasharray: 5 7;
          opacity: 0;
        }
        .hiw-scene :global(.hiw-select) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          fill: rgba(var(--ink-rgb), 0.60);
        }
        .hiw-scene :global(.hiw-arrow) {
          stroke: var(--accent);
          stroke-width: 1.6;
          stroke-dasharray: 4 4;
          marker-end: none;
        }
        .hiw-scene :global(.hiw-slot rect) {
          fill: rgba(var(--accent-rgb), 0.08);
          stroke: rgba(var(--accent-rgb), 0.28);
          stroke-width: 1;
        }
        .hiw-scene :global(.hiw-rank) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          fill: var(--accent);
        }
        .hiw-scene :global(.hiw-more) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          fill: rgba(var(--ink-rgb), 0.60);
        }
        .hiw-scene :global(.hiw-status) {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          fill: rgba(var(--ink-rgb), 0.62);
        }
        .hiw-scene :global(.hiw-status-a) { opacity: 0; }
        .hiw-scene :global(.hiw-status-b) { opacity: 1; }

        /* ── One-shot sequence, ~3.1s, matching the storyboard beats ─────── */
        .hiw-scene.play :global(.hiw-scan) {
          animation: hiwScan 900ms cubic-bezier(.22, 1, .36, 1) 450ms both;
        }
        .hiw-scene.play :global(.hiw-chunk.is-match rect) {
          animation: hiwMatchRect 360ms ease-out both;
          animation-delay: calc(700ms + var(--i) * 110ms);
        }
        .hiw-scene.play :global(.hiw-chunk.is-match text) {
          animation: hiwMatchText 360ms ease-out both;
          animation-delay: calc(700ms + var(--i) * 110ms);
        }
        .hiw-scene.play :global(.hiw-chunk.is-match .hiw-tick) {
          animation: hiwFadeIn 260ms ease-out both;
          animation-delay: calc(820ms + var(--i) * 110ms);
        }
        .hiw-scene.play :global(.hiw-chunk:not(.is-match) rect),
        .hiw-scene.play :global(.hiw-chunk:not(.is-match) text) {
          animation: hiwMute 420ms ease-out 1250ms both;
        }
        .hiw-scene.play :global(.hiw-chunk.travels) {
          animation: hiwTravel 900ms cubic-bezier(.22, 1, .36, 1) both;
          animation-delay: calc(1300ms + var(--i) * 130ms);
        }
        .hiw-scene.play :global(.hiw-slot rect) {
          animation: hiwSlot 420ms ease-out both;
          animation-delay: calc(1500ms + var(--i) * 130ms);
        }
        .hiw-scene.play :global(.hiw-rank) {
          animation: hiwFadeIn 360ms ease-out both;
          animation-delay: calc(2100ms + var(--i) * 130ms);
        }
        .hiw-scene.play :global(.hiw-more) {
          animation: hiwFadeIn 400ms ease-out 2500ms both;
        }
        .hiw-scene.play :global(.hiw-status-a) {
          animation: hiwStatusOut 2600ms linear both;
        }
        .hiw-scene.play :global(.hiw-status-b) {
          animation: hiwFadeIn 400ms ease-out 2600ms both;
        }

        @keyframes hiwScan {
          from { transform: translateX(40px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          to   { transform: translateX(400px); opacity: 0; }
        }
        @keyframes hiwMatchRect {
          from { fill: rgba(var(--ink-rgb), 0.04); stroke: rgba(var(--ink-rgb), 0.12); }
          to   { fill: rgba(var(--accent-rgb), 0.10); stroke: rgba(var(--accent-rgb), 0.55); }
        }
        @keyframes hiwMatchText {
          from { fill: rgba(var(--ink-rgb), 0.62); }
          to   { fill: var(--accent); }
        }
        @keyframes hiwMute {
          from { opacity: 1; }
          to   { opacity: 0.45; }
        }
        @keyframes hiwTravel {
          from { transform: translate(0, 0); opacity: 1; }
          85%  { opacity: 1; }
          to   { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes hiwSlot {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hiwFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hiwStatusOut {
          0%, 92% { opacity: 1; }
          100%    { opacity: 0; }
        }

        /* Reduced motion: no animation at any point, finished state only. */
        .hiw-scene.still :global(*) {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </figure>
  )
}
