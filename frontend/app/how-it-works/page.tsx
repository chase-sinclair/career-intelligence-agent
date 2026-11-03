'use client'

import Link from 'next/link'
import TopNav from '@/components/TopNav'
import { useInView } from '@/hooks/useInView'
import { Eyebrow, Heading2, Divider } from '@/components/shared/typography'
import PipelineSection from '@/components/how-it-works/PipelineSection'
import ChapterLayout from '@/components/how-it-works/ChapterLayout'
import IntroScene from '@/components/how-it-works/IntroScene'
import KnowledgeBaseScene from '@/components/how-it-works/KnowledgeBaseScene'
import QualityScene from '@/components/how-it-works/QualityScene'
import StackScene from '@/components/how-it-works/StackScene'

// ── Data ──────────────────────────────────────────────────────────────────────

/**
 * Corpus snapshot. Counted from the live Chroma collection rather than
 * estimated, and dated so it is obvious when it was last checked. There is no
 * public endpoint exposing a chunk count, and the spec rules out live calls
 * from explanatory visuals, so this is a dated figure rather than a fetch.
 */
const CORPUS = { artifacts: 19, chunks: 91, asOf: 'October 2026' } as const

const KB_DOCS = [
  {
    label: 'Core Profile',
    detail: 'Resume, skills summary, and target roles',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1" width="9" height="12" rx="1" stroke="rgba(var(--accent-rgb),0.55)" strokeWidth="0.75" />
        <line x1="3.5" y1="4.5" x2="8.5" y2="4.5" stroke="rgba(var(--accent-rgb),0.35)" strokeWidth="0.75" />
        <line x1="3.5" y1="6.5" x2="8.5" y2="6.5" stroke="rgba(var(--accent-rgb),0.35)" strokeWidth="0.75" />
        <line x1="3.5" y1="8.5" x2="6.5" y2="8.5" stroke="rgba(var(--accent-rgb),0.4)" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    label: 'Project Docs',
    detail: 'Deep-dive write-ups per project',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1.5 4C1.5 3.17 2.17 2.5 3 2.5H6L7.5 4.5H12C12.83 4.5 13.5 5.17 13.5 6V11C13.5 11.83 12.83 12.5 12 12.5H3C2.17 12.5 1.5 11.83 1.5 11V4Z" stroke="rgba(var(--accent-rgb),0.55)" strokeWidth="0.75" fill="rgba(var(--accent-rgb),0.04)" />
      </svg>
    ),
  },
  {
    label: 'Work Highlights',
    detail: 'Engagement summaries by client and deliverable',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="4.5" width="12" height="9" rx="1" stroke="rgba(var(--accent-rgb),0.55)" strokeWidth="0.75" fill="rgba(var(--accent-rgb),0.04)" />
        <path d="M4.5 4.5V3.5C4.5 3.22 4.72 3 5 3H10C10.28 3 10.5 3.22 10.5 3.5V4.5" stroke="rgba(var(--accent-rgb),0.4)" strokeWidth="0.75" />
        <line x1="1.5" y1="8.5" x2="13.5" y2="8.5" stroke="rgba(var(--accent-rgb),0.35)" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    label: 'Certifications',
    detail: 'AWS, Google, Anthropic, IBM credentials',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="6.5" r="3.5" stroke="rgba(var(--accent-rgb),0.55)" strokeWidth="0.75" />
        <path d="M4.5 9.5L3 13L7.5 11.5L12 13L10.5 9.5" stroke="rgba(var(--accent-rgb),0.4)" strokeWidth="0.75" fill="none" />
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
    summary: 'Semantic search returns the 12 highest-scoring chunks from the indexed corpus.',
    description:
      'The rewritten query is embedded with text-embedding-3-small and matched against the indexed corpus by cosine similarity in Chroma. Retrieval is configured to return the top 12 chunks — not whole documents, but the individual sections that scored highest: resume passages, project write-ups, certification records, work highlights.',
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
    scale: '0-1 score',
    kind: 'score',
  },
  {
    label: 'Evidence Coverage',
    detail: 'Do the chunks contain enough specific facts to actually answer?',
    phase: 'Pre-generation',
    scale: '0-1 score',
    kind: 'score',
  },
  {
    label: 'Groundedness',
    detail: 'Are all claims in the answer directly supported by the evidence?',
    phase: 'Post-generation',
    scale: '0-1 score',
    kind: 'score',
  },
  {
    label: 'Completeness',
    detail: 'Did the answer use all the relevant information available?',
    phase: 'Post-generation',
    scale: '0-1 score',
    kind: 'score',
  },
  {
    label: 'Unsupported Claims',
    detail: 'Did the answer assert anything not present in the source documents?',
    phase: 'Post-generation',
    scale: 'flagged / not flagged',
    kind: 'flag',
  },
] as const

