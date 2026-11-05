'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import {
  CHECK_PATH,
  CapabilityPicker,
  CaseStudyShell,
  Chips,
  CloseStrip,
  ContrastPair,
  Figure,
  Glyph,
  HeroPlaceholder,
  PipelineList,
  ProblemFixCards,
  TwoUp,
  reveal,
  useOnceInView,
  useTimeline,
} from '@/components/case-study/chrome'
import {
  CAPABILITIES,
  HERO_PLACEHOLDER,
  INTEGRATIONS,
  PIPELINE,
  SERVICES,
  SIGNALS,
} from '@/lib/rentalshield-data'

/** The one figure this page owns: ranked signal bars under a composite score. */
const EXTRA_CSS = `
.rentalshield .sigs { display: flex; flex-direction: column; gap: 9px; }
.rentalshield .sig {
  opacity: 0;
  transform: translateY(7px);
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.rentalshield .sig.shown { opacity: 1; transform: none; }
.rentalshield .sig .srow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}
.rentalshield .sig .snm {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: rgba(var(--ink-rgb), 0.78);
}
.rentalshield .sig .sfrom {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: right;
  color: rgba(var(--ink-rgb), 0.38);
}
.rentalshield .sig .bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(var(--ink-rgb), 0.07);
  overflow: hidden;
}
.rentalshield .sig .bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  width: 0;
  background: rgba(var(--accent-rgb), 0.55);
  transition: width 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}
.rentalshield .sig.shown .bar i { width: var(--w); }
.rentalshield .illus {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(var(--ink-rgb), 0.09);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--ink-rgb), 0.35);
}
`

