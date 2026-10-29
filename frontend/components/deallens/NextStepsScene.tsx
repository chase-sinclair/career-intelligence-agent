'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Minus, CircleHelp } from 'lucide-react'
import { companies, criteria, questions } from '@/lib/deallens-data'
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
          {selected === 0 ? (
            <div className="space-y-2">
              {questions.map(([risk, question], i) => (
                <Reveal play={play} delay={i * 0.25} key={risk}>
                  <div className="grid grid-cols-[110px_1fr] gap-3 text-xs leading-[1.5] sm:grid-cols-[130px_1fr]">
                    <p className="font-medium text-primary">{risk}</p>
                    <p>{question}</p>
                  </div>
                </Reveal>
              ))}
              <p className="pt-1 text-[10px] text-on-surface-variant">
                5 risks flagged · Follow-up questions prepared for analyst
                review
              </p>
            </div>
          ) : (
            <div className="flex min-h-[110px] flex-col justify-center">
              <p className="text-sm">Sample follow-up not shown</p>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                A verified question capture for {company.short} is not available
                in this case study. Financials and the captured recommendation
                are shown below.
              </p>
            </div>
          )}
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
                      <th
                        scope="row"
                        className="w-[49%] py-1.5 pr-3 font-normal"
                      >
                        {criterion.need}
                      </th>
                      <motion.td
                        initial={play ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: play ? 1.15 : 0,
                          duration: play ? 0.25 : 0,
                        }}
                        className="py-1.5 font-medium tabular-nums"
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
                        className={`py-1.5 pl-2 ${meets ? 'text-primary' : 'text-amber-900'}`}
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
        <Reveal play={play} delay={1.6}>
          <p className="mt-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
            {company.recommendation}
          </p>
        </Reveal>
        <p className="mt-2 text-[10px] leading-4 text-on-surface-variant">
          Simplified screening interpretation. Checks use existing information;
          they do not calculate the initial match score.
        </p>
      </Tabs>
    </div>
  )
}

