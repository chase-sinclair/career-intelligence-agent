'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Chapter 4 — Answer Quality: two checkpoints, not a dashboard.
 *
 * Quality is checked twice — once on the evidence before anything is written,
 * once on the finished answer. The scene illuminates the first checkpoint, then
 * the generation step, then the second, so the ordering is the message.
 *
 * Deliberately carries no scores or percentages: none are measured and
 * published, so none are drawn.
 */
const PRE = [
  { label: 'Evidence relevance', hint: 'is this on topic?' },
  { label: 'Evidence coverage', hint: 'are the facts actually here?' },
]
const POST = [
  { label: 'Groundedness', hint: 'is every claim supported?' },
  { label: 'Completeness', hint: 'was the evidence used?' },
  { label: 'Unsupported claims', hint: 'was anything invented?' },
]

export default function QualityScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active
  const at = (d: number) => (reduce ? 0 : d)

  const pill = (i: number, base: number) => ({
    initial: reduce ? false : { opacity: 0, x: -8 },
    animate: on ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 },
    transition: { duration: 0.45, ease: EASE, delay: at(base + i * 0.15) },
  })

  return (
    <SceneFrame
      viewBox="0 0 620 320"
      label="Quality is checked at two points. Before anything is written, the retrieved evidence is checked for relevance and coverage. After the answer exists, it is checked for groundedness, completeness, and unsupported claims."
      caption="Explanatory schematic — this page publishes no performance scores."
    >
      {/* ── Checkpoint 1 ─────────────────────────────────────────────────── */}
      <SceneLabel x={16} y={24}>CHECKPOINT 1 · BEFORE WRITING</SceneLabel>
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(0) }}
      >
        <rect x={16} y={34} width={588} height={92} rx={12} fill={ACCENT(0.05)} stroke={ACCENT(0.22)} strokeWidth={1} />
      </motion.g>

      {PRE.map((c, i) => (
        <motion.g key={c.label} {...pill(i, 0.25)}>
          <rect x={34} y={48 + i * 34} width={360} height={28} rx={7} fill={ACCENT(0.1)} stroke={ACCENT(0.34)} strokeWidth={1} />
          <path
            d={`M50 ${62 + i * 34} l4 4 l8 -9`}
            stroke={ACCENT(0.9)} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <text x={72} y={66 + i * 34} style={{ fontFamily: MONO, fontSize: 11.5 }} fill={ACCENT(1)}>
            {c.label}
          </text>
          <text x={240} y={66 + i * 34} style={{ fontFamily: MONO, fontSize: 10 }} fill={INK(0.6)}>
            {c.hint}
          </text>
        </motion.g>
      ))}
      <motion.text
        x={414} y={88}
        style={{ fontFamily: MONO, fontSize: 10 }}
        fill={INK(0.6)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(0.6) }}
      >
        gate — may stop here
      </motion.text>

      {/* ── Generation between the checkpoints ───────────────────────────── */}
      <motion.path
        d="M310 128 V160"
        stroke={ACCENT(0.5)} strokeWidth={1.5} strokeDasharray="4 4" fill="none"
        initial={reduce ? false : { pathLength: 0 }}
        animate={on ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: at(0.8) }}
      />
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: EASE, delay: at(0.95) }}
        style={{ transformOrigin: '310px 148px' }}
      >
        <rect x={228} y={134} width={164} height={26} rx={13} fill="var(--panel-2)" stroke={INK(0.14)} strokeWidth={1} />
        <text x={310} y={151} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10.5 }} fill={INK(0.66)}>
          answer written
        </text>
      </motion.g>

      {/* ── Checkpoint 2 ─────────────────────────────────────────────────── */}
      <SceneLabel x={16} y={184}>CHECKPOINT 2 · AFTER WRITING</SceneLabel>
      <motion.g
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(1.1) }}
      >
        <rect x={16} y={194} width={588} height={114} rx={12} fill={ACCENT(0.05)} stroke={ACCENT(0.22)} strokeWidth={1} />
      </motion.g>

      {POST.map((c, i) => (
        <motion.g key={c.label} {...pill(i, 1.25)}>
          <rect x={34} y={206 + i * 34} width={360} height={28} rx={7} fill={ACCENT(0.1)} stroke={ACCENT(0.34)} strokeWidth={1} />
          {i === 2 ? (
            <g>
              <circle cx={56} cy={220 + i * 34} r={6.5} fill="none" stroke={INK(0.34)} strokeWidth={1.2} />
              <path d={`M56 ${216 + i * 34} v5 M56 ${226 + i * 34} v1`} stroke={INK(0.5)} strokeWidth={1.3} strokeLinecap="round" />
            </g>
          ) : (
            <path
              d={`M50 ${220 + i * 34} l4 4 l8 -9`}
              stroke={ACCENT(0.9)} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
          )}
          <text x={72} y={224 + i * 34} style={{ fontFamily: MONO, fontSize: 11.5 }} fill={ACCENT(1)}>
            {c.label}
          </text>
          <text x={240} y={224 + i * 34} style={{ fontFamily: MONO, fontSize: 10 }} fill={INK(0.6)}>
            {c.hint}
          </text>
        </motion.g>
      ))}
      <motion.text
        x={414} y={270}
        style={{ fontFamily: MONO, fontSize: 10 }}
        fill={INK(0.6)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(1.8) }}
      >
        recorded with the answer
      </motion.text>
    </SceneFrame>
  )
}
