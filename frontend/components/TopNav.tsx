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
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226,223,208,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] font-medium tracking-[0.04em]"
          style={{ color: 'rgba(226,223,208,0.55)' }}
        >
          Career Architect
        </span>
        {subtitle && (
          <>
            <span
              className="w-px h-3"
              style={{ background: 'rgba(226,223,208,0.12)' }}
            />
            <span
              className="text-[11px] tracking-[0.04em]"
              style={{ color: 'rgba(196,168,130,0.8)' }}
            >
              {subtitle}
            </span>
          </>
        )}
      </div>
    </header>
  )
}
