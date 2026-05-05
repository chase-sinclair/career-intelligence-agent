'use client'

import { useState } from 'react'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { useInView } from '@/hooks/useInView'

// ── Data ──────────────────────────────────────────────────────────────────────

const KB_DOCS = [
  {
    label: 'Core Profile',
    detail: 'Resume, skills summary, and target roles',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1" width="9" height="12" rx="1" stroke="rgba(196,168,130,0.55)" strokeWidth="0.75" />
        <line x1="3.5" y1="4.5" x2="8.5" y2="4.5" stroke="rgba(196,168,130,0.35)" strokeWidth="0.75" />
        <line x1="3.5" y1="6.5" x2="8.5" y2="6.5" stroke="rgba(196,168,130,0.35)" strokeWidth="0.75" />
        <line x1="3.5" y1="8.5" x2="6.5" y2="8.5" stroke="rgba(196,168,130,0.25)" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    label: 'Project Docs',
    detail: 'Deep-dive write-ups per project',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1.5 4C1.5 3.17 2.17 2.5 3 2.5H6L7.5 4.5H12C12.83 4.5 13.5 5.17 13.5 6V11C13.5 11.83 12.83 12.5 12 12.5H3C2.17 12.5 1.5 11.83 1.5 11V4Z" stroke="rgba(196,168,130,0.55)" strokeWidth="0.75" fill="rgba(196,168,130,0.04)" />
      </svg>
    ),
  },
  {
    label: 'Work Highlights',
    detail: 'Engagement summaries by client and deliverable',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="4.5" width="12" height="9" rx="1" stroke="rgba(196,168,130,0.55)" strokeWidth="0.75" fill="rgba(196,168,130,0.04)" />
        <path d="M4.5 4.5V3.5C4.5 3.22 4.72 3 5 3H10C10.28 3 10.5 3.22 10.5 3.5V4.5" stroke="rgba(196,168,130,0.4)" strokeWidth="0.75" />
        <line x1="1.5" y1="8.5" x2="13.5" y2="8.5" stroke="rgba(196,168,130,0.2)" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    label: 'Certifications',
    detail: 'AWS, Google, Anthropic, IBM credentials',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="6.5" r="3.5" stroke="rgba(196,168,130,0.55)" strokeWidth="0.75" />
        <path d="M4.5 9.5L3 13L7.5 11.5L12 13L10.5 9.5" stroke="rgba(196,168,130,0.4)" strokeWidth="0.75" fill="none" />
      </svg>
    ),
  },
]

const PIPELINE_STEPS = [
  {
    index: '01',
    title: 'Query Rewrite',
    model: 'gpt-4o-mini',
    summary: 'Follow-up pronouns and references resolved into a standalone retrieval query.',
    description:
      'On follow-up questions, gpt-4o-mini resolves pronouns and references ("that project", "his role there") into a fully self-contained retrieval query — so retrieval always gets the right signal regardless of conversational context.',
  },
  {
    index: '02',
    title: 'Evidence Retrieval',
    model: 'text-embedding-3-small',
    summary: 'Top-12 most relevant chunks returned from 16+ ingested career documents.',
    description:
      'The rewritten query is embedded and matched against 16+ ingested career documents using cosine similarity in Chroma. The top-12 most relevant chunks are returned — resume sections, project write-ups, certification records, and work highlights.',
  },
  {
    index: '03',
    title: 'Evidence Gate',
    model: 'gpt-4o-mini',
    summary: 'Checks whether the retrieved evidence is sufficient before allowing generation.',
    description:
      'Before generating anything, a gpt-4o-mini judge evaluates the retrieved chunks: are they relevant to the question? Do they contain the specific facts needed? If not, the system declines to answer rather than fabricate. Relevance, coverage, and source quality are each scored 0–1.',
  },
  {
    index: '04',
    title: 'Answer Generation',
    model: 'gpt-4o',
    summary: 'Grounded answer generated from retrieved evidence and conversation history.',
    description:
      'GPT-4o generates a grounded answer using only the retrieved evidence — with conversation history injected so responses stay coherent across turns. The system prompt explicitly forbids asserting anything not present in the evidence.',
  },
  {
    index: '05',
    title: 'Answer Evaluation',
    model: 'gpt-4o-mini',
    summary: 'Independent judge scores groundedness, completeness, and unsupported claims.',
    description:
      'A second gpt-4o-mini call acts as an independent judge, scoring the generated answer on groundedness (are claims supported?), completeness (does it use all available evidence?), and whether any unsupported assertions were made.',
  },
]