export default function RentalShieldPage() {
  const { ref: builtRef, inView: builtIn } = useInView({ threshold: 0.1 })
  const { ref: probRef, inView: probIn } = useInView({ threshold: 0.1 })
  const { ref: foundRef, inView: foundIn } = useInView({ threshold: 0.1 })
  const { ref: sysRef, inView: sysIn } = useInView({ threshold: 0.1 })
  const { ref: hardRef, inView: hardIn } = useInView({ threshold: 0.1 })
  const { ref: pracRef, inView: pracIn } = useInView({ threshold: 0.1 })
  const { ref: closeRef, inView: closeIn } = useInView({ threshold: 0.1 })

  // §4 integrations land one at a time, then the "four live APIs" chip.
  const { ref: intRef, fired: intGo } = useOnceInView<HTMLDivElement>(0.25)
  const [intShown, setIntShown] = useState(0)
  const [intDone, setIntDone] = useState(false)
  useTimeline(intGo, [
    ...INTEGRATIONS.map((_, i) => ({ at: 260 + i * 380, run: () => setIntShown(i + 1) })),
    { at: 260 + INTEGRATIONS.length * 380 + 220, run: () => setIntDone(true) },
  ])

  // §5 signal bars fill in rank order.
  const { ref: sigRef, fired: sigGo } = useOnceInView<HTMLDivElement>(0.3)
  const [sigShown, setSigShown] = useState(0)
  useTimeline(sigGo, SIGNALS.map((_, i) => ({ at: 220 + i * 150, run: () => setSigShown(i + 1) })))

  return (
    <CaseStudyShell subtitle="RentalShield NYC" pageClass="rentalshield" extraCss={EXTRA_CSS}>
      {/* ── 1 Hero ──────────────────────────────────────────────────── */}
      <header>
        <Eyebrow>Full-Stack AI</Eyebrow>
        <div className="hero">
          <div>
            <h1 className="font-light tracking-[-0.04em] leading-[1.06] mb-[22px]" style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}>
              The deposit is gone before you ever see the apartment
            </h1>
            <p className="lede">
              A screening tool for Manhattan apartment hunters. Submit a listing and it reads the screenshots, checks
              the rent against live market data, verifies the broker&rsquo;s license with the state, and returns a risk
              score with the ranked reasons behind it. The hard part was not detecting fraud. It was not crying wolf on
              a real listing in a competitive neighborhood.
            </p>
            <Chips
              items={[
                { label: 'Multimodal reasoning', accent: true },
                { label: 'Four live APIs', accent: true },
                { label: 'Seven services' },
                { label: 'Explainable scoring' },
              ]}
            />
          </div>
          <HeroPlaceholder
            label={HERO_PLACEHOLDER.label}
            note={HERO_PLACEHOLDER.note}
            caption="Production-ready screening flow"
          />
        </div>
      </header>

      <Divider />

      {/* ── 2 What I built ──────────────────────────────────────────── */}
      <section ref={builtRef} className={reveal(builtIn)}>
        <Eyebrow>The contribution</Eyebrow>
        <Heading2 className="mb-6 max-w-[16ch]">What I built</Heading2>
        <TwoUp
          work="Seven independently executable services behind one screening flow: a listing parser, multimodal reasoning over uploaded screenshots through Claude Sonnet 4 on AWS Bedrock, a geocoder, live rent comparison through RentCast, a New York State broker license lookup, a calibrated composite scorer, and persistence in Supabase. The frontend is Next.js 15 in TypeScript throughout."
          demonstrates="Four of those services call something real: a cloud inference endpoint, a commercial market data API, a government license database, and a hosted Postgres. Each of them fails differently, and none of them agree on what a confident answer looks like. The work was turning those disagreeing signals into one number a renter can act on, and being able to say why that number came out the way it did."
        />
      </section>

      <Divider />

      {/* ── 3 The problem ───────────────────────────────────────────── */}
      <section ref={probRef} className={reveal(probIn)}>
        <Eyebrow>The problem</Eyebrow>
        <Heading2 className="mb-[18px] max-w-[20ch]">NYC rental scams run on the urgency of the search</Heading2>
        <p className="body">
          The New York City rental market creates perfect conditions for fraud. Competition is intense, listings
          disappear within hours, and renters feel pressure to commit quickly. Scammers work that pressure directly:
          listing properties they do not own, fabricating broker credentials, and quoting rents well below market to
          attract applicants willing to pay deposits before viewing.
        </p>
        <p className="body mb-[30px]">
          The exposure is concrete. Application fees, a security deposit of one to two months rent, and a broker fee of
          15 percent of annual rent can add up to several thousand dollars committed before anyone sees a key. On a
          fraudulent listing that is a total loss. No existing tool combined multimodal image analysis, live rent
          comparison, and license verification into one screening pass, so renters were left cross-referencing
          StreetEasy, the state license database, and neighborhood rent data by hand.
        </p>
        <ContrastPair
          before={{
            label: 'Checking it yourself',
            quote:
              'Three tabs open, a license number you have no way to confirm, and a price that feels low in a neighborhood you do not know well enough to say.',
            foot: 'No synthesis, no verdict',
          }}
          after={{
            label: 'One screening pass',
            quote:
              'A composite risk score, and under it the ranked list of what actually triggered it: the photos, the price against comparables, the broker record.',
            foot: 'Scored, with reasons attached',
          }}
        />
      </section>

      <Divider />

      {/* ── 4 The foundation ────────────────────────────────────────── */}
      <section ref={foundRef} className={reveal(foundIn)}>
        <Eyebrow>The foundation</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">Four external systems, asked the same question</Heading2>
        <div className="split" ref={intRef}>
          <div>
            <p className="body">
              Each service answers one narrow question about the listing and answers it from a different kind of
              source. Bedrock reads pixels. RentCast reads a market. The state database reads a register. The geocoder
              reads an address. None of them knows the listing is suspicious, and none of them is authoritative alone.
            </p>
            <p className="body mb-0">
              They are independently executable on purpose. A listing submitted without screenshots still gets a price
              check and a license check, so a missing input degrades the score rather than blocking the screen.
            </p>
          </div>
          <Figure name="One listing, four checks" category="Integrations">
            <div className="meta">
              {INTEGRATIONS.map(([field, value], i) => (
                <div key={field} className={`mrow${i < intShown ? ' shown' : ''}`}>
                  <b>{field}</b>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <span className={`idxchip${intDone ? ' shown' : ''}`}>
              <Glyph d={CHECK_PATH} size={11} />
              Each one runs on its own
            </span>
            <div className="tokz">
              <p className="lab">Services in the pipeline</p>
              <div className="tokrow">
                {SERVICES.map((service) => (
                  <span key={service} className="tok">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 5 The system ────────────────────────────────────────────── */}
      <section ref={sysRef} className={reveal(sysIn)}>
        <Eyebrow>The system</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[19ch]">A score is useless without the reasons under it</Heading2>
        <div className="split">
          <div>
            <p className="body">
              The scorer takes the output of every service and produces one weighted composite. That number is the part
              a renter sees first, and on its own it is the least useful thing the system produces. A listing scored
              high risk with no explanation is just a different kind of guess.
            </p>
            <p className="body">
              So the output is the ranked factors, not the number. Each contributing signal is listed by severity, with
              the service it came from, so a renter can see that the price is fine and the broker record is the problem
              rather than being told to walk away and not knowing why.
            </p>
            <PipelineList label="End to end" rows={PIPELINE} />
          </div>
          <Figure name="Contributing factors" category="Scoring">
            <div className="sigs" ref={sigRef}>
              {SIGNALS.map(({ name, from, weightHint }, i) => (
                <div
                  key={name}
                  className={`sig${i < sigShown ? ' shown' : ''}`}
                  style={{ ['--w' as string]: `${weightHint}%`, transitionDelay: `${i * 60}ms` }}
                >
                  <div className="srow">
                    <span className="snm">{name}</span>
                    <span className="sfrom">{from}</span>
                  </div>
                  <div className="bar">
                    <i />
                  </div>
                </div>
              ))}
            </div>
            <p className="illus">
              Factors ranked by severity. Bar lengths here are illustrative, not the production weights.
            </p>
          </Figure>
        </div>
      </section>

      <Divider />

      {/* ── 6 The hard part ─────────────────────────────────────────── */}
      <section ref={hardRef} className={reveal(hardIn)}>
        <Eyebrow>The hard part</Eyebrow>
        <Heading2 className="mb-5 max-w-[18ch]">A false positive costs someone the apartment</Heading2>
        <p className="body mb-[30px]">
          The tempting failure mode is to flag everything. A screening tool that calls every listing risky is never
          wrong in the way that makes the news, and it is also worthless, because in a market this tight a renter who
          hesitates on a real listing loses it. Underpricing is a genuine scam signal and also just what a walk-up in a
          competitive neighborhood looks like in a slow month. Getting that line right meant tuning thresholds against
          a suite of real test cases rather than reasoning about it.
        </p>
        <ProblemFixCards
          cards={[
            {
              problem:
                'Normal price variation reading as fraud. A legitimate listing below the neighborhood median is common, and a naive underpricing rule flags a large share of the real market.',
              fix: 'Thresholds calibrated across a real test case suite rather than set by intuition, so pricing contributes to the composite in proportion to how far outside the comparable range a listing actually sits.',
            },
            {
              problem:
                'One service failing and taking the verdict with it. A rate-limited API or a listing with no screenshots should not produce a confident answer built on a missing input.',
              fix: 'Services execute independently and the scorer works from whatever returned. A missing signal lowers confidence in the composite rather than silently counting as a clean result.',
            },
          ]}
        />
        <p className="coda">
          The judgment call here is not technical. It is deciding what the tool owes someone who is about to wire money
          to a stranger, and what it owes someone whose real listing it is about to call suspicious. Those two people
          want the threshold in different places, and the ranked factors are how the product refuses to pick for them.
        </p>
      </section>

      <Divider />

      {/* ── 7 In practice ───────────────────────────────────────────── */}
      <section ref={pracRef} className={reveal(pracIn)}>
        <Eyebrow>In practice</Eyebrow>
        <Heading2 className="mb-[22px] max-w-[18ch]">What the screen actually checks</Heading2>
        <div className="split">
          <div>
            <p className="body">
              Six capabilities, each answering a question a careful renter would ask if they had the time, the market
              data, and access to the state license register.
            </p>
            <p className="body mb-0">Select any one to open it out.</p>
          </div>
          <CapabilityPicker items={CAPABILITIES} />
        </div>
      </section>

      <Divider />

      {/* ── 8 Close ─────────────────────────────────────────────────── */}
      <section ref={closeRef} className={reveal(closeIn)}>
        <CloseStrip
          title="Ask about the build"
          body="The screening flow depends on paid and government APIs, so there is no open demo. The knowledge base on this site will answer questions about the architecture and the calibration work."
          cta="Ask about Chase"
          href="/knowledge-base"
          related={
            <>
              Related work &middot; <Link href="/projects/career-radar">Career Radar</Link> &middot; another product
              built on messy real-world data
            </>
          }
        />
      </section>
    </CaseStudyShell>
  )
}
