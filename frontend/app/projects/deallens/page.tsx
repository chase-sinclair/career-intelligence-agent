'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useInView } from '@/hooks/useInView'

// ── Types ─────────────────────────────────────────────────────────────────────

interface HotspotData {
  x: string
  y: string
  tip?: 'left' | 'right'
  title: string
  bullets: string[]
}

// ── Hotspot data ──────────────────────────────────────────────────────────────

const WORKFLOW_HOTSPOTS: HotspotData[] = [
  { x: '6.8%', y: '48%', tip: 'left', title: 'Google Drive intake',
    bullets: ['Watches the CIM Intake folder.', 'Captures file name, Drive ID, upload time, and source link.', 'Starts the automation without manual handoff.'] },
  { x: '17.2%', y: '61%', title: 'PDF.co extraction',
    bullets: ['Converts PDF pages into machine-readable text.', 'Preserves document structure for downstream parsing.', 'Creates the raw material for OpenAI extraction.'] },
  { x: '29%', y: '54%', title: 'Preprocessing',
    bullets: ['Cleans and flattens extracted text.', 'Normalizes inconsistent PDF output.', 'Packages the content for the OpenAI step.'] },
  { x: '40%', y: '58%', title: 'AI structuring',
    bullets: ['Uses OpenAI to extract deal facts, financials, risks, scoring, and memo content.', 'Returns structured JSON rather than free-form prose.', 'Keeps later Airtable steps predictable.'] },
  { x: '65%', y: '36%', title: 'Create Deal record',
    bullets: ['Writes the primary company profile to Airtable.', 'Stores revenue, EBITDA, fit score, status, next step, and source links.', 'Becomes the parent record for linked tables.'] },
  { x: '65.4%', y: '45%', title: 'Create Financial Metrics',
    bullets: ['Creates the FY2025 metric row.', 'Normalizes percentage fields and fiscal period values.', 'Links the metrics back to the Deal record.'] },
  { x: '65.3%', y: '54%', title: 'Create Risk records',
    bullets: ['Loops through AI-generated risks.', 'Stores category, severity, evidence rationale, owner, and follow-up status.', 'Keeps risk review tied to the deal.'] },
  { x: '64.8%', y: '63%', title: 'Create related review records',
    bullets: ['Creates workflow log rows and related review records.', 'Captures generated diligence/workflow artifacts.', 'Preserves an audit trail of what the automation produced.'] },
  { x: '72%', y: '54%', title: 'Slack alert',
    bullets: ['Posts a summary to the analyst channel.', 'Includes company, sector, revenue, EBITDA, fit score, risks, and CIM source link.', 'Makes the new intake visible immediately.'] },
  { x: '81.5%', y: '56%', title: 'Memo generation',
    bullets: ['Uses Google Docs template fields.', 'Generates a first-pass IC memo from structured output.', 'Produces an analyst support artifact for human review.'] },
  { x: '96.5%', y: '37%', tip: 'right', title: 'Memo link write-back',
    bullets: ['Updates the original Deal record with the generated memo URL.', 'Keeps the review workspace complete.', 'Avoids hunting through Drive for the memo.'] },
  { x: '97%', y: '48%', tip: 'right', title: 'Looping by Zapier',
    bullets: ['Iterates through generated line items.', 'Supports variable counts of criteria, risks, or other related records.', 'Prevents hardcoding a fixed number of rows.'] },
  { x: '96.5%', y: '62%', tip: 'right', title: 'Investment criteria rows',
    bullets: ['Creates weighted scoring rows in Airtable.', 'Links criteria back to the Deal record.', 'Makes the recommendation more explainable.'] },
]

