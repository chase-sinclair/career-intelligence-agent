'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Expand,
  X,
  ZoomIn,
  ZoomOut,
  ImageOff,
} from 'lucide-react'
import { companies } from '@/lib/deallens-data'
import { copy } from '@/lib/deallens-copy'
import {
  button,
  focus,
  CopyBlock,
  Disclosure,
  EditorialHeading,
  sectionClass,
} from './Primitives'
import { Tabs } from './StoryParts'

const root = '/images/deallens/proof/'
const shots = [
  {
    file: 'airtable-executive-dashboard.png',
    title: 'Executive Dashboard',
    caption:
      'Pipeline recommendations, deal prioritization, review list, and workflow health across the three synthetic companies.',
    width: 1915,
    height: 1190,
  },
  {
    file: 'airtable-deal-review-interface.png',
    title: 'Northstar Deal Review',
    caption:
      'Northstar’s source-linked company profile, one FY2025 financial record, screening criteria, five risks, and tailored question records.',
    width: 1322,
    height: 1192,
  },
  {
    file: 'northstar-cim-dropped-in-folder.png',
    title: 'Document received',
    caption:
      'The synthetic northstar-field-services.pdf in the watched CIM Intake folder.',
    width: 1523,
    height: 656,
  },
  {
    file: 'northstar-cim-04-financial-snapshot.png',
    title: 'Source financials',
    caption:
      'The authentic synthetic CIM financial page. Extraction includes several periods; the tested workflow persists one FY2025 row.',
    width: 606,
    height: 779,
  },
  {
    file: 'cim-intake-zap.png',
    title: 'CIM Intake automation',
    caption:
      'Zap 1: Drive, PDF.co, preprocessing, OpenAI, normalization, four Airtable writes, Slack, Google Docs, memo-link update, and the risk loop.',
    width: 202,
    height: 862,
  },
  {
    file: 'diligence-builder-zap.png',
    title: 'Diligence Builder',
    caption:
      'An independent Airtable view trigger starts question generation, a separate workflow run, and linked question writes.',
    width: 430,
    height: 782,
  },
  {
    file: 'investment-criteria-builder-zap.png',
    title: 'Investment Criteria Builder',
    caption:
      'An independent Airtable view trigger starts Code by Zapier and linked screening-criteria writes.',
    width: 546,
    height: 778,
  },
  {
    file: 'slack-deallens-alert-northstar.png',
    title: 'Northstar Slack alert',
    caption:
      'Captured alert: 85 initial fit score, five risks, and Proceed to initial review. This historical capture shows completeness75, whereas the Airtable capture shows80; those fields are not synchronized proof from one canonical run.',
    width: 766,
    height: 285,
  },
]
const chapters = [
  { name: 'Document received', images: [2, 3] },
  { name: 'Automation executed', images: [4, 5, 6] },
  { name: 'Review materials created', images: [7, 1] },
]

