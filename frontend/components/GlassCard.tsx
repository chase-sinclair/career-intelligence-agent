interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accent?: boolean
}

export default function GlassCard({ children, className = '', accent = false }: GlassCardProps) {
  const bg = accent ? 'rgba(180,158,120,0.07)' : 'rgba(226,223,208,0.04)'
  const border = accent ? '0.5px solid rgba(180,158,120,0.18)' : '0.5px solid rgba(226,223,208,0.10)'
  const sheen = accent
    ? 'linear-gradient(135deg, rgba(180,158,120,0.1) 0%, transparent 55%)'
    : 'linear-gradient(135deg, rgba(226,223,208,0.06) 0%, transparent 55%)'

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
