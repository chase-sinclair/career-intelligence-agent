'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, ScenePanel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Stage 03 — Evidence Gate.
 *
 * The conditional edge is the point of this scene: both outcomes are drawn, and
 * the insufficient branch terminates. Generation is never shown downstream of
 * insufficient evidence.
 */
export default function GateScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active

  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    animate: on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { duration: 0.6, ease: EASE, delay: reduce ? 0 : delay },
  })
  const pop = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: { duration: 0.45, ease: EASE, delay: reduce ? 0 : delay },
  })

  return (
    <SceneFrame
      viewBox="0 0 620 300"
      label="Retrieved evidence reaches a judging step. If the evidence is sufficient the flow continues to answer generation. If it is insufficient the flow stops and the system declines to answer — generation never runs on insufficient evidence."
    >
      {/* incoming evidence */}
      <SceneLabel x={16} y={30}>RETRIEVED EVIDENCE</SceneLabel>
      <motion.g {...pop(0)}>
        <ScenePanel x={16} y={42} width={120} height={96} rx={10} />
        {[0, 1, 2].map(i => (
          <rect
            key={i}
            x={28} y={54 + i * 28} width={96} height={20} rx={5}
            fill={ACCENT(0.1)} stroke={ACCENT(0.3)} strokeWidth={1}
          />
        ))}
      </motion.g>

      <motion.path d="M140 90 H196" stroke={ACCENT(0.55)} strokeWidth={1.6} fill="none" {...draw(0.3)} />

      {/* the gate */}
      <motion.g {...pop(0.45)}>
        <rect x={200} y={56} width={128} height={70} rx={12} fill={ACCENT(0.08)} stroke={ACCENT(0.45)} strokeWidth={1.2} />
        <path
          d="M264 70 l18 7 v12 c0 11 -8 19 -18 23 c-10 -4 -18 -12 -18 -23 v-12 z"
          fill={ACCENT(0.16)} stroke={ACCENT(0.6)} strokeWidth={1.2}
        />
        <text x={264} y={138} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.72)}>
          evidence gate
        </text>
      </motion.g>

      {/* ── sufficient branch ─────────────────────────────────────────────── */}
      <motion.path
        d="M332 78 C368 78, 368 56, 398 56"
        stroke={ACCENT(0.6)} strokeWidth={1.6} fill="none" {...draw(0.9)}
      />
      <motion.g {...pop(1.25)}>
        <rect x={402} y={38} width={210} height={38} rx={9} fill={ACCENT(0.1)} stroke={ACCENT(0.45)} strokeWidth={1} />
        <text x={416} y={62} style={{ fontFamily: MONO, fontSize: 11 }} fill={ACCENT(1)}>
          sufficient → generate answer
        </text>
      </motion.g>

      {/* ── insufficient branch — terminates ──────────────────────────────── */}
      <motion.path
        d="M332 108 C368 108, 368 150, 398 150"
        stroke={INK(0.32)} strokeWidth={1.6} strokeDasharray="5 5" fill="none" {...draw(1.3)}
      />
      <motion.g {...pop(1.65)}>
        <rect x={402} y={132} width={210} height={38} rx={9} fill={INK(0.04)} stroke={INK(0.18)} strokeWidth={1} />
        <text x={416} y={156} style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}>
          insufficient → no answer
        </text>
        {/* stop marker: the path ends here */}
        <circle cx={598} cy={151} r={7} fill="none" stroke={INK(0.3)} strokeWidth={1.4} />
        <path d="M594 147 l8 8 M602 147 l-8 8" stroke={INK(0.42)} strokeWidth={1.3} strokeLinecap="round" />
      </motion.g>

      <motion.g {...pop(1.9)}>
        <text x={16} y={214} style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}>
          Scored on relevance, coverage and source quality
        </text>
        <text x={16} y={236} style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}>
          before any answer text is produced.
        </text>
        <text x={16} y={272} style={{ fontFamily: MONO, fontSize: 11 }} fill={ACCENT(1)}>
          Declining is a designed outcome, not a failure.
        </text>
      </motion.g>
    </SceneFrame>
  )
}
