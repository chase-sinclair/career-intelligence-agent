'use client'

import { useEffect, useRef, useState } from 'react'
import TopNav from '@/components/TopNav'
import ConstellationCanvas from '@/components/ConstellationCanvas'

// ─── Types ────────────────────────────────────────────────────────────────────

type TipData = { eyebrow: string; title: string; period?: string; sub?: string; list?: string[] }
type TrajPoint = {
  id: string; x: number; y: number; type: string; label: string
  tipPlacement: 'top' | 'bottom' | 'left' | 'right'
  tip: TipData
}
type FulltimeJob = { id: string; title: string; co: string; period: string; loc: string; type: 'fulltime'; bahWork: { client: string[]; internal: string[] } }
type InternJob   = { id: string; title: string; co: string; period: string; loc: string; type: 'intern';   bullets: string[] }
type Job = FulltimeJob | InternJob

// ─── Colors ───────────────────────────────────────────────────────────────────

const PURPLE = 'var(--viz-bah)'
const GREEN  = 'var(--viz-intern)'
const GOLD   = 'var(--accent)'

// ─── Trajectory data ──────────────────────────────────────────────────────────

const TRAJ: TrajPoint[] = [
  { id: 'empoweryu', x: 80,  y: 255, type: 'intern',     label: 'EmPowerYu',
    tipPlacement: 'top',
    tip: { eyebrow: 'Internship', title: 'Data Analytics Intern · EmPowerYu', period: 'May – Nov 2020', sub: 'Palo Alto, CA' } },
  { id: 'r42',       x: 200, y: 240, type: 'intern',     label: 'R42 Group',
    tipPlacement: 'top',
    tip: { eyebrow: 'Internship', title: 'AI Intern · R42 Group', period: 'Jun – Sep 2020', sub: 'Palo Alto, CA' } },
  { id: 'lockheed',  x: 330, y: 215, type: 'intern',     label: 'Lockheed Martin',
    tipPlacement: 'top',
    tip: { eyebrow: 'Internship', title: 'Data Scientist Intern · Lockheed Martin', period: 'May – Aug 2021', sub: 'Bethesda, MD' } },
  { id: 'vt',        x: 440, y: 185, type: 'graduation', label: 'Virginia Tech',
    tipPlacement: 'top',
    tip: { eyebrow: 'Graduation', title: 'B.S., Computational Modeling & Data Analytics', period: 'Class of 2021', sub: 'Virginia Tech · Minor in Statistics' } },
  { id: 'bah-ds',    x: 560, y: 150, type: 'bah',        label: 'Data Scientist',
    tipPlacement: 'top',
    tip: { eyebrow: 'Promotion · Booz Allen', title: 'Data Scientist', period: 'Mar 2022 — May 2023', sub: 'Consulting title: Consultant' } },
  { id: 'bah-staff', x: 680, y: 115, type: 'bah',        label: 'Staff Data Scientist',
    tipPlacement: 'top',
    tip: { eyebrow: 'Promotion · Booz Allen', title: 'Staff Data Scientist', period: 'Jun 2023 — Aug 2024', sub: 'Consulting title: Senior Consultant' } },
  { id: 'bah-lead',  x: 800, y: 80,  type: 'bah',        label: 'Lead Data Scientist',
    tipPlacement: 'bottom',
    tip: { eyebrow: 'Current Role · Booz Allen', title: 'Lead Data Scientist', period: 'Sep 2024 — Present', sub: 'Consulting title: Associate' } },
  { id: 'next',      x: 920, y: 50,  type: 'next',       label: "What's Next?",
    tipPlacement: 'left',
    tip: {
      eyebrow: 'Looking Ahead', title: "What's Next?",
      sub: "Looking for a senior IC or tech-lead role at a product-driven company — somewhere I can take ownership of an applied-AI surface area end-to-end.",
      list: [
        'Production GenAI systems (RAG, agents, evals) at meaningful scale',
        'A small, high-trust team where I can both build and mentor',
        'Hybrid or remote · NYC, SF, or distributed',
        'Industries: enterprise SaaS, fintech, dev-tools, applied research',
      ],
    } },
]

const LEGEND_TIPS: Record<string, { eyebrow: string; title: string; body: string; list: string[] }> = {
  internships: {
    eyebrow: 'Internships', title: '3 internships · 2020 – 2021',
    body: 'Early-career rotations across AI research, defense, and consumer IoT — building the foundation for production data work.',
    list: ['EmPowerYu — Anomaly detection · IoT', 'R42 Group — AI quant overlays · VC', 'Lockheed Martin — NLP & topic modeling'],
  },
  bah: {
    eyebrow: 'Booz Allen Hamilton', title: 'Mar 2022 — Present',
    body: 'McLean, VA · Federal consulting. Five promotions in four years across DHS/FEMA and DOL engagements.',
    list: ['Data Scientist (Consultant)', 'Staff Data Scientist (Senior Consultant)', 'Lead Data Scientist (Associate) — current'],
  },
}

// ─── Experience data ──────────────────────────────────────────────────────────

