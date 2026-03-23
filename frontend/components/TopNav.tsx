interface TopNavProps {
  /** When true the header insets from the right panel (right-80). Default: false (right-0). */
  hasRightPanel?: boolean
  subtitle?: string
}

export default function TopNav({ hasRightPanel = false, subtitle }: TopNavProps) {
  const rightClass = hasRightPanel ? 'right-80' : 'right-0'

  return (
    <header
      className={`bg-slate-950/60 dark:bg-[#121315]/60 backdrop-blur-xl fixed top-0 left-64 ${rightClass} z-40 border-b border-white/5 flex justify-between items-center h-16 px-8`}
    >
      <div className="flex items-center gap-4">
        <span className="text-lg font-black tracking-tighter text-sky-400 dark:text-[#38bdf8]">
          Career Architect AI
        </span>
        <div className="h-4 w-[1px] bg-outline-variant/30" />
        {subtitle ? (
          <span className="text-sm font-medium text-on-surface-variant">{subtitle}</span>
        ) : (
          <div className="flex gap-6">
            <a
              className="text-slate-400 dark:text-[#e3e2e5]/70 font-medium text-sm hover:text-sky-300 dark:hover:text-[#8ed5ff] transition-all"
              href="#"
            >
              System Status
            </a>
            <a
              className="text-slate-400 dark:text-[#e3e2e5]/70 font-medium text-sm hover:text-sky-300 dark:hover:text-[#8ed5ff] transition-all"
              href="#"
            >
              History
            </a>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 dark:text-[#e3e2e5]/70 hover:text-sky-300">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-slate-400 dark:text-[#e3e2e5]/70 hover:text-sky-300">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  )
}
