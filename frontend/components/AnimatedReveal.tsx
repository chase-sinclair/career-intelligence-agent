'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

interface AnimatedRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

export default function AnimatedReveal({
  children,
  className = '',
  delayMs = 0,
}: AnimatedRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -72px 0px',
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(36px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
