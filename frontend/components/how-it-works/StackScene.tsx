'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { INK, ACCENT, MONO, EASE } from './SceneFrame'

/**
 * Chapter 5 — the stack as layers, so the pieces named in the list have a
 * place relative to each other. Versions are taken from package.json and the
 * backend config rather than from memory.
 */
const LAYERS = [
  { name: 'Interface', items: 'Next.js 14 · TypeScript · Tailwind' },
  { name: 'API', items: 'FastAPI · Python' },
  { name: 'Orchestration', items: 'LangGraph — five-node stateful graph' },
  { name: 'Models', items: 'gpt-4o · gpt-4o-mini · text-embedding-3-small' },
  { name: 'Storage', items: 'Chroma — local persistent vectors' },
]

export default function StackScene({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion()
  const on = reduce || active

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 620 300"
        className="w-full h-auto"
        role="img"
        aria-label="The stack in five layers, from the browser interface down through the API, the orchestration graph, the models, and the vector store."
      >
        {LAYERS.map((l, i) => (
          <motion.g
            key={l.name}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : i * 0.11 }}
          >
            <rect
              x={16 + i * 6}
              y={16 + i * 56}
              width={588 - i * 12}
              height={44}
              rx={9}
              fill={i === 2 ? ACCENT(0.1) : 'var(--panel-2)'}
              stroke={i === 2 ? ACCENT(0.42) : INK(0.12)}
              strokeWidth={1}
            />
            <text
              x={34 + i * 6}
              y={37 + i * 56}
              style={{ fontFamily: MONO, fontSize: 11.5 }}
              fill={i === 2 ? ACCENT(1) : 'var(--ink)'}
            >
              {l.name}
            </text>
            <text
              x={34 + i * 6}
              y={52 + i * 56}
              style={{ fontFamily: MONO, fontSize: 10 }}
              fill={INK(0.6)}
            >
              {l.items}
            </text>
          </motion.g>
        ))}
      </svg>
      <figcaption className="mt-2 text-[10px]" style={{ fontFamily: MONO, color: INK(0.6) }}>
        Orchestration is highlighted — it is where the five pipeline stages live.
      </figcaption>
    </figure>
  )
}
