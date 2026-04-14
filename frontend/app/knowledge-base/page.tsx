'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import TopNav from '@/components/TopNav'
import { chat as sendChat, getProfile, getAboutContent } from '@/lib/api'
import type {
  ChatResponse,
  CandidateProfile,
  AboutContent,
  EvaluationScores,
} from '@/lib/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  evidence_snippets?: string[]
  scores?: EvaluationScores
  processingTime?: number
}

interface SessionQualityEntry {
  id: string
  question: string
  answer: string
  sources: string[]
  evidence_snippets: string[]
  scores: EvaluationScores
  processingTime: number
  createdAt: string
}

const SESSION_STORAGE_KEY = 'career-architect-answer-quality-session'

const PROMPT_ICONS = ['psychology', 'source', 'monitoring'] as const

const DEFAULT_PROMPTS = [
  "What is this candidate's experience with LangGraph?",
  'Show me evidence of leadership in AI projects',
  'Which projects demonstrate RAG pipeline experience?',
]

export default function KnowledgeBasePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null)
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [siteContent, setSiteContent] = useState<AboutContent | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {})
    getAboutContent().then(setSiteContent).catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  async function handleSend(query?: string) {
    const text = (query ?? input).trim()
    if (!text || isLoading) return

    setInput('')
    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const startTime = performance.now()
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const response = await sendChat({ query: text, conversation_history: history })
      const processingTime = (performance.now() - startTime) / 1000

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        evidence_snippets: response.evidence_snippets,
        scores: response.scores,
        processingTime,
      }
      setMessages(prev => [...prev, aiMessage])
      setLastResponse(response)
      saveSessionEntry({
        id: `${Date.now()}`,
        question: text,
        answer: response.answer,
        sources: response.sources,
        evidence_snippets: response.evidence_snippets,
        scores: response.scores,
        processingTime,
        createdAt: new Date().toISOString(),
      })
    } catch (e) {
      const fallback =
        e instanceof Error
          ? e.message
          : 'Could not reach the backend. Make sure the API server is running.'
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fallback,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSend()
  }

  const suggestedPrompts = siteContent?.suggested_prompts.slice(0, 3) ?? DEFAULT_PROMPTS
  const candidateName = profile?.name ?? 'Candidate'

  return (
    <>
      <main className="ml-64 mr-80 flex h-screen flex-col relative bg-surface">
        <TopNav hasRightPanel subtitle="Career Knowledge Base" />

        <div className="pt-16 pb-24 flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-3 bg-surface-container-low/50 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(68,226,205,0.6)]" />
            <span className="font-mono text-[11px] tracking-tight text-on-surface-variant uppercase">
              Evidence-grounded answers from the active career knowledge base
            </span>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 space-y-10"
          >
            {messages.length === 0 && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-on-surface">
                    Career Knowledge Base: {candidateName}
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    Ask grounded questions about experience, projects, skills, and impact.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="group bg-surface-container-low p-4 rounded-lg text-left border border-white/5 hover:bg-surface-container-high hover:border-primary/30 transition-all"
                    >
                      <span className="material-symbols-outlined text-primary text-xl mb-3 block">
                        {PROMPT_ICONS[i]}
                      </span>
                      <span className="text-xs font-medium text-on-surface block leading-relaxed">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <div key={i} className="max-w-3xl mx-auto flex justify-end">
                    <div className="bg-surface-container-high px-5 py-3 rounded-lg max-w-xl text-sm text-on-surface">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              return (
                <div key={i} className="max-w-4xl mx-auto flex gap-6">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-surface-container-lowest p-6 rounded-lg border-l-2 border-primary relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold">
                          Answer
                        </span>
                        {msg.processingTime !== undefined && (
                          <span className="text-[10px] font-mono text-on-surface-variant">
                            {msg.processingTime.toFixed(4)}s Processing Time
                          </span>
                        )}
                      </div>
                      <div className="space-y-4 text-sm leading-relaxed text-on-surface">
                        <p>{msg.content}</p>
                        {msg.evidence_snippets && msg.evidence_snippets.length > 0 && (
                          <div className="bg-surface-container-low/50 p-4 rounded border border-white/5 font-mono text-[12px] text-on-surface-variant">
                            <div className="flex items-center gap-2 mb-2 text-secondary">
                              <span className="material-symbols-outlined text-xs">terminal</span>
                              <span className="uppercase tracking-tighter">Evidence Snippet</span>
                            </div>
                            <span className="block whitespace-pre-wrap">
                              {msg.evidence_snippets[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="max-w-4xl mx-auto flex gap-6">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                </div>
                <div className="flex-1">
                  <div className="bg-surface-container-lowest p-6 rounded-lg border-l-2 border-primary">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
                      <span className="text-[10px] font-mono text-on-surface-variant ml-2 uppercase tracking-widest">
                        Retrieving evidence...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-surface via-surface to-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="bg-surface-container-high rounded-xl p-2 shadow-2xl flex items-center gap-2 border border-white/5 focus-within:border-primary/50 transition-colors">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">query_stats</span>
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-on-surface placeholder:text-on-surface-variant/50 disabled:opacity-50"
                  placeholder="Ask the career knowledge base anything..."
                  type="text"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  ASK
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/diagnostics"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-lowest px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Answer Quality Check
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="fixed right-0 top-0 w-80 h-screen bg-surface-container-low border-l border-white/5 flex flex-col p-6 z-50 overflow-y-auto custom-scrollbar">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Quality Metrics
            </h3>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">info</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-on-surface-variant/70">Groundedness</span>
                <span className="text-sm font-mono text-secondary">
                  {lastResponse ? lastResponse.scores.groundedness.toFixed(3) : '-'}
                </span>
              </div>
              <div className="h-1 bg-surface-container-highest w-full overflow-hidden">
                <div
                  className="h-full bg-secondary shadow-[0_0_4px_rgba(68,226,205,0.4)] transition-all duration-500"
                  style={{
                    width: lastResponse
                      ? `${Math.round(lastResponse.scores.groundedness * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-on-surface-variant/70">Completeness</span>
                <span className="text-sm font-mono text-primary">
                  {lastResponse ? lastResponse.scores.completeness.toFixed(3) : '-'}
                </span>
              </div>
              <div className="h-1 bg-surface-container-highest w-full overflow-hidden">
                <div
                  className="h-full bg-primary shadow-[0_0_4px_rgba(142,213,255,0.4)] transition-all duration-500"
                  style={{
                    width: lastResponse
                      ? `${Math.round(lastResponse.scores.completeness * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-mono text-on-surface-variant/70">Unsupported Claim</span>
              {lastResponse ? (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    lastResponse.scores.unsupported_claim
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}
                >
                  {lastResponse.scores.unsupported_claim ? 'True' : 'False'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold border border-white/5">
                  -
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-surface-container-highest my-8" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Source Evidence
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[9px] font-bold border border-secondary/20">
              {lastResponse ? `${lastResponse.sources.length} SOURCES` : '0 SOURCES'}
            </span>
          </div>

          <div className="space-y-4">
            {lastResponse?.sources.map((source, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest p-3 rounded border border-white/5 hover:bg-surface-container-highest transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">
                    description
                  </span>
                  <span className="text-[11px] font-bold text-on-surface truncate">{source}</span>
                </div>
                {lastResponse.evidence_snippets[i] && (
                  <p className="font-mono text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {lastResponse.evidence_snippets[i]}
                  </p>
                )}
              </div>
            ))}

            {!lastResponse && (
              <p className="text-[11px] font-mono text-on-surface-variant/50 text-center pt-4">
                Ask a question to inspect source evidence
              </p>
            )}
          </div>
        </section>

        <div className="mt-auto pt-10" />
      </aside>
    </>
  )
}

function saveSessionEntry(entry: SessionQualityEntry) {
  if (typeof window === 'undefined') return

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  const existing: SessionQualityEntry[] = raw ? JSON.parse(raw) : []
  existing.push(entry)
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existing))
}
