'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Eyebrow } from '@/components/shared/typography'
import { Glyph, ARROW_PATH, EXTERNAL_PATH } from '@/components/case-study/chrome'

/**
 * Project closing: "Continue the conversation" knowledge-base CTA plus the
 * quiet utility row (Back to projects · View source code · Back to top).
 *
 * Reusable across case studies; everything project-specific arrives as props.
 * Styles live in `PROJECT_CLOSING_CSS`, scoped under `.case-study .pc-root`, so
 * a page mounts it by appending that string to `extraCss`. It depends only on
 * the `.case-study` shell sheet, never on a page's own sheet.
 *
 * HAND-OFF MODE: PREFILL, deliberately. Ask/Enter navigates to the existing
 * assistant at `/knowledge-base?q=<question>`, which reads `q` once on mount and
 * puts it in its own composer. Nothing is sent until the visitor presses the
 * assistant's own Ask. This reuses the one prefill path the assistant already
 * has (Eval Lab links use it too) instead of adding a second mechanism, so:
 *   - no new endpoint, chat UI, or parallel call to the backend;
 *   - the evidence gate, generation, evaluation and session handling are the
 *     assistant's own, untouched;
 *   - refresh and Back can never resend, because nothing is ever sent here.
 * Tradeoff: the question is visible in the URL and browser history. It is the
 * visitor's own text, and the assistant already accepts it this way.
 *
 * `QUESTION_MAX` mirrors the assistant's own 300-character cap on `q`, so the
 * field stops at the limit instead of the assistant truncating silently.
 * The form also carries `action`/`name="q"`, so without JavaScript it falls
 * back to the same GET hand-off.
 */
export const ASSISTANT_PATH = '/knowledge-base'
export const QUESTION_MAX = 300

export const PROJECT_CLOSING_COPY = {
  eyebrow: 'Continue the conversation',
  heading: 'Want to know more about this build?',
  placeholder: 'Ask a question about my experience...',
  submit: 'Ask',
  note: 'Opens your question in the knowledge base.',
  suggestionsLabel: 'Suggested questions',
  back: 'Back to projects',
  source: 'View source code',
  top: 'Back to top',
} as const

export function assistantHref(question: string) {
  return `${ASSISTANT_PATH}?q=${encodeURIComponent(question.trim().slice(0, QUESTION_MAX))}`
}

type Props = {
  /** Shown in the description: "Ask my AI-powered knowledge base about {projectName}, …" */
  projectName: string
  suggestions: ReadonlyArray<string>
  /** Public source URL. Omit (or pass null) to hide the link entirely. */
  sourceUrl?: string | null
  /** id of the case study's top element; Back to top scrolls to it and focuses its h1. */
  topId: string
}

