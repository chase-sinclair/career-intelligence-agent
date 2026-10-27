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

// ── Enhanced profile (opt-in, landing page) ───────────────────────────────────
// Resting values are deliberately high enough that the network reads as
// connected with no cursor at all — the proximity highlight never fires on
// touch, so the resting state has to carry the whole effect there.
const ENH_GLOW_RADIUS = 140   // tighter reach than the 130 default, but eased
const ENH_GLOW_LERP = 0.20    // vs 0.08 — snappier response to the cursor
const ENH_EDGE_REST = 0.26    // vs 0.10 resting coefficient
const ENH_EDGE_GLOW = 0.40    // vs 0.34
const ENH_EDGE_MAX = 0.58     // vs 0.50
const ENH_NODE_BASE = 0.34    // vs 0.16
const ENH_NODE_MAX = 0.88     // vs 0.72
const ENH_NODE_GLOW = 0.55    // vs 0.60 (less needed now the base is higher)

// Quiet zone behind the headline
const QUIET_PAD = 28          // px of padding around the measured rect
const QUIET_FEATHER = 90      // px over which activity returns to normal
const QUIET_MIN = 0.18        // opacity multiplier at the centre of the zone

const smoothstep = (t: number) => t * t * (3 - 2 * t)

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

interface ConstellationCanvasProps {
  className?: string
  /**
   * Opt-in landing-page tuning: brighter resting network, tighter accent
   * proximity falloff. Off by default so other routes are unaffected.
   */
  enhanced?: boolean
  /**
   * CSS selector for the element whose bounding rect becomes a reduced-activity
   * zone, so text over the canvas stays legible. A selector rather than a ref
   * so the host page can stay a server component. Measured live rather than
   * hardcoded, and re-measured on resize and whenever the element reflows.
   */
  quietZoneSelector?: string
}

