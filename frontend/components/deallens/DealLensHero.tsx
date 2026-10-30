'use client'
import { useRef } from 'react'
import { useInView, motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  FileText,
  Check,
  FileSearch,
  Table2,
  ShieldAlert,
  MessageSquareText,
  FilePenLine,
} from 'lucide-react'
import { copy } from '@/lib/deallens-copy'
import { northstar } from '@/lib/deallens-data'
import { CopyBlock, Label, primaryButton, sectionClass } from './Primitives'
import { Reveal } from './StoryParts'
import { useSceneMotion } from './useSceneMotion'

export default function DealLensHero() {
  const ref = useRef<HTMLDivElement>(null)
  const entered = useInView(ref, { once: true, amount: 0.3 })
  const play = useSceneMotion(entered)
  return (
    <>
      <section
        id="introduction"
        className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_1fr] lg:py-24"
        aria-labelledby="deallens-title"
      >
        <div>
          <Label>{copy[0].eyebrow}</Label>
          <h1
            id="deallens-title"
            className="mt-6 text-7xl font-medium tracking-[-.075em] sm:text-8xl"
          >
            DealLens<span className="text-primary">.</span>
          </h1>
          <h2 className="mb-7 mt-6 max-w-xl text-4xl leading-[1.06] tracking-[-.045em] sm:text-5xl">
            One PDF in.
            <br />
            <span className="font-serif text-[1.12em] italic text-primary">
              A first-pass deal review out.
            </span>
          </h2>
          <CopyBlock paragraphs={copy[0].body} />
          <a href="#problem" className={`${primaryButton} mt-7`}>
            Follow the story <ArrowDown size={16} />
          </a>
        </div>
        <div
          ref={ref}
          className="relative rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:p-6"
        >
          <div className="mb-7 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
            <span>Source document</span>
            <span>Review-ready output</span>
          </div>
          <div
            key={String(entered)}
            className="grid grid-cols-[minmax(0,.65fr)_28px_minmax(0,1.35fr)] items-center sm:grid-cols-[minmax(0,.65fr)_36px_minmax(0,1.35fr)]"
          >
            <Reveal
              play={play}
              className="relative rounded-md border border-outline-variant bg-[var(--panel-solid)] px-3 py-5 shadow-sm sm:px-4"
            >
              <FileText size={25} className="text-primary" aria-hidden="true" />
              <p className="mb-4 mt-5 font-mono text-[9px] tracking-widest text-on-surface-variant">
                CIM / PDF
              </p>
              <p className="text-sm font-semibold leading-5 tracking-tight">
                Northstar
                <br />
                Field Services
              </p>
              <div className="mb-5 mt-4 h-px bg-primary/25" />
              <p className="text-[10px] leading-4 text-on-surface-variant">
                Confidential information memorandum
              </p>
            </Reveal>
            <div
              className="relative flex items-center text-primary"
              aria-hidden="true"
            >
              <motion.div
                className="absolute h-px w-full origin-left bg-primary/50"
                initial={play ? { scaleX: 0 } : false}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: play ? 0.45 : 0,
                  delay: play ? 0.3 : 0,
                }}
              />
              <Reveal play={play} delay={0.65} className="ml-auto">
                <ArrowRight size={18} />
              </Reveal>
            </div>
            <Reveal
              play={play}
              delay={0.75}
              className="relative rounded-xl border border-primary/30 bg-[var(--panel-solid)] p-4 shadow-[0_12px_32px_rgba(19,23,26,.06)] sm:p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                First-pass review
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-6 tracking-tight sm:text-xl">
                {northstar.name}
              </h3>
              <p className="mt-2 text-[11px] leading-4 text-on-surface-variant">
                Business Services · Facilities Maintenance
              </p>
              <Reveal
                play={play}
                delay={1}
                className="my-4 border-y border-outline-variant py-3"
              >
                <p className="text-sm font-semibold leading-5 text-primary">
                  {northstar.recommendation}
                </p>
              </Reveal>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Financials extracted',
                  '5 risks flagged',
                  'Memo drafted',
                ].map((text, i) => (
                  <Reveal key={text} play={play} delay={1.2 + i * 0.15}>
                    <span className="inline-flex items-center gap-1 rounded border border-outline-variant px-1.5 py-1 text-[10px]">
                      <Check
                        size={11}
                        className="text-primary"
                        aria-hidden="true"
                      />
                      {text}
                    </span>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
          <p className="mt-6 text-[11px] text-on-surface-variant">
            Illustrative review package · Synthetic company data
          </p>
        </div>
      </section>
      <section
        id="problem"
        className={`${sectionClass} border-t-2 border-t-on-surface/20`}
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="mb-5 text-xl font-bold uppercase tracking-[.12em] text-on-surface">
              The problem
            </p>
            <h2 className="mb-7 text-3xl font-medium leading-[1.12] tracking-[-.045em] sm:text-4xl lg:text-5xl">
              {copy[1].title}
            </h2>
            <p className="text-base leading-7 text-on-surface-variant">
              {copy[1].body[0]}
            </p>
          </div>
          <div>
            <p className="text-base leading-7 text-on-surface-variant">
              {copy[1].body[1]}
            </p>
            <ol className="mt-6 border-t border-outline-variant">
              {[
                'Pull key company and financial information from the document',
                'Organize financial figures by reporting period',
                'Identify potential risks and missing information',
                'Draft follow-up questions for the seller',
                'Prepare an initial summary for the investment team',
              ].map((task, i) => {
                const Icon = [
                  FileSearch,
                  Table2,
                  ShieldAlert,
                  MessageSquareText,
                  FilePenLine,
                ][i]
                return (
                  <li
                    key={task}
                    className="flex items-center gap-5 border-b border-outline-variant py-4 text-sm leading-6"
                  >
                    <span className="font-mono text-xs text-primary">
                      0{i + 1}
                    </span>
                    <span className="flex-1">{task}</span>
                    <Icon
                      size={18}
                      className="shrink-0 text-on-surface-variant"
                      aria-hidden="true"
                    />
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
        <p className="mt-12 max-w-4xl border-l-2 border-primary pl-6 text-xl font-medium leading-8 tracking-tight sm:text-2xl">
          {copy[1].body[2]}
        </p>
      </section>
    </>
  )
}
