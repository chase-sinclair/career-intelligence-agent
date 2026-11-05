'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import {
  CAPABILITIES,
  HERO_PLACEHOLDER,
  INGESTION_META,
  PIPELINE,
  QUARANTINE_CATEGORIES,
  RETRIEVAL_LEGS,
} from '@/lib/kb-agent-data'

/**
 * One-shot scroll trigger.
 *
 * Same contract as the two PEAI case studies: the observer disconnects as soon
 * as it fires, so no reveal on this page replays on scroll back.
 */
function useOnceInView<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null)
  const [fired, setFired] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setFired(true)
            observer.disconnect()
            return
          }
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, fired }
}

/** Runs a list of timers once `start` flips true, clearing them on unmount. */
function useTimeline(start: boolean, steps: ReadonlyArray<{ at: number; run: () => void }>) {
  const stepsRef = useRef(steps)
  stepsRef.current = steps

  useEffect(() => {
    if (!start) return
    const ids = stepsRef.current.map(({ at, run }) => setTimeout(run, at))
    return () => ids.forEach(clearTimeout)
  }, [start])
}

const CHECK_PATH = 'm5 13 4 4 10-10'
const CROSS_PATH = 'M18 6 6 18M6 6l12 12'

function Glyph({ d, size = 10, width = 2.4 }: { d: string; size?: number; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/** Titled shell shared by the explanatory figures, same as the Chat page. */
function Figure({ name, category, children }: { name: string; category: string; children: React.ReactNode }) {
  return (
    <div className="fig">
      <div className="flab">
        <b>{name}</b>
        <span>{category}</span>
      </div>
      {children}
    </div>
  )
}

export default function KbAgentPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §3 before/after contrast: panels land, then the citation line resolves.
  const { ref: contrastRef, fired: contrastGo } = useOnceInView<HTMLDivElement>(0.4)

  // §4 ingestion: four metadata rows 400ms apart, then the file card is marked.
  const { ref: ingestRef, fired: ingestGo } = useOnceInView<HTMLDivElement>(0.25)
  const [metaShown, setMetaShown] = useState(0)
  const [indexed, setIndexed] = useState(false)
  useTimeline(ingestGo, [
    ...INGESTION_META.map((_, i) => ({ at: 260 + i * 400, run: () => setMetaShown(i + 1) })),
    { at: 260 + INGESTION_META.length * 400 + 240, run: () => setIndexed(true) },
  ])

  // §5 merge: the two legs land, then the merged node, then the output chip.
  const { ref: mergeRef, fired: mergeGo } = useOnceInView<HTMLDivElement>(0.3)

  // §7 capabilities: chips appear 110ms apart once the figure is in view.
  const { ref: capRef, fired: capGo } = useOnceInView<HTMLDivElement>(0.25)
  const [chipsShown, setChipsShown] = useState(0)
  useTimeline(capGo, CAPABILITIES.map((_, i) => ({ at: 240 + i * 110, run: () => setChipsShown(i + 1) })))

  const [openCap, setOpenCap] = useState<number | null>(null)
  const open = openCap === null ? null : CAPABILITIES[openCap]

  const reveal = (shown: boolean) =>
    `transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

  return (
    <div className="kb-agent min-h-screen">
      <TopNav subtitle="KB Agent · Proposal Intelligence" />

      <main className="pl-5">
        <div className="px-6 md:px-10 pb-24 pt-24 mx-auto w-full max-w-[1280px]">
          <Link href="/projects" className="backlink">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Projects
          </Link>

          {/* ── 1 Hero ────────────────────────────────────────────────── */}
          <header>
            <Eyebrow>Agentic RAG</Eyebrow>
            <div className="hero">
              <div>
                <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
                  Half a day of proposal research, answered in the thread
                </h1>
                <p className="lede">
                  A Slack bot that turns a SharePoint document library into a queryable proposal intelligence system. Ask
                  what the team has done before, in plain English, and get an answer drawn from the actual library. The
                  hard part was never the bot. It was making retrieval trustworthy enough that a bid decision could rest
                  on it.
                </p>
                <div className="credit">
                  <span className="chip a">Hybrid retrieval</span>
                  <span className="chip a">Custom RRF merge</span>
                  <span className="chip">Six workflows</span>
                  <span className="chip">In production</span>
                </div>
              </div>
              {/* Visuals are not finalized. This is a marked placeholder frame,
                  not a missing image: no asset is referenced, so the page
                  builds and ships as is. Swap in next/image when a capture
                  exists. */}
              <div className="shot">
                <div className="ph">
                  <span className="pht">{HERO_PLACEHOLDER.label}</span>
                  <span className="phn">{HERO_PLACEHOLDER.note}</span>
                </div>
                <span className="cap">
                  <i />
                  Running for a live proposal team
                </span>
              </div>
            </div>
          </header>

          <Divider />

          {/* ── 2 What I built ────────────────────────────────────────── */}
          <section ref={builtRef} className={reveal(builtIn)}>
            <Eyebrow>The contribution</Eyebrow>
            <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
            <div className="two">
              <div className="c">
                <p className="lab">The work</p>
                <p>
                  I built the whole path from document library to cited answer: Microsoft Graph ingestion with typed
                  quarantine and SHA-256 change detection, hybrid dense and sparse indexing in Qdrant, a hand written
                  Reciprocal Rank Fusion merge, a FastMCP server exposing each analytical workflow as a named tool, and
                  the Slack Bolt interface a proposal team actually talks to.
                </p>
              </div>
              <div className="c">
                <p className="lab">What it demonstrates</p>
                <p>
                  A vector database gives you storage and similarity search. Ranking two retrieval legs against each
                  other, surviving a broken client library, and keeping an answer honest about what the library does not
                  contain are left to you. I did not wire up a chatbot. I found where its retrieval failed, diagnosed the
                  cause down to a client version, and replaced the broken path with one I could reason about.
                </p>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 3 The problem ─────────────────────────────────────────── */}
          <section ref={probRef} className={reveal(probIn)}>
            <Eyebrow>The problem</Eyebrow>
            <Heading2 className="mb-[18px] max-w-[20ch]">
              An RFP drops and the first question is always the same
            </Heading2>
            <p className="body">
              Government proposal teams work to brutal deadlines. A request for proposal lands with two weeks on the
              clock, and the opening question never changes: what have we done before that is relevant to this? Answering
              it means searching SharePoint folders by hand, pinging subject matter experts, and reassembling fragments
              of prior proposals. That routinely costs half a day.
            </p>
            <p className="body mb-[30px]">
              The library already exists and the institutional knowledge is in it. It is locked in unstructured files
              with no retrieval layer that understands proposal terminology. Keyword search returns noise and misses
              anything phrased differently, which on a proposal is most things.
            </p>
            <div ref={contrastRef} className={`gvu${contrastGo ? ' go' : ''}`}>
              <div className="gv">
                <p className="lab">Searching the library by hand</p>
                <q>
                  Four folder trees, two experts interrupted, and a paragraph pulled from a proposal nobody is sure was
                  the winning version.
                </q>
                <span className="src none">Half a day, no provenance</span>
              </div>
              <div className="gv ok">
                <p className="lab">Asking in the thread</p>
                <q>
                  Here is the prior work that matches the requirement, the sections it came from, and the requirements
                  nothing in the library supports.
                </q>
                <span className="src has">
                  <Glyph d={CHECK_PATH} size={11} />
                  Grounded in retrieved documents
                </span>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 4 The foundation ──────────────────────────────────────── */}
          <section ref={foundRef} className={reveal(foundIn)}>
            <Eyebrow>The foundation</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[17ch]">Ingestion that survives a real document library</Heading2>
            <div className="split" ref={ingestRef}>
              <div>
                <p className="body">
                  A live SharePoint library is not a clean corpus. Files are checked out and locked, some are corrupt,
                  and the network drops mid fetch. Microsoft Graph polling pulls new and changed files, and anything that
                  fails is quarantined by error type rather than taking the run down with it.
                </p>
                <p className="body mb-0">
                  Re-ingestion is cheap because it is content addressed. A SHA-256 hash per file means an unchanged
                  document is recognized and skipped, so the index can be refreshed as often as the library moves.
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
                <div className="qz">
                  <p className="lab">Quarantine categories</p>
                  <div className="qc">
                    {QUARANTINE_CATEGORIES.map((category) => (
                      <span key={category} className="qt">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </Figure>
            </div>
          </section>

          <Divider />

          {/* ── 5 The system ──────────────────────────────────────────── */}
          <section ref={sysRef} className={reveal(sysIn)}>
            <Eyebrow>The system</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[19ch]">Two retrieval legs, merged by rank</Heading2>
            <div className="split">
              <div>
                <p className="body">
                  Proposal language is the worst case for either retrieval method alone. Dense embeddings catch a
                  requirement phrased three different ways across three agencies, and miss the contract vehicle named
                  only by its acronym. Sparse retrieval does the reverse. So every query runs both legs and merges them.
                </p>
                <p className="body">
                  The merge is Reciprocal Rank Fusion, scoring each document by where it placed in each leg rather than
                  by raw score, which keeps two incomparable scales from fighting. It is implemented by hand. The reason
                  is the next section.
                </p>
                <div className="pipe">
                  <p className="lab">End to end</p>
                  {PIPELINE.map(({ k, v }) => (
                    <div key={k} className="prow">
                      <b>{k}</b>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Figure name="Hybrid merge" category="Query time">
                <div ref={mergeRef} className={`mg${mergeGo ? ' go' : ''}`}>
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

          {/* ── 6 The hard part ───────────────────────────────────────── */}
          <section ref={hardRef} className={reveal(hardIn)}>
            <Eyebrow>The hard part</Eyebrow>
            <Heading2 className="mb-5 max-w-[18ch]">The hybrid search that silently was not</Heading2>
            <p className="body mb-[30px]">
              Qdrant supports hybrid search natively, so the first build used it. Retrieval quality was wrong in a way
              that did not look like a bug: results came back, they were plausible, and they were worse than the dense
              leg alone. The cause was a serialization bug in Qdrant client v1.17.1 that broke the native hybrid path.
              Nothing raised. The fix was to stop trusting that path, retrieve each leg separately, and fuse the ranks in
              application code I could inspect.
            </p>
            <div className="fx">
              <div className="fc">
                <div className="seg">
                  <p className="t">
                    <i>
                      <Glyph d={CROSS_PATH} width={2.6} />
                    </i>
                    <b>Problem</b>
                  </p>
                  <p>
                    A library path that failed quietly. The native hybrid query returned results rather than an error, so
                    the only symptom was retrieval that underperformed the simpler approach it was supposed to beat.
                  </p>
                </div>
                <div className="seg fix">
                  <p className="t">
                    <i>
                      <Glyph d={CHECK_PATH} width={2.6} />
                    </i>
                    <b>Fix</b>
                  </p>
                  <p>
                    Two explicit retrieval calls and a Reciprocal Rank Fusion merge written in application code. Slower
                    to write, inspectable at every step, and pinned to a client version whose behavior is known.
                  </p>
                </div>
              </div>
              <div className="fc">
                <div className="seg">
                  <p className="t">
                    <i>
                      <Glyph d={CROSS_PATH} width={2.6} />
                    </i>
                    <b>Problem</b>
                  </p>
                  <p>
                    A model that would rather draft than admit a gap. Asked to write a section the library did not
                    support, the obvious failure is a confident paragraph with nothing behind it.
                  </p>
                </div>
                <div className="seg fix">
                  <p className="t">
                    <i>
                      <Glyph d={CHECK_PATH} width={2.6} />
                    </i>
                    <b>Fix</b>
                  </p>
                  <p>
                    The system prompt enforces evidence-only assertions, and unsupported claims come back marked
                    [EVIDENCE MISSING] rather than written around. A visible gap is useful. An invented one is not.
                  </p>
                </div>
              </div>
            </div>
            <p className="coda">
              The lesson I keep from this one is about failure modes, not about Qdrant. A retrieval layer that errors is
              a morning of work. A retrieval layer that quietly returns slightly worse results is the one that ships, and
              the only way I caught it was comparing against the baseline it was meant to beat.
            </p>
          </section>

          <Divider />

          {/* ── 7 In practice ─────────────────────────────────────────── */}
          <section ref={pracRef} className={reveal(pracIn)}>
            <Eyebrow>In practice</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[18ch]">What a proposal team can ask it to do</Heading2>
            <div className="split" ref={capRef}>
              <div>
                <p className="body">
                  Each workflow is a named tool on the FastMCP server, so the Slack layer routes a message to the right
                  one by intent rather than making the user learn commands. The work happens where the team already
                  talks about the bid.
                </p>
                <p className="body mb-0">Select any capability to open it out.</p>
              </div>
              <Figure name="Capabilities" category="In practice">
                <div className="caps">
                  {CAPABILITIES.map((capability, i) => (
                    <button
                      key={capability.id}
                      type="button"
                      className={`cap-chip${i < chipsShown ? ' shown' : ''}`}
                      aria-expanded={openCap === i}
                      onClick={() => setOpenCap(openCap === i ? null : i)}
                    >
                      {capability.short}
                    </button>
                  ))}
                </div>
                <div className={`capx${open ? ' open' : ''}`}>
                  <div className="box">
                    {open && (
                      <>
                        <p className="ct">{open.title}</p>
                        <p className="cb">{open.body}</p>
                        <span className="co">
                          <Glyph d={CHECK_PATH} />
                          {open.output}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Figure>
            </div>
          </section>

          <Divider />

          {/* ── 8 Close ───────────────────────────────────────────────── */}
          <section ref={closeRef} className={reveal(closeIn)}>
            <div className="close">
              <div className="t">
                <b>Ask about the build</b>
                <span>
                  This one runs inside a client environment, so there is no public demo. The knowledge base on this site
                  will answer questions about how it was built and what it took to get retrieval honest.
                </span>
              </div>
              <Link className="go" href="/knowledge-base">
                Ask about Chase
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <p className="rel">
              Related work &middot; <Link href="/projects/peai-chat-assistant">PEAI Chat Assistant</Link> &middot; the
              same grounding problem, a different library
            </p>
          </section>
        </div>
      </main>

      <style jsx global>{`
        /* Scoped under .kb-agent so nothing here can reach another route.
           Deliberately the same visual system as the two PEAI case studies:
           same tokens, same figure shell, same chip and panel geometry. */
        .kb-agent .backlink {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 30px;
          font-size: 11px;
          color: rgba(var(--ink-rgb), 0.6);
          transition: color 0.18s;
        }
        .kb-agent .backlink:hover {
          color: var(--accent);
        }
        .kb-agent .lab {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.48);
        }
        .kb-agent p.body {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: 64ch;
          margin-bottom: 1rem;
          text-wrap: pretty;
        }

        /* 1 hero */
        .kb-agent .hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 430px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1060px) {
          .kb-agent .hero {
            grid-template-columns: 1fr;
            gap: 34px;
          }
        }
        .kb-agent .hero .lede {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: none;
          text-wrap: pretty;
        }
        .kb-agent .credit {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 26px;
        }
        .kb-agent .chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.35;
          white-space: nowrap;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 7px 11px;
          border-radius: 20px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
          color: rgba(var(--ink-rgb), 0.6);
        }
        .kb-agent .chip.a {
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.22);
          color: var(--accent);
        }
        .kb-agent .shot {
          display: flex;
          flex-direction: column;
          gap: 11px;
          align-items: flex-start;
          width: 100%;
          justify-self: end;
          max-width: min(430px, 100%);
        }
        /* Placeholder frame. Holds the hero's aspect ratio so dropping a real
           screenshot in later does not reflow the section. */
        .kb-agent .ph {
          width: 100%;
          aspect-ratio: 16 / 10;
          border-radius: 11px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: var(--panel-2);
          border: 1px dashed rgba(var(--ink-rgb), 0.2);
        }
        .kb-agent .ph .pht {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.5);
        }
        .kb-agent .ph .phn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.32);
        }
        .kb-agent .shot .cap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.48);
        }
        .kb-agent .shot .cap i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          display: block;
          animation: kb-agent-pulse 2.2s ease-in-out infinite;
        }
        @keyframes kb-agent-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.28;
          }
        }

        /* 2 what I built */
        .kb-agent .two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-top: 10px;
        }
        @media (max-width: 860px) {
          .kb-agent .two {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .kb-agent .two .c {
          padding-right: 46px;
        }
        .kb-agent .two .c + .c {
          padding: 0 0 0 46px;
          border-left: 1px solid rgba(var(--ink-rgb), 0.1);
        }
        @media (max-width: 860px) {
          .kb-agent .two .c,
          .kb-agent .two .c + .c {
            padding: 0;
            border: 0;
          }
        }
        .kb-agent .two .lab {
          color: var(--accent);
          margin-bottom: 12px;
          letter-spacing: 0.14em;
        }
        .kb-agent .two p {
          font-size: 0.9688rem;
          line-height: 1.72;
          color: rgba(var(--ink-rgb), 0.7);
          text-wrap: pretty;
        }

        /* 3 before and after */
        .kb-agent .gvu {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          max-width: 800px;
          margin-top: 8px;
        }
        @media (max-width: 760px) {
          .kb-agent .gvu {
            grid-template-columns: 1fr;
          }
        }
        .kb-agent .gv {
          border-radius: 13px;
          padding: 16px 17px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kb-agent .gvu.go .gv {
          opacity: 1;
          transform: none;
        }
        .kb-agent .gvu.go .gv:nth-child(2) {
          transition-delay: 0.28s;
        }
        .kb-agent .gv.ok {
          background: rgba(var(--accent-rgb), 0.05);
          border-color: rgba(var(--accent-rgb), 0.22);
        }
        .kb-agent .gv .lab {
          margin-bottom: 11px;
        }
        .kb-agent .gv.ok .lab {
          color: var(--accent);
        }
        .kb-agent .gv q {
          display: block;
          quotes: none;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.7);
        }
        .kb-agent .gv .src {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 13px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.06em;
          padding: 7px 10px;
          border-radius: 7px;
        }
        .kb-agent .gv .src.none {
          background: transparent;
          border: 0.5px dashed rgba(var(--ink-rgb), 0.22);
          color: rgba(var(--ink-rgb), 0.4);
        }
        .kb-agent .gv .src.has {
          background: rgba(var(--accent-rgb), 0.1);
          border: 0.5px solid rgba(var(--accent-rgb), 0.3);
          color: var(--accent);
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s;
        }
        .kb-agent .gvu.go .gv .src.has {
          opacity: 1;
          transform: none;
        }

        /* graphic shell shared by 4, 5 and 7 */
        .kb-agent .fig {
          border-radius: 16px;
          padding: 20px;
          background: var(--panel);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04);
          min-width: 0;
        }
        .kb-agent .fig .flab {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }
        .kb-agent .fig .flab b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 400;
        }
        .kb-agent .fig .flab span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.35);
        }

        .kb-agent .split {
          display: grid;
          grid-template-columns: 52fr 48fr;
          gap: 44px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .kb-agent .split {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        /* 4 ingestion */
        .kb-agent .pg {
          display: grid;
          grid-template-columns: 116px 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 520px) {
          .kb-agent .pg {
            grid-template-columns: 1fr;
          }
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
        .kb-agent .leaf .ln:nth-child(3n) {
          width: 72%;
        }
        .kb-agent .leaf .ln:nth-child(5n) {
          width: 86%;
        }
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
        .kb-agent .leaf.idx .pn {
          color: var(--accent);
        }
        .kb-agent .meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .kb-agent .mrow {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: baseline;
          padding: 8px 10px;
          border-radius: 7px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.09);
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kb-agent .mrow.shown {
          opacity: 1;
          transform: none;
        }
        .kb-agent .mrow b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.4;
          font-weight: 400;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .kb-agent .mrow span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.4;
          color: rgba(var(--ink-rgb), 0.85);
          word-break: break-word;
        }
        .kb-agent .idxchip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 13px;
          padding: 8px 11px;
          border-radius: 7px;
          background: rgba(var(--accent-rgb), 0.09);
          border: 0.5px solid rgba(var(--accent-rgb), 0.3);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kb-agent .idxchip.shown {
          opacity: 1;
          transform: none;
        }
        .kb-agent .qz {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
        }
        .kb-agent .qz .lab {
          margin-bottom: 10px;
        }
        .kb-agent .qc {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .kb-agent .qt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1;
          letter-spacing: 0.06em;
          padding: 7px 9px;
          border-radius: 6px;
          background: rgba(var(--ink-rgb), 0.04);
          border: 0.5px solid rgba(var(--ink-rgb), 0.13);
          color: rgba(var(--ink-rgb), 0.55);
        }

        /* 5 merge diagram */
        .kb-agent .mg {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          max-width: 760px;
        }
        .kb-agent .nd {
          border-radius: 9px;
          padding: 10px 12px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
        }
        .kb-agent .nd.pri {
          background: rgba(var(--accent-rgb), 0.06);
          border-color: rgba(var(--accent-rgb), 0.3);
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.42s,
            transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.42s;
        }
        .kb-agent .mg.go .nd.pri {
          opacity: 1;
          transform: none;
        }
        .kb-agent .nd .k {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
          margin-bottom: 6px;
        }
        .kb-agent .nd.pri .k {
          color: var(--accent);
        }
        .kb-agent .nd .v {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.78);
        }
        .kb-agent .nd .f {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.5);
          margin-top: 5px;
          word-break: break-word;
        }
        .kb-agent .stem {
          height: 15px;
          margin-left: 17px;
          border-left: 1px solid rgba(var(--ink-rgb), 0.18);
        }
        .kb-agent .legs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .kb-agent .leg {
          border-radius: 11px;
          padding: 13px 14px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
          min-width: 0;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kb-agent .mg.go .leg {
          opacity: 1;
          transform: none;
        }
        .kb-agent .mg.go .leg:nth-child(2) {
          transition-delay: 0.16s;
        }
        .kb-agent .leg .hd {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .kb-agent .leg .hd b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.06em;
          color: rgba(var(--ink-rgb), 0.6);
        }
        .kb-agent .leg .hd em {
          font-style: normal;
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.34);
        }
        .kb-agent .leg p {
          font-size: 11.5px;
          line-height: 1.55;
          color: rgba(var(--ink-rgb), 0.66);
          text-wrap: pretty;
        }
        .kb-agent .leg .out {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 11px;
          padding: 7px 10px;
          border-radius: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.4;
          letter-spacing: 0.05em;
          background: rgba(var(--ink-rgb), 0.04);
          border: 0.5px solid rgba(var(--ink-rgb), 0.13);
          color: rgba(var(--ink-rgb), 0.52);
        }
        /* The two legs sit directly above this bar at the 25% and 75% marks,
           which are their centers in the two-column grid, so the bar reads as
           the join without needing risers of its own. */
        .kb-agent .conv {
          position: relative;
          height: 26px;
        }
        .kb-agent .conv::before {
          content: '';
          position: absolute;
          left: 25%;
          right: 25%;
          top: 0;
          height: 1px;
          background: rgba(var(--accent-rgb), 0.35);
        }
        .kb-agent .conv::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(var(--accent-rgb), 0.35);
        }
        @media (max-width: 620px) {
          .kb-agent .legs {
            grid-template-columns: 1fr;
          }
          .kb-agent .conv::before {
            display: none;
          }
          .kb-agent .conv::after {
            left: 17px;
          }
        }
        .kb-agent .chipout {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 11px;
          padding: 7px 10px;
          border-radius: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.05em;
          background: rgba(var(--accent-rgb), 0.1);
          border: 0.5px solid rgba(var(--accent-rgb), 0.3);
          color: var(--accent);
        }
        .kb-agent .pipe {
          margin-top: 22px;
          max-width: 64ch;
          border-radius: 14px;
          padding: 16px 18px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .kb-agent .pipe .lab {
          margin-bottom: 12px;
          color: var(--accent);
          letter-spacing: 0.14em;
        }
        .kb-agent .prow {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 12px;
          padding: 7px 0;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.08);
        }
        .kb-agent .prow:first-of-type {
          border-top: 0;
        }
        .kb-agent .prow b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          line-height: 1.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--accent-rgb), 0.85);
        }
        .kb-agent .prow span {
          font-size: 12.5px;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.7);
        }
        @media (max-width: 520px) {
          .kb-agent .prow {
            grid-template-columns: 1fr;
            gap: 3px;
          }
        }

        /* 6 problem and fix cards */
        .kb-agent .fx {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 10px;
        }
        @media (max-width: 860px) {
          .kb-agent .fx {
            grid-template-columns: 1fr;
          }
        }
        .kb-agent .fc {
          border-radius: 14px;
          padding: 18px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.11);
        }
        .kb-agent .fc .seg + .seg {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .kb-agent .fc .seg .t {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .kb-agent .fc .seg .t b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 400;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .kb-agent .fc .seg.fix .t b {
          color: var(--accent);
        }
        .kb-agent .fc .seg .t i {
          width: 16px;
          height: 16px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--ink-rgb), 0.06);
          color: rgba(var(--ink-rgb), 0.45);
          flex: none;
        }
        .kb-agent .fc .seg.fix .t i {
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
        }
        .kb-agent .fc p {
          font-size: 0.9375rem;
          line-height: 1.65;
          color: rgba(var(--ink-rgb), 0.7);
          text-wrap: pretty;
        }
        .kb-agent .coda {
          margin-top: 22px;
          max-width: 70ch;
          font-size: 0.9688rem;
          line-height: 1.72;
          color: rgba(var(--ink-rgb), 0.68);
          text-wrap: pretty;
        }

        /* 7 capabilities */
        .kb-agent .caps {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .kb-agent .cap-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.04em;
          padding: 9px 11px;
          border-radius: 7px;
          cursor: pointer;
          background: rgba(var(--accent-rgb), 0.08);
          border: 0.5px solid rgba(var(--accent-rgb), 0.28);
          color: var(--accent);
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            background 0.18s, border-color 0.18s;
        }
        .kb-agent .cap-chip.shown {
          opacity: 1;
          transform: none;
        }
        .kb-agent .cap-chip:hover {
          background: rgba(var(--accent-rgb), 0.16);
          border-color: rgba(var(--accent-rgb), 0.45);
        }
        /* Accent is dark, so the selected chip takes light accent-ink text. */
        .kb-agent .cap-chip[aria-expanded='true'] {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-ink);
        }
        .kb-agent .capx {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s, margin 0.45s;
        }
        .kb-agent .capx.open {
          max-height: 320px;
          opacity: 1;
          margin-top: 13px;
        }
        .kb-agent .capx .box {
          padding: 14px 15px;
          border-radius: 9px;
          background: var(--panel-solid);
          border: 0.5px solid rgba(var(--accent-rgb), 0.26);
        }
        .kb-agent .capx .ct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: 0.05em;
          color: var(--accent);
          margin-bottom: 9px;
        }
        .kb-agent .capx .cb {
          font-size: 12.5px;
          line-height: 1.65;
          color: rgba(var(--ink-rgb), 0.74);
          text-wrap: pretty;
        }
        .kb-agent .capx .co {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
          padding: 7px 10px;
          border-radius: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.4;
          letter-spacing: 0.05em;
          background: rgba(var(--accent-rgb), 0.09);
          border: 0.5px solid rgba(var(--accent-rgb), 0.28);
          color: var(--accent);
        }

        /* 8 close */
        .kb-agent .close {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
          border-radius: 14px;
          padding: 20px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .kb-agent .close .t {
          flex: 1;
          min-width: 250px;
        }
        .kb-agent .close .t b {
          display: block;
          font-weight: 400;
          font-size: 1rem;
          color: rgba(var(--ink-rgb), 0.84);
          margin-bottom: 5px;
        }
        .kb-agent .close .t span {
          display: block;
          font-size: 0.875rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.58);
        }
        .kb-agent .close a.go {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 11px 14px;
          border-radius: 9px;
          background: rgba(var(--accent-rgb), 0.09);
          border: 0.5px solid rgba(var(--accent-rgb), 0.28);
          color: var(--accent);
          display: inline-flex;
          gap: 7px;
          align-items: center;
          transition: 0.18s;
        }
        .kb-agent .close a.go:hover {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
        }
        .kb-agent .rel {
          margin-top: 15px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .kb-agent .rel a {
          color: var(--accent);
        }

        @media (prefers-reduced-motion: reduce) {
          .kb-agent *,
          .kb-agent *::before,
          .kb-agent *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  )
}
