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

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'career-architect-answer-quality-session'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STARTER_QUESTIONS = [
  'What AI systems has Chase built in production?',
  'How does Chase approach LLM evaluation?',
  "What is Chase's experience with RAG pipelines?",
  'What kind of roles is Chase looking for?',
]

// ── Session storage ───────────────────────────────────────────────────────────

function saveSessionEntry(entry: SessionQualityEntry) {
  if (typeof window === 'undefined') return
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  const existing: SessionQualityEntry[] = raw ? JSON.parse(raw) : []
  existing.push(entry)
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing))
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-2.5 items-start"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
        style={{
          background: 'rgba(196,168,130,0.12)',
          border: '0.5px solid rgba(196,168,130,0.28)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4A882', opacity: 0.85 }} />
      </div>
      <div
        className="px-3.5 py-3 rounded-[3px_14px_14px_14px] flex items-center gap-2"
        style={{
          background: 'rgba(226,223,208,0.04)',
          border: '0.5px solid rgba(226,223,208,0.10)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-typingBounce"
            style={{
              background: 'rgba(196,168,130,0.5)',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
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
        <span className="text-[9px]" style={{ color: 'rgba(226,223,208,0.42)' }}>{label}</span>
        <span className="text-[10px] font-medium" style={{ color: '#C4A882' }}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(226,223,208,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, rgba(196,168,130,0.4), rgba(196,168,130,0.85))' }}
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
  const [startersDismissed, setStartersDismissed] = useState(false)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)
  const [typingId, setTypingId] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading, displayedText])

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

  async function sendMessage(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isLoading) return

    setInput('')
    setStartersDismissed(true)

    const userMsg: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: query,
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      const response = await sendChat({ query, conversation_history: history })

      const aiId = `${Date.now()}-ai`
      const aiMsg: Message = {
        id: aiId,
        role: 'assistant',
        content: response.answer,
        scores: response.scores,
        evidence_sufficiency: response.evidence_sufficiency,
        sources: response.sources,
        evidence_snippets: response.evidence_snippets,
      }
      setMessages(prev => [...prev, aiMsg])
      setLastResponse(response)
      setTypingId(aiId)

      saveSessionEntry({
        id: aiId,
        question: query,
        answer: response.answer,
        sources: response.sources,
        evidence_snippets: response.evidence_snippets,
        scores: response.scores,
        evidence_sufficiency: response.evidence_sufficiency,
        processingTime: 0,
        createdAt: new Date().toISOString(),
      })
    } catch {
      const errMsg: Message = {
        id: `${Date.now()}-err`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendMessage()
  }

  const sufficiency = lastResponse?.evidence_sufficiency
  const passed = sufficiency?.should_answer ?? true

  return (
    <main
      className="flex flex-col h-screen bg-[#080808] overflow-hidden transition-[margin] duration-300"
      style={{ marginRight: panelOpen ? 320 : 0 }}
    >
      <TopNav subtitle="Ask About Chase" hasRightPanel={panelOpen} />

      {/* Content wrapper — clears fixed TopNav */}
      <div className="flex flex-col flex-1 overflow-hidden" style={{ paddingTop: 64 }}>

        {/* Page header */}
        <div className="pt-6 px-6 pb-0 flex-shrink-0">
          <h1
            className="text-xl md:text-2xl font-light tracking-[-0.03em] leading-tight"
            style={{ color: '#E2DFD0' }}
          >
            Ask About{' '}
            <em className="font-serif not-italic" style={{ color: '#C4A882' }}>Chase</em>
          </h1>
          <p
            className="text-[11px] mt-1.5 leading-relaxed"
            style={{ color: 'rgba(226,223,208,0.35)' }}
          >
            Every answer is grounded in verified career artifacts and cited with evidence.
          </p>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4"
        >

          {/* Starter prompts — shown until first send */}
          {!startersDismissed && messages.length === 0 && (
            <div className="mt-auto flex flex-col gap-3 pb-2">
              <p
                className="text-[9px] tracking-[0.16em] uppercase text-center mb-1"
                style={{ color: 'rgba(226,223,208,0.22)' }}
              >
                Suggested questions
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {STARTER_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="relative overflow-hidden rounded-xl p-2.5 text-[10px] leading-relaxed text-left transition-all duration-150 group"
                    style={{
                      background: 'rgba(226,223,208,0.03)',
                      border: '0.5px solid rgba(226,223,208,0.09)',
                      color: 'rgba(226,223,208,0.42)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(226,223,208,0.06)'
                      el.style.borderColor = 'rgba(226,223,208,0.18)'
                      el.style.color = 'rgba(226,223,208,0.7)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(226,223,208,0.03)'
                      el.style.borderColor = 'rgba(226,223,208,0.09)'
                      el.style.color = 'rgba(226,223,208,0.42)'
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(226,223,208,0.04) 0%, transparent 60%)' }}
                    />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
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
                    className="max-w-[72%] px-3.5 py-2.5 text-[11px] leading-relaxed rounded-[14px_14px_3px_14px] relative overflow-hidden"
                    style={{
                      color: 'rgba(226,223,208,0.82)',
                      background: 'rgba(196,168,130,0.10)',
                      border: '0.5px solid rgba(196,168,130,0.22)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-[14px_14px_3px_14px] pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(196,168,130,0.08) 0%, transparent 60%)' }}
                    />
                    <span className="relative">{msg.content}</span>
                  </div>
                </motion.div>
              )
            }

            // Assistant message
            const renderedText = isTypingThis ? displayedText : msg.content
            const isStillTyping = isTypingThis && displayedText !== msg.content

            return (
              <motion.div
                key={msg.id}
                className="flex gap-2.5 items-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{
                    background: 'rgba(196,168,130,0.12)',
                    border: '0.5px solid rgba(196,168,130,0.28)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#C4A882', opacity: 0.85 }}
                  />
                </div>

                {/* Bubble */}
                <div
                  className="max-w-[85%] px-3.5 py-3 text-[11px] leading-[1.75] rounded-[3px_14px_14px_14px] relative overflow-hidden"
                  style={{
                    color: 'rgba(226,223,208,0.62)',
                    background: 'rgba(226,223,208,0.04)',
                    border: '0.5px solid rgba(226,223,208,0.10)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(226,223,208,0.05) 0%, transparent 55%)' }}
                  />
                  <p
                    className="text-[8px] tracking-[0.12em] uppercase mb-1.5 relative"
                    style={{ color: 'rgba(196,168,130,0.5)' }}
                  >
                    Career Intelligence
                  </p>
                  <div className="relative whitespace-pre-wrap">
                    {renderedText}
                    {isStillTyping && (
                      <span
                        className="inline-block w-0.5 h-3 ml-px align-middle animate-blink"
                        style={{ background: '#C4A882' }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}
        </div>

        {/* Quality toggle row */}
        <div className="px-6 pb-2 flex justify-end flex-shrink-0">
          <button
            onClick={() => setPanelOpen(v => !v)}
            className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.12em] uppercase rounded-md px-2 py-1 transition-all duration-150"
            style={
              panelOpen
                ? {
                    color: 'rgba(196,168,130,0.8)',
                    border: '0.5px solid rgba(196,168,130,0.25)',
                    background: 'rgba(196,168,130,0.06)',
                  }
                : {
                    color: 'rgba(226,223,208,0.3)',
                    border: '0.5px solid rgba(226,223,208,0.08)',
                    background: 'rgba(226,223,208,0.03)',
                  }
            }
          >
            Answer Quality Check
            <ArrowUpRight size={10} />
          </button>
        </div>

        {/* Input area */}
        <div className="px-6 pb-5 flex-shrink-0">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(226,223,208,0.04)',
              border: '0.5px solid rgba(226,223,208,0.10)',
              backdropFilter: 'blur(8px)',
            }}
            onFocus={e =>
              e.currentTarget.style.cssText += '; border-color: rgba(196,168,130,0.30); background: rgba(226,223,208,0.05)'
            }
            onBlur={e =>
              e.currentTarget.style.cssText += '; border-color: rgba(226,223,208,0.10); background: rgba(226,223,208,0.04)'
            }
          >
            <Search size={14} style={{ color: 'rgba(226,223,208,0.18)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask the career knowledge base anything…"
              className="flex-1 bg-transparent border-none outline-none text-[11px] font-sans disabled:opacity-50"
              style={{
                color: 'rgba(226,223,208,0.65)',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:pointer-events-none"
              style={{
                background: 'rgba(196,168,130,0.15)',
                border: '0.5px solid rgba(196,168,130,0.28)',
              }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,168,130,0.25)')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,168,130,0.15)')
              }
            >
              <span
                className="text-[10px] font-medium tracking-[0.08em]"
                style={{ color: 'rgba(196,168,130,0.85)' }}
              >
                ASK
              </span>
              <ArrowUpRight size={10} style={{ color: '#C4A882' }} />
            </button>
          </div>
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
            background: 'rgba(10,10,10,0.95)',
            borderLeft: '1px solid rgba(226,223,208,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >

          {/* ── Evidence Check ──────────────────────────────────────────────── */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(226,223,208,0.05)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[8px] tracking-[0.16em] uppercase"
                style={{ color: 'rgba(226,223,208,0.25)' }}
              >
                Evidence Check
              </p>
              {sufficiency && (
                <span
                  className="text-[8px] px-2 py-0.5 rounded-full"
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
                    className="mt-2 px-2 py-1.5 rounded-lg text-[9px] leading-relaxed"
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
                className="text-[10px] text-center py-2"
                style={{ color: 'rgba(226,223,208,0.2)' }}
              >
                Ask a question to see evidence scores
              </p>
            )}
          </div>

          {/* ── Answer Quality ──────────────────────────────────────────────── */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(226,223,208,0.05)' }}
          >
            <p
              className="text-[8px] tracking-[0.16em] uppercase mb-3"
              style={{ color: 'rgba(226,223,208,0.25)' }}
            >
              Answer Quality
            </p>

            {lastResponse ? (
              passed ? (
                <>
                  <ScoreBar label="Groundedness" value={lastResponse.scores.groundedness} />
                  <ScoreBar label="Completeness" value={lastResponse.scores.completeness} />

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px]" style={{ color: 'rgba(226,223,208,0.32)' }}>
                      Unsupported claims
                    </span>
                    {lastResponse.scores.unsupported_claim ? (
                      <span
                        className="text-[8px] px-2 py-0.5 rounded-full"
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
                        className="text-[8px] px-2 py-0.5 rounded-full"
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
                  className="text-[10px] py-1 leading-relaxed"
                  style={{ color: 'rgba(226,223,208,0.25)' }}
                >
                  Not evaluated — evidence gate blocked generation
                </p>
              )
            ) : (
              <p
                className="text-[10px] text-center py-2"
                style={{ color: 'rgba(226,223,208,0.2)' }}
              >
                Ask a question to see quality scores
              </p>
            )}
          </div>

          {/* ── Evidence Sources ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            <p
              className="text-[8px] tracking-[0.16em] uppercase mb-1 flex-shrink-0"
              style={{ color: 'rgba(226,223,208,0.25)' }}
            >
              Evidence Sources
            </p>

            {lastResponse && lastResponse.evidence_snippets.length > 0 ? (
              lastResponse.evidence_snippets.map((snippet) => (
                <div
                  key={snippet.citation_index}
                  className="relative overflow-hidden rounded-lg p-2.5"
                  style={{
                    background: 'rgba(226,223,208,0.03)',
                    border: '0.5px solid rgba(226,223,208,0.08)',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(226,223,208,0.03) 0%, transparent 55%)' }}
                  />
                  <div className="flex items-center gap-1.5 mb-1.5 relative">
                    <span
                      className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(196,168,130,0.10)',
                        border: '0.5px solid rgba(196,168,130,0.20)',
                        color: 'rgba(196,168,130,0.85)',
                      }}
                    >
                      [{snippet.citation_index}]
                    </span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(226,223,208,0.04)',
                        border: '0.5px solid rgba(226,223,208,0.08)',
                        color: 'rgba(226,223,208,0.35)',
                      }}
                    >
                      source
                    </span>
                  </div>
                  <p
                    className="text-[9px] leading-[1.55] line-clamp-3 relative"
                    style={{ color: 'rgba(226,223,208,0.36)' }}
                  >
                    {snippet.text}
                  </p>
                  <p
                    className="text-[8px] mt-1.5 relative"
                    style={{ color: 'rgba(226,223,208,0.18)' }}
                  >
                    {snippet.source}
                  </p>
                </div>
              ))
            ) : (
              <p
                className="text-[10px] text-center py-2 mt-2"
                style={{ color: 'rgba(226,223,208,0.2)' }}
              >
                Sources will appear after your first question
              </p>
            )}
          </div>

        </div>
      </motion.div>
    </main>
  )
}