const JOBS: Job[] = [
  { id: 'bah', title: 'Lead Data Scientist', co: 'Booz Allen Hamilton',
    period: 'Mar 2022 — Present', loc: 'McLean, VA · Federal Consulting', type: 'fulltime',
    bahWork: {
      client: [
        'Sole Metrics Lead on DisasterAssistance.gov (DHS / FEMA) — platform serving up to 20M annual users and 80M annual site visits.',
        'Defined and automated 100+ daily KPI measurement fields, giving senior government executives real-time analytics visibility during emergency response windows.',
        'Deployed a production-grade internal RAG chatbot trained on live website metrics data — currently in active use, eliminating hours of manual data collection per week.',
        'Directly managed one data scientist; coordinated across a ~30-person cross-disciplinary team and 6–8 DHS/FEMA stakeholders.',
        'Directed Grants Data Modernization migration for the DOL Office of Apprenticeship from Excel-based workflows to AWS and Snowflake via a 3-layer ETL pipeline.',
        'Reduced data pipeline runtime from hours to minutes, eliminating recurring manual ingestion and cleaning.',
        'Delivered 20+ real-time Tableau dashboards; led weekly strategy sessions with the Director.',
        'Operated within a ~20-person team alongside 5 DOL stakeholders.',
      ],
      internal: [
        'Lead PM for OptiFleet 2.0 — a 6-intern Summer Games cohort building an AI-enabled vehicle recommendation prototype, evaluated for direct government contract implementation.',
        'Developed a GenAI agentic recall detection system end-to-end during an internal hackathon, demonstrating multi-agent orchestration over public consumer-safety data.',
        'Contributed to 7 proposal efforts, leading major sections of 3 — including full past-performance workstreams.',
        'Proposal contributions helped secure contracts valued at $10M+.',
      ],
    } },
  { id: 'lockheed', title: 'Data Scientist Intern', co: 'Lockheed Martin',
    period: 'May – Aug 2021', loc: 'Bethesda, MD', type: 'intern',
    bullets: ['NLP and topic modeling on large document corpora.', 'Built semantic search improvements via k-means clustering, topic modeling, and Top2Vec.', 'Developed session log analysis to identify user data retrieval failures.'] },
  { id: 'r42', title: 'AI Intern', co: 'R42 Group',
    period: 'Jun – Sep 2020', loc: 'Palo Alto, CA', type: 'intern',
    bullets: ['Venture capital-adjacent AI environment.', 'Enhanced an AI-based stock market predictive model with a volatility-optimized algorithmic overlay to improve downside risk management and expected return.'] },
  { id: 'empoweryu', title: 'Data Analytics Intern', co: 'EmPowerYu',
    period: 'May – Nov 2020', loc: 'Palo Alto, CA', type: 'intern',
    bullets: ['Evaluated sensor event stability and reliability for a smart home IoT platform.', 'Built anomaly detection pipelines to pinpoint and mitigate errors in sensor data logs.'] },
]

// ─── Skills data ──────────────────────────────────────────────────────────────

const SKILLS = [
  // ── AI / GenAI ──────────────────────────────────────────────────────────────
  { name: 'LLMs',          cat: 'ai',   cx: 720,  cy: 110, size: 22 },
  { name: 'RAG',           cat: 'ai',   cx: 620,  cy: 70,  size: 18 },
  { name: 'LangGraph',     cat: 'ai',   cx: 820,  cy: 70,  size: 14 },
  { name: 'Agents',        cat: 'ai',   cx: 870,  cy: 160, size: 16 },
  { name: 'Prompt Eng',    cat: 'ai',   cx: 750,  cy: 200, size: 13 },
  { name: 'Eval',          cat: 'ai',   cx: 620,  cy: 180, size: 12 },
  { name: 'NLP',           cat: 'ai',   cx: 940,  cy: 110, size: 12 },
  { name: 'Vector Search', cat: 'ai',   cx: 540,  cy: 130, size: 12 },
  { name: 'LangChain',     cat: 'ai',   cx: 670,  cy: 235, size: 13 },
  { name: 'Multimodal',    cat: 'ai',   cx: 1000, cy: 90,  size: 12 },
  { name: 'MCP',           cat: 'ai',   cx: 1080, cy: 68,  size: 12 },
  // ── Data & Cloud ────────────────────────────────────────────────────────────
  { name: 'Python',        cat: 'data', cx: 350,  cy: 130, size: 20 },
  { name: 'SQL',           cat: 'data', cx: 220,  cy: 90,  size: 15 },
  { name: 'AWS',           cat: 'data', cx: 270,  cy: 230, size: 16 },
  { name: 'Snowflake',     cat: 'data', cx: 130,  cy: 170, size: 14 },
  { name: 'ETL',           cat: 'data', cx: 410,  cy: 240, size: 13 },
  { name: 'Bedrock',       cat: 'platform', cx: 160,  cy: 290, size: 13 },
  { name: 'Pandas',        cat: 'data', cx: 320,  cy: 60,  size: 12 },
  { name: 'FastAPI',       cat: 'data', cx: 440,  cy: 148, size: 15 },
  { name: 'Next.js',       cat: 'data', cx: 495,  cy: 52,  size: 14 },
  { name: 'dbt',           cat: 'data', cx: 295,  cy: 295, size: 13 },
  { name: 'Databricks',    cat: 'data', cx: 180,  cy: 388, size: 14 },
  { name: 'PySpark',       cat: 'data', cx: 55,   cy: 185, size: 12 },
  { name: 'n8n',           cat: 'auto', cx: 490,  cy: 290, size: 11 },
  // ── Visualization ───────────────────────────────────────────────────────────
  { name: 'Tableau',       cat: 'viz',  cx: 380,  cy: 340, size: 14 },
  { name: 'Streamlit',     cat: 'viz',  cx: 240,  cy: 360, size: 12 },
  { name: 'Dashboards',    cat: 'viz',  cx: 480,  cy: 370, size: 13 },
  { name: 'Looker',        cat: 'viz',  cx: 355,  cy: 400, size: 11 },
  // ── Leadership ──────────────────────────────────────────────────────────────
  { name: 'Stakeholder',   cat: 'lead',     cx: 980,  cy: 270, size: 15 },
  { name: 'Mentorship',    cat: 'lead',     cx: 880,  cy: 340, size: 13 },
  { name: 'Proposals',     cat: 'lead',     cx: 1080, cy: 320, size: 13 },
  { name: 'Published',     cat: 'lead',     cx: 1080, cy: 200, size: 13 },
  // ── AI Platforms & APIs ─────────────────────────────────────────────────────
  { name: 'OpenAI API',    cat: 'platform', cx: 710,  cy: 310, size: 15 },
  { name: 'Anthropic API', cat: 'platform', cx: 800,  cy: 285, size: 15 },
  { name: 'Claude Code',   cat: 'platform', cx: 655,  cy: 375, size: 14 },
  { name: 'Codex',         cat: 'platform', cx: 610,  cy: 325, size: 12 },
  { name: 'NotebookLM',   cat: 'platform', cx: 760,  cy: 380, size: 12 },
  { name: 'Gemini',        cat: 'platform', cx: 855,  cy: 360, size: 13 },
  // ── Automation ──────────────────────────────────────────────────────────────
  { name: 'Zapier',        cat: 'auto',     cx: 560,  cy: 360, size: 13 },
  { name: 'Airtable',      cat: 'auto',     cx: 430,  cy: 360, size: 13 },
]

