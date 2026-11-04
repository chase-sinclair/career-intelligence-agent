import type { ReactNode } from 'react'

/**
 * Shared typographic atoms for the long-form editorial pages.
 *
 * These originated inside `app/how-it-works/page.tsx`. They were lifted here so
 * the standalone project case-study pages can inherit the same visual system
 * rather than redefining it, which is how the three pages stay consistent.
 * How It Works imports them back from this module, so its rendered output is
 * unchanged. No styling was altered in the move.
 *
 * Intentionally not marked `'use client'`: nothing here uses hooks or browser
 * APIs, so server and client components can both import it.
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-4" style={{ color: 'var(--accent)' }}>
      {children}
    </p>
  )
}

export function Heading2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-light tracking-[-0.04em] leading-[1.08] ${className}`}
      style={{ color: 'var(--ink)', fontSize: 'clamp(2rem, 2.9vw, 3rem)' }}
    >
      {children}
    </h2>
  )
}

export function Divider() {
  return <div className="my-16 h-px" style={{ background: 'rgba(var(--ink-rgb),0.10)' }} />
}