const STACK = [
  {
    label: 'Orchestration',
    value:
      'LangGraph holds the five stages as a stateful graph. State flows node to node, and the gate is a conditional edge — which is what lets the graph stop early instead of always running to the end.',
  },
  {
    label: 'Retrieval',
    value:
      'Chroma stores a vector per chunk and answers the nearest-neighbour query. It is local and persistent, so the index is a file on disk rather than a managed service.',
  },
  {
    label: 'Embeddings',
    value:
      'text-embedding-3-small turns both the indexed chunks and the incoming question into vectors. The same model has to be used for both, or the distances between them are meaningless.',
  },
  {
    label: 'Generation',
    value:
      'gpt-4o writes the answer, but only from the passages the graph hands it. The prompt constrains it to the supplied evidence and the conversation so far.',
  },
  {
    label: 'Judging',
    value:
      'gpt-4o-mini runs twice on different questions: before generation it rules on whether the evidence is sufficient, after generation it reviews the finished answer. A smaller model is enough for a bounded yes/no judgement.',
  },
  {
    label: 'API',
    value:
      'FastAPI exposes the graph over one endpoint. The browser posts a question and conversation history and receives the answer, its sources, and both sets of scores together.',
  },
  {
    label: 'Interface',
    value:
      'Next.js 14 App Router with TypeScript and Tailwind. The chat page renders the answer as it streams in and shows the evidence and scores alongside it.',
  },
]