const SKILL_COLORS: Record<string, string> = {
  ai:       'var(--sk-ai)',
  data:     'var(--sk-data)',
  viz:      'var(--sk-viz)',
  lead:     'var(--sk-lead)',
  platform: 'var(--sk-platform)',
  auto:     'var(--sk-auto)',
}

// ─── Cert data ────────────────────────────────────────────────────────────────

const CERT_GROUPS = [
  { id: 'anthropic', name: 'Anthropic', items: ['Claude 101', 'Claude Code in Action', 'Building with the Claude API', 'Introduction to Model Context Protocol', 'Claude with Amazon Bedrock'] },
  { id: 'aws',       name: 'AWS',       items: ['AWS Certified AI Practitioner Professional'] },
  { id: 'google',    name: 'Google',    items: ['Google AI Professional Certificate'] },
  { id: 'ibm',       name: 'IBM',       items: ['IBM RAG and Agentic AI Professional Certificate'] },
  { id: 'amazon',    name: 'Amazon',    items: ['ML & AI Fundamentals', 'Generative AI Solutions', 'Foundation Model Optimization', 'Responsible AI Practices', 'Security & Governance for AI', 'Essentials of Prompt Engineering'] },
]

// ─── Path helper ──────────────────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }
  return d
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => el.classList.add('about-revealed'), delay)
        observer.unobserve(el)
      }
    }, { threshold: 0.08 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return <div ref={ref} className="about-reveal">{children}</div>
}

// ─── Identity Section ─────────────────────────────────────────────────────────

function IdentitySection() {
  return (
    <section style={{
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28,
      padding: '28px 32px',
      background: 'var(--panel)',
      border: '0.5px solid rgba(var(--accent-rgb),0.20)',
      borderRadius: 14, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.10) 0%, transparent 55%)' }} />

      {/* Left: name + headline + links */}
      <div style={{ position: 'relative' }}>
        <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(var(--accent-rgb),0.5)', margin: '0 0 10px' }}>
          Architect File · CSI-001
        </p>
        <h1 style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 1, color: 'var(--ink)', margin: 0 }}>
          Chase{' '}
          <em className="font-serif" style={{ fontStyle: 'normal', color: GOLD, fontWeight: 400 }}>Sinclair</em>
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 13, color: 'rgba(var(--ink-rgb),0.6)', lineHeight: 1.5, maxWidth: 720 }}>
          Data Scientist building production-grade analytics and AI systems for federal &amp; enterprise clients —
          five promotions in four years, currently a Lead Data Scientist at Booz Allen Hamilton.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px',
            borderRadius: 9999, background: 'rgba(var(--accent-rgb),0.10)', border: '0.5px solid rgba(var(--accent-rgb),0.25)' }}>
            <span className="about-pulse" />
            <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.08em',
              color: 'rgba(var(--accent-rgb),0.9)', textTransform: 'uppercase' }}>Open to opportunities</span>
          </div>
          <span style={{ width: 1, height: 11, background: 'rgba(var(--ink-rgb),0.16)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: 'rgba(var(--ink-rgb),0.60)' }}>New York, NY</span>
          <span style={{ width: 1, height: 11, background: 'rgba(var(--ink-rgb),0.16)', flexShrink: 0 }} />
          <a href="https://www.linkedin.com/in/chase-sinclair" target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: 'rgba(var(--accent-rgb),0.85)', textDecoration: 'underline',
              textDecorationColor: 'rgba(var(--accent-rgb),0.4)', textUnderlineOffset: 3,
              display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 16, height: 16, borderRadius: 3, background: '#0A66C2',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>
              </svg>
            </span>
            LinkedIn
          </a>
          <span style={{ width: 1, height: 11, background: 'rgba(var(--ink-rgb),0.16)', flexShrink: 0 }} />
          <a href="https://github.com/chasesinclair23" target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: 'rgba(var(--accent-rgb),0.85)', textDecoration: 'underline',
              textDecorationColor: 'rgba(var(--accent-rgb),0.4)', textUnderlineOffset: 3,
              display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 16, height: 16, borderRadius: 3, background: 'var(--ink)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--panel-solid)">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.39.97 0 1.95.13 2.86.39 2.18-1.49 3.14-1.18 3.14-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
              </svg>
            </span>
            Github
          </a>
        </div>
      </div>

      {/* Right: education tiles */}
      <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}>
        <div style={{ width: '100%', padding: '16px 20px', background: 'var(--panel-2)',
          border: '0.5px solid rgba(var(--accent-rgb),0.24)', borderRadius: 12 }}>
          <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(var(--accent-rgb),0.55)', margin: '0 0 8px' }}>Education</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(var(--ink-rgb),0.85)', margin: 0, lineHeight: 1.3 }}>
            B.S. — Computational Modeling &amp; Data Analytics (CMDA)
          </p>
          <p style={{ fontSize: 11, color: 'rgba(var(--ink-rgb),0.60)', margin: '4px 0 0' }}>Virginia Tech</p>
          <p className="font-mono" style={{ fontSize: 10, color: 'rgba(var(--accent-rgb),0.7)', margin: '6px 0 0' }}>2021</p>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: 9999, border: '0.5px solid rgba(var(--accent-rgb),0.25)',
          background: 'var(--panel-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(var(--accent-rgb),0.6)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          lineHeight: 1, margin: '-2px 0', zIndex: 1 }}>+</div>
        <div style={{ width: '90%', padding: '12px 18px', background: 'var(--panel-2)',
          border: '0.5px solid rgba(var(--accent-rgb),0.24)', borderRadius: 12, opacity: 0.95 }}>
          <p style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(var(--ink-rgb),0.85)', margin: 0, lineHeight: 1.3 }}>
            Minor in Statistics
          </p>
          <p style={{ fontSize: 10.5, color: 'rgba(var(--ink-rgb),0.60)', margin: '4px 0 0' }}>Virginia Tech</p>
          <p className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--accent-rgb),0.7)', margin: '6px 0 0' }}>2021</p>
        </div>
      </div>
    </section>
  )
}

