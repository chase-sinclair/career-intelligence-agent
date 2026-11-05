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
  HERO_PLACEHOLDER,
  INGESTION_META,
  PIPELINE,
  QUARANTINE_CATEGORIES,
  RETRIEVAL_LEGS,
} from '@/lib/kb-agent-data'

/** The one figure this page owns: a document card that lights once indexed. */
const EXTRA_CSS = `
.kb-agent .pg {
  display: grid;
  grid-template-columns: 116px 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 520px) {
  .kb-agent .pg { grid-template-columns: 1fr; }
}
.kb-agent .leaf {
  border-radius: 7px;
  padding: 13px 11px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
  transition: border-color 0.6s, box-shadow 0.6s;
}
.kb-agent .leaf.idx {
  border-color: rgba(var(--accent-rgb), 0.45);
  box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.14);
}
.kb-agent .leaf .ln {
  height: 4px;
  border-radius: 3px;
  background: rgba(var(--ink-rgb), 0.13);
  margin-bottom: 6px;
}
.kb-agent .leaf .ln:nth-child(3n) { width: 72%; }
.kb-agent .leaf .ln:nth-child(5n) { width: 86%; }
.kb-agent .leaf .pn {
  margin-top: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.1em;
  color: rgba(var(--ink-rgb), 0.38);
  text-align: right;
  transition: color 0.6s;
}
.kb-agent .leaf.idx .pn { color: var(--accent); }
`