export default function ProjectClosing({ projectName, suggestions, sourceUrl, topId }: Props) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const leaving = useRef(false)
  const uid = useId()
  const inputId = `${uid}-q`
  const noteId = `${uid}-note`
  const question = value.trim()

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!question || leaving.current) return
    leaving.current = true
    try {
      router.push(assistantHref(question))
    } catch {
      // Keep the typed question in place so the visitor can retry.
      leaving.current = false
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter that commits an IME composition must not submit.
    if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
  }

  function pick(q: string) {
    setValue(q.slice(0, QUESTION_MAX))
    const el = inputRef.current
    if (!el) return
    el.focus({ preventScroll: true })
    requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length))
  }

  function toTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    const h = document.getElementById(topId)?.querySelector<HTMLElement>('h1')
    if (h) {
      if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1')
      h.focus({ preventScroll: true })
    }
  }

  return (
    <div className="pc-root">
      <section className="pc-panel" aria-labelledby={`${uid}-h`}>
        <Eyebrow>{PROJECT_CLOSING_COPY.eyebrow}</Eyebrow>
        <h2 id={`${uid}-h`} className="pc-h">{PROJECT_CLOSING_COPY.heading}</h2>
        <p className="pc-desc">
          Ask my AI-powered knowledge base about {projectName}, the engineering decisions behind it, or anything
          else about my projects and professional experience.
        </p>

        <form className="pc-form" action={ASSISTANT_PATH} method="get" onSubmit={submit} role="search" aria-label="Ask the knowledge base">
          <label htmlFor={inputId} className="pc-sr">Your question for the knowledge base</label>
          <div className="pc-field">
            <svg className="pc-spark" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              id={inputId}
              name="q"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={PROJECT_CLOSING_COPY.placeholder}
              maxLength={QUESTION_MAX}
              autoComplete="off"
              enterKeyHint="go"
              aria-describedby={noteId}
            />
            <button type="submit" className="pc-ask" disabled={!question}>
              <span>{PROJECT_CLOSING_COPY.submit}</span>
              <Glyph d={ARROW_PATH} size={11} />
            </button>
          </div>
          <p id={noteId} className="pc-note">{PROJECT_CLOSING_COPY.note}</p>
        </form>

        <p className="lab pc-sl" id={`${uid}-sl`}>{PROJECT_CLOSING_COPY.suggestionsLabel}</p>
        <ul className="pc-chips" aria-labelledby={`${uid}-sl`}>
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" className="pc-chip" onClick={() => pick(s)}>{s}</button>
            </li>
          ))}
        </ul>
      </section>

      <div className="pc-rule" aria-hidden="true" />

      <nav className="pc-nav" aria-label="Project navigation">
        <Link href="/projects" className="pc-link">
          <span className="pc-flip" aria-hidden="true"><Glyph d={ARROW_PATH} size={11} /></span>
          {PROJECT_CLOSING_COPY.back}
        </Link>
        <div className="pc-right">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="pc-link">
              {PROJECT_CLOSING_COPY.source}
              <span aria-hidden="true"><Glyph d={EXTERNAL_PATH} size={11} /></span>
              <span className="pc-sr"> (opens in a new tab)</span>
            </a>
          ) : null}
          <button type="button" className="pc-link" onClick={toTop}>
            {PROJECT_CLOSING_COPY.top}
            <span className="pc-up" aria-hidden="true"><Glyph d={ARROW_PATH} size={11} /></span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export const PROJECT_CLOSING_CSS = `
.case-study .pc-root { scroll-margin-top: 84px; }
.case-study .pc-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.case-study .pc-panel {
  border-radius: 16px;
  padding: 30px 34px 28px;
  background:
    radial-gradient(120% 140% at 0% 0%, rgba(var(--accent-rgb), 0.07), transparent 65%),
    var(--panel);
  border: 0.5px solid rgba(var(--ink-rgb), 0.12);
  box-shadow: 0 1px 3px rgba(var(--ink-rgb), 0.04);
}
.case-study .pc-panel > p:first-child { margin-bottom: 12px; }
.case-study .pc-h {
  font-size: 23px; font-weight: 400; letter-spacing: -0.02em; line-height: 1.2;
  color: var(--ink); margin: 0 0 8px;
}
.case-study .pc-desc {
  max-width: 68ch; margin: 0 0 20px;
  font-size: 14px; line-height: 1.6; color: rgba(var(--ink-rgb), 0.72);
}
.case-study .pc-form { margin: 0; }
.case-study .pc-field {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 8px 8px 14px; border-radius: 12px;
  background: var(--panel-2);
  border: 0.5px solid rgba(var(--ink-rgb), 0.14);
  transition: border-color 0.18s, background 0.18s;
}
.case-study .pc-field:focus-within { border-color: rgba(var(--accent-rgb), 0.45); background: var(--panel-solid); }
.case-study .pc-spark { color: var(--accent); flex-shrink: 0; }
.case-study .pc-field input {
  flex: 1; min-width: 0; background: transparent; border: 0; outline: none;
  font-size: 14px; color: rgba(var(--ink-rgb), 0.86); font-family: inherit;
}
.case-study .pc-field input::placeholder { color: rgba(var(--ink-rgb), 0.5); }
.case-study .pc-ask {
  display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0;
  padding: 8px 14px; border-radius: 9px; cursor: pointer;
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  background: var(--accent); color: var(--accent-ink); border: 0.5px solid var(--accent);
  transition: opacity 0.18s, background 0.18s;
}
.case-study .pc-ask:hover:not(:disabled) { background: rgba(var(--accent-rgb), 0.88); }
.case-study .pc-ask:disabled { opacity: 0.42; cursor: not-allowed; }
.case-study .pc-note { margin: 8px 0 0 2px; font-size: 11.5px; color: rgba(var(--ink-rgb), 0.6); }
.case-study .pc-sl { margin: 20px 0 10px; }
.case-study .pc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.case-study .pc-chip {
  padding: 7px 13px; border-radius: 999px; cursor: pointer; text-align: left;
  font-size: 13px; line-height: 1.35; color: rgba(var(--ink-rgb), 0.8);
  background: var(--panel-2); border: 0.5px solid rgba(var(--ink-rgb), 0.16);
  transition: border-color 0.18s, color 0.18s, background 0.18s;
}
.case-study .pc-chip:hover { border-color: rgba(var(--accent-rgb), 0.45); color: var(--ink); background: var(--panel-solid); }
.case-study .pc-rule { height: 1px; margin: 40px 0 0; background: rgba(var(--ink-rgb), 0.10); }
.case-study .pc-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 0 4px; }
.case-study .pc-right { display: flex; align-items: center; gap: 28px; }
.case-study .pc-link {
  display: inline-flex; align-items: center; gap: 7px; padding: 4px 0;
  background: none; border: 0; cursor: pointer; font-family: inherit;
  font-size: 12px; color: rgba(var(--ink-rgb), 0.66); transition: color 0.18s;
}
.case-study .pc-link:hover { color: var(--accent); }
.case-study .pc-flip { display: inline-flex; transform: rotate(180deg); }
.case-study .pc-up { display: inline-flex; transform: rotate(-90deg); }
.case-study .pc-root :is(input, button, a):focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.case-study .pc-field input:focus-visible { outline: none; }
.case-study .pc-field:has(input:focus-visible) { box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.55); }
`
