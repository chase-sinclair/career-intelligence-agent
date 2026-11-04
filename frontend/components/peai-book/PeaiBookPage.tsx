'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import AbilityGrid, { WorkedExamplePills, useAbilityGrid, type GridMode } from '@/components/peai-book/AbilityGrid'
import { BAYESIAN_ROWS, BOOK } from '@/lib/peai-book-data'

/** One-shot scroll trigger whose observer disconnects as soon as it fires. */
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

const CHAPTER_MODES: ReadonlyArray<GridMode> = ['intro', 'explore', 'worked']

export default function PeaiBookPage() {
  const { ref: contribRef, inView: contribIn } = useInView({ threshold: 0.08 })
  const { ref: problemRef, inView: problemIn } = useInView({ threshold: 0.08 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.12 })

  // §3 jargon-to-plain panels: one shot, never replays.
  const { ref: swapRef, fired: swapGo } = useOnceInView<HTMLDivElement>(0.35)

  // §4-6 chapter.
  const [mode, setMode] = useState<GridMode>('intro')
  const ownsRefs = useRef<Array<HTMLDivElement | null>>([])
  const { ref: ideaRef, fired: cellsRevealed } = useOnceInView<HTMLElement>(0.12)
  const { shownCells, selected, example, toggleAbility, pickExample } = useAbilityGrid(mode, cellsRevealed)

  const [sectionsIn, setSectionsIn] = useState<boolean[]>([false, false, false])

  /**
   * Exactly one narrative section owns the grid at any scroll position.
   *
   * This is measured per frame rather than derived from IntersectionObserver.
   * Each narrative section's box extends 42vh past its last line of text, so
   * several padded boxes intersect any reasonable band at once and the last in
   * document order would silently win, flipping the grid to `explore` while
   * the reader is still part way through §3. Measuring the distance from an
   * anchor line to each section's inner `.owns` block gives one unambiguous
   * winner. Distance is 0 while the anchor sits inside a block, so the owner
   * changes only when the anchor actually crosses out of one: no hysteresis
   * needed and no flicker at the boundaries.
   *
   * The anchor sits higher on desktop (33%) than narrow (62%) because the grid
   * is beside the text on desktop and above it on narrow.
   */
  const syncMode = useCallback(() => {
    const anchor = window.innerHeight * (window.innerWidth <= 1000 ? 0.62 : 0.33)
    let best = -1
    let bestDistance = Infinity
    ownsRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = anchor < r.top ? r.top - anchor : anchor > r.bottom ? anchor - r.bottom : 0
      if (d < bestDistance) {
        bestDistance = d
        best = i
      }
    })
    if (best >= 0) setMode(CHAPTER_MODES[best])
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        syncMode()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncMode)
    syncMode()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncMode)
    }
  }, [syncMode])

  // Reveal classes for the three chapter sections, kept separate from mode
  // ownership: the two concerns do not share a trigger.
  useEffect(() => {
    const observers = ownsRefs.current.map((el, i) => {
      if (!el) return null
      const o = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setSectionsIn((prev) => {
                if (prev[i]) return prev
                const next = [...prev]
                next[i] = true
                return next
              })
              o.disconnect()
              return
            }
          }
        },
        { threshold: 0.12 },
      )
      o.observe(el)
      return o
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  const [pagesOpen, setPagesOpen] = useState(false)

  const reveal = (shown: boolean) =>
    `transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

  return (
    <div className="peai-book min-h-screen">
      <TopNav subtitle="PEAI Book · ML Model Matrix" />

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
            <Eyebrow>Published contribution</Eyebrow>
            <div className="hero">
              <div>
                <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-5 max-w-[17ch]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
                  The matrix that turns a business problem into a model choice
                </h1>
                <p className="lede">
                  Twelve atomic AI abilities, mapped to the model types, model families and training paradigms that
                  deliver each one, so a private equity operator with no ML training can get from{' '}
                  <em>&ldquo;we have a churn problem&rdquo;</em> to a specification a data scientist can build against.
                </p>
                <div className="credit">
                  <span className="chip a">Authored the matrix</span>
                  <span className="chip a">Peer reviewer</span>
                  <span className="chip">Published 2026</span>
                  <span className="chip">Technical to business translation</span>
                </div>
              </div>
              <div className="coverwrap">
                <Image
                  className="cover"
                  src="/peai/01_book_cover_FULL.jpeg"
                  alt="Cover of The Private Equity AI Operating Partner by Bruce Sinclair"
                  width={420}
                  height={652}
                  priority
                />
                <span className="meta">
                  Appendix 1 &middot; Ch. 1
                  <br />
                  Bruce Sinclair &middot; 2026
                </span>
              </div>
            </div>
          </header>

          <Divider />

          {/* ── 2 The Contribution ────────────────────────────────────── */}
          <section ref={contribRef} className={reveal(contribIn)}>
            <Eyebrow>The contribution</Eyebrow>
            <Heading2 className="mb-[26px] max-w-[16ch]">What I did on this book</Heading2>
            <div className="contrib">
              <div className="spine">
                <div className="sp">
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 9h18M9 9v11" />
                    </svg>
                  </span>
                  <div className="bd">
                    <p className="lab">The work</p>
                    <p>
                      I authored the model selection matrix: the &ldquo;Types of AI Models&rdquo; table that runs as
                      Appendix 1 of Chapter 1. It maps all twelve atomic abilities to the model types a practitioner
                      would actually reach for, the family each belongs to, and the training each needs.
                    </p>
                  </div>
                </div>

                <div className="sp">
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
                      <path d="M5 11v5c0 1.5 3.1 3 7 3s7-1.5 7-3v-5" />
                    </svg>
                  </span>
                  <div className="bd">
                    <p className="lab">The background</p>
                    <p>
                      I studied Computational Modeling and Data Analytics, and I keep current on models, methods and
                      stats through my own research and hands-on work, both teaching these techniques and running them
                      in real applications. The book&rsquo;s author, my father, brought me in for exactly that: a
                      current, practical read on how these models get built and used today. I designed the table, and a
                      technical audience reviewed it before it shipped.
                    </p>
                  </div>
                </div>

                <div className="sp">
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="9" cy="12" r="6" />
                      <circle cx="15" cy="12" r="6" />
                    </svg>
                  </span>
                  <div className="bd">
                    <p className="lab">The hard part</p>
                    <p>
                      Most of the work was in the simplification. Many of these models cross abilities. An autoencoder
                      earns a place under both anomaly detection and representation learning; a Bayesian method fits
                      half the rows. Mapping each ability to one clear, defensible set of models meant deciding what to
                      leave out, so the table stayed correct for a data scientist while staying usable for an operator
                      who will never train a model. It also had to merge cleanly with the author&rsquo;s twelve atomic
                      abilities and the rest of the book. Holding technical accuracy and plain readability at once is
                      the thing I do, and this is one published, checkable instance of it.
                    </p>

                    <div className="vis">
                      <p className="vlab">
                        For example<i>&mdash;</i>
                        <i>one model, several rows</i>
                      </p>
                      <div className="fan">
                        <span className="bay">Bayesian</span>
                        <div className="brk" />
                        <div className="rws">
                          {BAYESIAN_ROWS.map((r) => (
                            <div key={r.name} className="rw">
                              <b>{r.name}</b>
                              <span>Row {r.row}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="vcap">
                        Bayesian methods land in three rows of the finished table. They could defensibly sit in several
                        more. Every extra placement is one more thing the reader has to weigh, so the question was never
                        which models are related, it was how few placements each ability could survive on.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sp">
                  <span className="ic">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
                    </svg>
                  </span>
                  <div className="bd">
                    <p className="lab">One more thing</p>
                    <p>
                      It happened to be private equity. The same table would serve a fintech or healthcare audience
                      unchanged, because the hard part was never the industry. It was the translation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="loc">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v18H5.5A1.5 1.5 0 0 1 4 19.5v-15Z" />
                  <path d="M4 17h15" />
                </svg>
                Appendix 1 &middot; Chapter 1 &middot; pp. 13&ndash;14
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 3 The Problem ─────────────────────────────────────────── */}
          <section ref={problemRef} className={reveal(problemIn)}>
            <Eyebrow>The translation gap</Eyebrow>
            <Heading2 className="mb-[18px] max-w-[20ch]">
              Operators have to make AI calls in a language they don&rsquo;t speak
            </Heading2>
            <p className="body">
              A private equity operating partner is accountable for whether an AI investment creates value. That
              decision gets made in a vocabulary of model families, training paradigms and supervision regimes, and that
              vocabulary belongs to data scientists. So the conversation stalls in both directions. The operator cannot
              specify what they need, and the technical partner cannot tell whether what is being asked for is the right
              thing to build.
            </p>
            <p className="body mb-7">
              Closing that gap does not mean teaching executives machine learning. It means giving both sides one
              vocabulary that maps cleanly onto the other.
            </p>
            <div ref={swapRef} className={`swap${swapGo ? ' go' : ''}`}>
              <div className="side">
                <p className="lab">What the operator hears</p>
                {/* Lines are wrapped so nth-child counts only the lines: with a
                    bare <p class="lab"> heading as sibling number one, every
                    delay would shift by one and the last line would match no
                    rule at all, arriving first at zero delay. */}
                <div className="lns">
                  <p className="ln">&ldquo;We&rsquo;ll need a supervised gradient-boosted ensemble.&rdquo;</p>
                  <p className="ln">&ldquo;Probably an unsupervised clustering approach.&rdquo;</p>
                  <p className="ln">&ldquo;That&rsquo;s a self-supervised representation problem.&rdquo;</p>
                </div>
              </div>
              <div className="ar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 9h16M4 9l4-4M4 9l4 4M20 15H4M20 15l-4-4M20 15l-4 4" />
                </svg>
              </div>
              <div className="side r">
                <p className="lab">What they need to say</p>
                <div className="lns">
                  <p className="ln">
                    &ldquo;<strong>Predict</strong> which accounts churn next quarter.&rdquo;
                  </p>
                  <p className="ln">
                    &ldquo;<strong>Group</strong> our customers by buying behaviour.&rdquo;
                  </p>
                  <p className="ln">
                    &ldquo;<strong>Interpret</strong> what the support logs are telling us.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 4-6 The grid chapter ──────────────────────────────────────
              .gridcol is FIRST in source order on purpose. Under 1000px the
              chapter becomes display:block so the sticky column has real
              travel, and `order` has no effect once the container is a block,
              so placement on desktop is done with explicit grid-column and
              grid-row instead. */}
          <div className="chapter">
            <AbilityGrid
              mode={mode}
              shownCells={shownCells}
              selected={selected}
              example={example}
              onToggleAbility={toggleAbility}
            />

            <div className="narr">
              <section ref={ideaRef} className={reveal(sectionsIn[0])}>
                <div
                  className="owns"
                  ref={(el) => {
                    ownsRefs.current[0] = el
                  }}
                >
                  <Eyebrow>The shared vocabulary</Eyebrow>
                  <Heading2 className="mb-[18px] max-w-[18ch]">Twelve abilities, three families</Heading2>
                  <p className="body">
                    The book&rsquo;s first principle is that any AI solution, however elaborate, can be described as a
                    combination of twelve atomic abilities. Each one is a verb an operator already understands, like
                    classify, group, predict and create, and each has a precise technical meaning underneath.
                  </p>
                  <p className="body">
                    Arranged as a periodic table, they fall into three families by what they do to information.{' '}
                    <em>Perceive</em> senses and structures data, <em>Reason</em> analyses patterns and extracts
                    meaning, <em>Act</em> decides, forecasts and generates outputs. Within each column the abilities
                    climb in sophistication.
                  </p>
                  <p className="body">
                    The abilities and their definitions are the book&rsquo;s. What they were missing was the other half
                    of the translation.
                  </p>
                </div>
              </section>

              <section className={reveal(sectionsIn[1])}>
                <div
                  className="owns"
                  ref={(el) => {
                    ownsRefs.current[1] = el
                  }}
                >
                  <Eyebrow>The artifact</Eyebrow>
                  <Heading2 className="mb-[18px] max-w-[19ch]">Every ability, mapped to the models that deliver it</Heading2>
                  <p className="body">
                    This is the contribution. For all twelve abilities, the model types a practitioner would actually
                    reach for, the family those models belong to, and the training paradigm each requires. It runs as
                    Appendix 1 of Chapter 1.
                  </p>
                  <p className="body">
                    The vocabulary stays real. <span className="tt">Isolation Forest</span>,{' '}
                    <span className="tt">Chain-of-Thought</span> and <span className="tt">Contrastive Learning</span>{' '}
                    all appear by name. What gets simplified is the structure: one clear mapping per ability, not the
                    full truth that most of these models can wear several hats.
                  </p>
                  <p className="body mb-0">Select any ability in the table to see its row.</p>
                  <div className={`reveal${pagesOpen ? ' on' : ''}`}>
                    <button type="button" aria-expanded={pagesOpen} onClick={() => setPagesOpen((v) => !v)}>
                      See it in the book
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <div className="pages">
                      <figure>
                        <Image src="/peai/03_ml_model_matrix_p13.png" alt="Printed matrix, page 13" width={1030} height={1592} />
                        <figcaption>Appendix 1 &middot; p. 13</figcaption>
                      </figure>
                      <figure>
                        <Image src="/peai/04_ml_model_matrix_p14.png" alt="Printed matrix, page 14" width={1030} height={1592} />
                        <figcaption>Appendix 1 &middot; p. 14</figcaption>
                      </figure>
                    </div>
                  </div>
                </div>
              </section>

              <section className={reveal(sectionsIn[2])}>
                <div
                  className="owns"
                  ref={(el) => {
                    ownsRefs.current[2] = el
                  }}
                >
                  <Eyebrow>How it&rsquo;s used</Eyebrow>
                  <Heading2 className="mb-[18px] max-w-[18ch]">From business problem to model requirements</Heading2>
                  <p className="body">
                    In use it runs one direction. Start with the problem, describe the solution as a short string of
                    abilities, then read off what each one needs. The operator does the first two steps in plain
                    language. The matrix does the third.
                  </p>
                  <p className="body mb-0">These four are the book&rsquo;s own worked examples.</p>
                  <WorkedExamplePills example={example} onPick={pickExample} />
                </div>
              </section>
            </div>
          </div>

          <Divider />

          {/* ── 7 Close ───────────────────────────────────────────────── */}
          <section ref={closeRef} className={reveal(closeIn)}>
            <div className="close">
              <Image
                src="/peai/01_book_cover_FULL.jpeg"
                alt="Cover of The Private Equity AI Operating Partner"
                width={420}
                height={652}
              />
              <div className="t">
                <b>{BOOK.title}</b>
                <span>
                  {BOOK.subtitle} &middot; {BOOK.author} &middot; {BOOK.publisher}, {BOOK.year} &middot; ISBN{' '}
                  {BOOK.isbn}
                </span>
              </div>
              <a className="go" href={BOOK.url} target="_blank" rel="noopener">
                View the book
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        /* Scoped under .peai-book so nothing here can reach another route.
           Base rules first; the compact breakpoint block is LAST in this
           sheet on purpose. See the note above it. */
        .peai-book .backlink {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 30px;
          font-size: 11px;
          color: rgba(var(--ink-rgb), 0.6);
          transition: color 0.18s;
        }
        .peai-book .backlink:hover {
          color: var(--accent);
        }
        .peai-book p.body {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: 64ch;
          margin-bottom: 1rem;
          text-wrap: pretty;
        }
        .peai-book p.body em {
          font-style: normal;
          color: var(--accent);
        }
        .peai-book .tt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          color: rgba(var(--ink-rgb), 0.68);
        }

        /* hero */
        .peai-book .hero {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .peai-book .hero {
            grid-template-columns: 1fr;
          }
        }
        .peai-book .hero .lede {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.72);
          max-width: 58ch;
          text-wrap: pretty;
        }
        .peai-book .hero .lede em {
          font-style: normal;
          color: var(--accent);
        }
        .peai-book .cover {
          display: block;
          width: 168px;
          height: auto;
          border-radius: 3px;
          box-shadow: 0 18px 40px -22px rgba(var(--ink-rgb), 0.55), 0 2px 6px -2px rgba(var(--ink-rgb), 0.2);
        }
        .peai-book .coverwrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
        .peai-book .coverwrap .meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.6;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.5);
        }
        .peai-book .credit {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 26px;
        }
        .peai-book .chip {
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
        .peai-book .chip.a {
          background: rgba(var(--accent-rgb), 0.08);
          border-color: rgba(var(--accent-rgb), 0.22);
          color: var(--accent);
        }

        /* 2 contribution spine */
        .peai-book .contrib {
          display: block;
          max-width: 900px;
          margin-top: 14px;
        }
        .peai-book .spine {
          position: relative;
          min-width: 0;
        }
        .peai-book .spine::before {
          content: '';
          position: absolute;
          left: 14px;
          top: 18px;
          bottom: 20px;
          width: 1px;
          background: rgba(var(--ink-rgb), 0.12);
        }
        .peai-book .sp {
          position: relative;
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 14px;
          padding-bottom: 22px;
        }
        .peai-book .sp:last-child {
          padding-bottom: 0;
        }
        .peai-book .sp .ic {
          position: relative;
          z-index: 1;
          width: 29px;
          height: 29px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--panel-solid);
          border: 0.5px solid rgba(var(--accent-rgb), 0.26);
          color: var(--accent);
        }
        .peai-book .sp .bd {
          min-width: 0;
          padding-top: 2px;
        }
        .peai-book .sp .lab {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 8px;
        }
        .peai-book .sp p {
          font-size: 0.9688rem;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.7);
          text-wrap: pretty;
          max-width: 70ch;
        }
        .peai-book .vis {
          border-radius: 14px;
          padding: 17px 18px;
          margin-top: 15px;
          max-width: 560px;
          background: var(--panel);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-book .vis .vlab {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1.5;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .peai-book .vis .vlab i {
          font-style: normal;
          white-space: nowrap;
          color: rgba(var(--ink-rgb), 0.42);
        }
        .peai-book .fan {
          display: grid;
          grid-template-columns: auto 20px 1fr;
          align-items: center;
        }
        .peai-book .bay {
          justify-self: start;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.04em;
          padding: 10px 12px;
          border-radius: 9px;
          background: var(--accent);
          color: var(--accent-ink);
          box-shadow: 0 6px 16px -10px rgba(var(--accent-rgb), 0.8);
        }
        .peai-book .brk {
          position: relative;
          align-self: stretch;
          margin: 6px 0;
        }
        .peai-book .brk::before {
          content: '';
          position: absolute;
          left: 9px;
          top: 12%;
          bottom: 12%;
          width: 1px;
          background: rgba(var(--accent-rgb), 0.4);
        }
        .peai-book .brk::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 10px;
          height: 1px;
          background: rgba(var(--accent-rgb), 0.4);
        }
        .peai-book .rws {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .peai-book .rw {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          border-radius: 9px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--accent-rgb), 0.22);
        }
        .peai-book .rw::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          width: 10px;
          height: 1px;
          background: rgba(var(--accent-rgb), 0.4);
        }
        .peai-book .rw b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.05em;
          color: var(--accent);
        }
        .peai-book .rw span {
          font-size: 10.5px;
          white-space: nowrap;
          color: rgba(var(--ink-rgb), 0.5);
          margin-left: auto;
        }
        .peai-book .vcap {
          font-size: 0.875rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.6);
          margin-top: 16px;
          padding-top: 14px;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
          text-wrap: pretty;
        }
        .peai-book .loc {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.5;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-book .loc svg {
          flex-shrink: 0;
          color: rgba(var(--accent-rgb), 0.6);
        }

        /* 3 jargon to plain */
        .peai-book .swap {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 18px;
          align-items: stretch;
          max-width: 760px;
          margin-top: 8px;
        }
        .peai-book .swap .side {
          border-radius: 12px;
          padding: 16px 18px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-book .swap .side.r {
          background: rgba(var(--accent-rgb), 0.05);
          border-color: rgba(var(--accent-rgb), 0.2);
        }
        .peai-book .swap .lab {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 11px;
          color: rgba(var(--ink-rgb), 0.5);
        }
        .peai-book .swap .side.r .lab {
          color: var(--accent);
        }
        .peai-book .swap .ln {
          font-size: 0.9375rem;
          line-height: 1.55;
          color: rgba(var(--ink-rgb), 0.68);
          padding: 5px 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-book .swap .ln strong {
          font-weight: 500;
          color: var(--accent);
        }
        .peai-book .swap.go .ln {
          opacity: 1;
          transform: none;
        }
        /* Lines live in their own .lns container, so nth-child counts lines
           only and every one of the six matches a rule. */
        .peai-book .swap .side .lns .ln:nth-child(1) {
          transition-delay: 0.05s;
        }
        .peai-book .swap .side .lns .ln:nth-child(2) {
          transition-delay: 0.17s;
        }
        .peai-book .swap .side .lns .ln:nth-child(3) {
          transition-delay: 0.29s;
        }
        .peai-book .swap .side.r .lns .ln:nth-child(1) {
          transition-delay: 0.86s;
        }
        .peai-book .swap .side.r .lns .ln:nth-child(2) {
          transition-delay: 0.98s;
        }
        .peai-book .swap .side.r .lns .ln:nth-child(3) {
          transition-delay: 1.1s;
        }
        .peai-book .swap .ar {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(var(--accent-rgb), 0.5);
        }
        .peai-book .swap .ar svg {
          opacity: 0.35;
        }
        .peai-book .swap.go .ar svg {
          animation: peai-book-arrow 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.56s 1 forwards;
        }
        @keyframes peai-book-arrow {
          0% {
            opacity: 0.35;
            transform: scale(1);
          }
          45% {
            opacity: 1;
            transform: scale(1.22);
            color: var(--accent);
          }
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
        }

        /* 4-6 chapter: narrative left, sticky grid right */
        .peai-book .chapter {
          display: grid;
          grid-template-columns: 44fr 56fr;
          gap: 56px;
          align-items: start;
        }
        .peai-book .narr {
          grid-column: 1;
          grid-row: 1;
          min-width: 0;
        }
        .peai-book .gridcol {
          grid-column: 2;
          grid-row: 1;
          min-width: 0;
          position: sticky;
          top: 112px;
        }
        .peai-book .narr section {
          padding: 0 0 42vh;
        }
        .peai-book .narr section:last-child {
          padding-bottom: 12vh;
        }

        .peai-book .gridshell {
          border-radius: 16px;
          padding: 18px;
          background: var(--panel);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
          box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04);
        }
        .peai-book .famrow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .peai-book .fam {
          border-radius: 10px;
          padding: 10px 11px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-book .fam b {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.14em;
          color: var(--accent);
          margin-bottom: 5px;
        }
        .peai-book .fam span {
          font-size: 10.5px;
          line-height: 1.45;
          color: rgba(var(--ink-rgb), 0.58);
          display: block;
        }
        .peai-book .cells {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .peai-book .col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .peai-book .cell {
          position: relative;
          text-align: left;
          border-radius: 10px;
          padding: 11px 11px 10px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.11);
          cursor: pointer;
          opacity: 0;
          transform: translateY(10px) scale(0.985);
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.18s, background 0.18s, box-shadow 0.18s;
        }
        .peai-book .cell.shown {
          opacity: 1;
          transform: none;
        }
        .peai-book .cell .nm {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.25;
          letter-spacing: 0.05em;
          color: rgba(var(--ink-rgb), 0.82);
        }
        .peai-book .cell .sub {
          display: block;
          font-size: 10px;
          line-height: 1.4;
          color: rgba(var(--ink-rgb), 0.52);
          margin-top: 3px;
        }
        .peai-book .cell .idx {
          position: absolute;
          top: 8px;
          right: 9px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          color: rgba(var(--ink-rgb), 0.3);
        }
        .peai-book .cell:hover {
          background: var(--panel-solid);
          border-color: rgba(var(--accent-rgb), 0.3);
        }
        /* Accent is dark, so a selected cell takes light accent-ink text. */
        .peai-book .cell[aria-pressed='true'] {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 6px 18px -10px rgba(var(--accent-rgb), 0.7);
        }
        .peai-book .cell[aria-pressed='true'] .nm,
        .peai-book .cell[aria-pressed='true'] .sub,
        .peai-book .cell[aria-pressed='true'] .idx {
          color: var(--accent-ink);
        }
        .peai-book .cell[aria-pressed='true'] .sub {
          opacity: 0.78;
        }
        .peai-book .cell.lit {
          background: rgba(var(--accent-rgb), 0.12);
          border-color: rgba(var(--accent-rgb), 0.45);
        }
        .peai-book .cell.lit .nm {
          color: var(--accent);
        }
        .peai-book .cell.dim {
          opacity: 0.34;
        }
        .peai-book .cell .step {
          position: absolute;
          left: -7px;
          top: -7px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          line-height: 1;
          background: var(--accent);
          color: var(--accent-ink);
          box-shadow: 0 2px 6px -2px rgba(var(--accent-rgb), 0.8);
        }
        .peai-book .cell.lit .step {
          display: flex;
        }
        .peai-book .gridhint {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          padding-top: 11px;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
        }
        .peai-book .gridhint span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          line-height: 1.5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
        }
        .peai-book .gridhint .src {
          color: rgba(var(--ink-rgb), 0.35);
        }

        /* detail drawer */
        .peai-book .detail {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s,
            margin 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-book .detail.open {
          max-height: 340px;
          opacity: 1;
          margin-top: 10px;
        }
        .peai-book .dbox {
          border-radius: 14px;
          padding: 16px 18px;
          background: var(--panel);
          border: 0.5px solid rgba(var(--accent-rgb), 0.22);
        }
        .peai-book .dhead {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 13px;
        }
        .peai-book .dhead b {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.05em;
          color: var(--accent);
        }
        .peai-book .dhead i {
          font-style: normal;
          font-size: 10.5px;
          color: rgba(var(--ink-rgb), 0.5);
        }
        .peai-book .drow {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 12px;
          padding: 7px 0;
          border-top: 0.5px solid rgba(var(--ink-rgb), 0.08);
        }
        .peai-book .drow:first-of-type {
          border-top: 0;
        }
        .peai-book .drow dt {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1.5;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.48);
          padding-top: 2px;
        }
        .peai-book .drow dd {
          font-size: 12.5px;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.78);
          margin: 0;
        }
        .peai-book .drow dd .mt {
          display: inline-block;
          margin: 0 5px 4px 0;
          padding: 3px 7px;
          border-radius: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          line-height: 1.35;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.11);
          color: rgba(var(--ink-rgb), 0.72);
        }

        /* book page reveal */
        .peai-book .reveal {
          margin-top: 14px;
        }
        .peai-book .reveal > button {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.55);
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
          border-radius: 8px;
          padding: 9px 13px;
          cursor: pointer;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          transition: 0.18s;
        }
        .peai-book .reveal > button:hover {
          color: var(--accent);
          border-color: rgba(var(--accent-rgb), 0.3);
        }
        .peai-book .reveal > button svg {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peai-book .reveal.on > button svg {
          transform: rotate(180deg);
        }
        .peai-book .pages {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s, margin 0.5s;
        }
        .peai-book .reveal.on .pages {
          max-height: 620px;
          opacity: 1;
          margin-top: 12px;
        }
        .peai-book .pages figure {
          margin: 0;
          min-width: 0;
        }
        .peai-book .pages img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
          background: var(--panel-solid);
          border: 0.5px solid rgba(var(--ink-rgb), 0.12);
        }
        .peai-book .pages figcaption {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          line-height: 1.5;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
          margin-top: 7px;
        }

        /* worked examples */
        .peai-book .flowlab {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8.5px;
          line-height: 1;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(var(--ink-rgb), 0.45);
          margin-top: 22px;
        }
        .peai-book .flow {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          margin-top: 10px;
        }
        .peai-book .flow button {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.08em;
          padding: 9px 13px;
          border-radius: 20px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.2);
          color: rgba(var(--ink-rgb), 0.66);
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
        }
        .peai-book .flow button:hover {
          border-color: rgba(var(--accent-rgb), 0.45);
          color: var(--accent);
          background: var(--panel-solid);
          transform: translateY(-1px);
        }
        .peai-book .flow button[aria-pressed='true'] {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--accent-ink);
          transform: none;
        }
        .peai-book .pathline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          line-height: 1.7;
          color: rgba(var(--ink-rgb), 0.55);
          margin-top: 12px;
          min-height: 19px;
        }
        .peai-book .pathline b {
          color: var(--accent);
          font-weight: 500;
        }

        /* 7 close */
        .peai-book .close {
          display: flex;
          gap: 22px;
          align-items: center;
          flex-wrap: wrap;
          border-radius: 14px;
          padding: 20px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.1);
        }
        .peai-book .close img {
          width: 96px;
          height: auto;
          border-radius: 3px;
          box-shadow: 0 10px 24px -16px rgba(var(--ink-rgb), 0.6);
        }
        .peai-book .close .t {
          flex: 1;
          min-width: 240px;
        }
        .peai-book .close .t b {
          display: block;
          font-weight: 400;
          font-size: 1rem;
          color: rgba(var(--ink-rgb), 0.84);
          margin-bottom: 5px;
        }
        .peai-book .close .t span {
          display: block;
          font-size: 0.875rem;
          line-height: 1.6;
          color: rgba(var(--ink-rgb), 0.58);
        }
        .peai-book .close a.go {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          line-height: 1;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 14px;
          border-radius: 9px;
          background: rgba(var(--accent-rgb), 0.09);
          border: 0.5px solid rgba(var(--accent-rgb), 0.28);
          color: var(--accent);
          display: inline-flex;
          gap: 7px;
          align-items: center;
          transition: 0.18s;
        }
        .peai-book .close a.go:hover {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
        }

        @media (max-width: 720px) {
          .peai-book .swap {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .peai-book .swap .ar {
            transform: rotate(90deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .peai-book *,
          .peai-book *::before,
          .peai-book *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }

        /* ── Narrow: the grid becomes a sticky bar above the narrative.
           This block MUST stay LAST in this sheet. At equal specificity the
           later rule wins, so a compact block placed mid-sheet silently fails
           to override .gridshell, .fam span, .cell .sub, .detail.open and
           .dbox, which are defined above, while the rules that happen to
           precede it still apply, making it look as though the breakpoint
           works.

           .chapter also has to become display:block here. A sticky grid item's
           containing block is its own grid row, which gives it no travel at
           all, so declaring sticky on .gridcol while .chapter is still a grid
           does nothing. As a block container, .gridcol and .narr become
           normal-flow siblings and sticky travel becomes the full block
           height. .gridcol is first in source order for this reason. ── */
        @media (max-width: 1000px) {
          .peai-book .chapter {
            display: block;
          }
          .peai-book .narr section {
            padding: 0 0 30vh;
          }
          .peai-book .gridcol {
            position: sticky;
            top: 56px;
            z-index: 20;
            margin: 0 -40px 24px;
            padding: 12px 40px 14px;
            background: rgba(var(--bg-rgb), 0.92);
            backdrop-filter: blur(18px);
            border-bottom: 1px solid rgba(var(--ink-rgb), 0.1);
          }
          .peai-book .gridshell {
            padding: 12px;
          }
          .peai-book .famrow {
            gap: 7px;
            margin-bottom: 7px;
          }
          .peai-book .fam {
            padding: 7px 9px;
          }
          .peai-book .fam b {
            margin-bottom: 0;
          }
          .peai-book .fam span {
            display: none;
          }
          .peai-book .cells,
          .peai-book .col {
            gap: 7px;
          }
          .peai-book .cell {
            padding: 8px 9px 7px;
          }
          .peai-book .cell .nm {
            font-size: 10px;
          }
          .peai-book .cell .sub {
            display: none;
          }
          .peai-book .cell .idx {
            top: 6px;
            right: 7px;
          }
          .peai-book .gridhint {
            margin-top: 9px;
            padding-top: 8px;
          }
          .peai-book .detail.open {
            max-height: 200px;
          }
          .peai-book .dbox {
            padding: 12px 14px;
            max-height: 188px;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  )
}
