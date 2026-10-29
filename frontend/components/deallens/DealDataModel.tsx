'use client'
import { useRef } from 'react'
import { useInView, motion } from 'framer-motion'
import { FileText, MessagesSquare, ListChecks, Link2 } from 'lucide-react'
import { copy } from '@/lib/deallens-copy'
import { northstar } from '@/lib/deallens-data'
import {
  CopyBlock,
  Disclosure,
  EditorialHeading,
  sectionClass,
  focus,
} from './Primitives'
import { DealIdentity, Reveal } from './StoryParts'
import { useSceneMotion } from './useSceneMotion'

const producers = [
  {
    title: 'When a file arrives',
    items: ['Source document', 'Financials', 'Run history', 'Risks'],
    note: 'Creates the company record; saves the memo link.',
    Icon: FileText,
  },
  {
    title: 'When follow-up questions are needed',
    items: ['Follow-up questions', 'Run history'],
    note: 'Adds tailored questions and another processing-history entry.',
    Icon: MessagesSquare,
  },
  {
    title: 'When investment criteria are needed',
    items: ['Screening checks'],
    note: 'Adds criteria from existing deal information.',
    Icon: ListChecks,
  },
]
export default function DealDataModel() {
  const ref = useRef<HTMLDivElement>(null)
  const entered = useInView(ref, { once: true, amount: 0.3 })
  const play = useSceneMotion(entered)
  return (
    <section
      id="data-model"
      tabIndex={-1}
      className={`${sectionClass} outline-none`}
    >
      <div className="grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <EditorialHeading eyebrow={copy[8].eyebrow} title={copy[8].title} />
        <CopyBlock paragraphs={copy[8].body} />
      </div>
      <div
        ref={ref}
        className="relative mt-10 rounded-xl border border-outline-variant bg-surface-container-low p-5 sm:p-9"
      >
        <h3 className="mb-8 text-lg font-medium tracking-tight">
          Three automations. One connected deal.
        </h3>
        <div className="relative grid gap-5 md:grid-cols-3">
          {producers.map(({ title, items, note, Icon }, i) => (
            <Reveal
              play={play}
              delay={i * 0.45}
              key={`${title}-${entered}`}
              className="relative z-10 flex flex-col rounded-lg border border-outline-variant bg-[var(--panel-solid)] p-5"
            >
              <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-primary">
                <Icon size={15} />
                Automation {i + 1}
              </p>
              <h4 className="min-h-12 text-base font-medium leading-6">
                {title}
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded bg-primary/5 px-2 py-1 text-xs text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-on-surface-variant">
                {note}
              </p>
            </Reveal>
          ))}
        </div>
        <svg
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="hidden h-20 w-full md:block"
        >
          {[
            'M166 0V30Q166 45 185 45H480Q500 45 500 65V80',
            'M500 0V80',
            'M834 0V30Q834 45 815 45H520Q500 45 500 65V80',
          ].map((d, i) => (
            <motion.path
              key={`${d}-${entered}`}
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.4"
              strokeOpacity=".5"
              initial={play ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{
                duration: play ? 0.5 : 0,
                delay: play ? i * 0.45 + 0.2 : 0,
              }}
            />
          ))}
        </svg>
        <div className="relative z-10 mx-auto mt-6 max-w-lg rounded-xl border border-primary/40 bg-[var(--panel-solid)] p-5 shadow-sm md:mt-0">
          <DealIdentity>Company profile · Connected record</DealIdentity>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4">
            <span className="text-sm font-medium text-primary">
              {northstar.recommendation}
            </span>
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <Link2 size={13} />
              Memo link
            </span>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-on-surface-variant">
          Every automation contributes to the same company, even though each
          starts at a different point in the workflow.
        </p>
      </div>
      <Disclosure paragraphs={copy[8].detail} />
      <a
        href="#analyst"
        className={`mt-6 inline-block text-sm font-medium text-primary ${focus}`}
      >
        {copy[8].transition}
      </a>
    </section>
  )
}
