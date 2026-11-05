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
import { EVENT_TYPES, HERO_PLACEHOLDER, HOPS, NODES, PIPELINE, SIGNALS } from '@/lib/oss-risk-data'

/** Two figures this page owns: the medallion hops and the signal bars. */
const EXTRA_CSS = `
.ossrisk .hops { display: flex; flex-direction: column; gap: 0; }
.ossrisk .hop {
  border-radius: 11px;
  padding: 12px 14px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.ossrisk .hops.go .hop { opacity: 1; transform: none; }
.ossrisk .hops.go .hop:nth-of-type(2) { transition-delay: 0.2s; }
.ossrisk .hops.go .hop:nth-of-type(3) { transition-delay: 0.4s; }
.ossrisk .hop.gold {
  background: rgba(var(--accent-rgb), 0.06);
  border-color: rgba(var(--accent-rgb), 0.3);
}
.ossrisk .hop .hh { display: flex; align-items: baseline; gap: 9px; margin-bottom: 6px; }
.ossrisk .hop .hh b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.08em;
  color: rgba(var(--ink-rgb), 0.7);
}
.ossrisk .hop.gold .hh b { color: var(--accent); }
.ossrisk .hop .hh em {
  font-style: normal;
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1.4;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  text-align: right;
  color: rgba(var(--ink-rgb), 0.36);
}
.ossrisk .hop p { font-size: 11.5px; line-height: 1.55; color: rgba(var(--ink-rgb), 0.64); text-wrap: pretty; }
.ossrisk .drop {
  height: 14px;
  margin-left: 17px;
  border-left: 1px solid rgba(var(--accent-rgb), 0.35);
}

.ossrisk .sigs { display: flex; flex-direction: column; gap: 9px; }
.ossrisk .sig {
  opacity: 0;
  transform: translateY(7px);
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.ossrisk .sig.shown { opacity: 1; transform: none; }
.ossrisk .sig .srow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}
.ossrisk .sig .snm {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: rgba(var(--ink-rgb), 0.78);
}
.ossrisk .sig .sfrom {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: right;
  color: rgba(var(--ink-rgb), 0.38);
}
.ossrisk .sig .bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(var(--ink-rgb), 0.07);
  overflow: hidden;
}
.ossrisk .sig .bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  width: 0;
  background: rgba(var(--accent-rgb), 0.55);
  transition: width 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}
.ossrisk .sig.shown .bar i { width: var(--w); }
.ossrisk .illus {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.35);
}
`

