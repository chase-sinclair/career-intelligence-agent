'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowUpRight } from 'lucide-react'
import TopNav from '@/components/TopNav'
import { chat as sendChat } from '@/lib/api'
import type { ChatResponse, EvaluationScores, EvidenceSufficiency, EvidenceSnippet } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  scores?: EvaluationScores
  evidence_sufficiency?: EvidenceSufficiency
  sources?: string[]
  evidence_snippets?: EvidenceSnippet[]
}

interface SessionQualityEntry {
  id: string
  question: string
  answer: string
  sources: string[]
  evidence_snippets: EvidenceSnippet[]
  scores: EvaluationScores
  evidence_sufficiency: EvidenceSufficiency
  processingTime: number
  createdAt: string
}

/** idle → thinking (stage line) → tracing (source rows) → answering (typewriter) */
type Phase = 'idle' | 'thinking' | 'tracing' | 'answering'

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'career-architect-answer-quality-session'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const QUESTION_POOL = [
  'What AI systems has Chase built in production?',
  'How does Chase approach LLM evaluation?',
  "What is Chase's experience with RAG pipelines?",
  'What kind of roles is Chase looking for?',
  'What has Chase shipped with LangGraph?',
  'How does Chase handle hallucination in RAG systems?',
  'What does Chase do at Booz Allen Hamilton?',
  'Which cloud and data platforms has Chase worked with?',
  'Has Chase led or mentored other engineers?',
  'What multi-agent systems has Chase designed?',
  'How does Chase measure whether an answer is grounded?',
  'What has Chase published or co-authored?',
]

/**
 * Pipeline stages shown while a request is in flight. Deliberately free of
 * corpus counts: the live index is small enough that a hardcoded figure would
 * be stale after the next ingestion, and there is no public endpoint that
 * returns a chunk count.
 */
const STAGES = [
  'Embedding query',
  'Searching the knowledge base',
  'Scoring relevance',
  'Re-ranking top candidates',
  'Checking evidence gate',
  'Grounding claims against sources',
  'Drafting answer',
]

const STAGE_MS = 620
const SUGGEST_CYCLE_MS = 8000
const TRACE_ROW_MS = 135
const TRACE_HOLD_MS = 900

/**
 * Follow-up questions are derived client-side from the question that was just
 * asked. The alternatives — a second model call, or returning them on
 * ChatResponse — both need changes outside this page, which this handoff
 * rules out. Keyed on topic so the chips stay relevant without inventing
 * claims; every entry is a question, never an assertion.
 */
const FOLLOW_UPS: { match: RegExp; questions: string[] }[] = [
  { match: /\brag\b|retriev|vector|chunk|embed/i, questions: [
    'How does Chase evaluate retrieval quality?',
    'Which vector databases has Chase used in production?',
    'How does Chase handle follow-up questions in a RAG system?',
  ] },
  { match: /eval|score|ground|hallucinat|judge|quality/i, questions: [
    'What does the evidence gate actually check?',
    'How does Chase catch unsupported claims in an answer?',
    'What AI systems has Chase built in production?',
  ] },
  { match: /agent|langgraph|orchestrat|multi-?agent|workflow/i, questions: [
    'How does Chase design state in a LangGraph workflow?',
    'What multi-agent systems has Chase designed?',
    'How does Chase decide when an agent should stop?',
  ] },
  { match: /role|hiring|looking|opportunit|job|career goal/i, questions: [
    'What is Chase working on right now?',
    'What AI systems has Chase built in production?',
    'Has Chase led or mentored other engineers?',
  ] },
  { match: /booz|bah|client|federal|consult|experience|work/i, questions: [
    'What did Chase deliver for federal clients?',
    'Has Chase led or mentored other engineers?',
    'What has Chase built outside of client work?',
  ] },
  { match: /cloud|aws|data|pipeline|snowflake|databricks|etl|sql/i, questions: [
    'Which cloud platforms has Chase deployed on?',
    'How does Chase structure a data pipeline?',
    'What AI systems has Chase built in production?',
  ] },
  { match: /publish|book|author|cert|degree|education/i, questions: [
    'What has Chase published or co-authored?',
    'Which certifications has Chase earned?',
    'What did Chase study at Virginia Tech?',
  ] },
]