// ── Shared atoms ──────────────────────────────────────────────────────────────
// Eyebrow, Heading2 and Divider now live in components/shared/typography so the
// standalone project pages can inherit the same system. Imported at the top of
// this file; rendered output is unchanged.

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const { ref: heroRef,     inView: heroIn     } = useInView()
  const { ref: calloutRef,  inView: calloutIn  } = useInView({ threshold: 0.1 })
  const { ref: kbRef,       inView: kbIn       } = useInView()
  const { ref: pipeRef,     inView: pipeIn     } = useInView({ threshold: 0.08 })
  const { ref: metricsRef,  inView: metricsIn  } = useInView()
  const { ref: stackRef,    inView: stackIn    } = useInView()
  const { ref: visionRef,   inView: visionIn   } = useInView({ threshold: 0.1 })


  return (
    <>
      <TopNav subtitle="How It Works" />

      <main className="pl-5">
        <div className="px-6 md:px-10 pb-24 pt-24 mx-auto w-full max-w-[1280px]">

          {/* ── §1 Under the hood ───────────────────────────────────────── */}
          <div ref={heroRef}>
            <header
              className={`transition-all duration-700 ease-out ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <Eyebrow>Under the hood</Eyebrow>
              <h1
                className="font-light tracking-[-0.04em] leading-[1.06] mb-6 max-w-[16ch]"
                style={{ color: 'var(--ink)', fontSize: 'clamp(2.25rem, 3.2vw, 3.5rem)' }}
              >
                An AI-native candidate profile built on real evidence
              </h1>

              <ChapterLayout visual={<IntroScene active={heroIn} />}>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  A resume is a fixed document: it answers the questions its author
                  anticipated, in the order they chose. This profile works the other way
                  round — you ask, and the system answers from Chase&apos;s actual career
                  documents.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  That only means something if the answers can be trusted. So the system is
                  built around a simple rule: before it writes anything, it has to find
                  supporting passages in the indexed documents, and it checks whether what it
                  found is actually enough. If it isn&apos;t, it says so instead of guessing.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-6 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  A language model still writes the words. What changes is where the facts come
                  from: retrieved passages rather than whatever the model absorbed in training.
                  Every answer carries citations back to the document it came from, and is
                  scored after the fact.
                </p>

                <div
                  ref={calloutRef}
                  className={`rounded-xl p-5 max-w-[46ch] transition-all duration-700 ease-out ${calloutIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{
                    background: 'rgba(var(--accent-rgb),0.05)',
                    border: '0.5px solid rgba(var(--accent-rgb),0.2)',
                    transitionDelay: '120ms',
                  }}
                >
                  {[
                    'Ask anything directly.',
                    `${CORPUS.artifacts} career artifacts indexed.`,
                    'Evidence checked before answering.',
                    'Answer scored after generating.',
                  ].map((line, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 mb-3 last:mb-0 transition-all duration-500 ease-out ${calloutIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: calloutIn ? `${160 + i * 70}ms` : '0ms' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[7px]"
                        style={{ background: 'rgba(var(--accent-rgb),0.65)' }}
                      />
                      <p className="text-[0.9375rem] leading-[1.6]" style={{ color: 'rgba(var(--ink-rgb),0.7)' }}>
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </ChapterLayout>
            </header>
          </div>

          <Divider />

          {/* ── §2 Knowledge Base ────────────────────────────────────────── */}
          <div ref={kbRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>The knowledge base</Eyebrow>
                <Heading2 className="mb-4">
                  {CORPUS.artifacts} career artifacts, ingested and indexed
                </Heading2>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Everything the assistant can say comes from a fixed set of documents:
                  resume content, project write-ups, engagement summaries and certification
                  records, written as structured markdown.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Each document is split along its own section boundaries rather than at a
                  fixed character count, so a retrieved passage still makes sense on its own.
                  Every passage is turned into an embedding — a list of numbers standing in
                  for its meaning — with{' '}
                  <span style={{ color: 'rgba(var(--ink-rgb),0.68)' }}>text-embedding-3-small</span>,
                  and stored in a Chroma vector index.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-7 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  That work happens once, when a document is ingested. It is worth separating
                  two numbers that are easy to confuse: {CORPUS.artifacts} artifacts are{' '}
                  <em className="not-italic" style={{ color: 'var(--accent)' }}>indexed</em>, and a
                  single question{' '}
                  <em className="not-italic" style={{ color: 'var(--accent)' }}>retrieves</em> a
                  small subset of the {CORPUS.chunks} resulting chunks — currently the top 12.
                  Nothing re-reads the whole corpus per question.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-7 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Which raises the question the next section answers: given an index full of
                  passages, how does one question turn into a trustworthy answer?
                </p>
              </div>

              <ChapterLayout visual={<KnowledgeBaseScene active={kbIn} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {KB_DOCS.map(({ label, detail, icon }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 transition-all duration-500 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'var(--panel-2)',
                      border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                      transitionDelay: kbIn ? `${i * 80}ms` : '0ms',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {icon}
                      <span
                        className="font-mono text-[8px] tracking-[0.14em] uppercase"
                        style={{ color: 'var(--accent)' }}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>
                      {detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ingestion flow terminal */}
              <div
                className={`rounded-xl px-5 py-3 transition-all duration-600 ease-out ${kbIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{
                  background: 'var(--panel-2)',
                  border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                  transitionDelay: kbIn ? '320ms' : '0ms',
                }}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {['.md files', 'parse', 'chunk', 'embed (text-embedding-3-small)', 'Chroma index'].map(
                    (step, i, arr) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[10px]" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>
                          {step}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="font-mono text-[10px]" style={{ color: 'var(--accent)' }}>
                            →
                          </span>
                        )}
                      </span>
                    )
                  )}
                </div>
              </div>
              </ChapterLayout>
            </section>
          </div>

          <Divider />

          {/* ── §3 Pipeline ──────────────────────────────────────────────── */}
          <div ref={pipeRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${pipeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>The pipeline</Eyebrow>
                <Heading2 className="mb-4">What happens when you ask</Heading2>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Indexing is the preparation. This is the part that runs every time someone
                  types a question, and it is where most of the design sits.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  The obvious way to build this is one call: hand the question and some
                  documents to a model and print what comes back. The problem is that you get
                  an answer either way. A model asked something the documents cannot support
                  will still produce fluent, confident text — and nothing in that design is
                  positioned to notice.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  So it is split into five steps instead, each doing one job and passing its
                  result to the next. Breaking it up means each step can be inspected, and one
                  of them is allowed to halt the whole thing. That step is the third:{' '}
                  <em className="not-italic" style={{ color: 'var(--accent)' }}>
                    if the evidence does not support an answer, the graph stops and no answer
                    is written
                  </em>
                  . Generation never runs on evidence that failed the check.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-10 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Scroll through the five stages below — the illustration follows along, or
                  select a step to jump to it.
                </p>
              </div>

              <PipelineSection steps={PIPELINE_STEPS} />
            </section>
          </div>

          <Divider />

          {/* ── §4 Answer Quality ────────────────────────────────────────── */}
          <div ref={metricsRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>Answer quality</Eyebrow>
                <Heading2 className="mb-4">Checked twice — before and after writing</Heading2>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Retrieval can go wrong in two different ways, so the system checks at two
                  different moments. Before anything is written, it asks whether the passages
                  it found are on topic and whether they actually contain the facts the
                  question needs. That check can stop the process outright.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-7 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Once an answer exists, a second pass reviews the finished text against the
                  evidence it was given: is every claim supported, was the available evidence
                  used, and did anything slip in that the sources do not say. The five
                  dimensions below belong to one checkpoint or the other — never both.
                </p>
              </div>

              {/* Pull-quote callout */}
              <div
                className={`border-l-2 pl-5 mb-7 transition-all duration-600 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  borderColor: 'rgba(var(--accent-rgb),0.45)',
                  transitionDelay: metricsIn ? '100ms' : '0ms',
                }}
              >
                <p className="text-[1.0625rem] leading-[1.7] italic mb-1" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Most AI systems generate an answer and stop. This one grades its own work.
                </p>
                <p className="text-[0.9375rem] leading-[1.6]" style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
                  Scores are recorded per answer and shown in the quality panel on the Ask
                  page. No aggregate performance figures are published here — see the note at
                  the end of this section.
                </p>
              </div>

              {/* Metric rows */}
              <ChapterLayout visual={<QualityScene active={metricsIn} />}>
              <div className="flex flex-col gap-2">
                {METRICS.map(({ label, detail, phase, scale, kind }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl px-4 py-3 transition-all duration-500 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'var(--panel-2)',
                      border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                      transitionDelay: metricsIn ? `${i * 100}ms` : '0ms',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-1.5">
                      <div className="flex-1">
                        <p className="text-[11px] font-medium" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                          {label}
                        </p>
                        <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>
                          {detail}
                        </p>
                      </div>
                      <span
                        className="font-mono text-[8px] tracking-[0.08em] whitespace-nowrap mt-0.5 px-2 py-0.5 rounded-full flex-shrink-0"
                        style={
                          phase === 'Pre-generation'
                            ? {
                                background: 'rgba(var(--accent-rgb),0.08)',
                                border: '0.5px solid rgba(var(--accent-rgb),0.2)',
                                color: 'var(--accent)',
                              }
                            : {
                                background: 'var(--panel-2)',
                                border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                                color: 'rgba(var(--ink-rgb),0.60)',
                              }
                        }
                      >
                        {phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="font-mono text-[8px] px-2 py-0.5 rounded"
                        style={{
                          background: 'var(--panel-2)',
                          border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                          color: 'rgba(var(--ink-rgb),0.60)',
                        }}
                      >
                        {scale}
                      </span>
                      <span className="text-[9px]" style={{ color: 'rgba(var(--ink-rgb),0.60)' }}>
                        {kind === 'flag' ? 'raised per answer' : 'recorded per answer'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
                <p className="mt-6 text-[0.9375rem] leading-[1.6] max-w-[62ch]" style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
                  A note on numbers: this page deliberately shows no average scores. The
                  evaluation harness exists and records these dimensions per answer, but the
                  only batch run stored in the repository covers three questions, which is far
                  too small to quote as a performance figure. Rather than publish a number that
                  cannot be defended, the design is described and the measurement left out.
                </p>
              </ChapterLayout>
            </section>
          </div>

          <Divider />

          {/* ── §5 Tech Stack ────────────────────────────────────────────── */}
          <div ref={stackRef}>
            <section>
              <div className={`transition-all duration-600 ease-out ${stackIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <Eyebrow>Tech stack</Eyebrow>
                <Heading2 className="mb-4">What it&apos;s built on</Heading2>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  All of that has to run somewhere. Individually these are ordinary choices,
                  and deliberately so. What matters is the division of labour between them:
                  each piece is responsible for one thing and hands a well-defined result to
                  the next.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-4 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  A question arrives at the API, which hands it to the graph. The graph decides
                  what happens in what order — and, crucially, whether to continue at all. The
                  embedding model and the vector store answer one narrow question between them:
                  which stored passages are closest to this one. Only after that does a
                  generation model see anything, and it sees the retrieved passages rather than
                  the corpus.
                </p>
                <p className="text-[1.0625rem] leading-[1.7] mb-7 max-w-[64ch]" style={{ color: 'rgba(var(--ink-rgb),0.72)' }}>
                  Splitting it this way is what makes the behaviour inspectable. Because judging
                  is a separate node rather than an instruction buried in the generation prompt,
                  its verdict can be recorded, shown next to the answer, and used to stop the
                  graph.
                </p>
              </div>

              <ChapterLayout visual={<StackScene active={stackIn} />}>
              <div className="grid grid-cols-1 gap-2">
                {STACK.map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`rounded-xl p-4 transition-all duration-500 ease-out ${stackIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{
                      background: 'var(--panel-2)',
                      border: '0.5px solid rgba(var(--ink-rgb),0.10)',
                      transitionDelay: stackIn ? `${i * 80}ms` : '0ms',
                    }}
                  >
                    <p
                      className="font-mono text-[9.5px] tracking-[0.14em] uppercase mb-1.5"
                      style={{ color: 'var(--accent)' }}
                    >
                      {label}
                    </p>
                    <p className="text-[0.9375rem] leading-[1.6]" style={{ color: 'rgba(var(--ink-rgb),0.66)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              </ChapterLayout>
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
                  style={{ maxWidth: 200, background: 'rgba(var(--accent-rgb),0.18)' }}
                />
                <p
                  className="text-2xl md:text-3xl font-serif italic leading-snug"
                  style={{ color: 'var(--accent)' }}
                >
                  &ldquo;This profile is Chase&apos;s.
                  <br />
                  The system is for anyone.&rdquo;
                </p>
                <div
                  className="h-px mt-8 mx-auto"
                  style={{ maxWidth: 200, background: 'rgba(var(--accent-rgb),0.18)' }}
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
                    style={{ color: 'var(--accent)' }}
                  >
                    What exists today
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
                    This profile is Chase&apos;s. But the underlying system is
                    document-agnostic. The ingestion pipeline, retrieval graph, evidence
                    gate, and evaluation layer are designed to work with any
                    candidate&apos;s career artifacts.
                  </p>
                </div>
                <div
                  className="pl-8 md:border-l mt-6 md:mt-0"
                  style={{ borderColor: 'rgba(var(--ink-rgb),0.10)' }}
                >
                  <p
                    className="font-mono text-[8px] tracking-[0.14em] uppercase mb-3"
                    style={{ color: 'var(--accent)' }}
                  >
                    Where it&apos;s going
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(var(--ink-rgb),0.62)' }}>
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
                    background: 'rgba(var(--accent-rgb),0.09)',
                    border: '0.5px solid rgba(var(--accent-rgb),0.28)',
                    color: 'var(--accent)',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(var(--accent-rgb),0.15)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'rgba(var(--accent-rgb),0.09)'
                  }}
                >
                  Ask About Chase →
                </Link>
                <Link
                  href="/projects"
                  className="text-[11px] px-4 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'var(--panel-2)',
                    border: '0.5px solid rgba(var(--ink-rgb),0.16)',
                    color: 'rgba(var(--ink-rgb),0.60)',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'var(--panel)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(var(--ink-rgb),0.75)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background =
                      'var(--panel-2)'
                    ;(e.currentTarget as HTMLAnchorElement).style.color =
                      'rgba(var(--ink-rgb),0.60)'
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
