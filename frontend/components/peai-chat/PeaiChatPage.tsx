'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import {
  ANSWER_GROUPS,
  BOOK_TITLE,
  CITATIONS,
  INGESTION_META,
  LIVE_URL,
  PASS_1_FILTER,
  citationChipLabel,
} from '@/lib/peai-chat-data'

/**
 * One-shot scroll trigger.
 *
 * The handoff is specific that every reveal on this page fires once and does
 * not replay on scroll back, so the observer disconnects as soon as it fires
 * rather than toggling with intersection.
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

/** Titled shell shared by the three explanatory figures. */
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

export default function PeaiChatPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: reqRef, inView: reqIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: trustRef, inView: trustIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §3 grounding contrast: panels land, then the citation chip resolves at 850ms.
  const { ref: contrastRef, fired: contrastGo } = useOnceInView<HTMLDivElement>(0.4)

  // §4 ingestion: four metadata rows 400ms apart, then the page card is marked.
  const { ref: ingestRef, fired: ingestGo } = useOnceInView<HTMLDivElement>(0.25)
  const [metaShown, setMetaShown] = useState(0)
  const [indexed, setIndexed] = useState(false)
  useTimeline(ingestGo, [
    ...INGESTION_META.map((_, i) => ({ at: 260 + i * 400, run: () => setMetaShown(i + 1) })),
    { at: 260 + INGESTION_META.length * 400 + 240, run: () => setIndexed(true) },
  ])

  // §7 cited answer: groups 300ms apart, then citation chips 110ms apart.
  const { ref: answerRef, fired: answerGo } = useOnceInView<HTMLDivElement>(0.25)
  const [groupsShown, setGroupsShown] = useState(0)
  const [citesShown, setCitesShown] = useState(0)
  useTimeline(answerGo, [
    ...ANSWER_GROUPS.map((_, i) => ({ at: 240 + i * 300, run: () => setGroupsShown(i + 1) })),
    ...CITATIONS.map((_, i) => ({
      at: 240 + ANSWER_GROUPS.length * 300 + 180 + i * 110,
      run: () => setCitesShown(i + 1),
    })),
  ])

  const [openCitation, setOpenCitation] = useState<number | null>(null)
  const open = openCitation === null ? null : CITATIONS[openCitation]

  const reveal = (shown: boolean) =>
    `transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

  return (
    <div className="peai-chat min-h-screen">
      <TopNav subtitle="PEAI Chat Assistant" />

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
            <Eyebrow>Production RAG</Eyebrow>
            <div className="hero">
              <div>
                <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
                  Every answer, down to the page it came from
                </h1>
                <p className="lede">
                  A retrieval assistant on the AI Operating Partners homepage answers questions about the firm&rsquo;s book and
                  names the exact page behind every claim. The hard part was never the chat. It was preparing the PEAI book so
                  the system could prove where each answer came from.
                </p>
                <div className="credit">
                  <span className="chip a">Production RAG</span>
                  <span className="chip a">Page level citations</span>
                  <span className="chip">Two pass retrieval</span>
                  <span className="chip">Live on aioperatingpartners.ai</span>
                </div>
              </div>
              <div className="shot">
                <a href={LIVE_URL} target="_blank" rel="noopener">
                  <Image
                    src="/peai-chat/homepage-chat.png"
                    alt="The live assistant on the AI Operating Partners homepage"
                    width={1747}
                    height={973}
                    priority
                  />
                </a>
                <span className="cap">
                  <i />
                  Live on the homepage
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
                  Tasked with building the firm&rsquo;s book assistant, I designed and built the retrieval system behind it:
                  page level ingestion and metadata, a custom two pass routing layer in Python, the evaluation logic that
                  decides when the book has actually answered, the citation framework, and a standalone Flask app to test the
                  whole flow before it reached the live site. It runs today on the AI Operating Partners homepage.
                </p>
              </div>
              <div className="c">
                <p className="lab">What it demonstrates</p>
                <p>
                  Managed RAG services handle storage and similarity search. Source priority, honest fallback, and trustworthy
                  citations are left to you. I did not configure a chatbot. I found where its retrieval and citations failed,
                  built an orchestration layer and a test harness to fix them, and hardened it against real cases before it
                  went live.
                </p>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 3 The requirement ─────────────────────────────────────── */}
          <section ref={reqRef} className={reveal(reqIn)}>
            <Eyebrow>The requirement</Eyebrow>
            <Heading2 className="mb-[18px] max-w-[20ch]">
              A proprietary book is only useful if you can trust the source
            </Heading2>
            <p className="body">
              The assistant came with a hard requirement. Every answer had to be grounded in the author&rsquo;s own sources,
              and the PEAI book had to be the first place it looked, ahead of every other source. Only when the book genuinely
              could not answer was it allowed to reach into the wider library. And every answer had to name where it came
              from, so a reader could open the page and check it.
            </p>
            <p className="body mb-[30px]">
              Pinecone Assistant, the managed retrieval layer, does none of this on its own. Its filtering is all or nothing,
              with no way to rank the book above everything else, and no built in path from an answer back to a specific page.
              All of it had to be built on top.
            </p>
            <div ref={contrastRef} className={`gvu${contrastGo ? ' go' : ''}`}>
              <div className="gv">
                <p className="lab">Answer without grounding</p>
                <q>
                  Value creation in private equity usually comes from revenue growth, cost reduction and multiple expansion.
                </q>
                <span className="src none">No source</span>
              </div>
              <div className="gv ok">
                <p className="lab">Answer with page level grounding</p>
                <q>
                  Value creation in private equity usually comes from revenue growth, cost reduction and multiple expansion.
                </q>
                <span className="src has">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5v-15Z" />
                    <path d="M4 17h15" />
                  </svg>
                  Part 2: Value Drivers, Page 45
                </span>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 4 The foundation ──────────────────────────────────────── */}
          <section ref={foundRef} className={reveal(foundIn)}>
            <Eyebrow>The foundation</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[17ch]">Every page, prepared to be cited</Heading2>
            <div className="split" ref={ingestRef}>
              <div>
                <p className="body mb-0">
                  The most important work happened before a single question was asked. Each page of the PEAI book was ingested
                  as its own unit and tagged with structured metadata: the section it sits in, that section&rsquo;s title, and
                  its true page number. Clean, consistent metadata is what made the chunking reliable and kept every chunk
                  traceable to the exact page it came from. The same preparation runs across the wider library, so a citation
                  is always available.
                </p>
              </div>
              <Figure name="One page, one citable unit" category="Ingestion">
                <div className="pg">
                  <div className={`leaf${indexed ? ' idx' : ''}`}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="ln" />
                    ))}
                    <p className="pn">p. 45</p>
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
                  Traceable to the exact page
                </span>
              </Figure>
            </div>
          </section>

          <Divider />

          {/* ── 5 The system ──────────────────────────────────────────── */}
          <section ref={sysRef} className={reveal(sysIn)}>
            <Eyebrow>The system</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[19ch]">Book first, with a fallback that knows when to step in</Heading2>
            <div className="split">
              <div>
                <p className="body">
                  Every question runs in two passes. Pass 1 searches the PEAI book only. An evaluation step reads the result
                  and decides whether the book actually answered. If it did, the system stops there and cites the pages. If it
                  did not, Pass 2 opens the search to the wider library of other books, course materials, interviews, and
                  podcast transcripts.
                </p>
                <p className="body mb-0">
                  The citations follow the source. Answers from the PEAI book get the exact chapter, section, and page.
                  Answers from anywhere else name the source without a page, because that precision only exists for the book.
                </p>
              </div>
              <Figure name="Two pass routing" category="Both paths">
                <div className="br">
                  <div className="nd">
                    <p className="k">Question</p>
                    <p className="v">What are the main PEAI value drivers?</p>
                  </div>
                  <div className="stem" />
                  <div className="nd">
                    <p className="k">Pass 1 &middot; PEAI book only</p>
                    <p className="v">Retrieve from the book, nothing else.</p>
                    <p className="f">{PASS_1_FILTER}</p>
                  </div>
                  <div className="stem" />
                  <div className="nd">
                    <p className="k">Evaluation check</p>
                    <p className="v">Did the book actually answer?</p>
                  </div>
                  <div className="yoke">
                    <i />
                  </div>
                  <div className="arms">
                    <div className="arm pri">
                      <div className="hd">
                        <b>Book answers</b>
                        <em>Primary</em>
                      </div>
                      <p>The system stops at Pass 1.</p>
                      <span className="out">
                        <Glyph d={CHECK_PATH} />
                        Cited to the exact page
                      </span>
                    </div>
                    <div className="arm">
                      <div className="hd">
                        <b>Book falls short</b>
                        <em>Fallback</em>
                      </div>
                      <p>Pass 2 opens the wider library.</p>
                      <span className="out">Source named, no page</span>
                    </div>
                  </div>
                </div>
              </Figure>
            </div>
          </section>

          <Divider />

          {/* ── 6 Making it trustworthy ───────────────────────────────── */}
          <section ref={trustRef} className={reveal(trustIn)}>
            <Eyebrow>The hard part</Eyebrow>
            <Heading2 className="mb-5 max-w-[18ch]">Teaching it to admit what the book doesn&rsquo;t say</Heading2>
            <p className="body mb-[30px]">
              Pinecone does not rank one source above another on its own, and prompt instructions alone did not enforce it.
              The two pass routing handled the ordering. The harder problem was judgment. The model would rather build a
              plausible answer out of loosely related book pages than admit the book did not cover the question. Asked for the
              ideal acquisition asset for a private equity firm, it conceded the book never defined one, then kept talking
              about AI value creation and cited those pages anyway. The fix was an acceptance check in the application layer:
              no-information phrases, a citation presence test, and rules for detecting thin book coverage, so the system
              recognizes when the book fell short and hands off instead of faking an answer.
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
                    A right answer, a wrong citation. Asked how many dimensions the human brain can visualize, the assistant
                    answered correctly from a course transcript, then cited Chapter 2, Page 18 of the book, a page that said
                    nothing about it.
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
                    Two filtered retrieval passes, plus citation rules moved into the application layer. Book answers carry
                    page citations. Answers from other sources have them stripped. A wrong page can no longer ride along with
                    a right answer.
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
                    Six citations where one would do. Asked for the parts of the AI tech stack, the assistant cited six
                    separate pages across Chapter 10, when Page 97 introduced all four layers by itself.
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
                    Citation discipline in the system prompt. Prefer the page that holds most of the answer. Default to the
                    single page that defines a concept. Cap citations at two. Collapse consecutive pages into a range.
                  </p>
                </div>
              </div>
            </div>
            <p className="coda">
              None of this came from one lucky prompt. I ran the system against questions the book covered, questions only the
              supplemental material covered, and ambiguous questions where both overlapped, and tightened the prompt and the
              Python logic against each failure. Citation selection is better, not perfect, and I know where it still slips.
              That gap is the kind of thing production RAG lives and dies on.
            </p>
          </section>

          <Divider />

          {/* ── 7 In practice ─────────────────────────────────────────── */}
          <section ref={pracRef} className={reveal(pracIn)}>
            <Eyebrow>In practice</Eyebrow>
            <Heading2 className="mb-[22px] max-w-[18ch]">A real answer, and exactly where it came from</Heading2>
            <div className="split" ref={answerRef}>
              <div>
                <p className="body">
                  Ask it for the main PEAI value drivers and it returns the three groups and ten levers, then lists the pages
                  behind the answer. Part 2, pages 45 and 46. Chapter 6, pages 47 and 50. Nothing to take on faith.
                </p>
                <p className="body mb-0">Select any source to open it out to book, section and page.</p>
              </div>
              <Figure name="A cited answer" category="In practice">
                <div className="ans">
                  <p className="q">What are the main PEAI value drivers?</p>
                  <div className="ansg">
                    {ANSWER_GROUPS.map(({ group, levers }, i) => (
                      <div key={group} className={`grp${i < groupsShown ? ' shown' : ''}`}>
                        <b>{group}</b>
                        <span>{levers}</span>
                      </div>
                    ))}
                  </div>
                  <p className="lab citlab">Sources</p>
                  <div className="cits">
                    {CITATIONS.map((citation, i) => (
                      <button
                        key={`${citation.section}-${citation.page}`}
                        type="button"
                        className={`cit${i < citesShown ? ' shown' : ''}`}
                        aria-expanded={openCitation === i}
                        onClick={() => setOpenCitation(openCitation === i ? null : i)}
                      >
                        {citationChipLabel(citation)}
                      </button>
                    ))}
                  </div>
                  <div className={`citx${open ? ' open' : ''}`}>
                    <div className="box">
                      {open && (
                        <dl>
                          <div className="r">
                            <dt>Book</dt>
                            <dd>{BOOK_TITLE}</dd>
                          </div>
                          <div className="r">
                            <dt>Section</dt>
                            <dd>{open.section}</dd>
                          </div>
                          <div className="r">
                            <dt>Page</dt>
                            <dd>Page {open.page}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
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
                <b>Ask it yourself</b>
                <span>
                  The assistant is live on the AI Operating Partners homepage. Ask it anything about the book and watch it
                  name the page.
                </span>
              </div>
              <a className="go" href={`${LIVE_URL}/`} target="_blank" rel="noopener">
                Open the live assistant
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
            <p className="rel">
              Related work &middot; <Link href="/projects/peai-book-ml-model-matrix">PEAI Book, ML Model Matrix</Link> &middot;
              same client, same book
            </p>
          </section>
        </div>
      </main>

      <style jsx global>{`
        /* Scoped under .peai-chat so nothing here can reach another route. */
        .peai-chat .backlink {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 30px;
          font-size: 11px;
          color: rgba(var(--ink-rgb), 0.6);
          transition: color 0.18s;
        }
        .peai-chat .backlink:hover {
          color: var(--accent);
        }
        .peai-chat .lab {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.48);
        }
        .peai-chat p.body {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: 64ch;
          margin-bottom: 1rem;
          text-wrap: pretty;
        }

        /* 1 hero. The screenshot track is pinned, not auto: with auto the
           image's intrinsic size governs and the text column reads as skinny. */
        .peai-chat .hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 430px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1060px) {
          .peai-chat .hero {
            grid-template-columns: 1fr;
            gap: 34px;
          }
        }
        .peai-chat .hero .lede {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: none;
          text-wrap: pretty;
        }
        .peai-chat .credit {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 26px;
        }
        .peai-chat .chip {
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
        .peai-chat .chip.a {
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.22);
          color: var(--accent);
        }
        .peai-chat .shot {
          display: flex;
          flex-direction: column;
          gap: 11px;
          align-items: flex-start;
          width: 100%;
          justify-self: end;
          max-width: min(430px, 100%);
        }
        .peai-chat .shot a {
          display: block;
          border-radius: 11px;
          overflow: hidden;
          border: 0.5px solid rgba(var(--ink-rgb), 0.18);
          box-shadow: 0 24px 54px -32px rgba(var(--ink-rgb), 0.8);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-chat .shot a:hover {
          transform: translateY(-3px);
          box-shadow: 0 30px 64px -32px rgba(var(--ink-rgb), 0.85);
        }
        .peai-chat .shot img {
          display: block;
          width: 100%;
          height: auto;
        }
        .peai-chat .shot .cap {
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
        .peai-chat .shot .cap i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          display: block;
          animation: peai-chat-pulse 2.2s ease-in-out infinite;
        }
        @keyframes peai-chat-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.28;
          }
        }

        /* 2 what I built */
        .peai-chat .two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          margin-top: 10px;
        }
        @media (max-width: 860px) {
          .peai-chat .two {
            grid-template-columns: 1fr;
            gap: 28px;
          }
        }
        .peai-chat .two .c {
          padding-right: 46px;
        }
        .peai-chat .two .c + .c {
          padding: 0 0 0 46px;
          border-left: 1px solid rgba(var(--ink-rgb), 0.1);
        }
        @media (max-width: 860px) {
          .peai-chat .two .c,
          .peai-chat .two .c + .c {
            padding: 0;
            border: 0;
          }
        }
        .peai-chat .two .lab {
          color: var(--accent);
          margin-bottom: 12px;
          letter-spacing: 0.14em;
        }
        .peai-chat .two p {
          font-size: 0.9688rem;
          line-height: 1.72;
          color: rgba(var(--ink-rgb), 0.7);
          text-wrap: pretty;
        }

        /* 3 requirement contrast */
        .peai-chat .gvu {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          max-width: 800px;
          margin-top: 8px;
        }
        @media (max-width: 760px) {
          .peai-chat .gvu {
            grid-template-columns: 1fr;
          }
        }
        .peai-chat .gv {
          border-radius: 13px;
          padding: 16px 17px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-chat .gvu.go .gv {
          opacity: 1;
          transform: none;
        }
        .peai-chat .gvu.go .gv:nth-child(2) {
          transition-delay: 0.28s;
        }
        .peai-chat .gv.ok {
          background: rgba(var(--accent-rgb), 0.05);
          border-color: rgba(var(--accent-rgb), 0.22);
        }
        .peai-chat .gv .lab {
          margin-bottom: 11px;
        }
        .peai-chat .gv.ok .lab {
          color: var(--accent);
        }
        .peai-chat .gv q {
          display: block;
          quotes: none;
          font-size: 0.9375rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.7);
        }
        .peai-chat .gv .src {
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
        .peai-chat .gv .src.none {
          background: transparent;
          border: 0.5px dashed rgba(var(--ink-rgb), 0.22);
          color: rgba(var(--ink-rgb), 0.4);
        }
        .peai-chat .gv .src.has {
          background: rgba(var(--accent-rgb), 0.1);
          border: 0.5px solid rgba(var(--accent-rgb), 0.3);
          color: var(--accent);
          opacity: 0;
          transform: translateY(4px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s;
        }
        .peai-chat .gvu.go .gv .src.has {
          opacity: 1;
          transform: none;
        }

        /* graphic shell shared by 4, 5 and 7 */
        .peai-chat .fig {
          border-radius: 16px;
          padding: 20px;
          background: var(--panel);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04);
          min-width: 0;
        }
        .peai-chat .fig .flab {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }
        .peai-chat .fig .flab b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 400;
        }
        .peai-chat .fig .flab span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.35);
        }

        /* 4 ingestion */
        .peai-chat .split {
          display: grid;
          grid-template-columns: 52fr 48fr;
          gap: 44px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .peai-chat .split {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
        .peai-chat .pg {
          display: grid;
          grid-template-columns: 116px 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 520px) {
          .peai-chat .pg {
            grid-template-columns: 1fr;
          }
        }
        .peai-chat .leaf {
          border-radius: 7px;
          padding: 13px 11px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.14);
          transition: border-color 0.6s, box-shadow 0.6s;
        }
        .peai-chat .leaf.idx {
          border-color: rgba(var(--accent-rgb), 0.45);
          box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.14);
        }
        .peai-chat .leaf .ln {
          height: 4px;
          border-radius: 3px;
          background: rgba(var(--ink-rgb), 0.13);
          margin-bottom: 6px;
        }
        .peai-chat .leaf .ln:nth-child(3n) {
          width: 72%;
        }
        .peai-chat .leaf .ln:nth-child(5n) {
          width: 86%;
        }
        .peai-chat .leaf .pn {
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
        .peai-chat .leaf.idx .pn {
          color: var(--accent);
        }
        .peai-chat .meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .peai-chat .mrow {
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
        .peai-chat .mrow.shown {
          opacity: 1;
          transform: none;
        }
        .peai-chat .mrow b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.4;
          font-weight: 400;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-chat .mrow span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.4;
          color: rgba(var(--ink-rgb), 0.85);
          word-break: break-word;
        }
        .peai-chat .idxchip {
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
        .peai-chat .idxchip.shown {
          opacity: 1;
          transform: none;
        }

        /* 5 branch diagram, static, both paths visible */
        .peai-chat .br {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          max-width: 760px;
        }
        .peai-chat .nd {
          border-radius: 9px;
          padding: 10px 12px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
        }
        .peai-chat .nd .k {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
          margin-bottom: 6px;
        }
        .peai-chat .nd .v {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.78);
        }
        .peai-chat .nd .f {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.5);
          margin-top: 5px;
          word-break: break-word;
        }
        .peai-chat .stem {
          height: 15px;
          margin-left: 17px;
          border-left: 1px solid rgba(var(--ink-rgb), 0.18);
        }
        .peai-chat .yoke {
          position: relative;
          height: 17px;
          margin: 0 25%;
        }
        .peai-chat .yoke::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: rgba(var(--ink-rgb), 0.18);
        }
        .peai-chat .yoke::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(var(--ink-rgb), 0.18);
        }
        .peai-chat .yoke i {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(var(--ink-rgb), 0.18);
        }
        .peai-chat .arms {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 620px) {
          .peai-chat .arms {
            grid-template-columns: 1fr;
          }
          .peai-chat .yoke {
            display: none;
          }
        }
        .peai-chat .arm {
          border-radius: 11px;
          padding: 13px 14px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
          min-width: 0;
        }
        .peai-chat .arm.pri {
          background: rgba(var(--accent-rgb), 0.06);
          border-color: rgba(var(--accent-rgb), 0.3);
        }
        .peai-chat .arm .hd {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .peai-chat .arm .hd b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.06em;
          color: rgba(var(--ink-rgb), 0.6);
        }
        .peai-chat .arm.pri .hd b {
          color: var(--accent);
        }
        .peai-chat .arm .hd em {
          font-style: normal;
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.34);
        }
        .peai-chat .arm p {
          font-size: 11.5px;
          line-height: 1.55;
          color: rgba(var(--ink-rgb), 0.66);
          text-wrap: pretty;
        }
        .peai-chat .arm .out {
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
          background: rgba(var(--ink-rgb), 0.04);
          border: 0.5px solid rgba(var(--ink-rgb), 0.13);
          color: rgba(var(--ink-rgb), 0.52);
        }
        .peai-chat .arm.pri .out {
          background: rgba(var(--accent-rgb), 0.1);
          border-color: rgba(var(--accent-rgb), 0.3);
          color: var(--accent);
        }

        /* 6 failure and fix cards */
        .peai-chat .fx {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 10px;
        }
        @media (max-width: 860px) {
          .peai-chat .fx {
            grid-template-columns: 1fr;
          }
        }
        .peai-chat .fc {
          border-radius: 14px;
          padding: 18px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.11);
        }
        .peai-chat .fc .seg + .seg {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-chat .fc .seg .t {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 9px;
        }
        .peai-chat .fc .seg .t b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 400;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-chat .fc .seg.fix .t b {
          color: var(--accent);
        }
        .peai-chat .fc .seg .t i {
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
        .peai-chat .fc .seg.fix .t i {
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
        }
        .peai-chat .fc p {
          font-size: 0.9375rem;
          line-height: 1.65;
          color: rgba(var(--ink-rgb), 0.7);
          text-wrap: pretty;
        }
        .peai-chat .coda {
          margin-top: 22px;
          max-width: 70ch;
          font-size: 0.9688rem;
          line-height: 1.72;
          color: rgba(var(--ink-rgb), 0.68);
          text-wrap: pretty;
        }

        /* 7 cited answer */
        .peai-chat .ans {
          max-width: 640px;
        }
        .peai-chat .q {
          display: inline-block;
          max-width: 92%;
          padding: 10px 13px;
          border-radius: 12px 12px 12px 3px;
          background: rgba(var(--ink-rgb), 0.055);
          border: 0.5px solid rgba(var(--ink-rgb), 0.09);
          font-size: 12.5px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.8);
          margin-bottom: 15px;
        }
        .peai-chat .ansg {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .peai-chat .grp {
          padding: 11px 13px;
          border-radius: 9px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          opacity: 0;
          transform: translateY(7px);
          transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-chat .grp.shown {
          opacity: 1;
          transform: none;
        }
        .peai-chat .grp b {
          display: block;
          font-size: 11.5px;
          font-weight: 500;
          line-height: 1;
          color: var(--accent);
          margin-bottom: 6px;
        }
        .peai-chat .grp span {
          font-size: 11.5px;
          line-height: 1.55;
          color: rgba(var(--ink-rgb), 0.62);
        }
        .peai-chat .citlab {
          margin: 17px 0 9px;
          letter-spacing: 0.14em;
        }
        .peai-chat .cits {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .peai-chat .cit {
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
        .peai-chat .cit.shown {
          opacity: 1;
          transform: none;
        }
        .peai-chat .cit:hover {
          background: rgba(var(--accent-rgb), 0.16);
          border-color: rgba(var(--accent-rgb), 0.45);
        }
        /* Accent is dark, so the selected chip takes light accent-ink text. */
        .peai-chat .cit[aria-expanded='true'] {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-ink);
        }
        .peai-chat .citx {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s, margin 0.45s;
        }
        .peai-chat .citx.open {
          max-height: 170px;
          opacity: 1;
          margin-top: 11px;
        }
        .peai-chat .citx .box {
          padding: 12px 13px;
          border-radius: 9px;
          background: var(--panel-solid);
          border: 0.5px solid rgba(var(--accent-rgb), 0.26);
        }
        .peai-chat .citx .r {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 11px;
          padding: 6px 0;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.08);
        }
        .peai-chat .citx .r:first-child {
          border-top: 0;
        }
        .peai-chat .citx .r dt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1.5;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-chat .citx .r dd {
          font-size: 11.5px;
          line-height: 1.5;
          color: rgba(var(--ink-rgb), 0.8);
          margin: 0;
        }

        /* 8 close */
        .peai-chat .close {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
          border-radius: 14px;
          padding: 20px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-chat .close .t {
          flex: 1;
          min-width: 250px;
        }
        .peai-chat .close .t b {
          display: block;
          font-weight: 400;
          font-size: 1rem;
          color: rgba(var(--ink-rgb), 0.84);
          margin-bottom: 5px;
        }
        .peai-chat .close .t span {
          display: block;
          font-size: 0.875rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.58);
        }
        .peai-chat .close a.go {
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
        .peai-chat .close a.go:hover {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
        }
        .peai-chat .rel {
          margin-top: 15px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-chat .rel a {
          color: var(--accent);
        }

        @media (prefers-reduced-motion: reduce) {
          .peai-chat *,
          .peai-chat *::before,
          .peai-chat *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  )
}