const FOLLOW_UPS_DEFAULT = [
  'What AI systems has Chase built in production?',
  'How does Chase approach LLM evaluation?',
  'What kind of roles is Chase looking for?',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripInlineCitations(text: string): string {
  const sourcesIdx = text.search(/\n\nSources:/)
  if (sourcesIdx !== -1) {
    const body = text.slice(0, sourcesIdx).replace(/\s*\[\d+\]/g, '')
    return body + text.slice(sourcesIdx)
  }
  return text.replace(/\s*\[\d+\]/g, '')
}

/** Distinct [n] markers actually referenced in the answer body. Must run on the
 *  raw string, before stripInlineCitations removes them. */
function countCitedSources(rawAnswer: string): number {
  const sourcesIdx = rawAnswer.search(/\n\nSources:/)
  const body = sourcesIdx === -1 ? rawAnswer : rawAnswer.slice(0, sourcesIdx)
  const found = body.match(/\[(\d+)\]/g)
  if (!found) return 0
  return new Set(found).size
}

/** 4 questions from the pool, never repeating the set currently on screen. */
function pickQuestions(exclude: string[]): string[] {
  const fresh = QUESTION_POOL.filter(q => !exclude.includes(q))
  const source = fresh.length >= 4 ? fresh : QUESTION_POOL
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4)
}

function followUpsFor(question: string): string[] {
  const hit = FOLLOW_UPS.find(f => f.match.test(question))
  const picked = hit ? hit.questions : FOLLOW_UPS_DEFAULT
  return picked.filter(q => q.toLowerCase() !== question.trim().toLowerCase()).slice(0, 3)
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// ── Session storage ───────────────────────────────────────────────────────────

function saveSessionEntry(entry: SessionQualityEntry) {
  if (typeof window === 'undefined') return
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  const existing: SessionQualityEntry[] = raw ? JSON.parse(raw) : []
  existing.push(entry)
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing))
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Cycling pipeline-stage line. No timer, no progress bar, no step dots. */
function StageLine({ index }: { index: number }) {
  return (
    <span className="ask-stageline-wrap">
      <span key={index} className="ask-stageline font-mono">
        {STAGES[index]}
      </span>
    </span>
  )
}

interface ScoreBarProps {
  label: string
  value: number
}

