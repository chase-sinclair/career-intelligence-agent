'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_STEPS } from '@/components/kb-agent/SlackWalkthroughSection04'

/**
 * The single source of truth for Section 04's replay.
 *
 * The standalone demo owned its own state machine and exposed only
 * `onStepChange`, which would have left the explanation panel guessing at
 * replay progress from the outside. Instead this hook owns every piece of
 * replay state and both children render from it: the Slack replay is a
 * controlled view, and the explanation panel is a pure function of the same
 * object. "Output is visible" and "panel reveals the finding" are therefore
 * the same React render, not two timers that might drift.
 *
 * Stale timers are impossible by construction: every Send takes a fresh run
 * id, every selection invalidates it, and a timer only applies its update if
 * its id is still current.
 */

export type ReplayStatus = 'idle' | 'reasoning' | 'done'
export type TicketStage = 'modal' | 'confirmed' | 'notion'

export const TICKET_STAGES: ReadonlyArray<TicketStage> = ['modal', 'confirmed', 'notion']

/** Index of the two special steps in `DEMO_STEPS`. */
export const STEP_CHANGES = 6
export const STEP_TICKET = 7

/** Reasoning line cadence carried over unchanged from the standalone demo. */
const LINE_MS = 650
const SETTLE_MS = 550

export interface WalkthroughState {
  /** 0..7 */
  stepIdx: number
  /** Step 07 only: 0 = `/kb changes`, 1 = `/kb diff`. */
  sub: 0 | 1
  status: ReplayStatus
  /** How many reasoning lines are on screen while `status === 'reasoning'`. */
  visibleLines: number
  /** Step 08 only: the stage the Slack replay is currently displaying. */
  stage: TicketStage
  /** Furthest Step 08 stage reached in this run; later stage tabs stay locked. */
  stageReached: number
  /** Step 07 only: `/kb changes` has returned since Step 07 was selected. */
  changesSeen: boolean
  /** Sticky for the session. The first Send dismisses the panel introduction. */
  hasEverSent: boolean
}

const INITIAL: WalkthroughState = {
  stepIdx: 0,
  sub: 0,
  status: 'idle',
  visibleLines: 0,
  stage: 'modal',
  stageReached: 0,
  changesSeen: false,
  hasEverSent: false,
}

/** The reasoning lines for whatever is loaded in the composer. */
export function reasoningLinesFor(stepIdx: number, sub: 0 | 1): ReadonlyArray<string> {
  const step = DEMO_STEPS[stepIdx]
  if (step.subCommands) return step.subCommands[sub].reasoningLines
  return step.reasoningLines ?? []
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

export interface WalkthroughActions {
  selectStep: (index: number) => void
  selectSub: (sub: 0 | 1) => void
  send: () => void
  setStage: (stage: TicketStage) => void
}

export function useWalkthroughReplay() {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<WalkthroughState>(INITIAL)

  const stateRef = useRef(state)
  stateRef.current = state
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const runRef = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const cancelRun = useCallback(() => {
    runRef.current += 1
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => cancelRun, [cancelRun])

  const selectStep = useCallback(
    (index: number) => {
      cancelRun()
      setState((s) => ({
        ...s,
        stepIdx: index,
        sub: 0,
        status: 'idle',
        visibleLines: 0,
        stage: 'modal',
        stageReached: 0,
        changesSeen: false,
      }))
    },
    [cancelRun],
  )

  /** Step 07 only. Loads a subcommand into the composer; never executes it. */
  const selectSub = useCallback(
    (sub: 0 | 1) => {
      cancelRun()
      setState((s) => ({ ...s, sub, status: 'idle', visibleLines: 0 }))
    },
    [cancelRun],
  )

  const send = useCallback(() => {
    const s = stateRef.current
    if (s.status === 'reasoning') return
    cancelRun()
    const run = runRef.current
    const lines = reasoningLinesFor(s.stepIdx, s.sub)

    const complete = () =>
      setState((cur) => ({
        ...cur,
        status: 'done',
        visibleLines: lines.length,
        stage: 'modal',
        stageReached: 0,
        changesSeen: cur.changesSeen || (cur.stepIdx === STEP_CHANGES && cur.sub === 0),
      }))

    // Step 01 has no activity lines, and reduced motion skips the staging:
    // the result appears at once, and the panel reveals in the same render.
    if (lines.length === 0 || reducedRef.current) {
      setState((cur) => ({ ...cur, hasEverSent: true }))
      complete()
      return
    }

    // The introduction is replaced at interaction time, not when the timer ends.
    setState((cur) => ({ ...cur, hasEverSent: true, status: 'reasoning', visibleLines: 1 }))

    const at = (ms: number, fn: () => void) => {
      timersRef.current.push(
        setTimeout(() => {
          if (runRef.current === run) fn()
        }, ms),
      )
    }
    for (let i = 1; i < lines.length; i++) {
      at(i * LINE_MS, () => setState((cur) => ({ ...cur, visibleLines: i + 1 })))
    }
    at(lines.length * LINE_MS + SETTLE_MS, complete)
  }, [cancelRun])

  /**
   * Step 08 only, and only once its replay is on screen. A stage can be shown
   * once it has been reached through the guided progression; after that the
   * visitor may move back and forth freely.
   */
  const setStage = useCallback((stage: TicketStage) => {
    setState((s) => {
      if (s.stepIdx !== STEP_TICKET || s.status !== 'done') return s
      const idx = TICKET_STAGES.indexOf(stage)
      if (idx > s.stageReached + 1) return s
      return { ...s, stage, stageReached: Math.max(s.stageReached, idx) }
    })
  }, [])

  const actions: WalkthroughActions = { selectStep, selectSub, send, setStage }
  return { state, actions, reduced }
}

/**
 * How much of a step's outcome the explanation panel may show, given exactly
 * what the Slack replay is displaying right now.
 */
export type OutcomeLevel = 'none' | 'partial' | 'full'

export function outcomeLevel(s: WalkthroughState): OutcomeLevel {
  if (s.stepIdx === STEP_CHANGES) {
    if (s.sub === 1) return s.status === 'done' ? 'full' : s.changesSeen ? 'partial' : 'none'
    return s.status === 'done' ? 'partial' : 'none'
  }
  if (s.status !== 'done') return 'none'
  if (s.stepIdx === STEP_TICKET) return s.stage === 'modal' ? 'none' : 'full'
  return 'full'
}
