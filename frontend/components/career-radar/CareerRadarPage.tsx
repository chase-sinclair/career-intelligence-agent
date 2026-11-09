'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import {
  CHECK_PATH,
  CapabilityPicker,
  CaseStudyShell,
  Chips,
  CloseStrip,
  ContrastPair,
  Figure,
  Glyph,
  HeroPlaceholder,
  PipelineList,
  ProblemFixCards,
  TwoUp,
  reveal,
  useOnceInView,
  useTimeline,
} from '@/components/case-study/chrome'
import {
  COMPANY_DIMENSIONS,
  HERO_PLACEHOLDER,
  PIPELINE,
  PIPELINE_META,
  VIEWS,
} from '@/lib/career-radar-data'

/** The one figure this page owns: the grounded narrative fallback. */
const EXTRA_CSS = `
.radar .ground { display: flex; flex-direction: column; gap: 0; }
/* These two layers are a sequence, not a split, so the connector is a plain
   centered drop rather than the shared .conv yoke, which reads as a branch. */
.radar .ground .drop {
  height: 16px;
  position: relative;
}
.radar .ground .drop::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(var(--accent-rgb), 0.35);
}
.radar .layer {
  border-radius: 11px;
  padding: 13px 14px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.radar .layer.truth {
  background: rgba(var(--accent-rgb), 0.06);
  border-color: rgba(var(--accent-rgb), 0.3);
}
.radar .layer .lh {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}
.radar .layer .lh b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.45);
}
.radar .layer.truth .lh b { color: var(--accent); }
.radar .layer .lh em {
  font-style: normal;
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.34);
}
.radar .layer p { font-size: 11.5px; line-height: 1.55; color: rgba(var(--ink-rgb), 0.66); text-wrap: pretty; }
.radar .fallback {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(var(--ink-rgb), 0.04);
  border: 0.5px dashed rgba(var(--ink-rgb), 0.2);
  font-size: 11px;
  line-height: 1.55;
  color: rgba(var(--ink-rgb), 0.55);
}
.radar .fallback svg { flex: none; margin-top: 2px; color: rgba(var(--ink-rgb), 0.4); }
`

