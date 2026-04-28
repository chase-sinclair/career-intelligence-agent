'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  MessageSquare,
  LayoutGrid,
  SlidersHorizontal,
  Compass,
  FlaskConical,
} from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_ITEMS = [
  { href: '/',                label: 'Overview',           Icon: LayoutDashboard  },
  { href: '/about',           label: 'Architect Profile',  Icon: User             },
  { href: '/knowledge-base',  label: 'Knowledge Base',     Icon: MessageSquare    },
  { href: '/projects',        label: 'Projects',           Icon: LayoutGrid       },
  { href: '/job-preferences', label: 'Job Preferences',    Icon: SlidersHorizontal },
  { href: '/top-fit-jobs',    label: 'Top Fit Jobs',       Icon: Compass          },
  { href: '/admin',           label: 'Demo Lab',           Icon: FlaskConical     },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Hover capture wrapper — always at least 20px wide */}
      <div
        className="fixed left-0 top-0 bottom-0 z-50"
        style={{ width: isExpanded ? 240 : 20 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Animated sidebar */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 overflow-hidden flex flex-col"
          animate={{ width: isExpanded ? 240 : 12 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            background: isExpanded ? 'rgba(8,8,8,0.97)' : 'transparent',
            borderRight: isExpanded ? '1px solid rgba(226,223,208,0.07)' : 'none',
            backdropFilter: isExpanded ? 'blur(20px)' : 'none',
          }}
        >
          {/* Gold sliver — visible only when collapsed */}
          {!isExpanded && (
            <motion.div
              className="absolute left-0 top-0 bottom-0"
              style={{ width: 4, background: '#C4A882' }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Expanded content */}
          <motion.div
            className="flex flex-col h-full w-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.15, delay: isExpanded ? 0.1 : 0 }}
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
          >
            {/* Header */}
            <div
              className="px-4 pt-5 pb-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(226,223,208,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: '#C4A882', opacity: 0.7 }}
                />
                <span
                  className="text-[11px] font-medium tracking-[0.04em] whitespace-nowrap"
                  style={{ color: 'rgba(226,223,208,0.7)' }}
                >
                  Career Architect
                </span>
              </div>
            </div>

            {/* Nav items */}
            <nav className="px-2 py-3 flex flex-col gap-0.5 flex-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const isActive = pathname === href
                return (
                  <Link key={href} href={href}>
                    <div
                      className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] transition-all duration-150 cursor-pointer whitespace-nowrap"
                      style={
                        isActive
                          ? {
                              background: 'rgba(180,158,120,0.08)',
                              border: '0.5px solid rgba(180,158,120,0.18)',
                              color: 'rgba(196,168,130,0.9)',
                            }
                          : { color: 'rgba(226,223,208,0.45)' }
                      }
                      onMouseEnter={e => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLDivElement).style.background =
                            'rgba(226,223,208,0.05)'
                          ;(e.currentTarget as HTMLDivElement).style.color =
                            'rgba(226,223,208,0.75)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLDivElement).style.background = ''
                          ;(e.currentTarget as HTMLDivElement).style.color =
                            'rgba(226,223,208,0.45)'
                        }
                      }}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                          style={{ background: '#C4A882' }}
                        />
                      )}
                      <Icon
                        size={15}
                        style={{ color: isActive ? '#C4A882' : 'rgba(226,223,208,0.3)', flexShrink: 0 }}
                      />
                      {label}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div
              className="mt-auto px-4 pb-5 pt-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(226,223,208,0.05)' }}
            >
              <p
                className="text-[8px] uppercase tracking-[0.1em] whitespace-nowrap"
                style={{ color: 'rgba(226,223,208,0.18)' }}
              >
                v1 · Career Architect
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