const METRICS = [
  {
    label: 'Evidence Relevance',
    detail: 'Are the retrieved chunks topically relevant to the question?',
    phase: 'Pre-generation',
    fill: 92,
    kind: 'score',
  },
  {
    label: 'Evidence Coverage',
    detail: 'Do the chunks contain enough specific facts to actually answer?',
    phase: 'Pre-generation',
    fill: 88,
    kind: 'score',
  },
  {
    label: 'Groundedness',
    detail: 'Are all claims in the answer directly supported by the evidence?',
    phase: 'Post-generation',
    fill: 95,
    kind: 'score',
  },
  {
    label: 'Completeness',
    detail: 'Did the answer use all the relevant information available?',
    phase: 'Post-generation',
    fill: 85,
    kind: 'score',
  },
  {
    label: 'Unsupported Claims',
    detail: 'Did the answer assert anything not present in the source documents?',
    phase: 'Post-generation',
    fill: 0,
    kind: 'flag',
  },
] as const

const STACK = [
  { label: 'Orchestration', value: 'LangGraph 0.2 — stateful multi-node graph' },
  { label: 'Generation',    value: 'GPT-4o — grounded answer synthesis' },
  { label: 'Evaluation',    value: 'GPT-4o-mini — LLM-as-judge (pre & post generation)' },
  { label: 'Embeddings',    value: 'text-embedding-3-small — semantic similarity' },
  { label: 'Vector DB',     value: 'Chroma — local persistent vector store' },
  { label: 'Backend',       value: 'FastAPI + Python — async REST API' },
  { label: 'Frontend',      value: 'Next.js 14 App Router + TypeScript + Tailwind CSS' },
]

// ── Shared atoms ──────────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9px] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(196,168,130,0.55)' }}>
      {children}
    </p>
  )
}

