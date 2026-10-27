'use client'

import type { ReactNode } from 'react'

/**
 * Editorial split used by every chapter: narrative left, illustration right on
 * desktop, stacked on small screens with the illustration next to the text it
 * belongs to (spec §2).
 */
export default function ChapterLayout({
  children,
  visual,
  align = 'start',
}: {
  children: ReactNode
  visual: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`lg:grid lg:grid-cols-[45fr_55fr] lg:gap-12 ${
        align === 'center' ? 'lg:items-center' : 'lg:items-start'
      }`}
    >
      <div className="min-w-0">{children}</div>
      <div className="min-w-0 mt-8 lg:mt-0">{visual}</div>
    </div>
  )
}
