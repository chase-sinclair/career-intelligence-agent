interface TopNavProps {
  hasRightPanel?: boolean
  subtitle?: string
}

export default function TopNav({ hasRightPanel = false, subtitle }: TopNavProps) {
  const rightClass = hasRightPanel ? 'right-80' : 'right-0'

  return (
    <header
      className={`fixed top-0 left-0 ${rightClass} z-40 h-16 flex items-center px-6`}
      style={{
        background: 'rgba(var(--bg-rgb),0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(var(--ink-rgb),0.10)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] font-medium tracking-[0.04em]"
          style={{ color: 'rgba(var(--ink-rgb),0.62)' }}
        >
          Career Architect
        </span>
        {subtitle && (
          <>
            <span
              className="w-px h-3"
              style={{ background: 'rgba(var(--ink-rgb),0.16)' }}
            />
            <span
              className="text-[11px] tracking-[0.04em]"
              style={{ color: 'rgba(var(--accent-rgb),0.8)' }}
            >
              {subtitle}
            </span>
          </>
        )}
      </div>
    </header>
  )
}
