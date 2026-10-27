'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, ScenePanel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Stage 05 — Answer Evaluation.
 *
 * Exactly the three post-generation dimensions. Relevance and coverage belong
 * to the gate and are deliberately absent here. No scores are shown, because
 * no measured scores are published on this page.
 */
const CHECKS = [
  { label: 'Groundedness', hint: 'claims supported by evidence' },
  { label: 'Completeness', hint: 'uses the evidence available' },
  { label: 'Unsupported claims', hint: 'flagged if anything is invented', flag: true },
]

export default function EvaluationScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active

  return (
    <SceneFrame
      viewBox="0 0 620 300"
      label="After an answer is generated, a separate judging model reviews it on three dimensions: groundedness, completeness, and whether any unsupported claims were made."
    >
      <SceneLabel x={16} y={30}>GENERATED ANSWER</SceneLabel>
      <motion.g
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <ScenePanel x={16} y={42} width={150} height={110} rx={10} />
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={30} y={58 + i * 22} width={i === 3 ? 76 : 122} height={8} rx={4} fill={INK(0.14)} />
        ))}
      </motion.g>

      <motion.path
        d="M170 96 H214"
        stroke={ACCENT(0.55)} strokeWidth={1.6} fill="none"
        initial={reduce ? false : { pathLength: 0 }}
        animate={on ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.3 }}
      />

      {/* the judge */}
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.45 }}
        style={{ transformOrigin: '258px 96px' }}
      >
        <rect x={218} y={62} width={80} height={68} rx={10} fill={ACCENT(0.08)} stroke={ACCENT(0.45)} strokeWidth={1.2} />
        <rect x={238} y={74} width={40} height={44} rx={5} fill={ACCENT(0.14)} stroke={ACCENT(0.5)} strokeWidth={1} />
        <path d="M246 92 l6 6 l12 -14" stroke={ACCENT(1)} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={258} y={146} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.72)}>
          judge
        </text>
      </motion.g>

      <SceneLabel x={330} y={30}>POST-GENERATION REVIEW</SceneLabel>
      {CHECKS.map((c, i) => (
        <motion.g
          key={c.label}
          initial={reduce ? false : { opacity: 0, x: 10 }}
          animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.75 + i * 0.16 }}
        >
          <path d={`M302 96 C330 96, 330 ${60 + i * 62}, 344 ${60 + i * 62}`} stroke={ACCENT(0.28)} strokeWidth={1.1} fill="none" />
          <rect x={348} y={42 + i * 62} width={256} height={46} rx={9} fill={ACCENT(0.07)} stroke={ACCENT(0.3)} strokeWidth={1} />
          <text x={366} y={64 + i * 62} style={{ fontFamily: MONO, fontSize: 11.5 }} fill={ACCENT(1)}>
            {c.label}
          </text>
          <text x={366} y={80 + i * 62} style={{ fontFamily: MONO, fontSize: 10 }} fill={INK(0.6)}>
            {c.hint}
          </text>
          {c.flag ? (
            <g>
              <circle cx={586} cy={64 + i * 62} r={8} fill="none" stroke={INK(0.3)} strokeWidth={1.2} />
              <path d={`M586 ${59 + i * 62} v6 M586 ${71 + i * 62} v1`} stroke={INK(0.5)} strokeWidth={1.4} strokeLinecap="round" />
            </g>
          ) : (
            <path
              d={`M578 ${64 + i * 62} l5 5 l10 -11`}
              stroke={ACCENT(0.8)} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
          )}
        </motion.g>
      ))}

      <motion.text
        x={16} y={272}
        style={{ fontFamily: MONO, fontSize: 11 }}
        fill={INK(0.62)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 1.3 }}
      >
        Recorded per answer and surfaced in the chat&apos;s quality panel.
      </motion.text>
    </SceneFrame>
  )
}