export default function KbAgentPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §4 ingestion: four metadata rows 400ms apart, then the file card is marked.
  const { ref: ingestRef, fired: ingestGo } = useOnceInView<HTMLDivElement>(0.25)
  const [metaShown, setMetaShown] = useState(0)
  const [indexed, setIndexed] = useState(false)
  useTimeline(ingestGo, [
    ...INGESTION_META.map((_, i) => ({ at: 260 + i * 400, run: () => setMetaShown(i + 1) })),
    { at: 260 + INGESTION_META.length * 400 + 240, run: () => setIndexed(true) },
  ])

  // §5 merge: the two legs land, then the merged node.
  const { ref: mergeRef, fired: mergeGo } = useOnceInView<HTMLDivElement>(0.3)

  return (
    <CaseStudyShell subtitle="KB Agent · Proposal Intelligence" pageClass="kb-agent" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Agentic RAG</Eyebrow>
        <div className="hero">
          <div>
            <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
              Half a day of proposal research, answered in the thread
            </h1>
            <p className="lede">
              A Slack bot that turns a SharePoint document library into a queryable proposal intelligence system. Ask
              what the team has done before, in plain English, and get an answer drawn from the actual library. The hard
              part was never the bot. It was making retrieval trustworthy enough that a bid decision could rest on it.
            </p>
            <Chips
              items={[
                { label: 'Hybrid retrieval', accent: true },
                { label: 'Custom RRF merge', accent: true },
                { label: 'Six workflows' },
                { label: 'In production' },
              ]}
            />
          </div>
          <HeroPlaceholder
            label={HERO_PLACEHOLDER.label}
            note={HERO_PLACEHOLDER.note}
            caption="Running for a live proposal team"
          />
        </div>
      </header>

      <Divider />

      {/* ── 2 What I built ──────────────────────────────────────────── */}
      <section ref={builtRef} className={reveal(builtIn)}>
        <Eyebrow>The contribution</Eyebrow>
        <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
        <TwoUp
          work="I built the whole path from document library to cited answer: Microsoft Graph ingestion with typed quarantine and SHA-256 change detection, hybrid dense and sparse indexing in Qdrant, a hand written Reciprocal Rank Fusion merge, a FastMCP server exposing each analytical workflow as a named tool, and the Slack Bolt interface a proposal team actually talks to."
          demonstrates="A vector database gives you storage and similarity search. Ranking two retrieval legs against each other, surviving a broken client library, and keeping an answer honest about what the library does not contain are left to you. I did not wire up a chatbot. I found where its retrieval failed, diagnosed the cause down to a client version, and replaced the broken path with one I could reason about."
        />
      </section>

      <Divider />

      {/* ── 3 The problem ───────────────────────────────────────────── */}
      <section ref={probRef} className={reveal(probIn)}>
        <Eyebrow>The problem</Eyebrow>
        <Heading2 className="mb-[18px] max-w-[20ch]">An RFP drops and the first question is always the same</Heading2>
        <p className="body">
          Government proposal teams work to brutal deadlines. A request for proposal lands with two weeks on the clock,
          and the opening question never changes: what have we done before that is relevant to this? Answering it means
          searching SharePoint folders by hand, pinging subject matter experts, and reassembling fragments of prior
          proposals. That routinely costs half a day.
        </p>
        <p className="body mb-[30px]">
          The library already exists and the institutional knowledge is in it. It is locked in unstructured files with
          no retrieval layer that understands proposal terminology. Keyword search returns noise and misses anything
          phrased differently, which on a proposal is most things.
        </p>
        <ContrastPair
          before={{
            label: 'Searching the library by hand',
            quote:
              'Four folder trees, two experts interrupted, and a paragraph pulled from a proposal nobody is sure was the winning version.',
            foot: 'Half a day, no provenance',
          }}
          after={{
            label: 'Asking in the thread',
            quote:
              'Here is the prior work that matches the requirement, the sections it came from, and the requirements nothing in the library supports.',
            foot: 'Grounded in retrieved documents',
          }}
        />
      </section>

      <Divider />

      {/* ── 4 The foundation ────────────────────────────────────────── */}
      <section ref={foundRef} className={reveal(foundIn)}>
        <Eyebrow>The foundation</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[17ch]">Ingestion that survives a real document library</Heading2>
        <div className="split" ref={ingestRef}>
          <div>
            <p className="body">
              A live SharePoint library is not a clean corpus. Files are checked out and locked, some are corrupt, and
              the network drops mid fetch. Microsoft Graph polling pulls new and changed files, and anything that fails
              is quarantined by error type rather than taking the run down with it.
            </p>
            <p className="body mb-0">
              Re-ingestion is cheap because it is content addressed. A SHA-256 hash per file means an unchanged document
              is recognized and skipped, so the index can be refreshed as often as the library moves.
            </p>
          </div>
          <Figure name="One file, indexed once" category="Ingestion">
            <div className="pg">
              <div className={`leaf${indexed ? ' idx' : ''}`}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="ln" />
                ))}
                <p className="pn">.docx</p>
              </div>
              <div className="meta">
                {INGESTION_META.map(([field, value], i) => (
                  <div key={field} className={`mrow${i < metaShown ? ' shown' : ''}`}>
                    <b>{field}</b>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className={`idxchip${indexed ? ' shown' : ''}`}>
              <Glyph d={CHECK_PATH} size={11} />
              Unchanged files skipped on re-run
            </span>
            <div className="tokz">
              <p className="lab">Quarantine categories</p>
              <div className="tokrow">
                {QUARANTINE_CATEGORIES.map((category) => (
                  <span key={category} className="tok">
                    {category}
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
        <Heading2 className="mb-[22px] max-w-[19ch]">Two retrieval legs, merged by rank</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Proposal language is the worst case for either retrieval method alone. Dense embeddings catch a
              requirement phrased three different ways across three agencies, and miss the contract vehicle named only
              by its acronym. Sparse retrieval does the reverse. So every query runs both legs and merges them.
            </p>
            <p className="body">
              The merge is Reciprocal Rank Fusion, scoring each document by where it placed in each leg rather than by
              raw score, which keeps two incomparable scales from fighting. It is implemented by hand. The reason is the
              next section.
            </p>
            <PipelineList label="End to end" rows={PIPELINE} />
          </div>
          <Figure name="Hybrid merge" category="Query time">
            <div ref={mergeRef} className={`flow${mergeGo ? ' go' : ''}`}>
              <div className="nd">
                <p className="k">Question</p>
                <p className="v">What prior work covers this requirement?</p>
              </div>
              <div className="stem" />
              <div className="legs">
                {RETRIEVAL_LEGS.map(({ name, kind, detail, finds }) => (
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
                <p className="k">Reciprocal Rank Fusion</p>
                <p className="v">Score by rank position in each leg, then merge into one list.</p>
                <p className="f">custom implementation, not the client&rsquo;s native hybrid path</p>
              </div>
              <div className="stem" />
              <div className="nd">
                <p className="k">To generation</p>
                <p className="v">One ranked set of chunks, passed to Claude Opus.</p>
                <span className="chipout">
                  <Glyph d={CHECK_PATH} />
                  Evidence only, gaps flagged
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
        <Heading2 className="mb-5 max-w-[18ch]">The hybrid search that silently was not</Heading2>
        <p className="body mb-[30px]">
          Qdrant supports hybrid search natively, so the first build used it. Retrieval quality was wrong in a way that
          did not look like a bug: results came back, they were plausible, and they were worse than the dense leg alone.
          The cause was a serialization bug in Qdrant client v1.17.1 that broke the native hybrid path. Nothing raised.
          The fix was to stop trusting that path, retrieve each leg separately, and fuse the ranks in application code I
          could inspect.
        </p>
        <ProblemFixCards
          cards={[
            {
              problem:
                'A library path that failed quietly. The native hybrid query returned results rather than an error, so the only symptom was retrieval that underperformed the simpler approach it was supposed to beat.',
              fix: 'Two explicit retrieval calls and a Reciprocal Rank Fusion merge written in application code. Slower to write, inspectable at every step, and pinned to a client version whose behavior is known.',
            },
            {
              problem:
                'A model that would rather draft than admit a gap. Asked to write a section the library did not support, the obvious failure is a confident paragraph with nothing behind it.',
              fix: 'The system prompt enforces evidence-only assertions, and unsupported claims come back marked [EVIDENCE MISSING] rather than written around. A visible gap is useful. An invented one is not.',
            },
          ]}
        />
        <p className="coda">
          The lesson I keep from this one is about failure modes, not about Qdrant. A retrieval layer that errors is a
          morning of work. A retrieval layer that quietly returns slightly worse results is the one that ships, and the
          only way I caught it was comparing against the baseline it was meant to beat.
        </p>
      </section>

      <Divider />

      {/* ── 7 In practice ───────────────────────────────────────────── */}
      <section ref={pracRef} className={reveal(pracIn)}>
        <Eyebrow>In practice</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">What a proposal team can ask it to do</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Each workflow is a named tool on the FastMCP server, so the Slack layer routes a message to the right one
              by intent rather than making the user learn commands. The work happens where the team already talks about
              the bid.
            </p>
            <p className="body mb-0">Select any capability to open it out.</p>
          </div>
          <CapabilityPicker items={CAPABILITIES} />
        </div>
      </section>

      <Divider />

      {/* ── 8 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Ask about the build"
          body="This one runs inside a client environment, so there is no public demo. The knowledge base on this site will answer questions about how it was built and what it took to get retrieval honest."
          cta="Ask about Chase"
          href="/knowledge-base"
          related={
            <>
              Related work &middot; <Link href="/projects/peai-chat-assistant">PEAI Chat Assistant</Link> &middot; the
              same grounding problem, a different library
            </>
          }
        />
      </section>
    </CaseStudyShell>
  )
}
