'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Backgrounding settles a scene; only explicit replay or a new scene restarts it. */
export function useSceneMotion(requested: boolean) {
  const reduced = useReducedMotion()
  const [cancelled, setCancelled] = useState(false)
  useEffect(() => {
    const settle = () => {
      if (document.hidden) setCancelled(true)
    }
    settle()
    document.addEventListener('visibilitychange', settle)
    return () => document.removeEventListener('visibilitychange', settle)
  }, [])
  return requested && !reduced && !cancelled
}