// ─── Trajectory Section ───────────────────────────────────────────────────────

function TrajectorySection() {
  const svgRef  = useRef<SVGSVGElement>(null)
  const tipRef  = useRef<HTMLDivElement>(null)
  const [legendTip, setLegendTip] = useState<{ key: string; left: number } | null>(null)

  useEffect(() => {
    if (!svgRef.current || !tipRef.current) return
    const svg = svgRef.current as SVGSVGElement
    const tip = tipRef.current as HTMLDivElement

    const W = 1000, H = 320
    const ns = 'http://www.w3.org/2000/svg'
    const pts: [number, number][] = TRAJ.map(m => [m.x, m.y])

    const pathD  = smoothPath(pts)
    const greenD = smoothPath(pts.slice(0, 3))
    const bahD   = smoothPath(pts.slice(4, 7))
    const areaD  = pathD + ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`

    let grid = ''
    for (let g = 0; g < 4; g++) {
      const y = 30 + g * 70
      grid += `<line x1="40" x2="${W - 20}" y1="${y}" y2="${y}" stroke="rgba(var(--ink-rgb),0.07)" stroke-dasharray="2 4"/>`
    }

    svg.innerHTML = `
      <defs>
        <linearGradient id="tFill"   x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(var(--accent-rgb),0.13)"/>
          <stop offset="100%" stop-color="rgba(var(--accent-rgb),0)"/>
        </linearGradient>
        <linearGradient id="tLine"   x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(var(--accent-rgb),0.5)"/>
          <stop offset="100%" stop-color="${GOLD}"/>
        </linearGradient>
        <linearGradient id="tBah"    x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(var(--viz-bah-rgb),0.7)"/>
          <stop offset="100%" stop-color="${PURPLE}"/>
        </linearGradient>
        <linearGradient id="tGreen"  x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(var(--viz-intern-rgb),0.7)"/>
          <stop offset="100%" stop-color="${GREEN}"/>
        </linearGradient>
        <filter id="fGlow"  x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fBah"   x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${grid}
      <path d="${areaD}" fill="url(#tFill)"/>
      <path d="${pathD}"  fill="none" stroke="url(#tLine)"  stroke-width="2" stroke-linecap="round" stroke-dasharray="2400" stroke-dashoffset="2400">
        <animate attributeName="stroke-dashoffset" from="2400" to="0" dur="1.6s" fill="freeze" begin="0.15s"/>
      </path>
      <path d="${greenD}" fill="none" stroke="url(#tGreen)" stroke-width="3" stroke-linecap="round" filter="url(#fBah)" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze" begin="1.2s"/>
      </path>
      <path d="${bahD}"   fill="none" stroke="url(#tBah)"   stroke-width="3" stroke-linecap="round" filter="url(#fBah)" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.6s" fill="freeze" begin="1.5s"/>
      </path>
      <g id="traj-pts"></g>
    `

    const pointsG = svg.querySelector('#traj-pts')!

    TRAJ.forEach((m, i) => {
      const isNext   = m.type === 'next'
      const isIntern = m.type === 'intern'
      const isBah    = m.type === 'bah'
      const color    = isBah ? PURPLE : isIntern ? GREEN : GOLD
      const ringR    = isNext ? 11 : 9
      const dotR     = isNext ? 5  : 4

      const g = document.createElementNS(ns, 'g')
      g.setAttribute('transform', `translate(${m.x} ${m.y})`)
      g.style.cursor    = 'pointer'
      g.style.opacity   = '0'
      g.style.animation = `traj-fadein 0.5s ease ${0.4 + i * 0.1}s forwards`

      // pulse ring
      const pulse = document.createElementNS(ns, 'circle')
      pulse.setAttribute('r', String(ringR))
      pulse.setAttribute('fill', 'none')
      pulse.setAttribute('stroke', color)
      pulse.setAttribute('stroke-width', '1')
      pulse.setAttribute('opacity', isNext ? '0.5' : '0.4')
      const dur   = isNext ? '2.2s' : `${2.4 + (i % 3) * 0.2}s`
      const begin = `${i * 0.18}s`
      const aR = document.createElementNS(ns, 'animate')
      aR.setAttribute('attributeName', 'r')
      aR.setAttribute('from', String(ringR))
      aR.setAttribute('to',   String(ringR + (isNext ? 13 : 10)))
      aR.setAttribute('dur', dur); aR.setAttribute('begin', begin); aR.setAttribute('repeatCount', 'indefinite')
      const aO = document.createElementNS(ns, 'animate')
      aO.setAttribute('attributeName', 'opacity')
      aO.setAttribute('from', isNext ? '0.5' : '0.4')
      aO.setAttribute('to',   '0')
      aO.setAttribute('dur', dur); aO.setAttribute('begin', begin); aO.setAttribute('repeatCount', 'indefinite')
      pulse.appendChild(aR); pulse.appendChild(aO)
      g.appendChild(pulse)

      // halo
      const halo = document.createElementNS(ns, 'circle')
      halo.setAttribute('r', String(ringR + 4))
      halo.setAttribute('fill', color)
      halo.setAttribute('opacity', isNext ? '0.18' : '0')
      if (isNext) halo.setAttribute('filter', 'url(#fGlow)')
      g.appendChild(halo)

      // ring
      const ring = document.createElementNS(ns, 'circle')
      ring.setAttribute('r', String(ringR))
      ring.setAttribute('fill', 'var(--panel-solid)')
      ring.setAttribute('stroke', color)
      ring.setAttribute('stroke-width', isNext ? '1.5' : '1.2')
      g.appendChild(ring)

      // dot
      const dot = document.createElementNS(ns, 'circle')
      dot.setAttribute('r', String(dotR))
      dot.setAttribute('fill', color)
      g.appendChild(dot)

      // label
      const lbl = document.createElementNS(ns, 'text')
      lbl.setAttribute('x', '0')
      lbl.setAttribute('y', String(isBah ? -18 : isNext ? 30 : 28))
      lbl.setAttribute('text-anchor', 'middle')
      lbl.setAttribute('fill', isNext ? GOLD : isBah ? PURPLE : isIntern ? GREEN : 'rgba(var(--ink-rgb),0.65)')
      lbl.setAttribute('font-family', 'JetBrains Mono, monospace')
      lbl.setAttribute('font-size', '10')
      lbl.textContent = m.label
      g.appendChild(lbl)

      g.addEventListener('mouseenter', () => {
        halo.setAttribute('opacity', '0.32')
        showTip(m, m.x, m.y)
      })
      g.addEventListener('mouseleave', () => {
        halo.setAttribute('opacity', isNext ? '0.18' : '0')
        tip.classList.remove('traj-tip-show')
      })

      pointsG.appendChild(g)
    })

    function showTip(m: TrajPoint, dx: number, dy: number) {
      tip.className = 'traj-tip'
      if (m.type === 'next')   tip.classList.add('traj-tip-large')
      if (m.type === 'bah')    tip.classList.add('traj-tip-purple')
      if (m.type === 'intern') tip.classList.add('traj-tip-green')

      const t = m.tip
      tip.innerHTML = `
        <p class="tt-eyebrow">${t.eyebrow}</p>
        <p class="tt-title">${t.title}</p>
        ${t.sub    ? `<p class="tt-sub">${t.sub}</p>`       : ''}
        ${t.period ? `<p class="tt-period">${t.period}</p>` : ''}
        ${t.list   ? `<ul class="tt-list">${t.list.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
      `

      const wrap = (svg.parentElement as HTMLElement).getBoundingClientRect()
      const xPct = (dx / W) * wrap.width
      const yPct = (dy / H) * wrap.height

      requestAnimationFrame(() => {
        const tw   = tip.offsetWidth
        const th   = tip.offsetHeight
        const wW   = wrap.width

        let pl = m.tipPlacement
        if (pl === 'top' && xPct + tw / 2 > wW - 12) pl = 'left'
        if (pl === 'top' && xPct - tw / 2 < 12)       pl = 'right'
        if (pl === 'top' && yPct - th - 18 < 0)        pl = 'bottom'

        tip.classList.remove('pos-top', 'pos-bottom', 'pos-left', 'pos-right')
        tip.classList.add('pos-' + pl)

        let left: number, top: number
        if      (pl === 'top')    { left = xPct;      top = yPct - th - 14; tip.style.transform = 'translate(-50%, 0)' }
        else if (pl === 'bottom') { left = xPct;      top = yPct + 18;      tip.style.transform = 'translate(-50%, 0)' }
        else if (pl === 'left')   { left = xPct - 18; top = yPct;           tip.style.transform = 'translate(-100%, -50%)' }
        else                      { left = xPct + 18; top = yPct;           tip.style.transform = 'translate(0, -50%)' }

        if (pl === 'top' || pl === 'bottom') {
          if (left - tw / 2 < 8)    { tip.style.transform = 'translate(0, 0)';    left = 8 }
          else if (left + tw / 2 > wW - 8) { tip.style.transform = 'translate(-100%, 0)'; left = wW - 8 }
        }

        tip.style.left = left + 'px'
        tip.style.top  = top  + 'px'
        tip.classList.add('traj-tip-show')
      })
    }
  }, [])

  function handleLegendEnter(key: string, el: HTMLElement) {
    const parentRect = el.parentElement!.getBoundingClientRect()
    const itemRect   = el.getBoundingClientRect()
    setLegendTip({ key, left: itemRect.left - parentRect.left })
  }

  const lt = legendTip ? LEGEND_TIPS[legendTip.key] : null

  return (
    <section style={{ background: 'var(--panel)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.60)', margin: 0 }}>Career Trajectory</p>
        <p className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--ink-rgb),0.60)', letterSpacing: '0.04em', margin: 0 }}>Hover a milestone</p>
      </div>

      {/* Legend */}
      <div style={{ position: 'relative', display: 'flex', gap: 18, flexWrap: 'wrap', padding: '4px 4px 12px', fontFamily: "'JetBrains Mono', monospace" }}>
        {([['internships', GREEN], ['bah', PURPLE]] as const).map(([key, color]) => (
          <div key={key}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'default', padding: '4px 6px', borderRadius: 6 }}
            onMouseEnter={e => handleLegendEnter(key, e.currentTarget)}
            onMouseLeave={() => setLegendTip(null)}>
            <span style={{ position: 'relative', width: 11, height: 11, borderRadius: 9999,
              background: 'var(--panel-solid)', border: `1px solid ${color}`, flexShrink: 0, display: 'inline-block' }}>
              <span style={{ position: 'absolute', inset: 2, borderRadius: 9999, background: color, display: 'block' }} />
              <span style={{ position: 'absolute', left: '100%', top: '50%', width: 14, height: 1.5,
                background: color, transform: 'translateY(-50%)', display: 'block' }} />
            </span>
            <span style={{ fontSize: 10, letterSpacing: '0.05em', color: 'rgba(var(--ink-rgb),0.7)', marginLeft: 12 }}>
              {key === 'internships' ? 'Internships' : 'Booz Allen Hamilton'}
            </span>
          </div>
        ))}

        {legendTip && lt && (
          <div className={`legend-tip legend-tip-${legendTip.key === 'internships' ? 'green' : 'purple'}`}
            style={{ position: 'absolute', left: legendTip.left, top: '100%', marginTop: 6 }}>
            <p className="lt-eyebrow">{lt.eyebrow}</p>
            <p className="lt-title">{lt.title}</p>
            <p className="lt-body">{lt.body}</p>
            <ul>{lt.list.map(x => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
      </div>

      {/* SVG wrapper */}
      <div style={{ position: 'relative', padding: '8px 4px 4px', overflow: 'visible' }}>
        <svg ref={svgRef} viewBox="0 0 1000 320" preserveAspectRatio="none"
          style={{ width: '100%', height: 320, display: 'block', overflow: 'visible' }} />
        <div ref={tipRef} className="traj-tip" />
      </div>
    </section>
  )
}

// ─── Experience Section ───────────────────────────────────────────────────────

function ExperienceSection() {
  const [activeId,   setActiveId]   = useState<string>('bah')
  const [bahFilter,  setBahFilter]  = useState<'client' | 'internal'>('client')

  const job = JOBS.find(j => j.id === activeId)!

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.55fr 1.45fr', gap: 16 }}>

      {/* Job list */}
      <section style={{ background: 'var(--panel)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 12, padding: 18 }}>
        <div style={{ marginBottom: 14 }}>
          <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.60)', margin: 0 }}>Professional Experience</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {JOBS.map(j => {
            const active = j.id === activeId
            return (
              <div key={j.id} onClick={() => { setActiveId(j.id); setBahFilter('client') }}
                style={{ position: 'relative', padding: '14px 14px 14px 28px', cursor: 'pointer',
                  borderLeft: `2px solid ${active ? GOLD : 'rgba(var(--accent-rgb),0.10)'}`,
                  background: active ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
                  transition: 'background .2s ease, border-color .2s ease' }}>
                <div style={{ position: 'absolute', left: -6, top: 22, width: 10, height: 10, borderRadius: 9999,
                  background: active ? GOLD : 'var(--panel-solid)',
                  border: `1px solid ${active ? GOLD : 'rgba(var(--accent-rgb),0.4)'}`,
                  boxShadow: active ? '0 0 10px rgba(var(--accent-rgb),0.55)' : 'none',
                  transition: 'all .2s ease' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.85)' }}>{j.title}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--accent-rgb),0.55)', flexShrink: 0 }}>{j.period}</span>
                </div>
                <p style={{ fontSize: 11, color: active ? 'rgba(var(--accent-rgb),0.85)' : 'rgba(var(--ink-rgb),0.60)', margin: '3px 0 0' }}>{j.co}</p>
                <p className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--ink-rgb),0.60)', margin: '3px 0 0' }}>{j.loc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Detail panel */}
      <section style={{ background: 'var(--panel)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 12, padding: 18, minHeight: 420, display: 'flex', flexDirection: 'column' }}>
        {job.type === 'fulltime' ? (
          <>
            <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--accent-rgb),0.55)', margin: '0 0 6px' }}>Current Role</p>
            <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2 }}>{job.title} · {job.co}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(var(--ink-rgb),0.60)' }}>{job.loc}</p>
            <p className="font-mono" style={{ marginTop: 10, fontSize: 10, color: 'rgba(var(--accent-rgb),0.65)' }}>{job.period}</p>
            <div style={{ marginTop: 16, flex: 1 }}>
              <div style={{ display: 'inline-flex', background: 'var(--panel-2)', border: '0.5px solid rgba(var(--accent-rgb),0.24)', borderRadius: 9999, padding: 3, marginBottom: 12 }}>
                {(['client', 'internal'] as const).map(f => (
                  <button key={f} onClick={() => setBahFilter(f)} className="font-mono"
                    style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase',
                      padding: '6px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                      background: bahFilter === f ? GOLD : 'transparent',
                      color: bahFilter === f ? 'var(--accent-ink)' : 'rgba(var(--accent-rgb),0.6)',
                      transition: 'all .18s ease' }}>
                    {f === 'client' ? 'Client Work' : 'Internal Work'}
                  </button>
                ))}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexDirection: 'column' }}>
                {job.bahWork[bahFilter].map((b, bi) => (
                  <li key={bi} style={{ position: 'relative', padding: '4px 0 4px 18px', fontSize: 12, lineHeight: 1.5, color: 'rgba(var(--ink-rgb),0.7)' }}>
                    <span style={{ position: 'absolute', left: 4, top: 11, width: 4, height: 4, borderRadius: 9999, background: 'rgba(var(--accent-rgb),0.7)' }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--accent-rgb),0.55)', margin: '0 0 6px' }}>Internship · Earlier Career</p>
            <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2 }}>{job.title} · {job.co}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(var(--ink-rgb),0.60)' }}>{job.loc}</p>
            <p className="font-mono" style={{ marginTop: 10, fontSize: 10, color: 'rgba(var(--accent-rgb),0.65)' }}>{job.period}</p>
            <div style={{ marginTop: 16, flex: 1 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexDirection: 'column' }}>
                {job.bullets.map((b, bi) => (
                  <li key={bi} style={{ position: 'relative', padding: '4px 0 4px 18px', fontSize: 12, lineHeight: 1.5, color: 'rgba(var(--ink-rgb),0.7)' }}>
                    <span style={{ position: 'absolute', left: 4, top: 11, width: 4, height: 4, borderRadius: 9999, background: 'rgba(var(--accent-rgb),0.7)' }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

// ─── Constellation Section ────────────────────────────────────────────────────

function buildEdges() {
  const out: { x1: number; y1: number; x2: number; y2: number; stroke: string; op: number }[] = []
  SKILLS.forEach((a, i) => {
    SKILLS.forEach((b, j) => {
      if (j <= i) return
      const d = Math.hypot(a.cx - b.cx, a.cy - b.cy)
      if (a.cat === b.cat && d < 160) out.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, stroke: SKILL_COLORS[a.cat], op: 0.18 })
      else if (d < 100)               out.push({ x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, stroke: 'rgba(var(--ink-rgb),0.5)', op: 0.032 })
    })
  })
  return out
}
const EDGES = buildEdges()

function ConstellationSection() {
  const svgRef       = useRef<SVGSVGElement>(null)
  const infoRef      = useRef<HTMLSpanElement>(null)
  const rafRef       = useRef<number>(0)

  useEffect(() => {
    if (!svgRef.current) return
    const svg = svgRef.current as SVGSVGElement
    let t = 0
    function tick() {
      t += 0.005
      const gs = svg.querySelectorAll('[data-si]')
      gs.forEach((g, i) => {
        const s = SKILLS[i]; if (!s) return
        const dx = Math.sin(t + i) * 1.2
        const dy = Math.cos(t + i * 0.7) * 1.2
        ;(g as SVGGElement).setAttribute('transform', `translate(${s.cx + dx} ${s.cy + dy})`)
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section style={{ background: 'var(--panel)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
        <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.60)', margin: 0 }}>Skills Constellation</p>
        <p className="font-mono" style={{ fontSize: 10, color: 'rgba(var(--ink-rgb),0.60)', margin: 0, height: 18 }}>
          <span ref={infoRef}>Hover a node</span>
        </p>
      </div>

      <svg ref={svgRef} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 420, cursor: 'default', display: 'block' }}>
        {EDGES.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.stroke} strokeWidth="0.5" strokeOpacity={e.op} />
        ))}
        {SKILLS.map((s, i) => (
          <g key={s.name} data-si={i} transform={`translate(${s.cx} ${s.cy})`} style={{ cursor: 'pointer' }}
            onMouseEnter={e => {
              const ch = e.currentTarget.children
              ;(ch[0] as SVGCircleElement).setAttribute('opacity', '0.16')
              ;(ch[1] as SVGCircleElement).setAttribute('fill-opacity', '0.55')
              ;(ch[2] as SVGTextElement).setAttribute('fill', 'var(--ink)')
              if (infoRef.current) infoRef.current.innerHTML = `<b style="color:${SKILL_COLORS[s.cat]}">${s.name}</b> · ${s.cat.toUpperCase()}`
            }}
            onMouseLeave={e => {
              const ch = e.currentTarget.children
              ;(ch[0] as SVGCircleElement).setAttribute('opacity', '0')
              ;(ch[1] as SVGCircleElement).setAttribute('fill-opacity', '0.25')
              ;(ch[2] as SVGTextElement).setAttribute('fill', 'rgba(var(--ink-rgb),0.60)')
              if (infoRef.current) infoRef.current.textContent = 'Hover a node'
            }}>
            <circle r={s.size + 6} fill={SKILL_COLORS[s.cat]} opacity={0} />
            <circle r={s.size / 2} fill={SKILL_COLORS[s.cat]} fillOpacity={0.25}
              stroke={SKILL_COLORS[s.cat]} strokeWidth={1} strokeOpacity={0.85} />
            <text x={0} y={s.size / 2 + 13} textAnchor="middle"
              fill="rgba(var(--ink-rgb),0.60)" fontFamily="JetBrains Mono, monospace" fontSize={9.5}>
              {s.name}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>
        {[['var(--sk-ai)', 'AI / GenAI'], ['var(--sk-data)', 'Data & Cloud'], ['var(--sk-viz)', 'Visualization'], ['var(--sk-lead)', 'Leadership'], ['var(--sk-platform)', 'AI Platforms & APIs'], ['var(--sk-auto)', 'Automation']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'rgba(var(--ink-rgb),0.60)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: c, flexShrink: 0 }} />
            {l}
          </span>
        ))}
      </div>
    </section>
  )
}

// ─── Certifications Section ───────────────────────────────────────────────────

function CertificationsSection() {
  const [activeId, setActiveId] = useState('anthropic')
  const group = CERT_GROUPS.find(g => g.id === activeId)!

  return (
    <section style={{ background: 'var(--panel)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.60)', margin: 0 }}>Certifications · 14 total</p>
        <p className="font-mono" style={{ fontSize: 9, color: 'rgba(var(--ink-rgb),0.60)', letterSpacing: '0.04em', margin: 0 }}>Filter by issuer</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {CERT_GROUPS.map(g => {
          const active = g.id === activeId
          return (
            <button key={g.id} onClick={() => setActiveId(g.id)} className="font-mono"
              style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase',
                padding: '5px 11px', borderRadius: 9999, border: '0.5px solid',
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                borderColor: active ? GOLD : 'rgba(var(--accent-rgb),0.20)',
                color: active ? 'var(--accent-ink)' : 'rgba(var(--accent-rgb),0.6)',
                background: active ? GOLD : 'transparent',
                transition: 'all .18s ease' }}>
              {g.name}
              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4,
                background: active ? 'rgba(var(--accent-ink-rgb),0.25)' : 'rgba(var(--ink-rgb),0.10)',
                color: active ? 'rgba(var(--accent-ink-rgb),0.85)' : 'rgba(var(--ink-rgb),0.60)' }}>
                {g.items.length}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ background: 'var(--panel-2)', border: '0.5px solid rgba(var(--ink-rgb),0.10)', borderRadius: 10, padding: '14px 16px', minHeight: 180 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span className="font-serif" style={{ fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{group.name}</span>
          <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(var(--accent-rgb),0.55)' }}>
            {group.items.length} {group.items.length === 1 ? 'Certification' : 'Certifications'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
          {group.items.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(var(--ink-rgb),0.07)' }}>
              <span style={{ flexShrink: 0, width: 14, height: 14, borderRadius: 9999,
                border: '0.5px solid rgba(var(--accent-rgb),0.45)', background: 'rgba(var(--accent-rgb),0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p style={{ fontSize: 11.5, lineHeight: 1.4, color: 'rgba(var(--ink-rgb),0.7)', margin: 0, flex: 1 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <ConstellationCanvas className="fixed inset-0 w-full h-full" />
      <TopNav subtitle="Architect Profile" />
      <main className="pl-5 h-screen overflow-y-auto custom-scrollbar relative z-10">
        <div style={{ padding: '88px 28px 40px', maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RevealSection><IdentitySection /></RevealSection>
          <RevealSection delay={70}><TrajectorySection /></RevealSection>
          <RevealSection delay={140}><ExperienceSection /></RevealSection>
          <RevealSection delay={210}><ConstellationSection /></RevealSection>
          <RevealSection delay={280}><CertificationsSection /></RevealSection>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Availability pulse */
        .about-pulse {
          width: 6px; height: 6px; border-radius: 9999px; background: var(--accent);
          box-shadow: 0 0 0 0 rgba(var(--accent-rgb),0.7);
          animation: about-pulse-anim 2.2s infinite;
          flex-shrink: 0; display: inline-block;
        }
        @keyframes about-pulse-anim {
          0%   { box-shadow: 0 0 0 0 rgba(var(--accent-rgb),0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(var(--accent-rgb),0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb),0); }
        }

        /* Trajectory point fade-in */
        @keyframes traj-fadein { to { opacity: 1; } }

        /* Section reveal */
        .about-reveal { opacity: 0; transform: translateY(14px); transition: opacity .55s cubic-bezier(0.16,1,0.3,1), transform .55s cubic-bezier(0.16,1,0.3,1); }
        .about-reveal.about-revealed { opacity: 1; transform: none; }

        /* Trajectory tooltip */
        .traj-tip {
          position: absolute; pointer-events: none;
          background: var(--panel-solid); border: 0.5px solid rgba(var(--accent-rgb),0.35);
          border-radius: 10px; padding: 12px 14px; min-width: 220px; max-width: 300px;
          backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(var(--ink-rgb),0.16);
          opacity: 0; visibility: hidden; z-index: 5;
        }
        .traj-tip.traj-tip-show   { opacity: 1; visibility: visible; }
        .traj-tip.traj-tip-large  { min-width: 300px; max-width: 360px; }
        .traj-tip.traj-tip-purple { border-color: rgba(var(--viz-bah-rgb),0.45); }
        .traj-tip.traj-tip-green  { border-color: rgba(var(--viz-intern-rgb),0.45); }
        .traj-tip::after {
          content: ''; position: absolute;
          width: 10px; height: 10px; background: var(--panel-solid);
          border-right: 0.5px solid rgba(var(--accent-rgb),0.35); border-bottom: 0.5px solid rgba(var(--accent-rgb),0.35);
        }
        .traj-tip.traj-tip-purple::after { border-right-color: rgba(var(--viz-bah-rgb),0.45); border-bottom-color: rgba(var(--viz-bah-rgb),0.45); }
        .traj-tip.traj-tip-green::after  { border-right-color: rgba(var(--viz-intern-rgb),0.45);  border-bottom-color: rgba(var(--viz-intern-rgb),0.45); }
        .traj-tip.pos-top::after    { left: 50%; bottom: -6px; transform: translateX(-50%) rotate(45deg); }
        .traj-tip.pos-bottom::after { left: 50%; top: -6px;    transform: translateX(-50%) rotate(225deg); }
        .traj-tip.pos-left::after   { right: -6px; top: 50%;   transform: translateY(-50%) rotate(-45deg); }
        .traj-tip.pos-right::after  { left: -6px;  top: 50%;   transform: translateY(-50%) rotate(135deg); }
        .tt-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(var(--accent-rgb),0.6); margin: 0 0 6px; }
        .traj-tip.traj-tip-purple .tt-eyebrow { color: rgba(var(--viz-bah-rgb),0.85); }
        .traj-tip.traj-tip-green  .tt-eyebrow { color: rgba(var(--viz-intern-rgb),0.90); }
        .tt-title  { font-size: 13px; font-weight: 500; color: var(--ink); margin: 0; line-height: 1.25; }
        .tt-sub    { font-size: 11px; color: rgba(var(--ink-rgb),0.60); margin: 4px 0 0; line-height: 1.4; }
        .tt-period { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(var(--accent-rgb),0.7); margin-top: 6px; }
        .traj-tip.traj-tip-purple .tt-period { color: rgba(var(--viz-bah-rgb),0.85); }
        .traj-tip.traj-tip-green  .tt-period { color: rgba(var(--viz-intern-rgb),0.90); }
        .tt-list { padding-left: 0; list-style: none; margin: 8px 0 0; }
        .tt-list li { font-size: 11px; line-height: 1.5; color: rgba(var(--ink-rgb),0.60); padding: 3px 0 3px 14px; position: relative; }
        .tt-list li::before { content: '→'; position: absolute; left: 0; color: rgba(var(--accent-rgb),0.55); font-family: 'JetBrains Mono', monospace; font-size: 9px; }

        /* Legend tooltip */
        .legend-tip { pointer-events: none; background: var(--panel-solid); border: 0.5px solid rgba(var(--accent-rgb),0.35); border-radius: 8px; padding: 10px 12px; min-width: 200px; max-width: 280px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(var(--ink-rgb),0.16); z-index: 6; }
        .legend-tip-green  { border-color: rgba(var(--viz-intern-rgb),0.5); }
        .legend-tip-purple { border-color: rgba(var(--viz-bah-rgb),0.5); }
        .lt-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 6px; color: rgba(var(--accent-rgb),0.6); }
        .legend-tip-green  .lt-eyebrow { color: rgba(var(--viz-intern-rgb),0.90); }
        .legend-tip-purple .lt-eyebrow { color: rgba(var(--viz-bah-rgb),0.85); }
        .lt-title { font-size: 12px; font-weight: 500; color: var(--ink); margin: 0 0 4px; }
        .lt-body  { font-size: 10.5px; line-height: 1.5; color: rgba(var(--ink-rgb),0.6); margin: 0; }
        .legend-tip ul { margin: 6px 0 0; padding-left: 0; list-style: none; }
        .legend-tip ul li { font-size: 10.5px; line-height: 1.5; color: rgba(var(--ink-rgb),0.6); padding: 2px 0 2px 12px; position: relative; }
        .legend-tip ul li::before { content: '·'; position: absolute; left: 4px; color: rgba(var(--accent-rgb),0.55); }
      ` }} />
    </>
  )
}