function Heading2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl font-light tracking-[-0.04em] leading-tight ${className}`} style={{ color: '#E2DFD0' }}>
      {children}
    </h2>
  )
}

function Divider() {
  return <div className="my-16 h-px" style={{ background: 'rgba(226,223,208,0.06)' }} />
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const { ref: heroRef,     inView: heroIn     } = useInView()
  const { ref: calloutRef,  inView: calloutIn  } = useInView({ threshold: 0.1 })
  const { ref: kbRef,       inView: kbIn       } = useInView()
  const { ref: pipeRef,     inView: pipeIn     } = useInView({ threshold: 0.08 })
  const { ref: metricsRef,  inView: metricsIn  } = useInView()
  const { ref: stackRef,    inView: stackIn    } = useInView()
  const { ref: visionRef,   inView: visionIn   } = useInView({ threshold: 0.1 })

  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  return (
    <>
      <TopNav subtitle="How It Works" />

      <main className="pl-5">
        <div className="px-10 pb-20 pt-24 max-w-4xl">

          {/* ── §1 Hero ──────────────────────────────────────────────────── */}
          <div ref={heroRef}>
            <header
              className={`mb-0 transition-all duration-700 ease-out ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <Eyebrow>Under the hood</Eyebrow>
              <h1
                className="text-4xl md:text-5xl font-light tracking-[-0.04em] leading-tight mb-6 max-w-xl"
                style={{ color: '#E2DFD0' }}
              >
                An AI-native candidate profile built on real evidence
              </h1>

              {/* Two-column desktop layout */}
              <div className="flex flex-col md:flex-row gap-8 mt-8 mb-14">
                {/* Left: problem copy */}
                <div className="flex-1 max-w-md">
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(226,223,208,0.45)' }}>
                    Traditional resumes are static snapshots. This profile is conversational,
                    evidence-backed, and evaluated in real time. Every answer is traced to a
                    specific career document — not generated from training data.
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,223,208,0.45)' }}>
                    A recruiter evaluating systems architecture experience has different questions
                    than one evaluating team leadership or client impact. This profile answers
                    both — grounded in evidence, not inference.
                  </p>
                </div>

                {/* Right: callout box */}
                <div
                  ref={calloutRef}
                  className={`w-full md:w-60 flex-shrink-0 rounded-xl p-5 transition-all duration-700 ease-out ${calloutIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{
                    background: 'rgba(196,168,130,0.05)',
                    border: '0.5px solid rgba(196,168,130,0.2)',
                    transitionDelay: '120ms',
                  }}
                >
                  {[
                    'Ask anything directly.',
                    '16+ career artifacts retrieved.',
                    'Evidence checked before answering.',
                    'Answer scored after generating.',
                  ].map((line, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 mb-3 last:mb-0 transition-all duration-500 ease-out ${calloutIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: calloutIn ? `${160 + i * 70}ms` : '0ms' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]"
                        style={{ background: 'rgba(196,168,130,0.65)' }}
                      />
                      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.62)' }}>
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </header>
          </div>

          <Divider />

          {/* ── §2 Knowledge Base ────────────────────────────────────────── */}
          <div ref={kbRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>The knowledge base</Eyebrow>
                <Heading2 className="mb-4">16+ career artifacts, ingested and indexed</Heading2>
                <p className="text-sm leading-relaxed mb-7 max-w-lg" style={{ color: 'rgba(226,223,208,0.45)' }}>
                  The profile is built from structured markdown documents parsed, chunked to
                  preserve section structure, embedded with{' '}
                  <span style={{ color: 'rgba(226,223,208,0.68)' }}>text-embedding-3-small</span>,
                  and stored in a Chroma vector index.
                </p>
              </div>

              {/* 2×2 doc cards */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {KB_DOCS.map(({ label, detail, icon }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 transition-all duration-500 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'rgba(226,223,208,0.03)',
                      border: '0.5px solid rgba(226,223,208,0.08)',
                      transitionDelay: kbIn ? `${i * 80}ms` : '0ms',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {icon}
                      <span
                        className="font-mono text-[8px] tracking-[0.14em] uppercase"
                        style={{ color: 'rgba(196,168,130,0.6)' }}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.33)' }}>
                      {detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ingestion flow terminal */}
              <div
                className={`rounded-xl px-5 py-3 transition-all duration-600 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{
                  background: 'rgba(226,223,208,0.02)',
                  border: '0.5px solid rgba(226,223,208,0.06)',
                  transitionDelay: kbIn ? '320ms' : '0ms',
                }}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {['.md files', 'parse', 'chunk', 'embed (text-embedding-3-small)', 'Chroma index'].map(
                    (step, i, arr) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[10px]" style={{ color: 'rgba(226,223,208,0.48)' }}>
                          {step}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="font-mono text-[10px]" style={{ color: 'rgba(196,168,130,0.45)' }}>
                            →
                          </span>
                        )}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>

          <Divider />

          {/* ── §3 Pipeline ──────────────────────────────────────────────── */}
          <div ref={pipeRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${pipeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>The pipeline</Eyebrow>
                <Heading2 className="mb-2">Five-node LangGraph workflow</Heading2>
                <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: 'rgba(226,223,208,0.45)' }}>
                  Every question runs through a stateful graph. Each node has a single
                  responsibility. The evidence gate uses a conditional edge — if evidence
                  is insufficient, generation is skipped and no answer is fabricated.
                </p>
              </div>

              <div className="flex flex-col">
                {PIPELINE_STEPS.map((step, i) => {
                  const isExpanded = expandedStep === i
                  const isLast = i === PIPELINE_STEPS.length - 1

                  return (
                    <div
                      key={step.index}
                      className={`flex gap-5 transition-all duration-500 ease-out ${pipeIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                      style={{ transitionDelay: pipeIn ? `${i * 120}ms` : '0ms' }}
                    >
                      {/* Left rail: node + connector */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <button
                          onClick={() => setExpandedStep(isExpanded ? null : i)}
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
                          style={{
                            background: isExpanded
                              ? 'rgba(196,168,130,0.15)'
                              : 'rgba(196,168,130,0.06)',
                            border: isExpanded
                              ? '1px solid rgba(196,168,130,0.55)'
                              : '0.5px solid rgba(196,168,130,0.22)',
                          }}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} step ${step.index}`}
                        >
                          <span
                            className="font-mono text-[9px]"
                            style={{
                              color: isExpanded
                                ? 'rgba(196,168,130,1)'
                                : 'rgba(196,168,130,0.65)',
                            }}
                          >
                            {step.index}
                          </span>
                        </button>

                        {/* Animated segment line between nodes */}
                        {!isLast && (
                          <div
                            className="w-px flex-1 mt-1 mb-0 min-h-[24px] transition-all duration-700 ease-out"
                            style={{
                              background: isExpanded
                                ? 'rgba(196,168,130,0.35)'
                                : 'rgba(196,168,130,0.1)',
                              transformOrigin: 'top',
                              transform: pipeIn ? 'scaleY(1)' : 'scaleY(0)',
                              transitionDelay: pipeIn ? `${i * 120 + 200}ms` : '0ms',
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <button
                            onClick={() => setExpandedStep(isExpanded ? null : i)}
                            className="text-[12px] font-medium text-left cursor-pointer transition-colors duration-150"
                            style={{
                              color: isExpanded
                                ? 'rgba(226,223,208,0.92)'
                                : 'rgba(226,223,208,0.7)',
                            }}
                          >
                            {step.title}
                          </button>
                          <span
                            className="font-mono text-[8px] px-1.5 py-[2px] rounded"
                            style={{
                              background: 'rgba(226,223,208,0.04)',
                              border: '0.5px solid rgba(226,223,208,0.08)',
                              color: 'rgba(226,223,208,0.28)',
                            }}
                          >
                            {step.model}
                          </span>
                        </div>

                        {/* Collapsed: summary. Expanded: full description */}
                        <div
                          className="overflow-hidden transition-all duration-300 ease-out"
                          style={{ maxHeight: isExpanded ? '160px' : '36px' }}
                        >
                          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.38)' }}>
                            {isExpanded ? step.description : step.summary}
                          </p>
                        </div>

                        {!isExpanded && (
                          <button
                            onClick={() => setExpandedStep(i)}
                            className="font-mono text-[8px] mt-1 transition-colors duration-150"
                            style={{ color: 'rgba(196,168,130,0.35)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,168,130,0.65)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(196,168,130,0.35)')}
                          >
                            expand ↓
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <Divider />

          {/* ── §4 Answer Quality ────────────────────────────────────────── */}
          <div ref={metricsRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>Answer quality</Eyebrow>
                <Heading2 className="mb-4">Every answer is scored, not just generated</Heading2>
              </div>

              {/* Pull-quote callout */}
              <div
                className={`border-l-2 pl-5 mb-7 transition-all duration-600 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  borderColor: 'rgba(196,168,130,0.45)',
                  transitionDelay: metricsIn ? '100ms' : '0ms',
                }}
              >
                <p className="text-sm leading-relaxed italic mb-1" style={{ color: 'rgba(226,223,208,0.68)' }}>
                  Most AI systems generate an answer and stop. This one evaluates it.
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.35)' }}>
                  The quality panel on the Ask page shows live scores for every response.
                </p>
              </div>

              {/* Metric rows */}
              <div className="flex flex-col gap-2">
                {METRICS.map(({ label, detail, phase, fill, kind }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl px-4 py-3 transition-all duration-500 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'rgba(226,223,208,0.03)',
                      border: '0.5px solid rgba(226,223,208,0.07)',
                      transitionDelay: metricsIn ? `${i * 100}ms` : '0ms',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <div className="flex-1">
                        <p className="text-[11px] font-medium" style={{ color: 'rgba(226,223,208,0.72)' }}>
                          {label}
                        </p>
                        <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: 'rgba(226,223,208,0.33)' }}>
                          {detail}
                        </p>
                      </div>
                      <span
                        className="font-mono text-[8px] tracking-[0.08em] whitespace-nowrap mt-0.5 px-2 py-0.5 rounded-full flex-shrink-0"
                        style={
                          phase === 'Pre-generation'
                            ? {
                                background: 'rgba(196,168,130,0.08)',
                                border: '0.5px solid rgba(196,168,130,0.2)',
                                color: 'rgba(196,168,130,0.6)',
                              }
                            : {
                                background: 'rgba(226,223,208,0.04)',
                                border: '0.5px solid rgba(226,223,208,0.10)',
                                color: 'rgba(226,223,208,0.35)',
                              }
                        }
                      >
                        {phase}
                      </span>
                    </div>

                    {kind === 'score' ? (
                      <div>
                        <div
                          className="h-px rounded-full overflow-hidden"
                          style={{ background: 'rgba(226,223,208,0.07)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: metricsIn ? `${fill}%` : '0%',
                              background:
                                'linear-gradient(to right, rgba(196,168,130,0.4), rgba(196,168,130,0.65))',
                              transitionDelay: metricsIn ? `${200 + i * 100}ms` : '0ms',
                            }}
                          />
                        </div>
                        <p
                          className="font-mono text-[8px] mt-1"
                          style={{ color: 'rgba(196,168,130,0.38)' }}
                        >
                          {fill}% avg
                        </p>
                      </div>
                    ) : (
                      <span
                        className="font-mono text-[8px] px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(226,223,208,0.04)',
                          border: '0.5px solid rgba(226,223,208,0.08)',
                          color: 'rgba(226,223,208,0.3)',
                        }}
                      >
                        flag rate: low
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Divider />

          {/* ── §5 Tech Stack ────────────────────────────────────────────── */}
          <div ref={stackRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${stackIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>Tech stack</Eyebrow>
                <Heading2 className="mb-6">What it&apos;s built on</Heading2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {STACK.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 transition-all duration-500 ease-out ${stackIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'rgba(226,223,208,0.03)',
                      border: '0.5px solid rgba(226,223,208,0.07)',
                      transitionDelay: stackIn ? `${i * 80}ms` : '0ms',
                    }}
                  >
                    <p
                      className="font-mono text-[8px] tracking-[0.14em] uppercase mb-1"
                      style={{ color: 'rgba(196,168,130,0.6)' }}
                    >
                      {label}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(226,223,208,0.5)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Divider />

          {/* ── §6 Platform Vision ───────────────────────────────────────── */}
          <div ref={visionRef}>
            <section className="py-8">
              {/* Centered quote treatment */}
              <div
                className={`text-center mb-12 transition-all duration-700 ease-out ${visionIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              >
                <div
                  className="h-px mb-8 mx-auto"
                  style={{ maxWidth: 200, background: 'rgba(196,168,130,0.18)' }}
                />
                <p
                  className="text-2xl md:text-3xl font-serif italic leading-snug"
                  style={{ color: 'rgba(196,168,130,0.82)' }}
                >
                  &ldquo;This profile is Chase&apos;s.
                  <br />
                  The system is for anyone.&rdquo;
                </p>
                <div
                  className="h-px mt-8 mx-auto"
                  style={{ maxWidth: 200, background: 'rgba(196,168,130,0.18)' }}
                />
              </div>

              {/* Two-column: now vs. next */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-0 mb-10 transition-all duration-600 ease-out ${visionIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: visionIn ? '200ms' : '0ms' }}
              >
                <div className="pr-8">
                  <p
                    className="font-mono text-[8px] tracking-[0.14em] uppercase mb-3"
                    style={{ color: 'rgba(196,168,130,0.4)' }}
                  >
                    What exists today
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,223,208,0.45)' }}>
                    This profile is Chase&apos;s. But the underlying system is
                    document-agnostic. The ingestion pipeline, retrieval graph, evidence
                    gate, and evaluation layer are designed to work with any
                    candidate&apos;s career artifacts.
                  </p>
                </div>
                <div
                  className="pl-8 md:border-l mt-6 md:mt-0"
                  style={{ borderColor: 'rgba(226,223,208,0.06)' }}
                >
                  <p
                    className="font-mono text-[8px] tracking-[0.14em] uppercase mb-3"
                    style={{ color: 'rgba(196,168,130,0.4)' }}
                  >
                    Where it&apos;s going
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,223,208,0.45)' }}>
                    A future version would let any candidate upload their resume and
                    supporting documents, then generate a fully interactive,
                    evidence-backed AI profile — replacing the traditional resume with
                    something that actually answers questions.
                  </p>
                </div>
              </div>

              {/* CTA row */}
              <div
                className={`flex gap-3 flex-wrap transition-all duration-500 ease-out ${visionIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: visionIn ? '360ms' : '0ms' }}
              >
                <Link
                  href="/knowledge-base"
                  className="text-[11px] px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(196,168,130,0.09)',
                    border: '0.5px solid rgba(196,168,130,0.28)',
                    color: 'rgba(196,168,130,0.88)',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(196,168,130,0.15)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(196,168,130,0.09)'
                  }}
                >
                  Ask About Chase →
                </Link>
                <Link
                  href="/projects"
                  className="text-[11px] px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(226,223,208,0.04)',
                    border: '0.5px solid rgba(226,223,208,0.12)',
                    color: 'rgba(226,223,208,0.5)',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(226,223,208,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(226,223,208,0.75)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(226,223,208,0.04)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(226,223,208,0.5)'
                  }}
                >
                  View Projects →
                </Link>
              </div>
            </section>
          </div>

        </div>
      </main>
    </>
  )
}