export default function CareerRadarPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §4 pipeline rows land one at a time, then the delivery chip.
  const { ref: pipeRef, fired: pipeGo } = useOnceInView<HTMLDivElement>(0.25)
  const [rowsShown, setRowsShown] = useState(0)
  const [delivered, setDelivered] = useState(false)
  useTimeline(pipeGo, [
    ...PIPELINE_META.map((_, i) => ({ at: 260 + i * 380, run: () => setRowsShown(i + 1) })),
    { at: 260 + PIPELINE_META.length * 380 + 220, run: () => setDelivered(true) },
  ])

  return (
    <CaseStudyShell subtitle="Career Radar · Labor Market Intelligence" pageClass="radar" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Full-Stack AI</Eyebrow>
        <div className="hero">
          <div>
            <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
              Job postings are evidence. The intelligence has to be built.
            </h1>
            <p className="lede">
              A labor market intelligence product built on roughly a thousand real postings: collected through an n8n
              pipeline, normalized and enriched in Supabase, and read through seven purpose-built views. The AI layer
              explains the numbers. It is never allowed to be the source of them.
            </p>
            <Chips
              items={[
                { label: 'Full data product', accent: true },
                { label: 'Grounded AI layer', accent: true },
                { label: '~1,000 postings' },
                { label: 'Seven views' },
              ]}
            />
          </div>
          <HeroPlaceholder
            label={HERO_PLACEHOLDER.label}
            note={HERO_PLACEHOLDER.note}
            caption="Seven views over normalized evidence"
          />
        </div>
      </header>

      <Divider />

      {/* ── 2 What I built ──────────────────────────────────────────── */}
      <section ref={builtRef} className={reveal(builtIn)}>
        <Eyebrow>The contribution</Eyebrow>
        <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
        <TwoUp
          work="The whole stack: an n8n orchestration pipeline that collects listings, deduplicates them, classifies roles by family and extracts tools and skills; a Supabase layer doing canonical record management, enrichment versioning, company dictionary mapping and role family normalization; a constrained OpenAI narrative layer; and seven purpose-built Next.js views reading app-facing Supabase views through typed contracts."
          demonstrates="This is a data product rather than a frontend with an API call in it. Ingestion, transformation, enrichment, analysis and presentation are separate layers that can each be wrong in their own way. The decision I would defend hardest is the smallest one: OpenAI interprets the data and never produces it, so every count, ranking and company name on screen traces to a row."
        />
      </section>

      <Divider />

      {/* ── 3 The problem ───────────────────────────────────────────── */}
      <section ref={probRef} className={reveal(probIn)}>
        <Eyebrow>The problem</Eyebrow>
        <Heading2 className="mb-[18px] max-w-[20ch]">A search box is not a view of the market</Heading2>
        <p className="body">
          Job postings carry real signal about how work is changing: which skills are rising, which segments are
          hiring, how traditional roles are being reshaped as AI and automation spread. That signal is scattered across
          job boards, career sites and recruiter listings with no analytical layer on top of it.
        </p>
        <p className="body mb-[30px]">
          The goal was never to collect listings. It was to answer the questions that matter for reading where the
          market is going, and those questions do not survive a keyword search. Asking which AI operations roles are
          growing fastest this quarter requires ingestion, normalization, classification, enrichment and analysis. Job
          boards surface listings. They do not surface patterns.
        </p>
        <ContrastPair
          before={{
            label: 'A job board',
            quote:
              'Nine hundred results for one query, the same posting listed four times by three agencies, and no way to ask what any of it adds up to.',
            foot: 'Listings, not patterns',
          }}
          after={{
            label: 'A data product',
            quote:
              'Deduplicated canonical records, classified by role family, enriched with extracted tools, and read through views built for the question.',
            foot: 'Counted, normalized, traceable',
          }}
        />
      </section>

      <Divider />

      {/* ── 4 The foundation ────────────────────────────────────────── */}
      <section ref={foundRef} className={reveal(foundIn)}>
        <Eyebrow>The foundation</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">Supabase as a transformation layer, not a table</Heading2>
        <div className="split" ref={pipeRef}>
          <div>
            <p className="body">
              The n8n workflow collects listings, structures the raw data, deduplicates, classifies each role by
              family, extracts tools and skills, and delivers cleaned records into Supabase with enrichment metadata.
              That is the part people picture when they hear pipeline.
            </p>
            <p className="body mb-0">
              The part that matters more is what Supabase does after. Deduplication logic, canonical job records,
              enrichment versioning, company dictionary mapping, URL quality metadata and role family normalization
              all live there, behind app-facing views. The frontend reads one consistent shape and never has to know
              how messy the thing underneath it was.
            </p>
          </div>
          <Figure name="One posting, normalized" category="Pipeline">
            <div className="meta">
              {PIPELINE_META.map(([field, value], i) => (
                <div key={field} className={`mrow${i < rowsShown ? ' shown' : ''}`}>
                  <b>{field}</b>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <span className={`idxchip${delivered ? ' shown' : ''}`}>
              <Glyph d={CHECK_PATH} size={11} />
              Delivered into Supabase with metadata
            </span>
            <div className="tokz">
              <p className="lab">One company field, four dimensions</p>
              <div className="tokrow">
                {COMPANY_DIMENSIONS.map((dimension) => (
                  <span key={dimension} className="tok">
                    {dimension}
                  </span>
                ))}
              </div>
            </div>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 5 The system ────────────────────────────────────────────── */}
      <section ref={sysRef} className={reveal(sysIn)}>
        <Eyebrow>The system</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[19ch]">The AI layer explains. It does not count.</Heading2>
        <div className="split">
          <div>
            <p className="body">
              OpenAI sits over the data as an interpretation layer. Server-side routes call it with deterministic
              results already in hand and ask it to explain what they show. Every count, every ranking and every
              company reference on screen comes from the structured layer underneath, not from the model.
            </p>
            <p className="body">
              Which means the narrative is optional. If the AI layer is unavailable, returns invalid output, or simply
              fails, the app falls back to deterministic text and the numbers are unchanged. An AI feature that can be
              switched off without the product losing correctness is one you can actually ship.
            </p>
            <PipelineList label="End to end" rows={PIPELINE} />
          </div>
          <Figure name="Two layers" category="Grounding">
            <div className="ground">
              <div className="layer truth">
                <div className="lh">
                  <b>Structured data</b>
                  <em>Source of truth</em>
                </div>
                <p>Counts, rankings, company references and role families, computed from Supabase views.</p>
              </div>
              <div className="drop" />
              <div className="layer">
                <div className="lh">
                  <b>OpenAI narrative</b>
                  <em>Interpretation</em>
                </div>
                <p>Reads the deterministic result as context and explains what it shows. Writes no numbers.</p>
              </div>
            </div>
            <p className="fallback">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              If the narrative layer fails or returns invalid output, the view falls back to deterministic text. The
              figures on screen do not change.
            </p>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 6 The hard part ─────────────────────────────────────────── */}
      <section ref={hardRef} className={reveal(hardIn)}>
        <Eyebrow>The hard part</Eyebrow>
        <Heading2 className="mb-5 max-w-[18ch]">Real job data is worse than you plan for</Heading2>
        <p className="body mb-[30px]">
          The pipeline was designed around clean postings and met agency listings with no real company name,
          inconsistent URLs, duplicate posts across sources, and role classifications that collapsed the moment a
          keyword appeared in the wrong sentence. Most of the engineering after the first working version went into
          the gap between what a posting is supposed to look like and what arrives.
        </p>
        <ProblemFixCards
          cards={[
            {
              problem:
                'The company on a listing is frequently not the company hiring. Staffing agencies post on behalf of clients, names appear in several spellings, and counting them naively produces a leaderboard of recruiters.',
              fix: 'The company field is split into four dimensions, listing, hiring, canonical and company type, with a dictionary mapping behind them, so a count can be asked about whichever one the question actually means.',
            },
            {
              problem:
                'Weak keyword matches over-including roles. A posting that mentions a tool in passing was being pulled into a role family it does not belong to, which quietly inflates exactly the trend the product exists to report.',
              fix: 'Role family filtering tightened so classification does not rest on a single incidental keyword, and scope constrained to the segments where the signal is strong rather than chasing breadth.',
            },
          ]}
        />
        <p className="coda">
          Scope is a data quality decision here, not a product one. Coverage is deliberately held to roles tied to AI
          adoption, workflow automation, business systems, RevOps, finance transformation, data analytics, AI
          governance and software engineering. A narrower product with signal worth reading beats a broad one whose
          numbers nobody should act on.
        </p>
      </section>

      <Divider />

      {/* ── 7 In practice ───────────────────────────────────────────── */}
      <section ref={pracRef} className={reveal(pracIn)}>
        <Eyebrow>In practice</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">Seven views, each built for one question</Heading2>
        <div className="split">
          <div>
            <p className="body">
              The views are not tabs over the same table. Each one answers a different question about the market, and
              Methodology ships alongside them so the limits of the data are part of the product rather than something
              a reader has to infer.
            </p>
            <p className="body mb-0">Select any view to open it out.</p>
          </div>
          <CapabilityPicker items={VIEWS} figureName="Dashboard views" figureCategory="Seven" />
        </div>
      </section>

      <Divider />

      {/* ── 8 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Ask about the build"
          body="The n8n pipeline, the Supabase modeling, and the rule that keeps OpenAI out of the numbers are the parts with the most thinking behind them. The knowledge base on this site will go into any of them."
          cta="Ask about Chase"
          href="/knowledge-base"
          related={
            <>
              Related work &middot; <Link href="/projects/rentalshield-nyc">RentalShield NYC</Link> &middot; another
              product built on data that arrives messy
            </>
          }
        />
      </section>
    </CaseStudyShell>
  )
}
