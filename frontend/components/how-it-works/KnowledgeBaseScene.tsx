'use client'

import { motion, useReducedMotion } from 'framer-motion'
import SceneFrame, { SceneLabel, ScenePanel, INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Chapter 2 — The Knowledge Base.
 *
 * Ingestion time, not query time: documents are split into sections, each
 * section is embedded, and the vectors live in the index. Retrieval happens
 * later, per question, and is deliberately not depicted here.
 */
const GROUPS = ['Core profile', 'Project docs', 'Work highlights', 'Certifications']

export default function KnowledgeBaseScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active
  const at = (d: number) => (reduce ? 0 : d)

  return (
    <SceneFrame
      viewBox="0 0 620 300"
      label="Career documents in four groups are parsed, split into sections, turned into embeddings, and stored in a vector index. This happens once when documents are ingested, not on every question."
      caption="Ingestion-time diagram — retrieval happens later, per question."
    >
      <SceneLabel x={16} y={26}>SOURCE DOCUMENTS</SceneLabel>
      {GROUPS.map((g, i) => (
        <motion.g
          key={g}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.45, ease: EASE, delay: at(i * 0.12) }}
        >
          <rect x={16} y={38 + i * 46} width={150} height={36} rx={8} fill={PANELISH} stroke={INK(0.12)} strokeWidth={1} />
          <rect x={28} y={46 + i * 46} width={12} height={20} rx={2} fill={ACCENT(0.16)} stroke={ACCENT(0.4)} strokeWidth={0.8} />
          <text x={50} y={61 + i * 46} style={{ fontFamily: MONO, fontSize: 10.5 }} fill={INK(0.7)}>
            {g}
          </text>
        </motion.g>
      ))}

      {/* parse + chunk */}
      <motion.path
        d="M170 128 H214"
        stroke={ACCENT(0.5)} strokeWidth={1.5} fill="none"
        initial={reduce ? false : { pathLength: 0 }}
        animate={on ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: at(0.55) }}
      />
      <SceneLabel x={218} y={26}>SPLIT INTO SECTIONS</SceneLabel>
      <ScenePanel x={218} y={38} width={150} height={182} />
      {[0, 1, 2, 3, 4].map(i => (
        <motion.rect
          key={i}
          x={232} y={52 + i * 34} width={122} height={24} rx={6}
          fill={ACCENT(0.08)} stroke={ACCENT(0.28)} strokeWidth={1}
          initial={reduce ? false : { opacity: 0, scaleX: 0.9 }}
          animate={on ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.9 }}
          transition={{ duration: 0.4, ease: EASE, delay: at(0.7 + i * 0.1) }}
          style={{ transformOrigin: '232px 0px' }}
        />
      ))}

      {/* embed */}
      <motion.path
        d="M372 128 H416"
        stroke={ACCENT(0.5)} strokeWidth={1.5} fill="none"
        initial={reduce ? false : { pathLength: 0 }}
        animate={on ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: at(1.2) }}
      />
      <motion.text
        x={394} y={118} textAnchor="middle"
        style={{ fontFamily: MONO, fontSize: 9 }} fill={INK(0.6)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(1.3) }}
      >
        embed
      </motion.text>

      {/* vector index */}
      <SceneLabel x={420} y={26}>VECTOR INDEX</SceneLabel>
      <ScenePanel x={420} y={38} width={184} height={182} />
      <motion.g
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, ease: EASE, delay: at(1.4) }}
      >
        <ellipse cx={512} cy={76} rx={56} ry={14} fill={ACCENT(0.12)} stroke={ACCENT(0.45)} strokeWidth={1.2} />
        <path d="M456 76 V160 A56 14 0 0 0 568 160 V76" fill={ACCENT(0.06)} stroke={ACCENT(0.45)} strokeWidth={1.2} />
        <ellipse cx={512} cy={160} rx={56} ry={14} fill="none" stroke={ACCENT(0.35)} strokeWidth={1} />
        <text x={512} y={196} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 11 }} fill={ACCENT(1)}>
          Chroma
        </text>
      </motion.g>
      {[0, 1, 2].map(i => (
        <motion.text
          key={i}
          x={512} y={104 + i * 20} textAnchor="middle"
          style={{ fontFamily: MONO, fontSize: 9.5 }} fill={INK(0.55)}
          initial={reduce ? false : { opacity: 0 }}
          animate={on ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: at(1.6 + i * 0.12) }}
        >
          [0.12, −0.04, …]
        </motion.text>
      ))}

      <motion.text
        x={16} y={262}
        style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(1.9) }}
      >
        Section-aware chunking keeps each passage self-contained,
      </motion.text>
      <motion.text
        x={16} y={282}
        style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: at(2.0) }}
      >
        so a retrieved chunk still makes sense on its own.
      </motion.text>
    </SceneFrame>
  )
}

const PANELISH = 'var(--panel-2)'
