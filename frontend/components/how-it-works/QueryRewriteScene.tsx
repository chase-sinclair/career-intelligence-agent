'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, ScenePanel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Stage 01 — Query Rewrite.
 *
 * A follow-up that only makes sense in context is resolved into a query that
 * stands on its own, because retrieval sees the query and not the conversation.
 * Text here is an illustrative example, not a transcript.
 */
export default function QueryRewriteScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const show = reduce ? 'on' : active ? 'on' : 'off'

  const fade = {
    off: { opacity: 0, y: 10 },
    on: { opacity: 1, y: 0 },
  }

  return (
    <SceneFrame
      viewBox="0 0 620 300"
      label="Illustrative example: a follow-up question that depends on earlier conversation is rewritten into a self-contained search query, with the ambiguous words resolved."
      caption="Illustrative example — not a real transcript."
    >
      <SceneLabel x={24} y={30}>EARLIER IN THE CONVERSATION</SceneLabel>
      <motion.g variants={fade} initial="off" animate={show} transition={{ duration: 0.5, ease: EASE }}>
        <ScenePanel x={24} y={42} width={330} height={44} rx={10} />
        <text x={40} y={70} style={{ fontFamily: MONO, fontSize: 12 }} fill={INK(0.72)}>
          “…his work on RAG systems”
        </text>
      </motion.g>

      <SceneLabel x={24} y={118}>FOLLOW-UP AS TYPED</SceneLabel>
      <motion.g
        variants={fade}
        initial="off"
        animate={show}
        transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.18 }}
      >
        <ScenePanel x={24} y={130} width={400} height={44} rx={10} />
        <text x={40} y={158} style={{ fontFamily: MONO, fontSize: 12 }} fill={INK(0.72)}>
          “How does <tspan fill={ACCENT(1)}>he</tspan> keep <tspan fill={ACCENT(1)}>them</tspan> grounded?”
        </text>
        {/* underline the ambiguous tokens */}
        <motion.path
          d="M136 164 H154 M204 164 H238"
          stroke={ACCENT(0.75)}
          strokeWidth={1.4}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={show === 'on' ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.5 }}
        />
      </motion.g>

      {/* resolution arrow */}
      <motion.path
        d="M300 182 C300 206, 300 206, 300 226"
        stroke={ACCENT(0.5)}
        strokeWidth={1.4}
        strokeDasharray="4 4"
        fill="none"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={show === 'on' ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.8 }}
      />

      <SceneLabel x={24} y={248}>SENT TO RETRIEVAL</SceneLabel>
      <motion.g
        variants={fade}
        initial="off"
        animate={show}
        transition={{ duration: 0.55, ease: EASE, delay: reduce ? 0 : 1.0 }}
      >
        <rect
          x={24} y={258} width={572} height={30} rx={8}
          fill={ACCENT(0.08)} stroke={ACCENT(0.4)} strokeWidth={1}
        />
        <text x={40} y={278} style={{ fontFamily: MONO, fontSize: 12 }} fill={ACCENT(1)}>
          “How does Chase keep his RAG systems grounded in evidence?”
        </text>
      </motion.g>
    </SceneFrame>
  )
}
