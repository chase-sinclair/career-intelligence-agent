interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accent?: boolean
}

export default function GlassCard({ children, className = '', accent = false }: GlassCardProps) {
  const bg = accent ? 'rgba(var(--accent-rgb),0.07)' : 'var(--panel-2)'
  const border = accent ? '0.5px solid rgba(var(--accent-rgb),0.24)' : '0.5px solid rgba(var(--ink-rgb),0.10)'
  const sheen = accent
    ? 'linear-gradient(135deg, rgba(var(--accent-rgb),0.1) 0%, transparent 55%)'
    : 'linear-gradient(135deg, rgba(var(--ink-rgb),0.06) 0%, transparent 55%)'

  return (
    <div
      className={`rounded-xl p-4 relative overflow-hidden ${className}`}
      style={{ background: bg, border, backdropFilter: 'blur(12px)' }}
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: sheen }}
      />
      {children}
    </div>
  )
}
