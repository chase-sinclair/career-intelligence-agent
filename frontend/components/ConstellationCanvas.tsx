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
}

const NODE_COUNT = 44
const EDGE_DIST = 115
const GLOW_RADIUS = 100

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.offsetWidth || window.innerWidth
    const h = canvas.offsetHeight || window.innerHeight

    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.42, 0.42),
      vy: rand(-0.42, 0.42),
      r: rand(0.5, 2.1),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.4, 1.0),
      glowCurrent: 0,
      glowTarget: 0,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    let t = 0

    function draw() {
      const cw = canvas!.offsetWidth
      const ch = canvas!.offsetHeight
      if (canvas!.width !== cw || canvas!.height !== ch) {
        canvas!.width = cw
        canvas!.height = ch
      }

      ctx!.fillStyle = '#080808'
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

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < EDGE_DIST) {
            const connectionGlow = Math.max(a.glowCurrent, b.glowCurrent)
            const alpha = Math.min(0.55, (1 - dist / EDGE_DIST) * 0.13 + connectionGlow * 0.25)
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.strokeStyle = `rgba(226,223,208,${alpha.toFixed(3)})`
            ctx!.lineWidth = 0.5 + connectionGlow * 0.5
            ctx!.stroke()
          }
        }
      }

      // Draw nodes
      t += 0.02
      for (const node of nodes) {
        const pulseFactor = 0.5 + 0.5 * Math.sin(t * node.pulseSpeed + node.pulse)
        const radius = node.r * (0.75 + 0.4 * pulseFactor) + node.glowCurrent * 2.5
        const alpha = Math.min(1, 0.2 + 0.4 * pulseFactor + node.glowCurrent * 0.7)

        if (node.glowCurrent > 0.05) {
          ctx!.beginPath()
          ctx!.arc(node.x, node.y, radius + 3, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(226,223,208,${(node.glowCurrent * 0.08).toFixed(3)})`
          ctx!.fill()
        }

        ctx!.beginPath()
        ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(226,223,208,${alpha.toFixed(3)})`
        ctx!.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