const TABLE_HOTSPOTS: HotspotData[] = [
  { x: '3%', y: '22%', tip: 'left', title: 'CIM Documents',
    bullets: ['Source document control table.', 'Tracks file link, upload time, extraction status, tool, page count, and raw-text availability.', 'Gives the team confidence the source PDF was processed successfully.'] },
  { x: '3%', y: '47%', tip: 'left', title: 'Financial Metrics',
    bullets: ['Stores normalized period-level financials.', 'Captures revenue, EBITDA, growth, margins, and screening notes.', 'Keeps calculations separate from the company profile while linked to the deal.'] },
  { x: '3%', y: '69%', tip: 'left', title: 'Risks',
    bullets: ['Converts CIM risk language into reviewable records.', 'Includes risk category, severity, evidence/rationale, owner, and follow-up flag.', 'Helps analysts triage what needs validation before IC discussion.'] },
  { x: '51%', y: '10%', title: 'Central Deal record',
    bullets: ['The parent object for the review workspace.', 'Stores company profile, revenue, EBITDA, fit score, recommended next step, deal status, CIM link, and memo link.', 'All related tables link back to this record.'] },
  { x: '69%', y: '24%', title: 'Diligence Questions',
    bullets: ['AI-assisted follow-up queue for analysts.', 'Tracks question, category, priority, owner, status, and source rationale.', 'Converts missing information and risk areas into actionable diligence work.'] },
  { x: '69%', y: '46%', title: 'Workflow Runs',
    bullets: ['Operational log for automation health.', 'Tracks extraction status, OpenAI status, Airtable write status, memo generation, Slack notification, records created, and estimated time saved.', 'Makes the pipeline observable instead of invisible.'] },
  { x: '69%', y: '69%', title: 'Investment Criteria',
    bullets: ['Creates a weighted scoring model for initial review.', 'Stores criterion, description, weight, threshold, score, and scoring notes.', 'Explains why a deal is proceed, request more information, or pass.'] },
  { x: '50.5%', y: '85%', title: 'Linked workspace output',
    bullets: ['Shows the full review package assembled around one deal.', 'Linked records, financial metrics, risks, diligence queue, workflow logs, investment criteria, and memo link live together.', 'This is the final operating surface, not just extracted text.'] },
]

const GALLERY_IMAGES = [
  '/images/deallens/gallery/gallery-01.png',
  '/images/deallens/gallery/gallery-02.png',
  '/images/deallens/gallery/gallery-03.jpeg',
  '/images/deallens/gallery/gallery-04.jpeg',
  '/images/deallens/gallery/gallery-05.jpeg',
  '/images/deallens/gallery/gallery-06.jpeg',
  '/images/deallens/gallery/gallery-07.jpeg',
  '/images/deallens/gallery/gallery-08.jpeg',
  '/images/deallens/gallery/gallery-09.jpeg',
  '/images/deallens/gallery/gallery-10.jpeg',
  '/images/deallens/gallery/gallery-11.jpeg',
  '/images/deallens/gallery/gallery-12.jpeg',
  '/images/deallens/gallery/gallery-13.jpeg',
  '/images/deallens/gallery/gallery-14.jpeg',
]

// ── Sub-components ────────────────────────────────────────────────────────────

function Hotspot({ x, y, tip, title, bullets }: HotspotData) {
  const [hovered, setHovered] = useState(false)

  const tooltipPos: React.CSSProperties =
    tip === 'left'
      ? { left: '26px', top: '50%', transform: 'translateY(-50%)' }
      : tip === 'right'
      ? { right: '26px', top: '50%', transform: 'translateY(-50%)' }
      : { bottom: '26px', left: '50%', transform: 'translateX(-50%)' }

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 17, height: 17, borderRadius: '50%',
        border: '1.5px solid rgba(243,200,97,0.75)',
        background: 'rgba(243,200,97,0.12)',
        animation: 'pulseDot 2.2s ease-out infinite',
        cursor: 'default',
      }} />
      {hovered && (
        <div style={{
          position: 'absolute',
          ...tooltipPos,
          width: 224,
          background: 'rgba(10,10,12,0.97)',
          border: '0.5px solid rgba(243,200,97,0.22)',
          borderRadius: 8,
          padding: '10px 12px',
          zIndex: 30,
          pointerEvents: 'none',
          whiteSpace: 'normal',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(243,200,97,0.85)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, marginTop: 0 }}>
            {title}
          </p>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, marginBottom: i < bullets.length - 1 ? 5 : 0 }}>
              <span style={{ color: '#C4A882', flexShrink: 0, fontSize: 10, marginTop: 1 }}>·</span>
              <p style={{ fontSize: 10, lineHeight: 1.55, color: 'rgba(226,223,208,0.58)', margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(196,168,130,0.6)', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: 16, marginTop: 0 }}>
      {children}
    </p>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C4A882', flexShrink: 0, marginTop: 7 }} />
          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(226,223,208,0.55)', margin: 0 }}>{item}</p>
        </div>
      ))}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
}

