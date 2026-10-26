'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  pulse: number
  pulseSpeed: number
  glowCurrent: number
  glowTarget: number
  active: boolean
  activePhase: number
}

const NODE_COUNT = 51
const EDGE_DIST = 115
const GLOW_RADIUS = 130

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// Bias node density toward upper-right so the bottom-left hero text stays clear
function biasedPoint(w: number, h: number): { x: number; y: number } {
  for (let i = 0; i < 8; i++) {
    const x = rand(0, w)
    const y = rand(0, h)
    const yWeight = 1 - 0.55 * (y / h)
    const xWeight = 0.7 + 0.3 * (x / w)
    const heroPenalty = y / h > 0.55 && x / w < 0.6 ? 0.25 : 1.0
    const p = yWeight * xWeight * heroPenalty
    if (Math.random() < p) return { x, y }
  }
  return { x: rand(0, w), y: rand(0, h * 0.6) }
}

export default function ConstellationCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const themeRef = useRef({ bg: '#DDE2E5', node: '19, 23, 26', accent: '14, 122, 114' })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function init() {
      // Read the Slate palette off the cascade once per init rather than per
      // frame — the tokens never change at runtime and getComputedStyle in the
      // draw loop forces a style recalc on every frame.
      const cs = getComputedStyle(canvas!)
      themeRef.current = {
        bg:     cs.getPropertyValue('--bg').trim() || '#DDE2E5',
        node:   cs.getPropertyValue('--ink-rgb').trim() || '19, 23, 26',
        accent: cs.getPropertyValue('--accent-rgb').trim() || '14, 122, 114',
      }

      const w = canvas!.offsetWidth || window.innerWidth
      const h = canvas!.offsetHeight || window.innerHeight
      nodesRef.current = Array.from({ length: NODE_COUNT }, () => {
        const p = biasedPoint(w, h)
        return {
          x: p.x,
          y: p.y,
          vx: rand(-0.38, 0.38),
          vy: rand(-0.38, 0.38),
          r: rand(0.5, 2.1),
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.4, 1.0),
          glowCurrent: 0,
          glowTarget: 0,
          active: Math.random() < 0.22,
          activePhase: rand(0, Math.PI * 2),
        }
      })
    }

    // Track mouse at window level so glow works even when sections overlay the canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseRef.current = { x, y }
      } else {
        mouseRef.current = { x: -9999, y: -9999 }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', init)

    let t = 0

    function draw() {
      const cw = canvas!.offsetWidth
      const ch = canvas!.offsetHeight
      if (canvas!.width !== cw || canvas!.height !== ch) {
        canvas!.width = cw
        canvas!.height = ch
      }

      const theme = themeRef.current
      ctx!.fillStyle = theme.bg
      ctx!.fillRect(0, 0, cw, ch)

      const nodes = nodesRef.current
      const mouse = mouseRef.current

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        if (node.x < 0) { node.x = 0; node.vx = Math.abs(node.vx) }
        if (node.x > cw) { node.x = cw; node.vx = -Math.abs(node.vx) }
        if (node.y < 0) { node.y = 0; node.vy = Math.abs(node.vy) }
        if (node.y > ch) { node.y = ch; node.vy = -Math.abs(node.vy) }
      }

      for (const node of nodes) {
        const dx = node.x - mouse.x
        const dy = node.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        node.glowTarget = dist < GLOW_RADIUS ? 1 - dist / GLOW_RADIUS : 0
        node.glowCurrent += (node.glowTarget - node.glowCurrent) * 0.08
      }

      // Edges — bumped rest opacity, strong hover boost
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < EDGE_DIST) {
            const g = Math.max(a.glowCurrent, b.glowCurrent)
            const alpha = Math.min(0.50, (1 - dist / EDGE_DIST) * 0.10 + g * 0.34)
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.strokeStyle = `rgba(${theme.node},${alpha.toFixed(3)})`
            ctx!.lineWidth = 0.5 + g * 0.9
            ctx!.stroke()
          }
        }
      }

      t += 0.02
      for (const node of nodes) {
        const p = 0.5 + 0.5 * Math.sin(t * node.pulseSpeed + node.pulse)
        const r = node.r * (0.75 + 0.4 * p) + node.glowCurrent * 3.2
        const alpha = Math.min(0.72, 0.16 + 0.30 * p + node.glowCurrent * 0.60)

        // Soft accent halo on the ~22% active nodes — breathes slowly
        if (node.active) {
          const breathe = 0.5 + 0.5 * Math.sin(t * 0.6 + node.activePhase)
          const haloAlpha = 0.05 + 0.05 * breathe
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, r + 5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${theme.accent},${haloAlpha.toFixed(3)})`
          ctx!.fill()
        }

        // Hover halo — more noticeable than resting state
        if (node.glowCurrent > 0.05) {
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, r + 6, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${theme.node},${(node.glowCurrent * 0.12).toFixed(3)})`
          ctx!.fill()
        }

        ctx!.beginPath()
        ctx!.arc(node.x, node.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${theme.node},${alpha.toFixed(3)})`
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    init()
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'absolute inset-0 w-full h-full'}
    />
  )
}
