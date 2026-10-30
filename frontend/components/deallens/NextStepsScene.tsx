'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Minus, CircleHelp, CircleArrowRight } from 'lucide-react'
import { companies, criteria, risks } from '@/lib/deallens-data'
import { Reveal, Tabs } from './StoryParts'

export default function NextStepsScene({ play }: { play: boolean }) {
  const [selected, setSelected] = useState(0)
  const company = companies[selected]
  // Local choices stay stable during scroll; a deliberate stage re-entry/replay restores defaults.
  return (
    <div className="py-3">
      <Tabs
        labels={companies.map((c) => c.short)}
        label="Compare synthetic companies"
        selected={selected}
        onChange={setSelected}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <h4 className="text-sm font-semibold">{company.name}</h4>
          <span className="text-[11px] text-on-surface-variant">
            Initial match score{' '}
            <strong className="text-primary">{company.score}/100</strong>
          </span>
        </div>
        <div className="mt-2 border-y border-outline-variant py-2">
          <p className="mb-2 text-[11px] font-semibold text-primary">
            From risks to follow-up questions
          </p>
          <div className="relative">
            {play && selected === 0 && (
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 0.8, times: [0, 0.35, 1] }}
                className="pointer-events-none absolute inset-0 z-10 flex flex-wrap content-center gap-2 bg-[var(--panel-solid)]"
              >
                {risks.map((risk) => (
                  <span
                    key={risk}
                    className={`h-fit rounded border px-2 py-1 text-xs ${risk === 'Customer concentration' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'}`}
                  >
                    {risk}
                  </span>
                ))}
              </motion.div>
            )}
            <div className="space-y-1.5">
              {company.questions.map(([risk, question], i) => (
                <Reveal play={play} delay={0.65 + i * 0.2} key={risk}>
                  <div className="grid grid-cols-[110px_1fr] gap-3 text-xs leading-[1.5] sm:grid-cols-[180px_1fr]">
                    <p className="font-medium text-primary">{risk}</p>
                    <p>{question}</p>
                  </div>
                </Reveal>
              ))}
              <p className="pt-1 text-[10px] text-on-surface-variant">
                Representative follow-up questions based on each synthetic CIM
              </p>
            </div>
          </div>
        </div>
        <Reveal play={play} delay={0.9}>
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold">
              How the deal measures up
            </p>
            <table className="w-full border-collapse text-left text-xs leading-4">
              <caption className="sr-only">
                Illustrative screening checks for {company.name}
              </caption>
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant">
                  <th scope="col" className="pb-2 font-medium">
                    Needs
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Has
                  </th>
                  <th scope="col" className="pb-2 pl-2 font-medium">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion, i) => {
                  const value = company.values[i]
                  const meets =
                    value !== null &&
                    ('below' in criterion
                      ? value < criterion.threshold
                      : value >= criterion.threshold)
                  const result =
                    value === null ? 'Not disclosed' : meets ? 'Meets' : 'Below'
                  const Icon =
                    value === null ? CircleHelp : meets ? Check : Minus
                  return (
                    <tr
                      key={criterion.need}
                      className="border-b border-outline-variant last:border-0"
                    >
                      <th scope="row" className="w-[49%] py-1 pr-3 font-normal">
                        {criterion.need}
                      </th>
                      <motion.td
                        initial={play ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: play ? 1.15 : 0,
                          duration: play ? 0.25 : 0,
                        }}
                        className="py-1 font-medium tabular-nums"
                      >
                        {company.display[i]}
                      </motion.td>
                      <motion.td
                        initial={play ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: play ? 1.45 : 0,
                          duration: play ? 0.25 : 0,
                        }}
                        className={`py-1 pl-2 ${meets ? 'text-primary' : 'text-amber-900'}`}
                      >
                        <span className="flex items-center gap-1">
                          <Icon size={12} className="shrink-0" />
                          {result}
                        </span>
                      </motion.td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p className="mt-2 text-[10px] leading-4 text-on-surface-variant">
          Simplified screening interpretation. Checks use existing information;
          they do not calculate the initial score or recommendation.
        </p>
        <Reveal play={play} delay={1.6}>
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
            <CircleArrowRight
              size={21}
              className="shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
                Initial AI recommendation
              </p>
              <p className="mt-0.5 text-sm font-semibold text-primary">
                {company.recommendation}
              </p>
            </div>
          </div>
        </Reveal>
      </Tabs>
    </div>
  )
}