export default function ConstellationCanvas({
  className,
  enhanced = false,
  quietZoneSelector,
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const theme = { bg: '#DDE2E5', node: '19, 23, 26', accent: '14, 122, 114' }
    // Quiet-zone rects in canvas space. Cached — never measured inside the draw
    // loop, since reading layout there would force a reflow every frame.
    let quiet: { x1: number; y1: number; x2: number; y2: number }[] = []

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduceMotion = motionQuery.matches

    function measureQuietZone() {
      quiet = []
      const el = quietZoneSelector ? document.querySelector(quietZoneSelector) : null
      if (!enhanced || !el || !canvas) return
      const c = canvas.getBoundingClientRect()

      // Per-line text boxes, not the element box. A block-level headline spans
      // the full column width while its text may occupy a fraction of it —
      // using the element rect would mute a full-width band of the canvas.
      let rects: DOMRect[] = []
      try {
        const range = document.createRange()
        range.selectNodeContents(el)
        rects = Array.from(range.getClientRects())
        range.detach?.()
      } catch {
        rects = []
      }
      if (!rects.length) rects = [el.getBoundingClientRect()]

      quiet = rects
        .filter(r => r.width > 0 && r.height > 0)
        .map(r => ({
          x1: r.left - c.left - QUIET_PAD,
          y1: r.top - c.top - QUIET_PAD,
          x2: r.right - c.left + QUIET_PAD,
          y2: r.bottom - c.top + QUIET_PAD,
        }))
    }

    /** 1 outside every zone, easing down to QUIET_MIN inside one. */
    function quietFactor(x: number, y: number): number {
      if (!quiet.length) return 1
      let factor = 1
      for (const z of quiet) {
        const dx = Math.max(z.x1 - x, 0, x - z.x2)
        const dy = Math.max(z.y1 - y, 0, y - z.y2)
        const d = Math.hypot(dx, dy)
        if (d >= QUIET_FEATHER) continue
        const f = QUIET_MIN + (1 - QUIET_MIN) * smoothstep(d / QUIET_FEATHER)
        if (f < factor) factor = f
      }
      return factor
    }

    function init() {
      // Read the Slate palette off the cascade once per init rather than per
      // frame — the tokens never change at runtime and getComputedStyle in the
      // draw loop forces a style recalc on every frame.
      const cs = getComputedStyle(canvas!)
      theme.bg = cs.getPropertyValue('--bg').trim() || '#DDE2E5'
      theme.node = cs.getPropertyValue('--ink-rgb').trim() || '19, 23, 26'
      theme.accent = cs.getPropertyValue('--accent-rgb').trim() || '14, 122, 114'

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
      measureQuietZone()
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
      if (reduceMotion) requestStatic()
    }

    const handleResize = () => {
      init()
      if (reduceMotion) requestStatic()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    // Re-measure if the headline itself reflows (font load, copy change).
    let ro: ResizeObserver | null = null
    const quietEl = enhanced && quietZoneSelector ? document.querySelector(quietZoneSelector) : null
    if (quietEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measureQuietZone()
        if (reduceMotion) requestStatic()
      })
      ro.observe(quietEl)
    }

    let t = 0

    function draw() {
      const cw = canvas!.offsetWidth
      const ch = canvas!.offsetHeight
      if (canvas!.width !== cw || canvas!.height !== ch) {
        canvas!.width = cw
        canvas!.height = ch
      }

      ctx!.fillStyle = theme.bg
      ctx!.fillRect(0, 0, cw, ch)

      const nodes = nodesRef.current
      const mouse = mouseRef.current

      // Drift. Frozen entirely under prefers-reduced-motion; speed and physics
      // are otherwise untouched.
      if (!reduceMotion) {
        for (const node of nodes) {
          node.x += node.vx
          node.y += node.vy
          if (node.x < 0) { node.x = 0; node.vx = Math.abs(node.vx) }
          if (node.x > cw) { node.x = cw; node.vx = -Math.abs(node.vx) }
          if (node.y < 0) { node.y = 0; node.vy = Math.abs(node.vy) }
          if (node.y > ch) { node.y = ch; node.vy = -Math.abs(node.vy) }
        }
      }

      // Proximity. One pass over the nodes — the mousemove handler only stores
      // coordinates, so moving the cursor costs nothing on its own.
      const radius = enhanced ? ENH_GLOW_RADIUS : GLOW_RADIUS
      const lerp = enhanced ? ENH_GLOW_LERP : 0.08
      for (const node of nodes) {
        const dx = node.x - mouse.x
        const dy = node.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const raw = dist < radius ? 1 - dist / radius : 0
        node.glowTarget = enhanced ? smoothstep(raw) : raw
        if (reduceMotion) node.glowCurrent = node.glowTarget
        else node.glowCurrent += (node.glowTarget - node.glowCurrent) * lerp
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
            const prox = 1 - dist / EDGE_DIST
            const alpha = enhanced
              ? Math.min(ENH_EDGE_MAX, prox * ENH_EDGE_REST + g * ENH_EDGE_GLOW)
              : Math.min(0.50, prox * 0.10 + g * 0.34)
            const q = enhanced
              ? Math.min(quietFactor(a.x, a.y), quietFactor(b.x, b.y))
              : 1
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.strokeStyle = `rgba(${theme.node},${(alpha * q).toFixed(3)})`
            ctx!.lineWidth = 0.5 + g * 0.9
            ctx!.stroke()
            // Accent tint on the edges nearest the cursor
            if (enhanced && g > 0.02) {
              ctx!.strokeStyle = `rgba(${theme.accent},${(g * 0.45 * q).toFixed(3)})`
              ctx!.stroke()
            }
          }
        }
      }

      if (!reduceMotion) t += 0.02
      for (const node of nodes) {
        const p = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * node.pulseSpeed + node.pulse)
        const r = node.r * (0.75 + 0.4 * p) + node.glowCurrent * 3.2
        const alpha = enhanced
          ? Math.min(ENH_NODE_MAX, ENH_NODE_BASE + 0.30 * p + node.glowCurrent * ENH_NODE_GLOW)
          : Math.min(0.72, 0.16 + 0.30 * p + node.glowCurrent * 0.60)
        const q = enhanced ? quietFactor(node.x, node.y) : 1

        // Soft accent halo on the ~22% active nodes — breathes slowly
        if (node.active) {
          const breathe = reduceMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.6 + node.activePhase)
          const haloAlpha = (0.05 + 0.05 * breathe) * q
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, r + 5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${theme.accent},${haloAlpha.toFixed(3)})`
          ctx!.fill()
        }

        // Hover halo — accent-tinted and tighter in the enhanced profile
        if (node.glowCurrent > 0.05) {
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, r + (enhanced ? 7 : 6), 0, Math.PI * 2)
          ctx!.fillStyle = enhanced
            ? `rgba(${theme.accent},${(node.glowCurrent * 0.22 * q).toFixed(3)})`
            : `rgba(${theme.node},${(node.glowCurrent * 0.12).toFixed(3)})`
          ctx!.fill()
        }

        ctx!.beginPath()
        ctx!.arc(node.x, node.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${theme.node},${(alpha * q).toFixed(3)})`
        ctx!.fill()

        // Nodes closest to the cursor pick up the accent
        if (enhanced && node.glowCurrent > 0.01) {
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, r, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${theme.accent},${(node.glowCurrent * 0.85 * q).toFixed(3)})`
          ctx!.fill()
        }
      }

      if (!reduceMotion) rafRef.current = requestAnimationFrame(draw)
    }

    /** Single frame, rAF-coalesced. Used only in the reduced-motion path. */
    let staticPending = false
    function requestStatic() {
      if (staticPending) return
      staticPending = true
      rafRef.current = requestAnimationFrame(() => {
        staticPending = false
        draw()
      })
    }

    function start() {
      cancelAnimationFrame(rafRef.current)
      staticPending = false
      if (reduceMotion) requestStatic()
      else rafRef.current = requestAnimationFrame(draw)
    }

    const handleMotionChange = () => {
      reduceMotion = motionQuery.matches
      start()
    }
    motionQuery.addEventListener('change', handleMotionChange)

    init()
    start()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      motionQuery.removeEventListener('change', handleMotionChange)
      ro?.disconnect()
    }
  }, [enhanced, quietZoneSelector])

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'absolute inset-0 w-full h-full'}
    />
  )
}
