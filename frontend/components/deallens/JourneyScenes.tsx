'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  FileText,
  Link2,
  Activity,
  ChartNoAxesCombined,
} from 'lucide-react'
import { financials, northstar, rawExcerpt, risks } from '@/lib/deallens-data'
import DocumentDropScene from './DocumentDropScene'
import NextStepsScene from './NextStepsScene'
import { focus, Label } from './Primitives'
import { Reveal, DealIdentity, Tabs } from './StoryParts'
import { useSceneMotion } from './useSceneMotion'

function RawText({
  play,
  highlighted = false,
}: {
  play: boolean
  highlighted?: boolean
}) {
  const phrases = rawExcerpt.split(/(\$42\.0M|13\.8%|\$6\.391M|Top 5 \(34%\))/)
  return (
    <div className="h-full rounded-md bg-surface-container-high p-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
        Extracted text
      </p>
      <p className="font-mono text-xs leading-[1.7] text-on-surface/75">
        {phrases.map((part, i) =>
          highlighted && i % 2 === 1 ? (
            <motion.mark
              key={i}
              initial={false}
              animate={{
                backgroundColor: play
                  ? [
                      'rgba(10,96,89,0)',
                      'rgba(10,96,89,.16)',
                      'rgba(10,96,89,.08)',
                    ]
                  : 'rgba(10,96,89,.08)',
              }}
              transition={{
                duration: play ? 0.65 : 0,
                delay: play ? 0.3 + i * 0.1 : 0,
              }}
              className="rounded-sm text-primary"
            >
              {part}
            </motion.mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
    </div>
  )
}
function Extraction({ play }: { play: boolean }) {
  return (
    <div className="py-3">
      <div className="mb-4 flex items-center justify-between text-xs text-on-surface-variant">
        <span>Document</span>
        <ArrowRight size={14} />
        <span>Extracted text</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-md border border-outline-variant bg-[var(--panel-solid)] p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-primary">
              NORTHSTAR / CIM
            </span>
            <FileText size={16} className="text-primary" />
          </div>
          <h4 className="text-xl font-semibold tracking-tight">
            Northstar
            <br />
            Field Services
          </h4>
          <div className="my-4 h-px bg-primary/30" />
          <p className="text-[11px] font-semibold uppercase tracking-wider">
            Company overview
          </p>
          <p className="mt-2 text-xs leading-5 text-on-surface-variant">
            A facilities maintenance platform serving multi-site commercial
            customers across the Southeast. Route-based field services with
            recurring master service agreements.
          </p>
          <p className="mb-2 mt-4 text-[11px] font-semibold">
            Financial performance · FY2025
          </p>
          {[
            ['Revenue', northstar.revenue],
            ['Adjusted EBITDA', '$6.391M'],
            ['Revenue growth', northstar.growth],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-2 border-t border-outline-variant py-2 text-[11px]"
            >
              <span>{label}</span>
              <strong className="font-medium">{value}</strong>
            </div>
          ))}
          {play && (
            <motion.div
              aria-hidden="true"
              initial={{ top: '5%', opacity: 0 }}
              animate={{ top: ['5%', '95%'], opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.9 }}
              className="pointer-events-none absolute left-0 right-0 h-10 border-t border-primary/40 bg-primary/10"
            />
          )}
        </div>
        <Reveal play={play} delay={0.5}>
          <RawText play={false} />
        </Reveal>
      </div>
      <Reveal play={play} delay={0.95}>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-primary">
          <Check size={14} />
          Text ready for analysis
        </p>
      </Reveal>
    </div>
  )
}
function Structure({ play }: { play: boolean }) {
  return (
    <div className="py-3">
      <Reveal play={play}>
        <div className="mb-3 border-b border-outline-variant pb-3">
          <Label>Extraction checklist</Label>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              'Company details',
              'Financial performance',
              'Potential risks',
              'Missing information',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check size={13} className="text-primary" />
                {item}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs font-medium text-primary">
            Same categories for every document
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[.85fr_1.15fr]">
        <RawText play={play} highlighted />
        <div className="relative rounded-md border border-primary/30 bg-[var(--panel-solid)] px-4 py-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-primary">
            Structured fields
          </p>
          {[
            ['Company', northstar.name],
            ['Annual revenue', northstar.revenue],
            ['Revenue growth', northstar.growth],
            ['Profit (EBITDA)', northstar.profit],
            ['Potential risk', 'Top five customers account for 34% of revenue'],
            [
              'Missing information',
              'Historical customer-level revenue — Not disclosed',
            ],
          ].map(([label, value], i) => (
            <Reveal play={play} delay={0.35 + i * 0.23} key={label}>
              <div className="relative border-t border-outline-variant py-1.5">
                <p className="text-[10px] text-on-surface-variant">{label}</p>
                <p
                  className={`mt-0.5 text-xs font-medium leading-5 ${i === 5 ? 'text-amber-900' : ''}`}
                >
                  {value}
                </p>
                {i > 0 && i < 4 && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute -left-7 top-4 hidden h-px w-7 origin-left bg-primary/50 sm:block"
                    initial={play ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: play ? 0.35 + i * 0.23 : 0,
                      duration: play ? 0.25 : 0,
                    }}
                  />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-on-surface-variant">
        From the actual Northstar test run · Simplified presentation
      </p>
    </div>
  )
}
function Records({ play }: { play: boolean }) {
  const [selected, setSelected] = useState(1)
  const icons = [FileText, ChartNoAxesCombined, Activity]
  return (
    <div className="py-3">
      <Reveal play={play}>
        <div className="rounded-lg border border-primary/30 bg-[var(--panel-solid)] p-4">
          <DealIdentity>Company record · FY2025</DealIdentity>
        </div>
      </Reveal>
      <svg viewBox="0 0 600 35" className="h-9 w-full" aria-hidden="true">
        <motion.path
          d="M300 0V15H100V35 M300 15V35 M300 15H500V35"
          stroke="var(--accent)"
          strokeOpacity=".4"
          fill="none"
          initial={play ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: play ? 0.5 : 0, delay: play ? 0.2 : 0 }}
        />
      </svg>
      <div
        role="group"
        aria-label="Connected deal information"
        className="grid grid-cols-3 gap-2"
      >
        {['Source document', 'Financials', 'Run history'].map((name, i) => {
          const Icon = icons[i]
          return (
            <button
              type="button"
              key={name}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-xs ${focus} ${selected === i ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant bg-[var(--panel-solid)] text-on-surface-variant'}`}
            >
              <Icon size={16} />
              {name}
            </button>
          )
        })}
      </div>
      <Reveal play={play} delay={0.6}>
        <div
          className="mt-4 min-h-[235px] rounded-lg border border-outline-variant bg-[var(--panel-solid)] px-4 py-3"
          aria-live="polite"
        >
          {selected === 1 ? (
            <>
              <p className="mb-1 text-xs font-medium text-primary">
                Northstar Field Services · FY2025
              </p>
              {financials.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-outline-variant py-2 text-xs last:border-0"
                >
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-semibold tabular-nums">{value}</span>
                </div>
              ))}
              <p className="mt-3 text-[11px] text-primary">
                Adjusted EBITDA is used as the primary screening metric.
              </p>
            </>
          ) : selected === 0 ? (
            <div className="space-y-4 text-sm">
              <Label>Source document</Label>
              <p>{northstar.source}</p>
              <p className="leading-6 text-on-surface-variant">
                Original document link, file identity, and extraction metadata
                stay connected to this deal.
              </p>
              <p className="flex items-center gap-2 text-xs text-primary">
                <Link2 size={14} />
                Linked CIM Documents record
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <Label>Run history</Label>
              <p>Intake processing history</p>
              <p className="leading-6 text-on-surface-variant">
                Upload timing and extraction, AI, and database-write statuses
                retain the processing history.
              </p>
              <p className="flex items-center gap-2 text-xs text-primary">
                <Activity size={14} />
                Linked Workflow Runs record
              </p>
            </div>
          )}
        </div>
      </Reveal>
      <p className="mt-3 rounded-md border border-dashed border-outline-variant px-3 py-2 text-center text-xs text-on-surface-variant">
        Risks &amp; questions — added later
      </p>
    </div>
  )
}
function Handoff({ play }: { play: boolean }) {
  const [tab, setTab] = useState(0)
  return (
    <div className="py-4">
      <DealIdentity />
      <div className="mb-4 mt-2 flex justify-end">
        <Reveal play={play} delay={1.2}>
          <span className="flex items-center gap-1 text-[11px] text-primary">
            <Link2 size={12} />
            Memo link saved
          </span>
        </Reveal>
      </div>
      <Tabs
        labels={['Slack alert', 'Memo draft']}
        selected={tab}
        onChange={setTab}
        label="Review package"
      >
        <div className="min-h-[240px] rounded-lg border border-outline-variant bg-[var(--panel-solid)] p-5">
          {tab === 0 ? (
            <Reveal play={play} delay={0.1}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">#</span>
                <span className="text-xs font-semibold">deallens-alerts</span>
                <span className="ml-auto text-[10px] text-on-surface-variant">
                  DealLens · APP
                </span>
              </div>
              <p className="mt-4 text-base font-semibold">{northstar.name}</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Business Services · Facilities Maintenance
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {[
                  ['Match score', '85/100'],
                  ['Revenue', northstar.revenue],
                  ['Profit (EBITDA)', northstar.profit],
                  ['Risks flagged', '5'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-on-surface-variant">{label}</span>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-outline-variant pt-3 text-sm font-medium text-primary">
                {northstar.recommendation}
              </p>
            </Reveal>
          ) : (
            <div className="space-y-3">
              {[
                [
                  'EXECUTIVE SUMMARY',
                  'Northstar Field Services is a facilities maintenance platform serving multi-site commercial customers across the Southeast.',
                ],
                [
                  'BUSINESS OVERVIEW',
                  'Route-based field services with a recurring MSA revenue model.',
                ],
                [
                  'KEY RISKS',
                  'Labor availability, founder dependency, customer concentration, seasonality, and integration risk.',
                ],
              ].map(([heading, text]) => (
                <div key={heading}>
                  <h4 className="text-[10px] font-semibold tracking-wider text-primary">
                    {heading}
                  </h4>
                  <p className="mt-1 text-xs leading-5">{text}</p>
                </div>
              ))}
              <p className="border-t border-outline-variant pt-2 text-[10px] text-on-surface-variant">
                AI-assisted first-pass / human review
              </p>
            </div>
          )}
        </div>
      </Tabs>
      <Reveal play={play} delay={1.1}>
        <p className="mt-2 text-[10px] text-primary">
          Memo draft ready · Simplified previews
        </p>
      </Reveal>
      <Reveal play={play} delay={1.6}>
        <p className="mb-2 mt-3 text-[11px] font-medium">
          5 risks added to the deal
        </p>
        <div className="flex flex-wrap gap-1.5">
          {risks.map((risk) => (
            <span
              key={risk}
              className={`rounded border px-2 py-1 text-[10px] ${risk === 'Customer concentration' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'}`}
            >
              {risk}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
export default function JourneyScene({
  stage,
  animate = true,
}: {
  stage: number
  animate?: boolean
}) {
  const play = useSceneMotion(animate)
  if (stage === 0) return <DocumentDropScene animate={animate} />
  if (stage === 1) return <Extraction play={play} />
  if (stage === 2) return <Structure play={play} />
  if (stage === 3) return <Records play={play} />
  if (stage === 4) return <Handoff play={play} />
  return <NextStepsScene play={play} />
}
