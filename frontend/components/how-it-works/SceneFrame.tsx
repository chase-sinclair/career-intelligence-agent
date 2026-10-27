'use client'

import type { ReactNode } from 'react'

/** Shared tokens for every scene, so the illustrations read as one system. */
export const INK = (a: number) => `rgba(var(--ink-rgb),${a})`
export const ACCENT = (a: number) => `rgba(var(--accent-rgb),${a})`
export const PANEL = 'var(--panel-2)'
export const MONO = "'JetBrains Mono', monospace"

/** Calm ease-out used across the page (spec §2 global motion system). */
export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Wrapper for an illustration: titled region, accessible description, and a
 * caption marking it as explanatory rather than live.
 */
export default function SceneFrame({
  label,
  caption = 'Illustrative pipeline visualization — not live data.',
  viewBox,
  children,
}: {
  label: string
  caption?: string
  viewBox: string
  children: ReactNode
}) {
  return (
    <figure className="m-0">
      <svg viewBox={viewBox} className="w-full h-auto" role="img" aria-label={label}>
        {children}
      </svg>
      <figcaption
        className="mt-2 text-[10px]"
        style={{ fontFamily: MONO, color: INK(0.6) }}
      >
        {caption}
      </figcaption>
    </figure>
  )
}

/** Small uppercase region label inside a scene. */
export function SceneLabel({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text x={x} y={y} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em' }} fill={INK(0.62)}>
      {children}
    </text>
  )
}

/** Soft rounded surface used for grouping. */
export function ScenePanel(props: { x: number; y: number; width: number; height: number; rx?: number }) {
  return (
    <rect
      {...props}
      rx={props.rx ?? 12}
      fill={PANEL}
      stroke={INK(0.1)}
      strokeWidth={1}
    />
  )
}
