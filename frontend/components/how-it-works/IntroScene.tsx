'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Chapter 1 — the shape of a single question, in four beats. Low motion: this
 * is the teaser for the pipeline chapter, not a competing animation.
 */
const BEATS = [
  { title: 'A question', body: '“What has he built with RAG?”' },
  { title: 'Search the documents', body: 'semantic match over indexed chunks' },
  { title: 'Check the evidence', body: 'enough to answer, or decline' },
  { title: 'A cited answer', body: 'every claim traceable to a source' },
]

export default function IntroScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 620 300"
        className="w-full h-auto"
        role="img"
        aria-label="A question is searched against indexed documents, the evidence is checked, and only then is a cited answer produced."
      >
        {BEATS.map((b, i) => (
          <g key={b.title}>
            {i > 0 && (
              <motion.path
                d={`M44 ${24 + i * 70} V${(i - 1) * 70 + 62}`}
                stroke={ACCENT(0.35)}
                strokeWidth={1.4}
                strokeDasharray="4 4"
                fill="none"
                initial={reduce ? false : { pathLength: 0 }}
                animate={on ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.18 + i * 0.18 }}
              />
            )}
            <motion.g
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : i * 0.18 }}
            >
              <circle
                cx={44} cy={i * 70 + 44} r={18}
                fill={i === 3 ? ACCENT(0.16) : ACCENT(0.07)}
                stroke={ACCENT(i === 3 ? 0.6 : 0.35)}
                strokeWidth={1.2}
              />
              <text
                x={44} y={i * 70 + 48} textAnchor="middle"
                style={{ fontFamily: MONO, fontSize: 11 }} fill={ACCENT(1)}
              >
                {`0${i + 1}`}
              </text>
              <text x={80} y={i * 70 + 40} style={{ fontSize: 14, fontWeight: 500 }} fill="var(--ink)">
                {b.title}
              </text>
              <text x={80} y={i * 70 + 58} style={{ fontFamily: MONO, fontSize: 11 }} fill={INK(0.62)}>
                {b.body}
              </text>
            </motion.g>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-[10px]" style={{ fontFamily: MONO, color: INK(0.6) }}>
        The same four beats are expanded, stage by stage, further down the page.
      </figcaption>
    </figure>
  )
}
