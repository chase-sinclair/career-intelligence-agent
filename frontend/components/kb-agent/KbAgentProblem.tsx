'use client'

import { Eyebrow } from '@/components/shared/typography'
import { KB_PROBLEM } from '@/lib/kb-agent-data'

/**
 * Section 02 of the KB Agent case study: The Problem.
 *
 * Deliberately static. The hero above carries the page's motion; this section
 * is an editorial read. No timers, no observers, no interaction logic, no
 * hover affordances beyond none at all — the rows are not links.
 *
 * Built from the shared system: `Eyebrow` from `shared/typography`, and `.lab`
 * / `.lede` off the `case-study` sheet. No new color literals.
 */
export default function KbAgentProblem() {
  return (
    <section id="kb-problem" className="kb-problem" aria-labelledby="kb-problem-h">
      <div className="kb-pr-copy">
        <Eyebrow>{KB_PROBLEM.eyebrow}</Eyebrow>
        <h2 id="kb-problem-h" className="kb-h2">
          {KB_PROBLEM.heading}
        </h2>
        {KB_PROBLEM.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="lede">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="kb-pr-panel">
        <p className="lab">{KB_PROBLEM.panelEyebrow}</p>
        {/* A list, not four cards: one surface, rows joined by hairlines and a
            continuous vertical rail through the ordinals. */}
        <ol className="kb-qs">
          {KB_PROBLEM.questions.map((q) => (
            <li key={q.ordinal} className="kb-q">
              <span className="kb-q-ord" aria-hidden="true">
                {q.ordinal}
              </span>
              <div className="kb-q-body">
                <p className="lab kb-q-lab">{q.topic}</p>
                <p className="kb-q-ask">{q.question}</p>
                <p className="kb-q-why">{q.explanation}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * Section 02's stylesheet, appended to the shared sheet by `KbAgentPage` via
 * `CaseStudyShell`'s `extraCss`. Scoped under `.kb-agent`; tokens only.
 */
export const KB_PROBLEM_CSS = `
.kb-agent .kb-problem {
  display: grid;
  grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
  gap: 60px;
  align-items: start;
}
@media (max-width: 1060px) {
  .kb-agent .kb-problem { grid-template-columns: minmax(0, 1fr); gap: 36px; }
}
.kb-agent .kb-pr-copy { padding-top: 2px; }
/* Smaller than the hero h1 by design, so it cannot compete with it. */
.kb-agent .kb-h2 {
  font-weight: 300;
  font-size: clamp(1.6rem, 2vw, 2.05rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin-bottom: 20px;
}
.kb-agent .kb-pr-copy .lede { max-width: 48ch; }
.kb-agent .kb-pr-copy .lede + .lede { margin-top: 16px; }

.kb-agent .kb-pr-panel {
  border-radius: 16px;
  padding: 24px 26px 6px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.1);
}
.kb-agent .kb-pr-panel > .lab { margin-bottom: 4px; }

.kb-agent .kb-qs { list-style: none; margin: 0; padding: 0; }
.kb-agent .kb-q {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 16px;
  padding: 17px 0;
  border-bottom: 0.5px solid rgba(var(--ink-rgb), 0.09);
}
.kb-agent .kb-q:last-child { border-bottom: 0; }
/* All four rows carry the same teal ordinal and micro-label: the set reads as
   one evenly weighted list, with no emphasised row and no interactive states. */
.kb-agent .kb-q-ord {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: 0.08em;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.kb-agent .kb-q-ord::before {
  content: '';
  position: absolute;
  top: 22px;
  bottom: -25px;
  left: 50%;
  width: 1px;
  background: rgba(var(--ink-rgb), 0.12);
}
.kb-agent .kb-q:last-child .kb-q-ord::before { display: none; }

.kb-agent .kb-q-lab { margin-bottom: 9px; color: var(--accent); }
.kb-agent .kb-q-ask {
  font-size: 1.0625rem;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.015em;
  color: rgba(var(--ink-rgb), 0.92);
  margin-bottom: 7px;
  text-wrap: pretty;
}
.kb-agent .kb-q-why {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(var(--ink-rgb), 0.62);
  max-width: 54ch;
  text-wrap: pretty;
}
`