function SectionImg({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', display: 'block', borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}
    />
  )
}

function HotspotCanvas({ src, alt, hotspots }: { src: string; alt: string; hotspots: HotspotData[] }) {
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 48px rgba(0,0,0,0.5)' }}>
      <img src={src} alt={alt} style={{ width: '100%', display: 'block' }} />
      {hotspots.map((h, i) => <Hotspot key={i} {...h} />)}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DealLensPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [activeGallery, setActiveGallery] = useState(0)

  const { ref: s1Ref, inView: s1In } = useInView({ threshold: 0.1 })
  const { ref: s2Ref, inView: s2In } = useInView({ threshold: 0.08 })
  const { ref: s3Ref, inView: s3In } = useInView({ threshold: 0.05 })
  const { ref: s4Ref, inView: s4In } = useInView({ threshold: 0.05 })
  const { ref: s5Ref, inView: s5In } = useInView({ threshold: 0.05 })
  const { ref: s6Ref, inView: s6In } = useInView({ threshold: 0.05 })
  const { ref: s7Ref, inView: s7In } = useInView({ threshold: 0.08 })
  const { ref: s8Ref, inView: s8In } = useInView({ threshold: 0.08 })
  const { ref: gallRef, inView: gallIn } = useInView({ threshold: 0.03 })
  const { ref: ctaRef, inView: ctaIn } = useInView({ threshold: 0.1 })

  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    if (max > 0) setScrollProgress(el.scrollTop / max)
    if (el.scrollTop > 80) setShowScrollHint(false)
  }

  const gallLen = GALLERY_IMAGES.length

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="custom-scrollbar"
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#121315', overflowY: 'auto' }}
    >
      <style>{`
        @keyframes pulseDot {
          0%   { box-shadow: 0 0 0 0 rgba(243,200,97,0.42), 0 0 18px rgba(243,200,97,0.5); }
          70%  { box-shadow: 0 0 0 15px rgba(243,200,97,0), 0 0 18px rgba(243,200,97,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(243,200,97,0), 0 0 18px rgba(243,200,97,0.5); }
        }
      `}</style>

      {/* Progress bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%',
          width: `${scrollProgress * 100}%`,
          background: 'linear-gradient(to right, #C4A882, #f0c96a)',
          transition: 'width 80ms linear',
        }} />
      </div>

      {/* Back nav */}
      <div style={{
        position: 'sticky', top: 3, zIndex: 19, height: 56,
        background: 'rgba(8,8,8,0.93)', backdropFilter: 'blur(16px)',
        borderBottom: '0.5px solid rgba(226,223,208,0.07)',
        display: 'flex', alignItems: 'center',
        paddingLeft: 40, paddingRight: 40,
      }}>
        <button
          onClick={() => router.push('/projects')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'rgba(226,223,208,0.5)', fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em',
            cursor: 'pointer', background: 'none', border: 'none', padding: 0,
            transition: 'color 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(226,223,208,0.9)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(226,223,208,0.5)' }}
        >
          ← Back to Projects
        </button>
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(196,168,130,0.4)', textTransform: 'uppercase', letterSpacing: '0.16em',
        }}>
          DealLens — PE CIM Intelligence Workflow
        </span>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 120px' }}>

        {/* §1 Problem */}
        <div ref={s1Ref} style={{ padding: '96px 0 80px', display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            className={`transition-all duration-700 ease-out ${s1In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ flex: '1 1 420px', maxWidth: 520 }}
          >
            <Eyebrow>Step 0 — Manual review problem</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              Private equity CIM review starts with unstructured documents and scattered work.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              Every new CIM creates the same manual assembly process: read the PDF, extract key metrics, flag risks, draft diligence questions, write an IC memo, and alert the team — all by hand, all from scratch, with no persistent structured output.
            </p>
            <BulletList items={[
              'Input: one PDF with useful information buried across many pages.',
              'Manual outputs: metrics, notes, risks, questions, memo drafts, and team updates.',
              'Core issue: every new CIM creates another manual assembly process.',
            ]} />
            <p style={{
              marginTop: 32, marginBottom: 0,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              color: 'rgba(196,168,130,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase',
              transition: 'opacity 600ms ease',
              opacity: showScrollHint ? 1 : 0,
            }}>
              Scroll to follow the CIM ↓
            </p>
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s1In ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ flex: '1 1 320px', transitionDelay: s1In ? '150ms' : '0ms' }}
          >
            <SectionImg src="/images/deallens/01-manual-cim-review.png" alt="Manual CIM review" />
          </div>
        </div>

        <Divider />

        {/* §2 CIM Intake */}
        <div ref={s2Ref} style={{ padding: '80px 0', display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            className={`transition-all duration-700 ease-out ${s2In ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            style={{ flex: '1 1 320px' }}
          >
            <SectionImg src="/images/deallens/02-northstar-cim-intake.png" alt="Northstar CIM intake in Google Drive" />
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s2In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ flex: '1 1 420px', maxWidth: 520, transitionDelay: s2In ? '150ms' : '0ms' }}
          >
            <Eyebrow>Step 1 — Google Drive intake trigger</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              The workflow begins when a CIM PDF lands in the intake folder.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              The pipeline activates automatically when a PDF is uploaded to the designated Google Drive CIM Intake folder. No manual steps, no per-deal configuration — the file drop is the only trigger.
            </p>
            <BulletList items={[
              'Google Drive watches the CIM Intake folder. Any new PDF starts the pipeline automatically.',
              'PDF.co extracts the full document text, preserving structure across pages.',
              'Extracted text is packaged and sent to OpenAI with a structured JSON extraction prompt.',
            ]} />
          </div>
        </div>

        <Divider />

        {/* §3 Workflow Automation */}
        <div ref={s3Ref} style={{ padding: '80px 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${s3In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 700, marginBottom: 40 }}
          >
            <Eyebrow>Step 2 — Zapier orchestration layer</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              A single Zapier workflow orchestrates the entire intake pipeline.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              Thirteen discrete steps — from PDF text extraction through structured AI analysis to Airtable record creation, Slack alerting, and IC memo generation — run in sequence with no manual intervention. Hover the pulsing dots to inspect each step.
            </p>
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s3In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: s3In ? '200ms' : '0ms' }}
          >
            <HotspotCanvas
              src="/images/deallens/03-workflow-automation.png"
              alt="Zapier workflow automation diagram"
              hotspots={WORKFLOW_HOTSPOTS}
            />
          </div>
        </div>

        <Divider />

        {/* §4 Airtable Data Model */}
        <div ref={s4Ref} style={{ padding: '80px 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${s4In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 700, marginBottom: 40 }}
          >
            <Eyebrow>Step 3 — Airtable data model</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              The CIM becomes a connected deal record instead of a static file.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              Every ingested CIM becomes a parent Deal record with seven linked tables — financial metrics, risks, diligence questions, workflow logs, investment criteria, source documents, and memo references — forming a queryable deal operating system. Hover the pulsing dots to explore the table structure.
            </p>
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s4In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: s4In ? '200ms' : '0ms' }}
          >
            <HotspotCanvas
              src="/images/deallens/04-airtable-workspace.png"
              alt="Airtable data model workspace"
              hotspots={TABLE_HOTSPOTS}
            />
          </div>
        </div>

        <Divider />

        {/* §5 Executive Dashboard */}
        <div ref={s5Ref} style={{ padding: '80px 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${s5In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 700, marginBottom: 40 }}
          >
            <Eyebrow>Step 4 — Executive dashboard</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              Airtable turns processed CIMs into a portfolio-level triage view.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              The Executive Dashboard aggregates all processed deals into a single triage view — fit scores, revenue, EBITDA, recommended next steps, and risk counts across every deal in the pipeline.
            </p>
            <BulletList items={[
              'Deal pipeline at a glance — company, sector, fit score, and recommended next step for every processed CIM.',
              'Financial metrics visible at the portfolio level without opening individual deal records.',
              'Workflow run status confirms which automations ran successfully and how much time each saved.',
            ]} />
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s5In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: s5In ? '200ms' : '0ms' }}
          >
            <SectionImg src="/images/deallens/05-executive-dashboard.png" alt="Executive dashboard" />
          </div>
        </div>

        <Divider />

        {/* §6 Deal Review Workspace */}
        <div ref={s6Ref} style={{ padding: '80px 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${s6In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 700, marginBottom: 40 }}
          >
            <Eyebrow>Step 5 — Single-deal review workspace</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              Each CIM becomes a linked review workspace for analyst and IC prep.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              Each deal has a structured Airtable interface with linked financial metrics, risks, diligence questions, workflow logs, and investment criteria visible in one place — analyst-ready without any manual assembly.
            </p>
            <BulletList items={[
              'Full deal profile: company name, sector, revenue, EBITDA, fit score, status, and source CIM link.',
              'Linked diligence question queue, risk register, and investment criteria scoring — all generated automatically.',
              'IC memo link in the Deal record — one click from the review workspace to the draft in Google Docs.',
            ]} />
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s6In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: s6In ? '200ms' : '0ms' }}
          >
            <SectionImg src="/images/deallens/06-deal-review.png" alt="Deal review workspace" />
          </div>
        </div>

        <Divider />

        {/* §7 Slack + Memo */}
        <div ref={s7Ref} style={{ padding: '80px 0', display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            className={`transition-all duration-700 ease-out ${s7In ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            style={{ flex: '1 1 320px', position: 'relative' }}
          >
            <SectionImg src="/images/deallens/07-slack-memo-generation.png" alt="Slack alert and memo generation" />
            {[
              { text: 'Slack alert: company, sector, revenue, EBITDA, fit score, risks, and source link.', style: { top: 14, left: 14 } },
              { text: 'Generated Memos folder: first-pass IC memo created and stored in Drive.', style: { top: 14, left: '50%', transform: 'translateX(-50%)' } },
              { text: 'IC memo: executive summary, key metrics, highlights, risks, and diligence priorities.', style: { top: 14, right: 14 } },
            ].map((ann, i) => (
              <div key={i} style={{
                position: 'absolute',
                ...ann.style,
                background: 'rgba(8,8,8,0.9)',
                border: '0.5px solid rgba(243,200,97,0.2)',
                borderRadius: 6,
                padding: '5px 9px',
                maxWidth: 170,
                pointerEvents: 'none',
              }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(226,223,208,0.6)', lineHeight: 1.5, margin: 0 }}>{ann.text}</p>
              </div>
            ))}
          </div>
          <div
            className={`transition-all duration-700 ease-out ${s7In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ flex: '1 1 420px', maxWidth: 520, transitionDelay: s7In ? '150ms' : '0ms' }}
          >
            <Eyebrow>Step 6 — Analyst alert and memo generation</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              DealLens pushes the review package into Slack and Google Docs.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', marginBottom: 14, marginTop: 0 }}>
              The moment a CIM is processed, DealLens posts a formatted Slack alert to the analyst channel and generates a first-pass IC memo in Google Docs. Both happen automatically as the final steps of the Zap 1 pipeline — the team is notified before they&apos;ve had a chance to check Drive.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              The memo link is then written back to the Airtable Deal record, making the full review package — structured data, risk flags, diligence questions, and draft memo — accessible from a single record.
            </p>
          </div>
        </div>

        <Divider />

        {/* §8 Final Impact */}
        <div ref={s8Ref} style={{ padding: '80px 0' }}>
          <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <div
              className={`transition-all duration-700 ease-out ${s8In ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              style={{ flex: '1 1 320px' }}
            >
              <SectionImg src="/images/deallens/08-final-impact.jpg" alt="Final impact — full deal workspace" />
            </div>
            <div
              className={`transition-all duration-700 ease-out ${s8In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ flex: '1 1 420px', maxWidth: 520, transitionDelay: s8In ? '150ms' : '0ms' }}
            >
              <Eyebrow>Step 7 — End-to-end review package</Eyebrow>
              <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
                DealLens converts a CIM upload into a review-ready PE deal workspace.
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
                A CIM upload triggers a fully automated pipeline that produces a structured deal record, risk flags, diligence questions, investment criteria scoring, a Slack alert, and a first-pass IC memo — all without manual analyst input.
              </p>
              <BulletList items={[
                'From PDF upload to structured Airtable record to Slack alert to IC memo in minutes — the full first-pass review package.',
                'Three validation CIMs (Northstar Field Services, MedAxis Revenue Solutions, BrightCart Consumer Goods) confirmed the pipeline generalizes across deal types.',
                'Several hours of analyst first-pass work replaced by a fully automated workflow running in minutes.',
              ]} />
            </div>
          </div>

          {/* Closing strip */}
          <div
            className={`transition-all duration-700 ease-out ${s8In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 24px',
              background: 'rgba(226,223,208,0.03)',
              border: '0.5px solid rgba(226,223,208,0.07)',
              borderRadius: 8,
              transitionDelay: s8In ? '300ms' : '0ms',
            }}
          >
            {['AI-assisted first-pass analyst support', 'Human review required', 'Built by Chase Sinclair'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {i > 0 && (
                  <div style={{ width: 1, height: 26, background: 'rgba(226,223,208,0.08)', marginRight: 24, flexShrink: 0 }} />
                )}
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  color: i === 2 ? 'rgba(196,168,130,0.5)' : 'rgba(226,223,208,0.28)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  margin: 0,
                }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* §9 Gallery */}
        <div ref={gallRef} style={{ padding: '80px 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${gallIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 680, marginBottom: 40 }}
          >
            <Eyebrow>Project gallery</Eyebrow>
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 16, marginTop: 0 }}>
              Screenshot evidence from the working DealLens build.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', margin: 0 }}>
              Working screenshots from the Zapier orchestration layer, Airtable deal operating system, Slack alert, and IC memo output.
            </p>
          </div>

          {/* Large display */}
          <div
            className={`transition-all duration-700 ease-out ${gallIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              marginBottom: 10,
              borderRadius: 12,
              overflow: 'hidden',
              border: '0.5px solid rgba(255,255,255,0.07)',
              background: 'rgba(10,10,12,0.6)',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transitionDelay: gallIn ? '120ms' : '0ms',
            }}
          >
            <img
              src={GALLERY_IMAGES[activeGallery]}
              alt={`Gallery image ${activeGallery + 1}`}
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain' }}
            />
          </div>

          {/* Thumbnail strip */}
          <div
            className={`transition-all duration-700 ease-out ${gallIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ display: 'flex', gap: 8, alignItems: 'center', transitionDelay: gallIn ? '240ms' : '0ms' }}
          >
            <button
              onClick={() => setActiveGallery(i => (i - 1 + gallLen) % gallLen)}
              style={{
                width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                background: 'rgba(226,223,208,0.05)', border: '0.5px solid rgba(226,223,208,0.1)',
                color: 'rgba(226,223,208,0.5)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.1)'; e.currentTarget.style.color = 'rgba(226,223,208,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.05)'; e.currentTarget.style.color = 'rgba(226,223,208,0.5)' }}
            >
              ‹
            </button>

            <div style={{ flex: 1, display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {GALLERY_IMAGES.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveGallery(i)}
                  style={{
                    flexShrink: 0, width: 80, height: 52,
                    borderRadius: 6, overflow: 'hidden', padding: 0,
                    border: i === activeGallery ? '1.5px solid #C4A882' : '0.5px solid rgba(226,223,208,0.08)',
                    cursor: 'pointer', background: 'rgba(10,10,12,0.6)',
                    opacity: i === activeGallery ? 1 : 0.5,
                    transition: 'border-color 150ms, opacity 150ms',
                  }}
                  onMouseEnter={e => { if (i !== activeGallery) e.currentTarget.style.opacity = '0.8' }}
                  onMouseLeave={e => { if (i !== activeGallery) e.currentTarget.style.opacity = '0.5' }}
                >
                  <img src={src} alt={`Thumbnail ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveGallery(i => (i + 1) % gallLen)}
              style={{
                width: 32, height: 32, borderRadius: 6, flexShrink: 0,
                background: 'rgba(226,223,208,0.05)', border: '0.5px solid rgba(226,223,208,0.1)',
                color: 'rgba(226,223,208,0.5)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.1)'; e.currentTarget.style.color = 'rgba(226,223,208,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.05)'; e.currentTarget.style.color = 'rgba(226,223,208,0.5)' }}
            >
              ›
            </button>
          </div>
        </div>

        <Divider />

        {/* §10 CTA */}
        <div ref={ctaRef} style={{ padding: '80px 0 0' }}>
          <div
            className={`transition-all duration-700 ease-out ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ maxWidth: 620 }}
          >
            <h2 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#E2DFD0', marginBottom: 20, marginTop: 0 }}>
              Built to practice real workflow automation on messy, technical documents.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', marginBottom: 14, marginTop: 0 }}>
              DealLens was built as a portfolio project to demonstrate AI workflow automation on a real, domain-grounded business process. The project uses no custom code for the orchestration layer — only Zapier, OpenAI, and Airtable — to show what&apos;s possible with composable no-code tools applied to a genuinely complex workflow.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(226,223,208,0.45)', marginBottom: 36, marginTop: 0 }}>
              The three-Zap separation of concerns, the structured JSON extraction schema, and the Airtable interface design were all deliberate architectural choices. The synthetic validation dataset confirms the pipeline generalizes across deal types without hardcoded logic.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/chase-sinclair/DealLens"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 8,
                  background: 'rgba(196,168,130,0.1)',
                  border: '0.5px solid rgba(196,168,130,0.35)',
                  color: 'rgba(196,168,130,0.9)', fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace',
                  textDecoration: 'none', transition: 'background 200ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,168,130,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(196,168,130,0.1)' }}
              >
                View on GitHub ↗
              </a>
              <button
                onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '10px 20px', borderRadius: 8,
                  background: 'rgba(226,223,208,0.04)',
                  border: '0.5px solid rgba(226,223,208,0.12)',
                  color: 'rgba(226,223,208,0.5)', fontSize: 12,
                  fontFamily: 'JetBrains Mono, monospace',
                  cursor: 'pointer', transition: 'all 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.08)'; e.currentTarget.style.color = 'rgba(226,223,208,0.8)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,223,208,0.04)'; e.currentTarget.style.color = 'rgba(226,223,208,0.5)' }}
              >
                Replay the workflow ↑
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
