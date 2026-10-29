'use client'
import { useId, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { northstar } from '@/lib/deallens-data'
import { focus } from './Primitives'

export function Reveal({
  children,
  play,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  play: boolean
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={play ? { opacity: 0, y: 9 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: play ? 0.3 : 0, delay: play ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
export function SourceBadge() {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-primary">
      <FileText size={14} className="shrink-0" />
      <span>{northstar.source}</span>
    </div>
  )
}
export function DealIdentity({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-medium text-on-primary">
        N<span className="text-on-primary/60">.</span>
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold tracking-tight">
          {northstar.name}
        </p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {children || 'Business Services · Facilities Maintenance'}
        </p>
      </div>
    </div>
  )
}
/** Automatic activation, one tab stop; arrows/Home/End are scoped to this tablist. */
export function Tabs({
  labels,
  selected,
  onChange,
  label,
  children,
}: {
  labels: readonly string[]
  selected: number
  onChange: (index: number) => void
  label: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 rounded-lg bg-surface-container-high p-1"
      >
        {labels.map((name, i) => (
          <button
            type="button"
            role="tab"
            key={name}
            id={`${id}-tab-${i}`}
            aria-selected={i === selected}
            aria-controls={`${id}-panel`}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => onChange(i)}
            onKeyDown={(event) => {
              const target =
                event.key === 'ArrowRight'
                  ? (i + 1) % labels.length
                  : event.key === 'ArrowLeft'
                    ? (i + labels.length - 1) % labels.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? labels.length - 1
                        : null
              if (target !== null) {
                event.preventDefault()
                onChange(target)
                document.getElementById(`${id}-tab-${target}`)?.focus()
              }
            }}
            className={`min-h-10 flex-1 rounded-md px-3 py-2 text-sm font-medium ${focus} ${i === selected ? 'bg-[var(--panel-solid)] text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
        className={`mt-4 ${focus}`}
      >
        {children}
      </div>
    </>
  )
}
