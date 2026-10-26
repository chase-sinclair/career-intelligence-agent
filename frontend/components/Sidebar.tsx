'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  MessageSquare,
  LayoutGrid,
  Layers,
  ChevronRight,
} from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NAV_ITEMS = [
  { href: '/',               label: 'Overview',           Icon: LayoutDashboard },
  { href: '/about',          label: 'Architect Profile',  Icon: User            },
  { href: '/knowledge-base', label: 'Ask About Chase',    Icon: MessageSquare   },
  { href: '/projects',       label: 'Projects',           Icon: LayoutGrid      },
  { href: '/how-it-works',   label: 'How It Works',       Icon: Layers          },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  // wrapperWide stays true until the close animation finishes so the wrapper
  // never shrinks while the sidebar is still animating out — prevents the
  // overflow gap that caused rapid mouseleave/mouseenter flicker.
  const [wrapperWide, setWrapperWide] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    if (wrapperTimerRef.current) clearTimeout(wrapperTimerRef.current)
  }, [])

  function handleMouseEnter() {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
    if (wrapperTimerRef.current) { clearTimeout(wrapperTimerRef.current); wrapperTimerRef.current = null }
    setIsExpanded(true)
    setWrapperWide(true)
  }

  function handleMouseLeave() {
    // Small debounce prevents flicker from edge jitter
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false)
      // Keep wrapper wide until framer-motion close animation completes (220ms)
      wrapperTimerRef.current = setTimeout(() => setWrapperWide(false), 250)
    }, 120)
  }

  function handleBackdropClick() {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
    if (wrapperTimerRef.current) { clearTimeout(wrapperTimerRef.current); wrapperTimerRef.current = null }
    setIsExpanded(false)
    wrapperTimerRef.current = setTimeout(() => setWrapperWide(false), 250)
  }

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
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Hover capture wrapper — always at least 20px wide */}
      <div
        className="fixed left-0 top-0 bottom-0 z-50"
        style={{ width: wrapperWide ? 240 : 20 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated sidebar */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 overflow-hidden flex flex-col"
          animate={{ width: isExpanded ? 240 : 12 }}
          transition={{ duration: 0.22, ease: EASE }}
          style={{
            background: isExpanded ? 'rgba(var(--bg-rgb),0.97)' : 'transparent',
            borderRight: isExpanded ? '1px solid rgba(var(--ink-rgb),0.10)' : 'none',
            backdropFilter: isExpanded ? 'blur(20px)' : 'none',
          }}
        >
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
              style={{ borderBottom: '1px solid rgba(var(--ink-rgb),0.10)' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'var(--accent)', opacity: 0.7 }}
                />
                <span
                  className="text-[11px] font-medium tracking-[0.04em] whitespace-nowrap"
                  style={{ color: 'rgba(var(--ink-rgb),0.7)' }}
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
                              background: 'rgba(var(--accent-rgb),0.08)',
                              border: '0.5px solid rgba(var(--accent-rgb),0.24)',
                              color: 'rgba(var(--accent-rgb),0.9)',
                            }
                          : { color: 'rgba(var(--ink-rgb),0.52)' }
                      }
                      onMouseEnter={e => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLDivElement).style.background =
                            'rgba(var(--ink-rgb),0.05)'
                          ;(e.currentTarget as HTMLDivElement).style.color =
                            'rgba(var(--ink-rgb),0.75)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          ;(e.currentTarget as HTMLDivElement).style.background = ''
                          ;(e.currentTarget as HTMLDivElement).style.color =
                            'rgba(var(--ink-rgb),0.52)'
                        }
                      }}
                    >
                      {/* Active left bar */}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                      <Icon
                        size={15}
                        style={{ color: isActive ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.42)', flexShrink: 0 }}
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
              style={{ borderTop: '1px solid rgba(var(--ink-rgb),0.07)' }}
            >
              <p
                className="text-[8px] uppercase tracking-[0.1em] whitespace-nowrap"
                style={{ color: 'rgba(var(--ink-rgb),0.42)' }}
              >
                v1 · Career Architect
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Collapsed tab indicator */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.button
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-16 rounded-r-xl flex items-center justify-center cursor-pointer"
              style={{
                background: 'var(--panel-solid)',
                border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                borderLeft: 'none',
              }}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsExpanded(true)}
              aria-label="Open navigation"
            >
              <ChevronRight size={12} style={{ color: 'rgba(var(--ink-rgb),0.52)' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
