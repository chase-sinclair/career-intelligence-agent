import type { ReactNode } from 'react'

export const focus =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
export const button = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-container-high ${focus}`
export const primaryButton = `${button} border-transparent bg-primary text-on-primary hover:bg-primary/90`
export const muted = 'text-on-surface-variant'
export const sectionClass =
  'scroll-mt-24 border-t border-outline-variant py-16 sm:py-24'

export function CopyBlock({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="space-y-4 text-base leading-7 text-on-surface-variant">
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  )
}

export function Disclosure({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <details className="mt-6 text-sm text-on-surface-variant">
      <summary
        className={`w-fit cursor-pointer py-2 font-medium text-on-surface ${focus}`}
      >
        Under the hood
      </summary>
      <div className="mt-3 space-y-3 leading-6">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </details>
  )
}

export function EditorialHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-7 max-w-3xl">
      <Label>{eyebrow}</Label>
      <h2 className="mt-4 text-3xl font-medium leading-[1.12] tracking-[-.045em] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
      {children}
    </p>
  )
}

export function SectionHeading({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <Label>{number} / DealLens</Label>
      <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {children && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${muted}`}>
          {children}
        </p>
      )}
    </div>
  )
}
