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
  CAPABILITIES,
  GATE_META,
  HERO_PLACEHOLDER,
  PARALLEL_AGENTS,
  PIPELINE,
  SCORES,
} from '@/lib/venture-architect-data'

/** The one figure this page owns: the deterministic score readout. */
const EXTRA_CSS = `
/* Held narrow: this figure sits full width under the fix cards, and at four
   equal tracks across the whole column the tiles read as empty bars. */
.venture .scorefig { max-width: 560px; margin-top: 24px; }
.venture .scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; }
@media (max-width: 560px) {
  .venture .scores { grid-template-columns: repeat(2, 1fr); }
}
.venture .sc {
  border-radius: 10px;
  padding: 11px 10px;
  text-align: center;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--accent-rgb), 0.22);
}
.venture .sc b {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.venture .sc span {
  display: block;
  margin-top: 7px;
  height: 4px;
  border-radius: 3px;
  background: rgba(var(--accent-rgb), 0.25);
}
.venture .reprod {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.4);
}
`

export default function VentureArchitectPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §4 gate rows land one at a time, then the gate chip resolves.
  const { ref: gateRef, fired: gateGo } = useOnceInView<HTMLDivElement>(0.25)
  const [gateShown, setGateShown] = useState(0)
  const [gateDone, setGateDone] = useState(false)
  useTimeline(gateGo, [
    ...GATE_META.map((_, i) => ({ at: 260 + i * 380, run: () => setGateShown(i + 1) })),
    { at: 260 + GATE_META.length * 380 + 220, run: () => setGateDone(true) },
  ])

  // §5 both agents land together, which is the point of the figure.
  const { ref: parRef, fired: parGo } = useOnceInView<HTMLDivElement>(0.3)

  return (
    <CaseStudyShell subtitle="AI Venture Architect" pageClass="venture" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Multi-Agent</Eyebrow>
        <div className="hero">
          <div>
            <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
              Two analyses that never needed to wait for each other
            </h1>
            <p className="lede">
              A LangGraph platform that turns a rough AI product idea into a structured opportunity report. It refuses
              to analyze an idea too vague to analyze, runs market research and technical architecture at the same
              time, and computes its scores outside the model so the same input scores the same way twice.
            </p>
            <Chips
              items={[
                { label: 'Parallel agents', accent: true },
                { label: 'Deterministic scoring', accent: true },
                { label: 'Clarification gate' },
                { label: 'Live SSE streaming' },
              ]}
            />
          </div>
          <HeroPlaceholder
            label={HERO_PLACEHOLDER.label}
            note={HERO_PLACEHOLDER.note}
            caption="Progress streams as the graph runs"
          />
        </div>
      </header>

      <Divider />

      {/* ── 2 What I built ──────────────────────────────────────────── */}
      <section ref={builtRef} className={reveal(builtIn)}>
        <Eyebrow>The contribution</Eyebrow>
        <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
        <TwoUp
          work="A LangGraph workflow in three phases: a clarification gate that routes low-clarity submissions through targeted questions before anything else runs, market research and solution architecture agents executing simultaneously via asyncio.gather, and a synthesis agent that combines them into a structured opportunity report. Scores are computed by a standalone utility. FastAPI streams progress over Server-Sent Events to a Next.js frontend, and every run is traced through Langfuse."
          demonstrates="Most agentic workflows run sequentially by default, even where the steps are independent, and most let the model grade its own output. This one does neither. Conditional routing on input quality, safe parallelism where the dependency graph allows it, and scoring held outside the generation path are the three things that separate an agent system you can operate from a demo that works once."
        />
      </section>

      <Divider />

      {/* ── 3 The problem ───────────────────────────────────────────── */}
      <section ref={probRef} className={reveal(probIn)}>
        <Eyebrow>The problem</Eyebrow>
        <Heading2 className="mb-[18px] max-w-[21ch]">Three questions, normally asked one after another</Heading2>
        <p className="body">
          Deciding whether an AI product idea is worth pursuing takes three kinds of analysis: market research into
          whether it solves a real problem, technical architecture into whether it can be built, and a feasibility read
          on how confident anyone should be about either. Done by hand this takes days, mostly because it gets done in
          sequence.
        </p>
        <p className="body mb-[30px]">
          The sequence is not required. Market research does not depend on the architecture, and the architecture does
          not depend on the market. They only run in order because that is what a workflow does by default. There is a
          second problem underneath it: ideas arrive too vague to analyze, and running a full pipeline over a low
          signal input produces a confident report about nothing.
        </p>
        <ContrastPair
          before={{
            label: 'Sequential, ungated',
            quote:
              'Analyze whatever arrives, market first, architecture after it finishes, then score the result with the same model that wrote it.',
            foot: 'Days, and unrepeatable',
          }}
          after={{
            label: 'Gated, then parallel',
            quote:
              'Ask three questions if the idea is too thin. Then run both analyses at once and score the output with a utility that never saw the prompt.',
            foot: 'Reproducible, roughly half the time',
          }}
        />
      </section>

      <Divider />

      {/* ── 4 The foundation ────────────────────────────────────────── */}
      <section ref={foundRef} className={reveal(foundIn)}>
        <Eyebrow>The foundation</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[17ch]">The gate that runs before anything else</Heading2>
        <div className="split" ref={gateRef}>
          <div>
            <p className="body">
              Incoming ideas are scored on clarity before any analysis starts. Below the threshold, the workflow stops
              and surfaces up to three targeted questions. It only proceeds once the input is good enough to work with.
            </p>
            <p className="body mb-0">
              This is the cheapest quality improvement in the system. A clarifying question costs one round trip. A
              full analysis pass over a vague input costs two agent runs, a synthesis, and a report nobody trusts,
              which is a much more expensive way to find out the input was thin.
            </p>
          </div>
          <Figure name="Clarity gate" category="Before analysis">
            <div className="meta">
              {GATE_META.map(([field, value], i) => (
                <div key={field} className={`mrow${i < gateShown ? ' shown' : ''}`}>
                  <b>{field}</b>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <span className={`idxchip${gateDone ? ' shown' : ''}`}>
              <Glyph d={CHECK_PATH} size={11} />
              Nothing runs on an unanalyzable idea
            </span>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 5 The system ────────────────────────────────────────────── */}
      <section ref={sysRef} className={reveal(sysIn)}>
        <Eyebrow>The system</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">Both agents, at the same time</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Past the gate, the market research and solution architecture agents start together through
              asyncio.gather. They share an input and nothing else, so neither blocks the other, and total analysis
              time comes down to roughly the slower of the two rather than their sum.
            </p>
            <p className="body">
              A third agent waits on both and combines them into a structured report with section headings, evidence
              references, and identified risks. Parallelism here is safe precisely because the join is explicit: the
              synthesis step is the only place the two branches meet.
            </p>
            <PipelineList label="End to end" rows={PIPELINE} />
          </div>
          <Figure name="Parallel execution" category="asyncio.gather">
            <div ref={parRef} className={`flow${parGo ? ' go' : ''}`}>
              <div className="nd">
                <p className="k">Cleared idea</p>
                <p className="v">Past the clarity gate, ready to analyze.</p>
              </div>
              <div className="conv split" />
              <div className="legs">
                {PARALLEL_AGENTS.map(({ name, kind, detail, finds }) => (
                  <div key={name} className="leg">
                    <div className="hd">
                      <b>{name}</b>
                      <em>{kind}</em>
                    </div>
                    <p>{detail}</p>
                    <span className="out">{finds}</span>
                  </div>
                ))}
              </div>
              <div className="conv" />
              <div className="nd pri">
                <p className="k">Synthesis agent</p>
                <p className="v">Waits on both, then writes the opportunity report.</p>
                <p className="f">the only point the two branches meet</p>
              </div>
              <div className="stem" />
              <div className="nd">
                <p className="k">Scoring</p>
                <p className="v">Handed to a utility outside the generation path.</p>
                <span className="chipout">
                  <Glyph d={CHECK_PATH} />
                  Reproducible, not model written
                </span>
              </div>
            </div>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 6 The hard part ─────────────────────────────────────────── */}
      <section ref={hardRef} className={reveal(hardIn)}>
        <Eyebrow>The hard part</Eyebrow>
        <Heading2 className="mb-5 max-w-[20ch]">A model should not be allowed to grade its own work</Heading2>
        <p className="body mb-[30px]">
          The obvious way to produce a feasibility score is to ask the model that wrote the analysis how feasible it
          thinks the idea is. It reads well and it is close to meaningless: the number moves between runs on identical
          input, and there is nothing to point at when someone asks why an idea scored a six. Uniqueness, feasibility,
          risk, and confidence are computed instead by a standalone utility applying explicit criteria, outside the
          generation path entirely.
        </p>
        <ProblemFixCards
          cards={[
            {
              problem:
                'Scores that drift. An LLM-generated feasibility number is not stable across runs of the same input, so two people analyzing the same idea get two different answers and neither can be defended.',
              fix: 'A standalone Python utility applies explicit rubrics to produce all four scores. Same input, same score, and a criterion to point at when someone disagrees with the result.',
            },
            {
              problem:
                'Parallelism applied where it is not safe. Running steps concurrently is only free when they genuinely do not depend on each other, and that is a property of the dependency graph, not a preference.',
              fix: 'Only the two independent analyses run concurrently. Synthesis joins them explicitly and scoring runs after, so the graph encodes which work can overlap rather than leaving it to chance.',
            },
          ]}
        />
        <p className="coda">
          Langfuse is what made the calibration possible rather than theoretical. Tracing token usage, per-node latency
          and score outputs across runs is how the gate threshold and the scoring rubric got tuned to something
          defensible, instead of being set once and assumed correct.
        </p>
        <div className="scorefig">
          <Figure name="Computed, not generated" category="Scoring">
            <div className="scores">
              {SCORES.map((score) => (
                <div key={score} className="sc">
                  <b>{score}</b>
                  <span />
                </div>
              ))}
            </div>
            <p className="reprod">
              <Glyph d={CHECK_PATH} size={11} />
              Explicit criteria, outside the LLM path
            </p>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 7 In practice ───────────────────────────────────────────── */}
      <section ref={pracRef} className={reveal(pracIn)}>
        <Eyebrow>In practice</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">What the platform does on a run</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Six pieces, each one a decision about where control sits: what gets analyzed, what runs together, who
              produces the numbers, and what the user can see while it happens.
            </p>
            <p className="body mb-0">Select any one to open it out.</p>
          </div>
          <CapabilityPicker items={CAPABILITIES} />
        </div>
      </section>

      <Divider />

      {/* ── 8 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Ask about the build"
          body="The graph structure, the gate calibration and the decision to keep scoring out of the model are the parts worth asking about. The knowledge base on this site will go into any of them."
          cta="Ask about Chase"
          href="/knowledge-base"
          related={
            <>
              Related work &middot; <Link href="/projects/oss-dependency-risk-agent">OSS Dependency Risk Agent</Link>{' '}
              &middot; another LangGraph system with scoring held outside the model
            </>
          }
        />
      </section>
    </CaseStudyShell>
  )
}
