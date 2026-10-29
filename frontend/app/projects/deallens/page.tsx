import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ArrowUp } from 'lucide-react'
import DealLensHero from '@/components/deallens/DealLensHero'
import DealLensJourney from '@/components/deallens/DealLensJourney'
import DealDataModel from '@/components/deallens/DealDataModel'
import ProjectEvidence from '@/components/deallens/ProjectEvidence'
import {
  button,
  focus,
  primaryButton,
  CopyBlock,
  Disclosure,
  EditorialHeading,
  sectionClass,
} from '@/components/deallens/Primitives'
import { DEAL_LENS_REPO } from '@/lib/deallens-data'
import { copy } from '@/lib/deallens-copy'

export const metadata: Metadata = {
  title: 'DealLens — CIM Intelligence | Chase Sinclair',
  description:
    'One PDF in. A first-pass deal review out. An interactive case study of AI extraction, three independent automations, and an analyst workspace.',
}
export default function DealLensPage() {
  return (
    <div id="top" className="min-h-screen bg-surface text-on-surface">
      <a
        href="#main-content"
        className={`sr-only fixed left-6 top-20 z-50 rounded bg-primary p-4 text-on-primary focus:not-sr-only ${focus}`}
      >
        Skip to case study
      </a>
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-[var(--panel-solid)]">
        <nav
          aria-label="Case study navigation"
          className="mx-auto flex min-h-16 max-w-[1328px] items-center justify-between gap-3 px-6 sm:px-10"
        >
          <Link
            href="/projects"
            className={`${button} border-transparent px-0`}
          >
            <ArrowLeft size={16} />
            Projects
          </Link>
          <div className="flex items-center gap-6">
            <a
              href="#walkthrough"
              className={`hidden py-3 text-sm text-on-surface-variant sm:block ${focus}`}
            >
              Walkthrough
            </a>
            <a
              href="#analyst"
              className={`hidden py-3 text-sm text-on-surface-variant sm:block ${focus}`}
            >
              Workspace
            </a>
            <a
              href="#evidence"
              className={`hidden py-3 text-sm text-on-surface-variant sm:block ${focus}`}
            >
              Build evidence
            </a>
            <span className="text-sm font-semibold">
              DealLens{' '}
              <span className="font-normal text-on-surface-variant">
                / Case study
              </span>
            </span>
          </div>
        </nav>
      </header>
      <main id="main-content" className="mx-auto max-w-[1328px] px-6 sm:px-10">
        <DealLensHero />
        <DealLensJourney />
        <DealDataModel />
        <ProjectEvidence />
        <section id="reflection" className={sectionClass}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <EditorialHeading
                eyebrow={copy[11].eyebrow}
                title={copy[11].title}
              />
              <CopyBlock paragraphs={copy[11].body.slice(0, 2)} />
            </div>
            <div>
              <p className="mb-6 text-sm font-medium text-primary">
                Three decisions that shaped the build
              </p>
              {[
                [
                  'Structured outputs over free-form answers',
                  'I designed a consistent extraction schema so different company documents produce information that can be organized and compared.',
                ],
                [
                  'Independent automations, one connected system',
                  'I separated intake, follow-up questions, and investment criteria into three workflows that contribute to the same company record.',
                ],
                [
                  'An analyst workspace, not just AI output',
                  'I built review interfaces around the results so people can inspect the financials, understand potential risks, and decide what to investigate next.',
                ],
              ].map(([title, body], i) => (
                <div
                  key={title}
                  className="border-t border-outline-variant py-6"
                >
                  <div className="flex gap-4">
                    <span className="pt-1 font-mono text-xs text-primary">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium tracking-tight">
                        {title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 border-t border-outline-variant pt-8 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-20">
            <h3 className="text-lg font-medium">What I&apos;d improve next</h3>
            <p className="mt-3 text-base leading-7 text-on-surface-variant lg:mt-0">
              {copy[11].body[2]}
            </p>
          </div>
          <Disclosure paragraphs={copy[11].detail} />
          <div className="mt-16 rounded-xl bg-primary px-6 py-10 text-on-primary sm:p-12">
            <h2 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-.04em] sm:text-5xl">
              From a manual process to an AI-powered workflow.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-on-primary/80">
              {copy[11].body[3]}
            </p>
            <a
              href={DEAL_LENS_REPO}
              target="_blank"
              rel="noreferrer"
              className={`${primaryButton} mt-7 border-on-primary/30 bg-[var(--panel-solid)] text-primary hover:bg-white`}
            >
              View project on GitHub <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <footer className="flex items-center justify-between border-t border-outline-variant py-8 text-sm">
          <Link href="/projects" className={`text-primary ${focus}`}>
            All projects
          </Link>
          <a href="#top" className={`${button} border-transparent`}>
            Back to top <ArrowUp size={15} />
          </a>
        </footer>
      </main>
    </div>
  )
}
