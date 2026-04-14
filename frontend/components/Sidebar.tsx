'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',               label: 'Overview',               icon: 'dashboard'  },
  { href: '/about',          label: 'Architect Profile',      icon: 'badge'      },
  { href: '/knowledge-base', label: 'Career Knowledge Base',  icon: 'forum'      },
  { href: '/projects',       label: 'Projects',               icon: 'source'     },
  { href: '/job-preferences', label: 'Job Preferences',       icon: 'tune'       },
  { href: '/top-fit-jobs',   label: 'Top Fit Jobs',           icon: 'work'       },
  { href: '/admin',          label: 'Demo Lab',               icon: 'experiment' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-slate-900 dark:bg-[#1b1c1e] h-screen w-64 fixed left-0 top-0 flex flex-col font-['Inter'] text-sm tracking-tight border-r border-white/5 z-50">
      <div className="flex flex-col h-full py-6 px-4">
        <div className="mb-10 px-2">
          <h1 className="font-bold text-sky-400 dark:text-[#38bdf8] text-xl tracking-tight">
            Career Architect
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-sky-400 dark:text-[#38bdf8] font-bold border-r-2 border-sky-400 bg-[#343537]/20'
                    : 'text-slate-400 dark:text-[#e3e2e5]/50 hover:bg-[#343537] transition-colors duration-200'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 px-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-base">person</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface">Analyst 01</span>
            <span className="text-[10px] text-on-surface-variant">Standard Access</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
