'use client'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { ArrowDown, ArrowRight, FileText, Check } from 'lucide-react'
import { copy } from '@/lib/deallens-copy'
import { northstar } from '@/lib/deallens-data'
import {
  CopyBlock,
  EditorialHeading,
  Label,
  primaryButton,
  sectionClass,
} from './Primitives'
import { DealIdentity, Reveal } from './StoryParts'
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
        <div ref={ref} className="relative py-6 sm:py-12">
          <div className="mb-9 flex items-center gap-5 pl-5">
            <div className="w-36 -rotate-6 rounded-md border border-outline-variant bg-[var(--panel-solid)] p-5 shadow-[0_8px_24px_rgba(19,23,26,.06)]">
              <FileText size={25} className="text-primary" />
              <p className="mt-5 text-sm font-medium">
                Northstar
                <br />
                Field Services
              </p>
              <p className="mt-4 font-mono text-[10px] text-on-surface-variant">
                CIM / PDF
              </p>
            </div>
            <div className="flex flex-1 items-center text-primary">
              <div className="h-px flex-1 bg-primary/30" />
              <ArrowRight size={22} />
              <span className="ml-3 text-xs">First-pass review</span>
            </div>
          </div>
          <Reveal
            play={play}
            delay={0.2}
            className="relative ml-5 rounded-xl border border-primary/25 bg-[var(--panel-solid)] p-6 shadow-[0_20px_60px_rgba(19,23,26,.07)] sm:ml-12 sm:p-8"
          >
            <DealIdentity />
            <p className="mt-6 border-y border-outline-variant py-4 text-lg font-medium text-primary">
              {northstar.recommendation}
            </p>
            <div className="mt-5 space-y-3">
              {[
                'Financials organized',
                'Potential risks flagged',
                'Follow-up questions prepared',
                'Investment memo drafted',
              ].map((text, i) => (
                <Reveal key={text} play={play} delay={0.4 + i * 0.18}>
                  <p className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary" />
                    {text}
                  </p>
                </Reveal>
              ))}
            </div>
            <p className="mt-5 text-xs text-on-surface-variant">
              Ready for an analyst to review
            </p>
          </Reveal>
          <p className="ml-5 mt-5 text-xs text-on-surface-variant sm:ml-12">
            Illustrative review package · Synthetic company data
          </p>
        </div>
      </section>
      <section id="problem" className={sectionClass}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <EditorialHeading eyebrow={copy[1].eyebrow} title={copy[1].title} />
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
              ].map((task, i) => (
                <li
                  key={task}
                  className="flex gap-5 border-b border-outline-variant py-4 text-sm leading-6"
                >
                  <span className="font-mono text-xs text-primary">
                    0{i + 1}
                  </span>
                  {task}
                </li>
              ))}
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