export default function OssRiskPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §4 the three medallion hops land in order.
  const { ref: hopsRef, fired: hopsGo } = useOnceInView<HTMLDivElement>(0.25)

  // §5 the seven signal bars fill.
  const { ref: sigRef, fired: sigGo } = useOnceInView<HTMLDivElement>(0.25)
  const [sigShown, setSigShown] = useState(0)
  useTimeline(sigGo, SIGNALS.map((_, i) => ({ at: 220 + i * 130, run: () => setSigShown(i + 1) })))

  return (
    <CaseStudyShell subtitle="OSS Dependency Risk Agent" pageClass="ossrisk" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Multi-Agent</Eyebrow>
        <div className="hero">
          <div>
            <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
              You find out the library is abandoned after the CVE lands
            </h1>
            <p className="lede">
              A daily pipeline that watches the health of 800+ open-source dependencies across 15 technology
              categories. GitHub Archive events flow through a multi-hop lakehouse into a seven-signal composite
              score, and a LangGraph agent writes the part a number cannot: why this repo is a risk, and what to do
              about it.
            </p>
            <Chips
              items={[
                { label: 'Multi-hop lakehouse', accent: true },
                { label: 'Seven-signal score', accent: true },
                { label: '800+ repos' },
                { label: 'Daily automated' },
              ]}
            />
          </div>
          <HeroPlaceholder
            label={HERO_PLACEHOLDER.label}
            note={HERO_PLACEHOLDER.note}
            caption="705 repos scored daily"
          />
        </div>
      </header>

      <Divider />

      {/* ── 2 What I built ──────────────────────────────────────────── */}
      <section ref={builtRef} className={reveal(builtIn)}>
        <Eyebrow>The contribution</Eyebrow>
        <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
        <TwoUp
          work="The full stack, end to end. Hourly GitHub Archive ingestion into S3, a PySpark deduplication job on serverless Databricks maintaining a 48-day rolling window, nine dbt models producing seven signal views and two Gold tables, a composite 0 to 10 health score, a five-node LangGraph agent calling Claude Sonnet for per-repo risk assessments, Pinecone indexing for semantic search over those assessments, and a FastAPI and Next.js 14 frontend with manifest-based onboarding."
          demonstrates="Every layer of the modern data stack in one system that has to run unattended every day. The part I would point at is not the breadth, it is the scoring model going through multiple data-driven revisions: the PR formula refactored from a ratio to log-scale for window stability, and the bus-factor weight zeroed after I traced an apparent signal to a 48-day data bias rather than anything about the repos."
        />
      </section>

      <Divider />

      {/* ── 3 The problem ───────────────────────────────────────────── */}
      <section ref={probRef} className={reveal(probIn)}>
        <Eyebrow>The problem</Eyebrow>
        <Heading2 className="mb-[18px] max-w-[20ch]">Supply-chain risk shows up only once it is real</Heading2>
        <p className="body">
          Every software team carries hidden exposure through the open-source libraries its products depend on. Those
          libraries are maintained by people who may abandon them, slow their review cadence, accumulate
          vulnerabilities, or concentrate all the knowledge in one contributor. Teams usually discover this after it
          materializes: a critical CVE lands, reviews stop, a widely used package quietly goes unmaintained.
        </p>
        <p className="body mb-[30px]">
          Nothing off the shelf continuously watches a whole portfolio of dependencies for deterioration across
          several signals at once. Manual audits are expensive, infrequent, and do not scale past a few dozen
          packages. Building this meant solving three separate problems: ingest enough raw event data to compute
          meaningful signals, normalize those signals into a score stable enough to compare across repos, and get
          qualitative context that a number cannot carry.
        </p>
        <ContrastPair
          before={{
            label: 'A periodic audit',
            quote:
              'Someone reads changelogs for a week, twice a year, across the dependencies they happen to remember are load bearing.',
            foot: 'Stale the day it ships',
          }}
          after={{
            label: 'A daily pipeline',
            quote:
              'Every monitored repo rescored overnight, the low scorers investigated against live GitHub state, and each one written up with an action attached.',
            foot: 'Scored daily, with reasons',
          }}
        />
      </section>

      <Divider />

      {/* ── 4 The foundation ────────────────────────────────────────── */}
      <section ref={foundRef} className={reveal(foundIn)}>
        <Eyebrow>The foundation</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[17ch]">Raw events, three hops from a score</Heading2>
        <div className="split">
          <div>
            <p className="body">
              GitHub Archive publishes hourly dumps of public GitHub activity. The ingestion job filters those to the
              monitored repos, which is the only way the volume stays tractable, and lands them compressed in a Bronze
              bucket. A separate batch process calls the GitHub REST API and the OSV vulnerability API per repo for
              the governance and security signals that event data does not carry.
            </p>
            <p className="body mb-0">
              One detail from the Silver hop worth keeping: DataFrames are materialized to temporary Delta tables
              rather than cached, because serverless Databricks compute does not support .cache(). The obvious
              approach fails quietly on serverless, and the fix is a different shape rather than a flag.
            </p>
          </div>
          <Figure name="Bronze, Silver, Gold" category="Lakehouse">
            <div ref={hopsRef} className={`hops${hopsGo ? ' go' : ''}`}>
              {HOPS.map(({ tier, where, what }, i) => (
                <div key={tier}>
                  {i > 0 && <div className="drop" />}
                  <div className={`hop${tier === 'Gold' ? ' gold' : ''}`}>
                    <div className="hh">
                      <b>{tier}</b>
                      <em>{where}</em>
                    </div>
                    <p>{what}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="tokz">
              <p className="lab">Event types ingested</p>
              <div className="tokrow">
                {EVENT_TYPES.map((event) => (
                  <span key={event} className="tok">
                    {event}
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
        <Heading2 className="mb-[22px] max-w-[19ch]">Seven signals, one number worth comparing</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Commit frequency, issue resolution rate, PR merge throughput, contributor diversity, governance signals
              and security signals combine into a weighted score from 0 to 10. Activity metrics are scaled
              logarithmically, which is what makes the score stable across a 48-day window instead of being dominated
              by whichever repo merged the most that fortnight.
            </p>
            <p className="body">
              Missing data defaults to 5.0. That choice is deliberate and it is a judgment call: a repo with
              incomplete coverage is unknown, not unhealthy, and penalizing it would mean the score measures how well
              the pipeline sees a project rather than how the project is doing.
            </p>
            <PipelineList label="End to end" rows={PIPELINE} />
          </div>
          <Figure name="Composite health score" category="0 to 10">
            <div className="sigs" ref={sigRef}>
              {SIGNALS.map(({ name, from, weightHint }, i) => (
                <div
                  key={name}
                  className={`sig${i < sigShown ? ' shown' : ''}`}
                  style={{ ['--w' as string]: `${weightHint}%`, transitionDelay: `${i * 50}ms` }}
                >
                  <div className="srow">
                    <span className="snm">{name}</span>
                    <span className="sfrom">{from}</span>
                  </div>
                  <div className="bar">
                    <i />
                  </div>
                </div>
              ))}
            </div>
            <p className="illus">
              Bar lengths here are illustrative. Missing data scores a neutral 5.0 rather than penalizing the repo.
            </p>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 6 The hard part ─────────────────────────────────────────── */}
      <section ref={hardRef} className={reveal(hardIn)}>
        <Eyebrow>The hard part</Eyebrow>
        <Heading2 className="mb-5 max-w-[19ch]">Two signals that were measuring the window</Heading2>
        <p className="body mb-[30px]">
          A composite score is only useful if the same repo scores roughly the same way next week for the same
          reasons. Two of the original signals failed that test, and both failed in the same direction: they looked
          like properties of the project and turned out to be properties of the 48-day observation window. Finding
          that out meant looking at score movement over time rather than at any single day&rsquo;s leaderboard.
        </p>
        <ProblemFixCards
          cards={[
            {
              problem:
                'PR merge throughput computed as a ratio. A repo with few open PRs swung wildly between runs, so the metric tracked how busy the window happened to be rather than how healthy the review process was.',
              fix: 'The formula was refactored from a ratio to log-scale, which is stable across the rolling window and keeps a quiet, well-maintained repo from reading as a deteriorating one.',
            },
            {
              problem:
                'Bus factor looked like the most alarming signal in the set, and it was an artifact. A 48-day window cannot distinguish a genuinely single-maintainer project from a busy one where only one person happened to commit.',
              fix: 'The bus-factor weight was zeroed rather than patched. A signal the available data cannot support should contribute nothing, not a reduced amount of noise.',
            },
          ]}
        />
        <p className="coda">
          Neither of these was visible from a single run. Both came out of watching the scores move and asking why a
          repo that had not changed was drifting, which is the kind of thing a daily pipeline makes possible and a
          twice-yearly audit structurally cannot.
        </p>
      </section>

      <Divider />

      {/* ── 7 In practice ───────────────────────────────────────────── */}
      <section ref={pracRef} className={reveal(pracIn)}>
        <Eyebrow>In practice</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">Five nodes, from flagged to filed</Heading2>
        <div className="split">
          <div>
            <p className="body">
              The agent runs Monitor, Investigate, Synthesize, Recommend, Deliver. The split matters: retrieval and
              scoring stay deterministic, Claude Sonnet is used only for the synthesis step where a judgment in
              language is the actual deliverable, and the recommendation is a mapping rather than an opinion.
            </p>
            <p className="body mb-0">Select any node to open it out.</p>
          </div>
          <CapabilityPicker items={NODES} figureName="LangGraph agent" figureCategory="Five nodes" />
        </div>
      </section>

      <Divider />

      {/* ── 8 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Ask about the build"
          body="The lakehouse hops, the scoring revisions, and the decision to zero a signal rather than keep a weakened version of it are the parts with the most reasoning behind them. The knowledge base on this site will go into any of them."
          cta="Ask about Chase"
          href="/knowledge-base"
          related={
            <>
              Related work &middot; <Link href="/projects/ai-venture-architect">AI Venture Architect</Link> &middot;
              another LangGraph system that keeps scoring out of the model
            </>
          }
        />
      </section>
    </CaseStudyShell>
  )
}
