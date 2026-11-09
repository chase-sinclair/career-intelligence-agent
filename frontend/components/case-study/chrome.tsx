'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import TopNav from '@/components/TopNav'

/**
 * Shared chrome for the standalone project case studies.
 *
 * The two PEAI pages and DealLens each carry their own copy of this visual
 * system, which was fine at three pages and is not fine at seven. Everything
 * those pages have in common lives here instead: the page shell, the figure
 * shell, the reveal contract, and one stylesheet scoped under `.case-study`.
 *
 * Scoping still holds the line the project conventions ask for. `.case-study`
 * is only ever applied by pages in this family, so none of these rules can
 * reach /how-it-works, the projects grid, or any other route. The PEAI and
 * DealLens pages keep their own page-root scopes and are untouched by this.
 *
 * A page that needs one bespoke figure passes its own CSS through `extra`,
 * scoped under its own page class, rather than adding to this sheet.
 */

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * One-shot scroll trigger. The observer disconnects as soon as it fires, so
 * nothing on these pages replays on scroll back.
 */
export function useOnceInView<T extends HTMLElement>(threshold: number) {
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
export function useTimeline(start: boolean, steps: ReadonlyArray<{ at: number; run: () => void }>) {
  const stepsRef = useRef(steps)
  stepsRef.current = steps

  useEffect(() => {
    if (!start) return
    const ids = stepsRef.current.map(({ at, run }) => setTimeout(run, at))
    return () => ids.forEach(clearTimeout)
  }, [start])
}

/** Section reveal class. Paired with `useInView` from the shared hook. */
export const reveal = (shown: boolean) =>
  `transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`

// ── Atoms ────────────────────────────────────────────────────────────────────

export const CHECK_PATH = 'm5 13 4 4 10-10'
export const CROSS_PATH = 'M18 6 6 18M6 6l12 12'
export const ARROW_PATH = 'M5 12h14M13 6l6 6-6 6'
export const EXTERNAL_PATH = 'M7 17 17 7M8 7h9v9'

export function Glyph({ d, size = 10, width = 2.4 }: { d: string; size?: number; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/** Titled shell every explanatory figure sits in. */
export function Figure({ name, category, children }: { name: string; category: string; children: ReactNode }) {
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

/** Hero credit chips. `accent` marks the leading two or three. */
export function Chips({ items }: { items: ReadonlyArray<{ label: string; accent?: boolean }> }) {
  return (
    <div className="credit">
      {items.map(({ label, accent }) => (
        <span key={label} className={`chip${accent ? ' a' : ''}`}>
          {label}
        </span>
      ))}
    </div>
  )
}

/**
 * Hero figure slot for a page with no finalized visual. Holds a 16:10 box so
 * dropping a real capture in later does not reflow the section.
 */
export function HeroPlaceholder({ label, note, caption }: { label: string; note: string; caption: string }) {
  return (
    <div className="shot">
      <div className="ph">
        <span className="pht">{label}</span>
        <span className="phn">{note}</span>
      </div>
      <span className="cap">
        <i />
        {caption}
      </span>
    </div>
  )
}

/** The "what I built" pair, split by a rule. */
export function TwoUp({ work, demonstrates }: { work: ReactNode; demonstrates: ReactNode }) {
  return (
    <div className="two">
      <div className="c">
        <p className="lab">The work</p>
        <p>{work}</p>
      </div>
      <div className="c">
        <p className="lab">What it demonstrates</p>
        <p>{demonstrates}</p>
      </div>
    </div>
  )
}

/** Before and after panels. The second lands late, then its footer resolves. */
export function ContrastPair({
  before,
  after,
}: {
  before: { label: string; quote: ReactNode; foot: string }
  after: { label: string; quote: ReactNode; foot: string }
}) {
  const { ref, fired } = useOnceInView<HTMLDivElement>(0.4)
  return (
    <div ref={ref} className={`gvu${fired ? ' go' : ''}`}>
      <div className="gv">
        <p className="lab">{before.label}</p>
        <q>{before.quote}</q>
        <span className="src none">{before.foot}</span>
      </div>
      <div className="gv ok">
        <p className="lab">{after.label}</p>
        <q>{after.quote}</q>
        <span className="src has">
          <Glyph d={CHECK_PATH} size={11} />
          {after.foot}
        </span>
      </div>
    </div>
  )
}

/** Two stacked problem/fix cards, the shape every one of these pages uses. */
export function ProblemFixCards({
  cards,
}: {
  cards: ReadonlyArray<{ problem: ReactNode; fix: ReactNode }>
}) {
  return (
    <div className="fx">
      {cards.map(({ problem, fix }, i) => (
        <div key={i} className="fc">
          <div className="seg">
            <p className="t">
              <i>
                <Glyph d={CROSS_PATH} width={2.6} />
              </i>
              <b>Problem</b>
            </p>
            <p>{problem}</p>
          </div>
          <div className="seg fix">
            <p className="t">
              <i>
                <Glyph d={CHECK_PATH} width={2.6} />
              </i>
              <b>Fix</b>
            </p>
            <p>{fix}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** The labelled key/value run used for end-to-end pipelines. */
export function PipelineList({
  label,
  rows,
}: {
  label: string
  rows: ReadonlyArray<{ k: string; v: string }>
}) {
  return (
    <div className="pipe">
      <p className="lab">{label}</p>
      {rows.map(({ k, v }) => (
        <div key={k} className="prow">
          <b>{k}</b>
          <span>{v}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Selectable chips over a drawer. Every page in this family uses this for its
 * "in practice" section, which is what keeps them feeling like one site.
 */
export function CapabilityPicker({
  items,
  figureName = 'Capabilities',
  figureCategory = 'In practice',
}: {
  items: ReadonlyArray<{ id: string; short: string; title: string; body: string; output: string }>
  figureName?: string
  figureCategory?: string
}) {
  const { ref, fired } = useOnceInView<HTMLDivElement>(0.25)
  const [shown, setShown] = useState(0)
  useTimeline(fired, items.map((_, i) => ({ at: 240 + i * 110, run: () => setShown(i + 1) })))

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex === null ? null : items[openIndex]

  return (
    <div ref={ref}>
      <Figure name={figureName} category={figureCategory}>
        <div className="caps">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`cap-chip${i < shown ? ' shown' : ''}`}
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {item.short}
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
  )
}

/** Closing strip. `href` may be internal or external; external opens a tab. */
export function CloseStrip({
  title,
  body,
  cta,
  href,
  external = false,
  related,
}: {
  title: string
  body: string
  cta: string
  href: string
  external?: boolean
  related?: ReactNode
}) {
  const icon = <Glyph d={external ? EXTERNAL_PATH : ARROW_PATH} size={11} />
  return (
    <>
      <div className="close">
        <div className="t">
          <b>{title}</b>
          <span>{body}</span>
        </div>
        {external ? (
          <a className="go" href={href} target="_blank" rel="noopener">
            {cta}
            {icon}
          </a>
        ) : (
          <Link className="go" href={href}>
            {cta}
            {icon}
          </Link>
        )}
      </div>
      {related && <p className="rel">{related}</p>}
    </>
  )
}

// ── Page shell ───────────────────────────────────────────────────────────────

/**
 * The outer shell: TopNav, the measured content column every case study uses,
 * the back link, and the shared stylesheet.
 *
 * `pageClass` is the page's own root class, used only to scope whatever it
 * passes through `extraCss`.
 */
export function CaseStudyShell({
  subtitle,
  pageClass,
  extraCss = '',
  children,
}: {
  subtitle: string
  pageClass: string
  extraCss?: string
  children: ReactNode
}) {
  return (
    <div className={`case-study ${pageClass} min-h-screen`}>
      <TopNav subtitle={subtitle} />

      <main className="pl-5">
        <div className="px-6 md:px-10 pb-24 pt-24 mx-auto w-full max-w-[1280px]">
          <Link href="/projects" className="backlink">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Projects
          </Link>
          {children}
        </div>
      </main>

      {/* Deliberately a plain style tag rather than the `<style jsx global>`
          the single-page editorial routes use. This sheet is composed at
          runtime from a module constant plus each page's own string, and
          styled-jsx is built around statically analyzable template literals,
          so a plain tag is the predictable way to emit a composed sheet. The
          content is a module constant, never user input. Scoping is unchanged:
          every rule is prefixed with `.case-study`. */}
      <style dangerouslySetInnerHTML={{ __html: CASE_STUDY_CSS + extraCss }} />
    </div>
  )
}

// ── The stylesheet ───────────────────────────────────────────────────────────

/**
 * Tokens only, no color literals. `--accent` is dark, so anything sitting on
 * an accent fill takes `--accent-ink`.
 */
const CASE_STUDY_CSS = `
.case-study .backlink {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 30px;
  font-size: 11px;
  color: rgba(var(--ink-rgb), 0.6);
  transition: color 0.18s;
}
.case-study .backlink:hover { color: var(--accent); }

.case-study .lab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.48);
}
.case-study p.body {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(var(--ink-rgb), 0.72);
  max-width: 64ch;
  margin-bottom: 1rem;
  text-wrap: pretty;
}
.case-study p.body em { font-style: normal; color: var(--accent); }
.case-study .tt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
  color: rgba(var(--ink-rgb), 0.68);
}

/* hero */
.case-study .hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  gap: 40px;
  align-items: start;
}
@media (max-width: 1060px) {
  .case-study .hero { grid-template-columns: 1fr; gap: 34px; }
}
.case-study .hero .lede {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: rgba(var(--ink-rgb), 0.72);
  max-width: none;
  text-wrap: pretty;
}
.case-study .hero .lede em { font-style: normal; color: var(--accent); }
.case-study .credit { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 26px; }
.case-study .chip {
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
.case-study .chip.a {
  background: rgba(var(--accent-rgb), 0.08);
  border-color: rgba(var(--accent-rgb), 0.22);
  color: var(--accent);
}
.case-study .shot {
  display: flex;
  flex-direction: column;
  gap: 11px;
  align-items: flex-start;
  width: 100%;
  justify-self: end;
  max-width: min(430px, 100%);
}
.case-study .ph {
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
.case-study .ph .pht {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.5);
}
.case-study .ph .phn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.32);
}
.case-study .shot .cap {
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
.case-study .shot .cap i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  display: block;
  animation: case-study-pulse 2.2s ease-in-out infinite;
}
@keyframes case-study-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.28; }
}

/* what I built */
.case-study .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 10px; }
@media (max-width: 860px) {
  .case-study .two { grid-template-columns: 1fr; gap: 28px; }
}
.case-study .two .c { padding-right: 46px; }
.case-study .two .c + .c { padding: 0 0 0 46px; border-left: 1px solid rgba(var(--ink-rgb), 0.1); }
@media (max-width: 860px) {
  .case-study .two .c, .case-study .two .c + .c { padding: 0; border: 0; }
}
.case-study .two .lab { color: var(--accent); margin-bottom: 12px; letter-spacing: 0.14em; }
.case-study .two p {
  font-size: 0.9688rem;
  line-height: 1.72;
  color: rgba(var(--ink-rgb), 0.7);
  text-wrap: pretty;
}

/* before and after */
.case-study .gvu {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  max-width: 800px;
  margin-top: 8px;
}
@media (max-width: 760px) {
  .case-study .gvu { grid-template-columns: 1fr; }
}
.case-study .gv {
  border-radius: 13px;
  padding: 16px 17px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
.case-study .gvu.go .gv { opacity: 1; transform: none; }
.case-study .gvu.go .gv:nth-child(2) { transition-delay: 0.28s; }
.case-study .gv.ok {
  background: rgba(var(--accent-rgb), 0.05);
  border-color: rgba(var(--accent-rgb), 0.22);
}
.case-study .gv .lab { margin-bottom: 11px; }
.case-study .gv.ok .lab { color: var(--accent); }
.case-study .gv q {
  display: block;
  quotes: none;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.7);
}
.case-study .gv .src {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 13px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.06em;
  padding: 7px 10px;
  border-radius: 7px;
}
.case-study .gv .src.none {
  background: transparent;
  border: 0.5px dashed rgba(var(--ink-rgb), 0.22);
  color: rgba(var(--ink-rgb), 0.4);
}
.case-study .gv .src.has {
  background: rgba(var(--accent-rgb), 0.1);
  border: 0.5px solid rgba(var(--accent-rgb), 0.3);
  color: var(--accent);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.85s;
}
.case-study .gvu.go .gv .src.has { opacity: 1; transform: none; }

/* figure shell */
.case-study .fig {
  border-radius: 16px;
  padding: 20px;
  background: var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04);
  min-width: 0;
}
.case-study .fig .flab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 17px;
}
.case-study .fig .flab b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 400;
}
.case-study .fig .flab span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.35);
}

.case-study .split {
  display: grid;
  grid-template-columns: 52fr 48fr;
  gap: 44px;
  align-items: start;
}
@media (max-width: 980px) {
  .case-study .split { grid-template-columns: 1fr; gap: 30px; }
}

/* node, stem and the generic flow diagram pieces */
.case-study .nd {
  border-radius: 9px;
  padding: 10px 12px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
}
.case-study .nd.pri {
  background: rgba(var(--accent-rgb), 0.06);
  border-color: rgba(var(--accent-rgb), 0.3);
}
.case-study .nd .k {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.45);
  margin-bottom: 6px;
}
.case-study .nd.pri .k { color: var(--accent); }
.case-study .nd .v { font-size: 12px; line-height: 1.5; color: rgba(var(--ink-rgb), 0.78); }
.case-study .nd .f {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.5;
  color: rgba(var(--ink-rgb), 0.5);
  margin-top: 5px;
  word-break: break-word;
}
.case-study .stem { height: 15px; margin-left: 17px; border-left: 1px solid rgba(var(--ink-rgb), 0.18); }

/* two arms side by side, then a join */
.case-study .legs { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.case-study .leg {
  border-radius: 11px;
  padding: 13px 14px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  min-width: 0;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.case-study .flow.go .leg { opacity: 1; transform: none; }
.case-study .flow.go .leg:nth-child(2) { transition-delay: 0.16s; }
.case-study .leg.pri {
  background: rgba(var(--accent-rgb), 0.06);
  border-color: rgba(var(--accent-rgb), 0.3);
}
.case-study .leg .hd { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.case-study .leg .hd b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.06em;
  color: rgba(var(--ink-rgb), 0.6);
}
.case-study .leg.pri .hd b { color: var(--accent); }
.case-study .leg .hd em {
  font-style: normal;
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.34);
}
.case-study .leg p { font-size: 11.5px; line-height: 1.55; color: rgba(var(--ink-rgb), 0.66); text-wrap: pretty; }
.case-study .leg .out {
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
.case-study .leg.pri .out {
  background: rgba(var(--accent-rgb), 0.1);
  border-color: rgba(var(--accent-rgb), 0.3);
  color: var(--accent);
}
/* The two arms sit directly above this bar at the 25% and 75% marks, which
   are their centers in the two-column grid, so the bar reads as the join
   without needing risers of its own. */
.case-study .conv { position: relative; height: 26px; }
.case-study .conv::before {
  content: '';
  position: absolute;
  left: 25%;
  right: 25%;
  top: 0;
  height: 1px;
  background: rgba(var(--accent-rgb), 0.35);
}
.case-study .conv::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(var(--accent-rgb), 0.35);
}
/* Same bar, read upward: one node splitting into two arms below it. */
.case-study .conv.split::before { top: auto; bottom: 0; }
@media (max-width: 620px) {
  .case-study .legs { grid-template-columns: 1fr; }
  .case-study .conv::before { display: none; }
  .case-study .conv::after { left: 17px; }
}
.case-study .chipout {
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
  background: rgba(var(--accent-rgb), 0.1);
  border: 0.5px solid rgba(var(--accent-rgb), 0.3);
  color: var(--accent);
}

/* end-to-end pipeline run */
.case-study .pipe {
  margin-top: 22px;
  max-width: 64ch;
  border-radius: 14px;
  padding: 16px 18px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.case-study .pipe .lab { margin-bottom: 12px; color: var(--accent); letter-spacing: 0.14em; }
.case-study .prow {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 12px;
  padding: 7px 0;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.08);
}
.case-study .prow:first-of-type { border-top: 0; }
.case-study .prow b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--accent-rgb), 0.85);
}
.case-study .prow span { font-size: 12.5px; line-height: 1.6; color: rgba(var(--ink-rgb), 0.7); }
@media (max-width: 520px) {
  .case-study .prow { grid-template-columns: 1fr; gap: 3px; }
}

/* labelled metadata rows, revealed in sequence */
.case-study .meta { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.case-study .mrow {
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
.case-study .mrow.shown { opacity: 1; transform: none; }
.case-study .mrow b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  line-height: 1.4;
  font-weight: 400;
  color: rgba(var(--ink-rgb), 0.45);
}
.case-study .mrow span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(var(--ink-rgb), 0.85);
  word-break: break-word;
}
.case-study .idxchip {
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
  line-height: 1.4;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.case-study .idxchip.shown { opacity: 1; transform: none; }

/* a run of small mono tokens under a label */
.case-study .tokz { margin-top: 16px; padding-top: 14px; border-top: 0.5px solid rgba(var(--ink-rgb), 0.09); }
.case-study .tokz .lab { margin-bottom: 10px; }
.case-study .tokrow { display: flex; flex-wrap: wrap; gap: 7px; }
.case-study .tok {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  line-height: 1.4;
  letter-spacing: 0.06em;
  padding: 7px 9px;
  border-radius: 6px;
  background: rgba(var(--ink-rgb), 0.04);
  border: 0.5px solid rgba(var(--ink-rgb), 0.13);
  color: rgba(var(--ink-rgb), 0.55);
}

/* problem and fix cards */
.case-study .fx { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
@media (max-width: 860px) {
  .case-study .fx { grid-template-columns: 1fr; }
}
.case-study .fc {
  border-radius: 14px;
  padding: 18px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.11);
}
.case-study .fc .seg + .seg {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.case-study .fc .seg .t { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.case-study .fc .seg .t b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 400;
  color: rgba(var(--ink-rgb), 0.45);
}
.case-study .fc .seg.fix .t b { color: var(--accent); }
.case-study .fc .seg .t i {
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
.case-study .fc .seg.fix .t i { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); }
.case-study .fc p { font-size: 0.9375rem; line-height: 1.65; color: rgba(var(--ink-rgb), 0.7); text-wrap: pretty; }
.case-study .coda {
  margin-top: 22px;
  max-width: 70ch;
  font-size: 0.9688rem;
  line-height: 1.72;
  color: rgba(var(--ink-rgb), 0.68);
  text-wrap: pretty;
}

/* capability picker */
.case-study .caps { display: flex; flex-wrap: wrap; gap: 7px; }
.case-study .cap-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
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
.case-study .cap-chip.shown { opacity: 1; transform: none; }
.case-study .cap-chip:hover {
  background: rgba(var(--accent-rgb), 0.16);
  border-color: rgba(var(--accent-rgb), 0.45);
}
/* Accent is dark, so the selected chip takes light accent-ink text. */
.case-study .cap-chip[aria-expanded='true'] {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}
.case-study .capx {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s, margin 0.45s;
}
.case-study .capx.open { max-height: 420px; opacity: 1; margin-top: 13px; }
.case-study .capx .box {
  padding: 14px 15px;
  border-radius: 9px;
  background: var(--panel-solid);
  border: 0.5px solid rgba(var(--accent-rgb), 0.26);
}
.case-study .capx .ct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.05em;
  color: var(--accent);
  margin-bottom: 9px;
}
.case-study .capx .cb {
  font-size: 12.5px;
  line-height: 1.65;
  color: rgba(var(--ink-rgb), 0.74);
  text-wrap: pretty;
}
.case-study .capx .co {
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

/* close */
.case-study .close {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 14px;
  padding: 20px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.case-study .close .t { flex: 1; min-width: 250px; }
.case-study .close .t b {
  display: block;
  font-weight: 400;
  font-size: 1rem;
  color: rgba(var(--ink-rgb), 0.84);
  margin-bottom: 5px;
}
.case-study .close .t span {
  display: block;
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.58);
}
.case-study .close a.go {
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
.case-study .close a.go:hover {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.case-study .rel {
  margin-top: 15px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.6;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.45);
}
.case-study .rel a { color: var(--accent); }

@media (prefers-reduced-motion: reduce) {
  .case-study *, .case-study *::before, .case-study *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`
