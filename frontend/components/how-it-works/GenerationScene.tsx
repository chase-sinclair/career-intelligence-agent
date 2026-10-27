'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, ScenePanel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Stage 04 — Answer Generation.
 *
 * The point is traceability: every answer line is tied back to the evidence it
 * came from, so the citation connectors matter more than the text appearing.
 */
const LINES = [
  { y: 70, w: 196, cite: 0 },
  { y: 98, w: 168, cite: 1 },
  { y: 126, w: 184, cite: 2 },
  { y: 154, w: 120, cite: 1 },
]

export default function GenerationScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active

  return (
    <SceneFrame
      viewBox="0 0 620 300"
      label="An answer is composed from the retrieved evidence. Each line of the answer is connected back to the specific evidence passage that supports it, shown as numbered citations."
    >
      <SceneLabel x={16} y={30}>EVIDENCE</SceneLabel>
      <ScenePanel x={16} y={42} width={150} height={150} rx={10} />
      {[0, 1, 2].map(i => (
        <motion.g
          key={i}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : i * 0.12 }}
        >
          <rect x={28} y={56 + i * 44} width={126} height={34} rx={7} fill={ACCENT(0.1)} stroke={ACCENT(0.32)} strokeWidth={1} />
          <text x={40} y={77 + i * 44} style={{ fontFamily: MONO, fontSize: 11 }} fill={ACCENT(1)}>
            [{i + 1}] passage
          </text>
        </motion.g>
      ))}

      <SceneLabel x={300} y={30}>GROUNDED ANSWER</SceneLabel>
      <ScenePanel x={300} y={42} width={304} height={176} rx={10} />

      {LINES.map((l, i) => (
        <g key={i}>
          {/* connector from the cited evidence card to this answer line */}
          <motion.path
            d={`M154 ${73 + l.cite * 44} C230 ${73 + l.cite * 44}, 240 ${l.y - 4}, 312 ${l.y - 4}`}
            stroke={ACCENT(0.3)}
            strokeWidth={1.1}
            fill="none"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : 0.5 + i * 0.16 }}
          />
          <motion.g
            initial={reduce ? false : { opacity: 0 }}
            animate={on ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.42 + i * 0.16 }}
          >
            <rect x={316} y={l.y - 13} width={l.w} height={10} rx={5} fill={INK(0.14)} />
            <text
              x={316 + l.w + 10} y={l.y - 3}
              style={{ fontFamily: MONO, fontSize: 10 }}
              fill={ACCENT(1)}
            >
              [{l.cite + 1}]
            </text>
          </motion.g>
        </g>
      ))}

      <motion.text
        x={16} y={248}
        style={{ fontFamily: MONO, fontSize: 11 }}
        fill={INK(0.62)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 1.2 }}
      >
        The prompt forbids asserting anything the evidence does not support.
      </motion.text>
      <motion.text
        x={16} y={272}
        style={{ fontFamily: MONO, fontSize: 11 }}
        fill={INK(0.62)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 1.35 }}
      >
        Conversation history is supplied so follow-ups stay coherent.
      </motion.text>
    </SceneFrame>
  )
}
