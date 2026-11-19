'use client'

import { KB_STEP_EXPLANATIONS, KB_WALKTHROUGH_INTRO } from '@/lib/kb-agent-data'
import {
  STEP_CHANGES,
  STEP_TICKET,
  outcomeLevel,
  type WalkthroughState,
} from '@/components/kb-agent/useWalkthroughReplay'

/**
 * Section 04's right-hand panel: the portfolio owner's explanation of the
 * step being replayed. Portfolio design system, not Slack styling, and never
 * dressed as a second chat response.
 *
 * Pure function of the shared replay state:
 *
 *  - Before the first Send it shows only the introduction, whatever pill is
 *    selected.
 *  - From the first Send on, it shows the selected step's number, title and
 *    WHY. The outcome sections appear only when `outcomeLevel` says the
 *    matching recorded result is on screen in Slack.
 *  - Step 07 shows the opening sentence of its approved finding after
 *    `/kb changes`, and the full finding plus WHY IT MATTERS only after
 *    `/kb diff`.
 *  - Step 08 reveals nothing while the review form is displayed; only the
 *    recorded confirmation or the Notion record unlock the outcome.
 *
 * New text fades in once (keyed on what changed); nothing else animates.
 */
export default function StepExplanationPanel({ state }: { state: WalkthroughState }) {
  if (!state.hasEverSent) {
    return (
      <aside className="kb-xp" aria-labelledby="kb-xp-intro-h">
        <div className="kb-xp-in" key="intro">
          <h3 id="kb-xp-intro-h" className="kb-xp-h">
            {KB_WALKTHROUGH_INTRO.title}
          </h3>
          <p className="kb-xp-p">{KB_WALKTHROUGH_INTRO.body}</p>
          <div className="kb-xp-rule" />
          <h4 className="kb-xp-sub">{KB_WALKTHROUGH_INTRO.howTitle}</h4>
          <p className="kb-xp-p">{KB_WALKTHROUGH_INTRO.how}</p>
        </div>
      </aside>
    )
  }

  const step = KB_STEP_EXPLANATIONS[state.stepIdx]
  const level = outcomeLevel(state)
  const headingId = `kb-xp-step-${step.number}`

  let pending: string | null = null
  if (level === 'none') {
    if (state.status === 'reasoning') pending = 'Replaying the recorded result in Slack…'
    else if (state.stepIdx === STEP_TICKET && state.status === 'done')
      pending = 'The review form is open. Continue to the recorded confirmation to see the result.'
    else pending = 'Press Send to replay this command’s recorded result.'
  } else if (level === 'partial') {
    pending =
      state.sub === 1 && state.status === 'reasoning'
        ? 'Replaying /kb diff in Slack…'
        : 'Next, load and send /kb diff to see what changed.'
  }

  const outcomeText = level === 'partial' ? step.partialOutcome ?? '' : step.outcome

  return (
    <aside className="kb-xp" aria-labelledby={headingId}>
      <div className="kb-xp-in" key={`step-${state.stepIdx}`}>
        <p className="lab kb-xp-lab">
          <span className="kb-xp-num">{step.number}</span> / 08
          {state.stepIdx === STEP_CHANGES && (
            <span className="kb-xp-part"> · Command {state.sub + 1} of 2</span>
          )}
        </p>
        <h3 id={headingId} className="kb-xp-h">
          {step.title}
        </h3>

        <p className="lab kb-xp-k">{step.whyLabel}</p>
        <p className="kb-xp-p">{step.why}</p>

        {level !== 'none' && (
          <div className="kb-xp-fade" key={`outcome-${level}`}>
            <div className="kb-xp-rule" />
            <p className="lab kb-xp-k">{step.outcomeLabel}</p>
            <p className="kb-xp-p">{outcomeText}</p>
            {level === 'full' && (
              <>
                <p className="lab kb-xp-k">WHY IT MATTERS</p>
                <p className="kb-xp-p kb-xp-matters">{step.matters}</p>
              </>
            )}
          </div>
        )}

        {pending && (
          <p className="kb-xp-pending" key={`pending-${pending}`}>
            {pending}
          </p>
        )}
      </div>
    </aside>
  )
}