function Screenshot({
  index,
  full = false,
  zoomed = false,
}: {
  index: number
  full?: boolean
  zoomed?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const shot = shots[index]
  if (failed)
    return (
      <div
        role="status"
        className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-on-surface-variant"
      >
        <ImageOff size={28} />
        <p>Screenshot unavailable</p>
        <p>{shot.title} could not be loaded. No substitute image is shown.</p>
      </div>
    )
  if (full)
    return (
      <Image
        src={root + shot.file}
        alt={shot.caption}
        unoptimized
        width={shot.width}
        height={shot.height}
        onError={() => setFailed(true)}
        className={
          zoomed ? 'mx-auto h-auto max-w-none' : 'h-full w-full object-contain'
        }
        style={zoomed ? { width: 'auto', height: 'auto' } : undefined}
      />
    )
  return (
    <Image
      src={root + shot.file}
      alt={shot.caption}
      width={shot.width}
      height={shot.height}
      sizes="(max-width: 768px) 100vw, 1248px"
      onError={() => setFailed(true)}
      className="h-auto w-full"
    />
  )
}
export default function ProjectEvidence() {
  const [surface, setSurface] = useState(0)
  const [chapter, setChapter] = useState(0)
  const [proof, setProof] = useState(2)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  function open(index: number) {
    opener.current = document.activeElement as HTMLElement
    setZoomed(false)
    setLightbox(index)
  }
  function close() {
    dialog.current?.close()
    setLightbox(null)
    setZoomed(false)
    opener.current?.focus()
  }
  function step(direction: number) {
    setZoomed(false)
    setLightbox((value) =>
      value === null ? null : (value + direction + shots.length) % shots.length,
    )
  }
  useEffect(() => {
    if (lightbox === null) return
    const el = dialog.current
    if (!el?.open) {
      el?.showModal()
      closeButton.current?.focus()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [lightbox])
  return (
    <>
      <section id="analyst" className={sectionClass}>
        <div className="grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <EditorialHeading eyebrow={copy[9].eyebrow} title={copy[9].title} />
          <CopyBlock paragraphs={copy[9].body} />
        </div>
        <div className="mt-9">
          <Tabs
            labels={['Pipeline overview', 'Deal review']}
            selected={surface}
            onChange={setSurface}
            label="Analyst workspace"
          >
            <figure className="overflow-hidden rounded-xl border border-outline-variant bg-[var(--panel-solid)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4">
                <p className="text-xs text-primary">
                  Authentic Airtable interface · Synthetic example data
                </p>
                <button
                  type="button"
                  onClick={() => open(surface)}
                  className={button}
                >
                  <Expand size={15} />
                  View full screenshot
                </button>
              </div>
              <motion.div
                key={surface}
                initial={reduced ? false : { opacity: 0.6, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => open(surface)}
                  aria-label={`Enlarge ${shots[surface].title}`}
                  className={`block w-full ${focus}`}
                >
                  <Screenshot key={surface} index={surface} />
                </button>
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  whileInView={
                    reduced ? { opacity: 0 } : { opacity: [0, 0.65, 0] }
                  }
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 2, delay: 0.3 }}
                  className={`pointer-events-none absolute left-[3%] right-[1%] rounded border-2 border-primary ${surface === 0 ? 'top-[20%] h-[26%]' : 'left-[22%] top-[26%] h-[47%]'}`}
                />
              </motion.div>
              <figcaption className="border-t border-outline-variant p-5 text-sm leading-6 text-on-surface-variant">
                {shots[surface].caption}
              </figcaption>
            </figure>
          </Tabs>
        </div>
        <Disclosure paragraphs={copy[9].detail} />
        <a
          href="#evidence"
          className={`mt-6 inline-block text-sm font-medium text-primary ${focus}`}
        >
          {copy[9].transition}
        </a>
      </section>
      <section id="evidence" className={sectionClass}>
        <EditorialHeading eyebrow={copy[10].eyebrow} title={copy[10].title} />
        <div className="max-w-3xl">
          <CopyBlock paragraphs={copy[10].body} />
        </div>
        <div className="mt-8">
          <Tabs
            labels={chapters.map((c) => c.name)}
            selected={chapter}
            onChange={(i) => {
              setChapter(i)
              setProof(chapters[i].images[0])
            }}
            label="Working build evidence"
          >
            <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
              <div className="flex flex-col gap-2">
                {chapters[chapter].images.map((index) => (
                  <button
                    type="button"
                    key={index}
                    aria-pressed={proof === index}
                    onClick={() => setProof(index)}
                    className={`rounded-lg border p-4 text-left ${focus} ${proof === index ? 'border-primary bg-surface-container-low' : 'border-outline-variant'}`}
                  >
                    <p className="text-sm font-medium">{shots[index].title}</p>
                    <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                      {shots[index].caption}
                    </p>
                  </button>
                ))}
                <p className="mt-3 text-xs leading-5 text-on-surface-variant">
                  Real workflow screenshots using synthetic deal data.
                </p>
              </div>
              <figure className="flex min-w-0 flex-col rounded-xl border border-outline-variant bg-[var(--panel-solid)]">
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant p-4">
                  <h3 className="text-sm font-medium">{shots[proof].title}</h3>
                  <button
                    type="button"
                    onClick={() => open(proof)}
                    className={button}
                  >
                    <Expand size={15} />
                    <span className="hidden sm:inline">
                      View full screenshot
                    </span>
                    <span className="sm:hidden">Enlarge</span>
                  </button>
                </div>
                <div className="flex min-h-[380px] flex-1 items-center justify-center p-4 sm:min-h-[460px]">
                  <button
                    type="button"
                    onClick={() => open(proof)}
                    aria-label={`Enlarge ${shots[proof].title}`}
                    className={`block max-h-[600px] max-w-full overflow-hidden ${proof >= 4 && proof <= 6 ? 'w-[240px]' : 'w-full'} ${focus}`}
                  >
                    <Screenshot key={proof} index={proof} />
                  </button>
                </div>
                <figcaption className="border-t border-outline-variant p-4 text-xs leading-5 text-on-surface-variant">
                  {shots[proof].caption}
                  {proof >= 4 && proof <= 6
                    ? ' Workflow preview; open the full screenshot to inspect every step.'
                    : ''}
                </figcaption>
              </figure>
            </div>
          </Tabs>
        </div>
        <div className="mt-8 grid gap-5 border-y border-outline-variant py-6 md:grid-cols-3">
          {companies.map((company) => (
            <div key={company.name}>
              <p className="text-sm font-medium">{company.name}</p>
              <p className="mt-2 text-xs text-primary">
                {company.recommendation}
              </p>
            </div>
          ))}
        </div>
        <details className="mt-6 text-sm">
          <summary
            className={`w-fit cursor-pointer py-2 text-on-surface-variant ${focus}`}
          >
            Evidence availability &amp; capture notes
          </summary>
          <p className="mt-3 max-w-3xl leading-6 text-on-surface-variant">
            The original Google Docs memo is withheld: its screening table
            contains an incorrect EBITDA value and its generation date needs
            correction. A workflow repair and fresh canonical capture are
            required. Slack and Airtable captures come from different test runs,
            with differing completeness values; they establish interface and
            integration behavior, not synchronized numerical validation.
          </p>
        </details>
        <Disclosure paragraphs={copy[10].detail} />
        <a
          href="#reflection"
          className={`mt-6 inline-block text-sm font-medium text-primary ${focus}`}
        >
          {copy[10].transition}
        </a>
      </section>
      <dialog
        ref={dialog}
        aria-labelledby="evidence-title"
        onCancel={(e) => {
          e.preventDefault()
          close()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            step(1)
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            step(-1)
          }
        }}
        className="m-auto h-[92dvh] w-[94vw] max-w-[1800px] overflow-hidden rounded-xl border border-outline-variant bg-[var(--panel-solid)] p-0 text-on-surface shadow-2xl backdrop:bg-black/70"
      >
        {lightbox !== null && (
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant p-4">
              <h2 id="evidence-title" className="text-base font-semibold">
                {shots[lightbox].title}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={zoomed ? 'Fit image' : 'Original size'}
                  onClick={() => setZoomed(!zoomed)}
                  className={button}
                >
                  {zoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
                  <span className="hidden sm:inline">
                    {zoomed ? 'Fit image' : 'Original size'}
                  </span>
                </button>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={close}
                  aria-label="Close screenshot"
                  className={button}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              tabIndex={0}
              aria-label="Screenshot; scroll to inspect when enlarged"
              className={`min-h-0 flex-1 overflow-auto bg-surface-container-high p-2 ${focus}`}
            >
              <Screenshot
                key={lightbox}
                index={lightbox}
                full
                zoomed={zoomed}
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-outline-variant p-4">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous screenshot"
                className={button}
              >
                <ArrowLeft size={17} />
              </button>
              <p className="max-w-4xl text-center text-xs leading-5">
                {lightbox + 1} / {shots.length} · {shots[lightbox].caption}
              </p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next screenshot"
                className={button}
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
