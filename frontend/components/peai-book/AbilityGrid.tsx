'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ABILITIES, FAMILIES, WORKED_EXAMPLES } from '@/lib/peai-book-data'

export type GridMode = 'intro' | 'explore' | 'worked'

const HINTS: Record<GridMode, string> = {
  intro: 'Perceive · Reason · Act',
  explore: 'Select an ability to see its row',
  worked: 'Business problem → abilities → models',
}

/** Cell stagger, matching the mock: 120ms in, 55ms apart, column by column. */
const STAGGER_START = 120
const STAGGER_GAP = 55

/** Auto-advance tour: 450ms before the first, 980ms between each. */
const TOUR_LEAD = 450
const TOUR_GAP = 980

/**
 * State for the one interactive artifact.
 *
 * It lives in a hook rather than inside the grid because the grid sits in the
 * sticky column while the example pills sit in section 6 of the narrative
 * column. They are two places in the tree driving one artifact, so the page
 * owns the state and hands each piece what it needs.
 */
export function useAbilityGrid(mode: GridMode, cellsRevealed: boolean) {
  const [shownCells, setShownCells] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [example, setExample] = useState<number | null>(null)

  const touredRef = useRef(false)
  const tourTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopTour = useCallback(() => {
    if (tourTimer.current) {
      clearTimeout(tourTimer.current)
      tourTimer.current = null
    }
  }, [])

  /**
   * `force` makes the setter idempotent for the tour. Without it, the tour
   * re-selecting the example already showing would toggle it back off.
   */
  const chooseExample = useCallback((index: number | null, force = false) => {
    setExample((current) => (!force && current === index ? null : index))
  }, [])

  /** Any manual pill click cancels the tour and marks it spent. */
  const pickExample = useCallback(
    (index: number) => {
      stopTour()
      touredRef.current = true
      chooseExample(index)
    },
    [stopTour, chooseExample],
  )

  const toggleAbility = useCallback((name: string) => {
    setSelected((current) => (current === name ? null : name))
  }, [])

  const runTour = useCallback(() => {
    if (touredRef.current) return
    touredRef.current = true
    let k = 0
    const step = () => {
      chooseExample(k, true)
      k += 1
      tourTimer.current = setTimeout(
        k < WORKED_EXAMPLES.length
          ? step
          : () => {
              // Settle on Customer churn rather than stopping on the last one.
              chooseExample(0, true)
              tourTimer.current = null
            },
        TOUR_GAP,
      )
    }
    tourTimer.current = setTimeout(step, TOUR_LEAD)
  }, [chooseExample])

  // Cell entrance, once, when the chapter's first section arrives.
  useEffect(() => {
    if (!cellsRevealed) return
    const ids = ABILITIES.map((_, i) =>
      setTimeout(() => setShownCells((n) => Math.max(n, i + 1)), STAGGER_START + i * STAGGER_GAP),
    )
    return () => ids.forEach(clearTimeout)
  }, [cellsRevealed])

  // Mode ownership is measured by the page and arrives here as a plain value.
  useEffect(() => {
    if (mode === 'intro') {
      stopTour()
      setSelected(null)
      chooseExample(null, true)
      return
    }
    if (mode === 'explore') {
      stopTour()
      chooseExample(null, true)
      return
    }
    // worked: run the tour once, otherwise restore a sensible selection.
    setSelected(null)
    if (!touredRef.current) {
      runTour()
    } else {
      setExample((current) => (current === null ? 0 : current))
    }
  }, [mode, stopTour, chooseExample, runTour])

  useEffect(() => stopTour, [stopTour])

  return { shownCells, selected, example, toggleAbility, pickExample }
}

/**
 * The grid itself: three family cards over three columns of four ability
 * cells, with the detail drawer beneath.
 *
 * A single instance carries sections 4 through 6. It is never unmounted
 * between modes, so cells visibly re-light in place rather than reappearing,
 * and that continuity is the point of the chapter.
 */
export default function AbilityGrid({
  mode,
  shownCells,
  selected,
  example,
  onToggleAbility,
}: {
  mode: GridMode
  shownCells: number
  selected: string | null
  example: number | null
  onToggleAbility: (name: string) => void
}) {
  const activePath = example === null ? null : WORKED_EXAMPLES[example].path
  const detail = selected === null ? null : ABILITIES.find((a) => a.name === selected) ?? null

  return (
    <div className="gridcol">
      <div className="gridshell">
        <div className="famrow">
          {FAMILIES.map((f) => (
            <div key={f.key} className="fam">
              <b>{f.key.toUpperCase()}</b>
              <span>{f.description}</span>
            </div>
          ))}
        </div>

        <div className="cells">
          {FAMILIES.map((family, familyIndex) => (
            <div key={family.key} className="col">
              {ABILITIES.filter((a) => a.family === familyIndex).map((ability) => {
                const order = ABILITIES.indexOf(ability)
                const step = activePath ? activePath.indexOf(ability.name) : -1
                const lit = step > -1
                const dim = Boolean(activePath) && !lit
                return (
                  <button
                    key={ability.name}
                    type="button"
                    className={`cell${order < shownCells ? ' shown' : ''}${lit ? ' lit' : ''}${dim ? ' dim' : ''}`}
                    aria-pressed={selected === ability.name}
                    onClick={() => onToggleAbility(ability.name)}
                  >
                    <span className="step">{lit ? step + 1 : ''}</span>
                    <span className="idx">{ability.row}</span>
                    <span className="nm">{ability.name}</span>
                    <span className="sub">{ability.sub}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="gridhint">
          <span>{HINTS[mode]}</span>
          <span className="src">Table 1 &middot; Ch. 1</span>
        </div>
      </div>

      <div className={`detail${detail ? ' open' : ''}`}>
        <div className="dbox">
          {detail && (
            <>
              <div className="dhead">
                <b>{detail.name}</b>
                <i>
                  {detail.sub} &middot; {FAMILIES[detail.family].key}
                </i>
              </div>
              <dl>
                <div className="drow">
                  <dt>Model types</dt>
                  <dd>
                    {detail.modelTypes.map((m) => (
                      <span key={m} className="mt">
                        {m}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="drow">
                  <dt>Model family</dt>
                  <dd>{detail.modelFamily}</dd>
                </div>
                <div className="drow">
                  <dt>Training</dt>
                  <dd>{detail.training}</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** The four example pills and the resolved path line, rendered inside §6. */
export function WorkedExamplePills({
  example,
  onPick,
}: {
  example: number | null
  onPick: (index: number) => void
}) {
  return (
    <>
      <p className="flowlab">Trace an example</p>
      <div className="flow">
        {WORKED_EXAMPLES.map((e, i) => (
          <button key={e.label} type="button" aria-pressed={example === i} onClick={() => onPick(i)}>
            {e.label}
          </button>
        ))}
      </div>
      <p className="pathline">
        {example !== null && (
          <>
            {WORKED_EXAMPLES[example].label} &nbsp;=&nbsp;{' '}
            {WORKED_EXAMPLES[example].path.map((step, i) => (
              <span key={step}>
                {i > 0 && ' → '}
                <b>{step}</b>
              </span>
            ))}
          </>
        )}
      </p>
    </>
  )
}
