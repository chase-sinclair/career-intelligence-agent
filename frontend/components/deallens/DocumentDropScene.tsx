'use client'

import { motion } from 'framer-motion'
import { useId, useEffect, useState } from 'react'
import { useSceneMotion } from './useSceneMotion'

/** Layers make the document actually disappear behind the folder's front. */
export default function DocumentDropScene({
  animate = true,
}: {
  animate?: boolean
}) {
  const play = useSceneMotion(animate)
  const patternId = useId()
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    if (!play) return
    const detected = setTimeout(() => setBeat(1), 900)
    const started = setTimeout(() => setBeat(2), 1450)
    return () => {
      clearTimeout(detected)
      clearTimeout(started)
    }
  }, [play])
  const status = !play ? 2 : beat
  return (
    <>
      <div
        className="flex items-center gap-2 pt-4 text-sm text-primary"
        role="status"
      >
        <span className="h-2 w-2 rounded-full bg-primary" />
        {
          ['Watching for new files', 'New file detected', 'Workflow started'][
            status
          ]
        }
      </div>
      <div
        className="relative mx-auto h-[360px] w-full max-w-[340px] sm:hidden"
        role="img"
        aria-label="A synthetic Northstar CIM PDF drops into Google Drive and triggers Zap 1."
      >
        <p className="pt-4 text-center font-mono text-[11px] text-primary">
          GOOGLE DRIVE INTAKE
        </p>
        <div className="absolute left-1/2 top-[134px] h-28 w-44 -translate-x-1/2 rounded-xl bg-primary/20" />
        <motion.div
          initial={play ? { x: -65, y: 0, rotate: -8, scale: 1 } : false}
          animate={{
            x: play ? [-65, -57, 0] : 0,
            y: play ? [0, -12, 80] : 80,
            rotate: play ? [-8, -10, 0] : 0,
            scale: play ? [1, 1.03, 0.68] : 0.68,
          }}
          transition={{
            duration: play ? 0.9 : 0,
            times: [0, 0.2, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-[calc(50%-54px)] top-12 h-36 w-[108px] rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-sm"
        >
          <span className="rounded bg-primary px-2 py-1 text-[10px] text-on-primary">
            PDF
          </span>
          <p className="mt-3 text-sm font-semibold">Northstar</p>
          <p className="text-xs">Field Services</p>
          <div className="mt-3 h-1 bg-outline-variant" />
          <div className="mt-2 h-1 w-3/4 bg-outline-variant" />
        </motion.div>
        <div className="absolute left-1/2 top-40 flex h-28 w-48 -translate-x-1/2 flex-col items-center justify-center rounded-xl border border-primary bg-surface-container-lowest shadow-sm">
          <svg viewBox="0 0 40 32" className="mb-2 h-6 w-8" aria-hidden="true">
            <path d="M12 0L0 22H12L24 0Z" fill="var(--accent)" />
            <path d="M24 0L38 22H26L12 0Z" fill="#7DADA7" />
            <path d="M0 22L6 32H32L38 22Z" fill="#ACCAC6" />
          </svg>
          <p className="text-base font-semibold">CIM Intake</p>
          <p className="text-xs text-primary">Google Drive</p>
        </div>
        <motion.div
          initial={play ? { opacity: 0, y: -5 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: play ? 1.8 : 0, duration: play ? 0.35 : 0 }}
          className="absolute bottom-5 left-0 right-0 text-center"
        >
          <p className="mb-2 text-primary">↓</p>
          <p className="text-sm font-semibold text-primary">
            ✓ File detected → Zap 1
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Northstar CIM · synthetic PDF
          </p>
        </motion.div>
      </div>
      <svg
        viewBox="0 0 600 410"
        role="img"
        aria-label="A synthetic Northstar CIM PDF drops into the Google Drive CIM Intake folder. File detection triggers Zap 1."
        className="hidden h-auto w-full overflow-visible sm:block"
      >
        <defs>
          <pattern
            id={patternId}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="currentColor" opacity="0.12" />
          </pattern>
        </defs>
        <rect width="600" height="410" fill={`url(#${patternId})`} />
        <text
          x="30"
          y="33"
          fill="var(--accent)"
          fontSize="12"
          letterSpacing="2"
        >
          01 / GOOGLE DRIVE INTAKE
        </text>
        <path
          d="M220 218 V174 Q220 160 235 160 H286 L301 177 H363 Q378 177 378 191 V295 H220Z"
          fill="var(--accent)"
          opacity="0.22"
        />
        <motion.g
          data-testid="cim-document"
          initial={play ? { x: 0, y: 0, rotate: -7, scale: 1 } : false}
          animate={{
            x: play ? [0, 14, 138, 154] : 154,
            y: play ? [0, -18, 54, 75] : 75,
            rotate: play ? [-7, -10, 3, 0] : 0,
            scale: play ? [1, 1.03, 0.84, 0.66] : 0.66,
          }}
          transition={{
            duration: play ? 0.9 : 0,
            times: [0, 0.2, 0.72, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: '140px 155px' }}
        >
          <rect
            x="59"
            y="60"
            width="156"
            height="204"
            rx="9"
            fill="var(--panel-solid)"
            stroke="rgba(var(--ink-rgb),.22)"
          />
          <rect
            x="76"
            y="78"
            width="35"
            height="19"
            rx="4"
            fill="var(--accent)"
          />
          <text x="83" y="92" fontSize="11" fill="var(--accent-ink)">
            PDF
          </text>
          <text x="76" y="126" fontSize="16" fontWeight="600">
            Northstar
          </text>
          <text x="76" y="146" fontSize="12">
            Field Services
          </text>
          <path
            d="M76 166H196 M76 177H180 M76 188H191"
            stroke="currentColor"
            opacity=".18"
            strokeWidth="3"
          />
          <text x="76" y="223" fontSize="10" fill="var(--accent)">
            SYNTHETIC CIM
          </text>
          <text x="76" y="243" fontSize="10">
            Confidential memorandum
          </text>
        </motion.g>
        <motion.path
          d="M211 206 Q210 196 221 196 H375 Q386 196 384 209 L374 296 Q373 307 360 307 H233 Q221 307 220 296Z"
          fill="var(--panel-solid)"
          stroke="var(--accent)"
          strokeWidth="1.5"
          animate={play ? { scale: [1, 1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: play ? 2 : 0 }}
          style={{ transformOrigin: '300px 260px' }}
        />
        <path d="M289 216L278 235H289L300 216Z" fill="#0A6059" />
        <path d="M300 216L311 235H300L289 216Z" fill="#7DADA7" />
        <path d="M278 235L284 245H305L311 235Z" fill="#ACCAC6" />
        <text
          x="297"
          y="268"
          textAnchor="middle"
          fontSize="17"
          fontWeight="600"
        >
          CIM Intake
        </text>
        <text
          x="297"
          y="288"
          textAnchor="middle"
          fontSize="12"
          fill="var(--accent)"
        >
          Google Drive
        </text>
        <motion.path
          d="M387 250H432 Q444 250 444 236V218H461"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          initial={play ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: play ? 1.5 : 0, duration: play ? 0.55 : 0 }}
        />
        <motion.g
          initial={play ? { opacity: 0, y: 8 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: play ? 1.9 : 0, duration: play ? 0.3 : 0 }}
        >
          <rect
            x="458"
            y="177"
            width="116"
            height="85"
            rx="12"
            fill="var(--panel-solid)"
            stroke="rgba(var(--accent-rgb),.3)"
          />
          <circle cx="478" cy="199" r="8" fill="var(--accent)" />
          <path
            d="M474 199l3 3 5-6"
            stroke="white"
            fill="none"
            strokeWidth="1.5"
          />
          <text x="495" y="204" fontSize="16" fontWeight="600">
            Zap 1
          </text>
          <text x="471" y="237" fontSize="12" fill="var(--accent)">
            Workflow started
          </text>
          <rect
            x="117"
            y="336"
            width="368"
            height="36"
            rx="7"
            fill="var(--panel-solid)"
            stroke="rgba(var(--ink-rgb),.1)"
          />
          <text x="136" y="359" fontSize="12">
            ✓ Northstar_Field_Services_CIM.pdf
          </text>
        </motion.g>
      </svg>
      <p className="pb-4 text-center text-[11px] leading-5 text-on-surface-variant">
        File name · Original document link · Upload timestamp
      </p>
    </>
  )
}