function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex justify-between">
        <span className="text-[10.5px]" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>{label}</span>
        <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(var(--ink-rgb),0.10)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, rgba(var(--accent-rgb),0.4), rgba(var(--accent-rgb),0.85))' }}
          initial={{ width: '0%' }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  )
}
// ── Page ──────────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)
  const [typingId, setTypingId] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState('')

  // Hero → chat transition. Flips once, never back.
  const [started, setStarted] = useState(false)

  // Suggested questions
  const [visibleQs, setVisibleQs] = useState<string[]>(() => QUESTION_POOL.slice(0, 4))
  const [qsIn, setQsIn] = useState(true)

  // Pipeline / retrieval trace
  const [phase, setPhase] = useState<Phase>('idle')
  const [stageIdx, setStageIdx] = useState(0)
  const [traceRows, setTraceRows] = useState<EvidenceSnippet[]>([])
  const [traceCollapsed, setTraceCollapsed] = useState(false)
  const [recap, setRecap] = useState<{ retrieved: number; cited: number } | null>(null)

  // Panel sources land on the same cadence as the trace rows
  const [panelSnippets, setPanelSnippets] = useState<EvidenceSnippet[]>([])
  const [flashIdx, setFlashIdx] = useState<number[]>([])

  // Follow-up chips
  const [followUps, setFollowUps] = useState<string[]>([])
  const [followUpFor, setFollowUpFor] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const aliveRef = useRef(true)

  useEffect(() => {
    aliveRef.current = true
    return () => { aliveRef.current = false }
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, phase, displayedText, traceRows, recap])

  // Suggested-question cycling — idle only, cleared permanently on first send
  useEffect(() => {
    if (started || isLoading) return
    const id = setInterval(() => {
      setQsIn(false)
      setTimeout(() => {
        if (!aliveRef.current) return
        setVisibleQs(prev => pickQuestions(prev))
        setQsIn(true)
      }, 300)
    }, SUGGEST_CYCLE_MS)
    return () => clearInterval(id)
  }, [started, isLoading])

  // Pipeline stage line — holds on the last stage rather than looping
  useEffect(() => {
    if (phase !== 'thinking') return
    const id = setInterval(() => {
      setStageIdx(i => (i < STAGES.length - 1 ? i + 1 : i))
    }, STAGE_MS)
    return () => clearInterval(id)
  }, [phase])

  // Typewriter effect
  useEffect(() => {
    if (!typingId) return
    const msg = messages.find(m => m.id === typingId)
    if (!msg) return

    const fullText = msg.content
    let idx = 0
    setDisplayedText('')

    typingIntervalRef.current = setInterval(() => {
      idx++
      setDisplayedText(fullText.slice(0, idx))
      if (idx >= fullText.length) {
        clearInterval(typingIntervalRef.current!)
        typingIntervalRef.current = null
        setTypingId(null)
      }
    }, 14)

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingId])

  function resetRunState() {
    setTraceRows([])
    setTraceCollapsed(false)
    setRecap(null)
    setFlashIdx([])
    setFollowUps([])
    setFollowUpFor(null)
    setStageIdx(0)
  }

  async function sendMessage(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isLoading) return

    setInput('')
    setStarted(true)
    resetRunState()

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: query,
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setPhase('thinking')

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      const response = await sendChat({ query, conversation_history: history })
      if (!aliveRef.current) return

      const snippets = response.evidence_snippets ?? []
      const cited = countCitedSources(response.answer)

      // Stage the retrieval trace: rows land one at a time, and the panel's
      // source cards land on the same cadence.
      setPhase('tracing')
      setPanelSnippets([])
      if (!hasAutoOpened) {
        setPanelOpen(true)
        setHasAutoOpened(true)
      }

      for (let i = 0; i < snippets.length; i++) {
        if (!aliveRef.current) return
        setTraceRows(prev => [...prev, snippets[i]])
        setPanelSnippets(prev => [...prev, snippets[i]])
        const landed = snippets[i].citation_index
        setFlashIdx(prev => [...prev, landed])
        setTimeout(() => {
          if (aliveRef.current) setFlashIdx(prev => prev.filter(n => n !== landed))
        }, 700)
        await sleep(TRACE_ROW_MS)
      }

      if (!aliveRef.current) return
      await sleep(TRACE_HOLD_MS)
      if (!aliveRef.current) return

      setTraceCollapsed(true)
      setRecap({ retrieved: snippets.length, cited })

      const aiId = `${Date.now()}-ai`
      const aiMsg: Message = {
        id: aiId,
        role: 'assistant',
        content: stripInlineCitations(response.answer),
        scores: response.scores,
        evidence_sufficiency: response.evidence_sufficiency,
        sources: response.sources,
        evidence_snippets: snippets,
      }
      setMessages(prev => [...prev, aiMsg])
      setLastResponse(response)
      setPhase('answering')
      setTypingId(aiId)
      setFollowUps(followUpsFor(query))
      setFollowUpFor(aiId)

      saveSessionEntry({
        id: aiId,
        question: query,
        answer: response.answer,
        sources: response.sources,
        evidence_snippets: snippets,
        scores: response.scores,
        evidence_sufficiency: response.evidence_sufficiency,
        processingTime: 0,
        createdAt: new Date().toISOString(),
      })
    } catch {
      if (!aliveRef.current) return
      // Clear the stage line and trace — never leave a pulsing avatar behind.
      setPhase('idle')
      setTraceRows([])
      setTraceCollapsed(false)
      setRecap(null)
      setPanelSnippets([])
      setFlashIdx([])
      const errMsg: Message = {
        id: `${Date.now()}-err`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      if (aliveRef.current) {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendMessage()
  }

  const sufficiency = lastResponse?.evidence_sufficiency
  const passed = sufficiency?.should_answer ?? true
  const working = phase === 'thinking' || phase === 'tracing'
  const showTraceBlock = working || traceRows.length > 0 || !!recap

  return (
    <main
      className="flex flex-col h-screen bg-[var(--bg)] overflow-hidden transition-[margin] duration-300"
      style={{ marginRight: panelOpen ? 320 : 0 }}
    >
      <TopNav subtitle="Ask About Chase" hasRightPanel={panelOpen} />

      {/* One relative stage. Hero, thread, suggestions and composer are all
          absolutely positioned inside it, so the browser tweens between the
          intro and chat layouts instead of cross-fading two trees. */}
      <div className={`ask-stage${started ? ' chat' : ''}`}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="ask-hero">
          <h1 className="ask-hero-h1 font-light tracking-[-0.03em] leading-tight" style={{ color: 'var(--ink)' }}>
            Ask About{' '}
            <em className="font-serif not-italic" style={{ color: 'var(--accent)' }}>Chase</em>
          </h1>
          <p className="ask-hero-p" style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
            Every answer is grounded in verified career artifacts and cited with evidence.
          </p>
        </div>

        {/* ── Thread ───────────────────────────────────────────────────────── */}
        <div ref={scrollRef} className="ask-thread">
          {messages.map(msg => {
            const isTypingThis = msg.id === typingId

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={msg.id}
                  className="flex justify-end"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <div
                    className="max-w-[72%] px-3.5 py-2.5 text-[13px] leading-[1.6] rounded-[14px_14px_3px_14px] relative overflow-hidden"
                    style={{
                      color: 'rgba(var(--ink-rgb),0.82)',
                      background: 'rgba(var(--accent-rgb),0.10)',
                      border: '0.5px solid rgba(var(--accent-rgb),0.22)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-[14px_14px_3px_14px] pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(var(--accent-rgb),0.08) 0%, transparent 60%)' }}
                    />
                    <span className="relative">{msg.content}</span>
                  </div>
                </motion.div>
              )
            }

            const renderedText = isTypingThis ? displayedText : msg.content
            const isStillTyping = isTypingThis && displayedText !== msg.content
            const showFollowUps = followUpFor === msg.id && !isStillTyping && followUps.length > 0

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <div className="flex gap-2.5 items-start">
                  <div
                    className="w-[25px] h-[25px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      background: 'rgba(var(--accent-rgb),0.12)',
                      border: '0.5px solid rgba(var(--accent-rgb),0.28)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.85 }} />
                  </div>

                  <div
                    className="max-w-[85%] px-3.5 py-3 text-[13.5px] leading-[1.78] rounded-[3px_14px_14px_14px] relative overflow-hidden"
                    style={{
                      color: 'rgba(var(--ink-rgb),0.82)',
                      background: 'var(--panel-2)',
                      border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(var(--ink-rgb),0.05) 0%, transparent 55%)' }}
                    />
                    <p
                      className="text-[9.5px] tracking-[0.12em] uppercase mb-1.5 relative"
                      style={{ color: 'var(--accent)' }}
                    >
                      Career Intelligence
                    </p>
                    <div className="relative whitespace-pre-wrap">
                      {renderedText}
                      {isStillTyping && (
                        <span
                          className="inline-block w-0.5 h-3 ml-px align-middle animate-blink"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {showFollowUps && (
                  <motion.div
                    className="mt-2.5 flex flex-col gap-1.5"
                    style={{ marginLeft: 36 }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <p
                      className="text-[9.5px] tracking-[0.16em] uppercase"
                      style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
                    >
                      Follow up
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {followUps.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="ask-chip text-[12px]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* ── Stage line + retrieval trace ─────────────────────────────────── */}
          {showTraceBlock && (
            <div className="flex gap-2.5 items-start">
              <div
                className={`w-[25px] h-[25px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center${working ? ' ask-pulse' : ''}`}
                style={{
                  background: 'rgba(var(--accent-rgb),0.12)',
                  border: '0.5px solid rgba(var(--accent-rgb),0.28)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.85 }} />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                {phase === 'thinking' && <StageLine index={stageIdx} />}

                <div className={`ask-trace${traceCollapsed ? ' collapsed' : ''}`}>
                  {traceRows.map((row, i) => (
                    <div key={`${row.citation_index}-${i}`} className="ask-trace-row">
                      <span className="ask-trace-idx font-mono">[{row.citation_index}]</span>
                      <span className="ask-trace-src font-mono">{row.source}</span>
                    </div>
                  ))}
                </div>

                {recap && (
                  <button
                    onClick={() => setTraceCollapsed(v => !v)}
                    className="ask-recap font-mono"
                  >
                    {recap.retrieved} sources retrieved · {recap.cited} cited
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Suggested questions ──────────────────────────────────────────── */}
        <div className="ask-suggest">
          <p
            className="text-[9.5px] tracking-[0.16em] uppercase text-center mb-2.5"
            style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
          >
            Suggested questions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {visibleQs.map((q, i) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className={`ask-card${qsIn ? ' in' : ' out'}`}
                style={{ transitionDelay: `${i * (qsIn ? 55 : 45)}ms` }}
              >
                <span className="relative">{q}</span>
                <ArrowUpRight size={12} className="ask-card-arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Composer ─────────────────────────────────────────────────────── */}
        <div className="ask-composer">
          <div className="ask-qualityrow">
            <button
              onClick={() => setPanelOpen(v => !v)}
              className="inline-flex items-center gap-1.5 text-[9.5px] tracking-[0.12em] uppercase rounded-md px-2 py-1 transition-all duration-150"
              style={
                panelOpen
                  ? {
                      color: 'var(--accent)',
                      border: '0.5px solid rgba(var(--accent-rgb),0.25)',
                      background: 'rgba(var(--accent-rgb),0.06)',
                    }
                  : {
                      color: 'rgba(var(--ink-rgb),0.60)',
                      border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                      background: 'var(--panel-2)',
                    }
              }
            >
              Answer Quality Check
              <ArrowUpRight size={10} />
            </button>
          </div>

          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--panel-2)',
              border: '0.5px solid rgba(var(--ink-rgb),0.10)',
              backdropFilter: 'blur(8px)',
            }}
            onFocus={e =>
              e.currentTarget.style.cssText += '; border-color: rgba(var(--accent-rgb),0.30); background: var(--panel)'
            }
            onBlur={e =>
              e.currentTarget.style.cssText += '; border-color: rgba(var(--ink-rgb),0.10); background: var(--panel-2)'
            }
          >
            <Search size={14} style={{ color: 'rgba(var(--ink-rgb),0.60)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask the career knowledge base anything…"
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] font-sans disabled:opacity-50"
              style={{ color: 'rgba(var(--ink-rgb),0.82)' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none"
              style={{
                background: 'rgba(var(--accent-rgb),0.15)',
                border: '0.5px solid rgba(var(--accent-rgb),0.28)',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb),0.25)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--accent-rgb),0.15)')
              }
            >
              <span className="text-[10.5px] font-medium tracking-[0.08em]" style={{ color: 'var(--accent)' }}>
                ASK
              </span>
              <ArrowUpRight size={10} style={{ color: 'var(--accent)' }} />
            </button>
          </div>

          <p className="ask-groundline font-mono">
            Grounded in verified career artifacts · every claim cited
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────────── */}
      <motion.div
        className="fixed top-16 right-0 bottom-0 flex flex-col overflow-hidden z-50"
        style={{ width: 320 }}
        animate={{ x: panelOpen ? 0 : '100%' }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <div
          className="flex flex-col h-full"
          style={{
            background: 'var(--panel-solid)',
            borderLeft: '1px solid rgba(var(--ink-rgb),0.10)',
            backdropFilter: 'blur(20px)',
          }}
        >

          {/* ── Evidence Check ──────────────────────────────────────────────── */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(var(--ink-rgb),0.07)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[9.5px] tracking-[0.16em] uppercase"
                style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
              >
                Evidence Check
              </p>
              {sufficiency && (
                <span
                  className="text-[9.5px] px-2 py-0.5 rounded-full"
                  style={
                    passed
                      ? {
                          background: 'rgba(110,231,183,0.08)',
                          border: '0.5px solid rgba(110,231,183,0.20)',
                          color: 'rgba(110,231,183,0.70)',
                        }
                      : {
                          background: 'rgba(251,191,36,0.08)',
                          border: '0.5px solid rgba(251,191,36,0.20)',
                          color: 'rgba(251,191,36,0.75)',
                        }
                  }
                >
                  {passed ? 'Pass' : 'Insufficient'}
                </span>
              )}
            </div>

            {sufficiency ? (
              <>
                <ScoreBar label="Relevance" value={sufficiency.relevance} />
                <ScoreBar label="Coverage" value={sufficiency.coverage} />
                <ScoreBar label="Source Quality" value={sufficiency.source_quality} />

                {sufficiency.conflict_flag && (
                  <div
                    className="mt-2 px-2 py-1.5 rounded-lg text-[11px] leading-relaxed"
                    style={{
                      background: 'rgba(251,191,36,0.06)',
                      border: '0.5px solid rgba(251,191,36,0.18)',
                      color: 'rgba(251,191,36,0.65)',
                    }}
                  >
                    Conflicting information detected in sources
                  </div>
                )}
              </>
            ) : (
              <p
                className="text-[11px] text-center py-2"
                style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
              >
                Ask a question to see evidence scores
              </p>
            )}
          </div>

          {/* ── Answer Quality ──────────────────────────────────────────────── */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(var(--ink-rgb),0.07)' }}
          >
            <p
              className="text-[9.5px] tracking-[0.16em] uppercase mb-3"
              style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
            >
              Answer Quality
            </p>

            {lastResponse ? (
              passed ? (
                <>
                  <ScoreBar label="Groundedness" value={lastResponse.scores.groundedness} />
                  <ScoreBar label="Completeness" value={lastResponse.scores.completeness} />

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10.5px]" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>
                      Unsupported claims
                    </span>
                    {lastResponse.scores.unsupported_claim ? (
                      <span
                        className="text-[9.5px] px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '0.5px solid rgba(239,68,68,0.22)',
                          color: 'rgba(239,68,68,0.75)',
                        }}
                      >
                        Flagged
                      </span>
                    ) : (
                      <span
                        className="text-[9.5px] px-2 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(110,231,183,0.1)',
                          border: '0.5px solid rgba(110,231,183,0.22)',
                          color: 'rgba(110,231,183,0.75)',
                        }}
                      >
                        None
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p
                  className="text-[11px] py-1 leading-relaxed"
                  style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
                >
                  Not evaluated — evidence gate blocked generation
                </p>
              )
            ) : (
              <p
                className="text-[11px] text-center py-2"
                style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
              >
                Ask a question to see quality scores
              </p>
            )}
          </div>

          {/* ── Evidence Sources ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <p
              className="text-[9.5px] tracking-[0.16em] uppercase mb-1 flex-shrink-0"
              style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
            >
              Evidence Sources
            </p>

            {panelSnippets.length > 0 ? (
              panelSnippets.map((snippet) => (
                <div
                  key={snippet.citation_index}
                  className={`ask-srccard relative overflow-hidden rounded-lg p-2.5${flashIdx.includes(snippet.citation_index) ? ' flash' : ''}`}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(var(--ink-rgb),0.03) 0%, transparent 55%)' }}
                  />
                  <div className="flex items-center gap-1.5 mb-1.5 relative">
                    <span
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(var(--accent-rgb),0.10)',
                        border: '0.5px solid rgba(var(--accent-rgb),0.20)',
                        color: 'var(--accent)',
                      }}
                    >
                      [{snippet.citation_index}]
                    </span>
                    <span
                      className="text-[9.5px] px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--panel-2)',
                        border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                        color: 'rgba(var(--ink-rgb),0.60)',
                      }}
                    >
                      source
                    </span>
                  </div>
                  <p
                    className="text-[11px] leading-[1.6] line-clamp-3 relative"
                    style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
                  >
                    {snippet.text}
                  </p>
                  <p
                    className="text-[9.5px] mt-1.5 relative"
                    style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
                  >
                    {snippet.source}
                  </p>
                </div>
              ))
            ) : (
              <p
                className="text-[11px] text-center py-2 mt-2"
                style={{ color: 'rgba(var(--ink-rgb),0.60)' }}
              >
                Sources will appear after your first question
              </p>
            )}
          </div>

        </div>
      </motion.div>

      <style jsx>{`
        /* ── Stage: one relative box, both layouts expressed on the same nodes ── */
        .ask-stage {
          position: relative;
          flex: 1;
          margin-top: 64px;
          overflow: hidden;
        }

        .ask-hero,
        .ask-composer,
        .ask-suggest {
          position: absolute;
          transition:
            left 800ms cubic-bezier(.16, 1, .3, 1),
            top 800ms cubic-bezier(.16, 1, .3, 1),
            width 800ms cubic-bezier(.16, 1, .3, 1),
            transform 800ms cubic-bezier(.16, 1, .3, 1),
            opacity 500ms cubic-bezier(.16, 1, .3, 1);
        }

        /* Hero */
        .ask-hero {
          left: 50%;
          top: calc(50% - 190px);
          width: min(660px, calc(100% - 48px));
          transform: translateX(-50%);
          text-align: center;
          z-index: 2;
        }
        .ask-stage.chat .ask-hero {
          left: 24px;
          top: 20px;
          width: auto;
          transform: translateX(0);
          text-align: left;
        }
        .ask-hero-h1 {
          font-size: 46px;
          white-space: nowrap;
          margin: 0;
          transition: font-size 800ms cubic-bezier(.16, 1, .3, 1);
        }
        .ask-stage.chat .ask-hero-h1 {
          font-size: 19px;
        }
        .ask-hero-p {
          font-size: 14px;
          line-height: 1.6;
          margin-top: 10px;
          max-height: 60px;
          opacity: 1;
          overflow: hidden;
          transition:
            opacity 350ms cubic-bezier(.16, 1, .3, 1),
            max-height 800ms cubic-bezier(.16, 1, .3, 1),
            margin-top 800ms cubic-bezier(.16, 1, .3, 1);
        }
        .ask-stage.chat .ask-hero-p {
          opacity: 0;
          max-height: 0;
          margin-top: 0;
        }

        /* Thread */
        .ask-thread {
          position: absolute;
          left: 0;
          right: 0;
          top: 64px;
          bottom: 104px;
          overflow-y: auto;
          padding: 8px 24px 4px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 500ms cubic-bezier(.16, 1, .3, 1) 200ms;
        }
        .ask-stage.chat .ask-thread {
          opacity: 1;
          pointer-events: auto;
        }

        /* Composer */
        .ask-composer {
          left: 50%;
          top: calc(50% - 46px);
          width: min(660px, calc(100% - 48px));
          transform: translateX(-50%);
          z-index: 3;
        }
        .ask-stage.chat .ask-composer {
          left: 24px;
          top: calc(100% - 84px);
          width: calc(100% - 48px);
          transform: translateX(0);
        }
        .ask-qualityrow {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 350ms ease, max-height 500ms ease;
        }
        .ask-stage.chat .ask-qualityrow {
          opacity: 1;
          max-height: 40px;
        }
        .ask-groundline {
          margin-top: 10px;
          text-align: center;
          font-size: 10.5px;
          letter-spacing: 0.04em;
          color: rgba(var(--ink-rgb), 0.60);
          opacity: 1;
          max-height: 24px;
          overflow: hidden;
          transition: opacity 300ms ease, max-height 500ms ease, margin-top 500ms ease;
        }
        .ask-stage.chat .ask-groundline {
          opacity: 0;
          max-height: 0;
          margin-top: 0;
        }

        /* Suggestions */
        .ask-suggest {
          left: 50%;
          top: calc(50% + 68px);
          width: min(660px, calc(100% - 48px));
          transform: translateX(-50%);
          z-index: 2;
        }
        .ask-stage.chat .ask-suggest {
          opacity: 0;
          transform: translateX(-50%) translateY(18px);
          pointer-events: none;
        }
        .ask-card {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          padding: 12px 13px;
          text-align: left;
          font-size: 13px;
          line-height: 1.5;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.10);
          color: rgba(var(--ink-rgb), 0.70);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition:
            opacity 300ms cubic-bezier(.16, 1, .3, 1),
            transform 300ms cubic-bezier(.16, 1, .3, 1),
            background 150ms ease,
            border-color 150ms ease,
            color 150ms ease;
        }
        .ask-card.in  { opacity: 1; transform: translateY(0); }
        .ask-card.out { opacity: 0; transform: translateY(-7px); }
        .ask-card:hover {
          background: var(--panel);
          border-color: rgba(var(--ink-rgb), 0.18);
          color: var(--ink);
        }
        .ask-card :global(.ask-card-arrow) {
          position: absolute;
          right: 10px;
          bottom: 10px;
          opacity: 0;
          color: var(--accent);
          transition: opacity 150ms ease;
        }
        .ask-card:hover :global(.ask-card-arrow) { opacity: 1; }

        /* Pipeline stage line */
        .ask-stageline-wrap {
          display: block;
          position: relative;
          height: 18px;
          overflow: hidden;
        }
        .ask-stageline {
          display: block;
          font-size: 12px;
          line-height: 18px;
          color: rgba(var(--ink-rgb), 0.62);
          animation: askStageIn 400ms cubic-bezier(.16, 1, .3, 1) both;
        }
        @keyframes askStageIn {
          from { opacity: 0; transform: translateY(9px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Avatar pulse while work is in flight */
        .ask-pulse :global(span) {
          animation: askPulse 1.1s ease-in-out infinite;
        }
        @keyframes askPulse {
          0%, 100% { transform: scale(1);    opacity: .9; }
          50%      { transform: scale(1.45); opacity: .45; }
        }

        /* Retrieval trace */
        .ask-trace {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 420px;
          opacity: 1;
          overflow: hidden;
          transition: max-height 550ms cubic-bezier(.16, 1, .3, 1), opacity 550ms ease;
        }
        .ask-trace.collapsed {
          max-height: 0;
          opacity: 0;
        }
        .ask-trace-row {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          animation: askRowIn 320ms cubic-bezier(.16, 1, .3, 1) both;
        }
        @keyframes askRowIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .ask-trace-idx {
          flex-shrink: 0;
          font-size: 11px;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(var(--accent-rgb), 0.10);
          border: 0.5px solid rgba(var(--accent-rgb), 0.20);
          color: var(--accent);
        }
        .ask-trace-src {
          font-size: 11.5px;
          color: rgba(var(--ink-rgb), 0.62);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        /* Recap pill */
        .ask-recap {
          margin-top: 2px;
          font-size: 11.5px;
          padding: 3px 10px;
          border-radius: 9999px;
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.10);
          color: rgba(var(--ink-rgb), 0.62);
          cursor: pointer;
          animation: askRecapIn 400ms cubic-bezier(.16, 1, .3, 1) both;
          transition: border-color 150ms ease, color 150ms ease;
        }
        .ask-recap:hover {
          border-color: rgba(var(--accent-rgb), 0.30);
          color: var(--accent);
        }
        @keyframes askRecapIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Follow-up chips */
        .ask-chip {
          padding: 5px 12px;
          border-radius: 9999px;
          background: transparent;
          border: 0.5px solid rgba(var(--ink-rgb), 0.16);
          color: rgba(var(--ink-rgb), 0.70);
          cursor: pointer;
          text-align: left;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }
        .ask-chip:hover {
          border-color: rgba(var(--accent-rgb), 0.35);
          background: rgba(var(--accent-rgb), 0.06);
          color: var(--accent);
        }

        /* Panel source card, flashing as it lands */
        .ask-srccard {
          background: var(--panel-2);
          border: 0.5px solid rgba(var(--ink-rgb), 0.10);
          transition: border-color 700ms ease;
        }
        .ask-srccard.flash {
          border-color: rgba(var(--accent-rgb), 0.55);
        }
      `}</style>
    </main>
  )
}
