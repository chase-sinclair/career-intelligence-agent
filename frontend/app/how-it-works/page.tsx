import TopNav from '@/components/TopNav'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PipelineStep {
  index: string
  title: string
  description: string
}

interface StackItem {
  label: string
  value: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PIPELINE_STEPS: PipelineStep[] = [
  {
    index: '01',
    title: 'Query Rewrite',
    description:
      'On follow-up questions, gpt-4o-mini resolves pronouns and references ("that project", "his role there") into a fully self-contained retrieval query — so retrieval always gets the right signal regardless of conversational context.',
  },
  {
    index: '02',
    title: 'Evidence Retrieval',
    description:
      'The rewritten query is embedded and matched against 16+ ingested career documents using cosine similarity in Chroma. The top-12 most relevant chunks are returned — resume sections, project write-ups, certification records, and work highlights.',
  },
  {
    index: '03',
    title: 'Evidence Gate',
    description:
      'Before generating anything, a gpt-4o-mini judge evaluates the retrieved chunks: are they relevant to the question? Do they contain the specific facts needed? If not, the system declines to answer rather than fabricate. Relevance, coverage, and source quality are each scored 0–1.',
  },
  {
    index: '04',
    title: 'Answer Generation',
    description:
      'GPT-4o generates a grounded answer using only the retrieved evidence — with conversation history injected so responses stay coherent across turns. The system prompt explicitly forbids asserting anything not present in the evidence.',
  },
  {
    index: '05',
    title: 'Answer Evaluation',
    description:
      'A second gpt-4o-mini call acts as an independent judge, scoring the generated answer on groundedness (are claims supported?), completeness (does it use all available evidence?), and whether any unsupported assertions were made.',
  },
]

const STACK: StackItem[] = [
  { label: 'Orchestration',  value: 'LangGraph 0.2 — stateful multi-node graph' },
  { label: 'Generation',     value: 'GPT-4o — grounded answer synthesis' },
  { label: 'Evaluation',     value: 'GPT-4o-mini — LLM-as-judge (pre & post generation)' },
  { label: 'Embeddings',     value: 'text-embedding-3-small — semantic similarity' },
  { label: 'Vector DB',      value: 'Chroma — local persistent vector store' },
  { label: 'Backend',        value: 'FastAPI + Python — async REST API' },
  { label: 'Frontend',       value: 'Next.js 14 App Router + TypeScript + Tailwind CSS' },
]

// ── Components ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] tracking-[0.2em] uppercase mb-5"
      style={{ color: 'rgba(196,168,130,0.5)' }}
    >
      {children}
    </p>
  )
}

function Divider() {
  return (
    <div
      className="my-14"
      style={{ height: '1px', background: 'rgba(226,223,208,0.06)' }}
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <>
      <TopNav subtitle="How It Works" />

      <main className="pl-5 h-screen overflow-y-auto">
        <div className="px-10 pb-16 pt-24 max-w-3xl">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <header className="mb-14">
            <SectionLabel>Under the hood</SectionLabel>
            <h1
              className="text-4xl font-light tracking-[-0.04em] leading-tight mb-5"
              style={{ color: '#E2DFD0' }}
            >
              An AI-native candidate profile built on real evidence
            </h1>
            <p
              className="text-sm leading-relaxed max-w-xl"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              Traditional resumes are static snapshots. This profile is conversational,
              evidence-backed, and evaluated in real time. Every answer is traced to a
              specific career document — not generated from training data.
            </p>
          </header>

          {/* ── The Problem ─────────────────────────────────────────────── */}
          <section>
            <SectionLabel>The problem</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-4"
              style={{ color: '#E2DFD0' }}
            >
              Resumes don&apos;t answer questions
            </h2>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              A PDF resume forces every reader to hunt for the specific signal they
              care about — and makes it easy to miss. A recruiter evaluating systems
              architecture experience has different questions than one evaluating team
              leadership or client impact.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              This profile inverts that. Ask anything directly. The system retrieves
              the most relevant evidence from 16+ career artifacts, checks whether
              that evidence is actually sufficient before answering, generates a
              grounded response, and then scores it — all in a single request.
            </p>
          </section>

          <Divider />

          {/* ── Data Foundation ─────────────────────────────────────────── */}
          <section>
            <SectionLabel>The knowledge base</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-4"
              style={{ color: '#E2DFD0' }}
            >
              16+ career artifacts, ingested and indexed
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              The profile is built from structured markdown documents: a full resume,
              project deep-dives, work highlight summaries by engagement, and
              certification records. Each document is parsed, chunked to preserve
              section structure, embedded with{' '}
              <span style={{ color: 'rgba(226,223,208,0.65)' }}>text-embedding-3-small</span>,
              and stored in a Chroma vector index.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Core profile', detail: 'Resume, skills, target roles' },
                { label: 'Project docs', detail: 'Deep dives per project' },
                { label: 'Work highlights', detail: 'Engagement summaries by client' },
                { label: 'Certifications', detail: 'AWS, Google, Anthropic credentials' },
              ].map(({ label, detail }) => (
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(226,223,208,0.03)',
                    border: '0.5px solid rgba(226,223,208,0.08)',
                  }}
                >
                  <p
                    className="text-[11px] font-medium mb-1"
                    style={{ color: 'rgba(226,223,208,0.75)' }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[10px] leading-relaxed"
                    style={{ color: 'rgba(226,223,208,0.35)' }}
                  >
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── Pipeline ────────────────────────────────────────────────── */}
          <section>
            <SectionLabel>The pipeline</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-2"
              style={{ color: '#E2DFD0' }}
            >
              Five-node LangGraph workflow
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              Every question runs through a stateful graph orchestrated by LangGraph.
              Each node has a single responsibility. The evidence gate uses a
              conditional edge — if evidence is insufficient, generation is skipped
              entirely and no answer is fabricated.
            </p>

            <div className="flex flex-col gap-3">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.index} className="flex gap-4">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center gap-0 flex-shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(196,168,130,0.08)',
                        border: '0.5px solid rgba(196,168,130,0.22)',
                      }}
                    >
                      <span
                        className="text-[9px] font-mono"
                        style={{ color: 'rgba(196,168,130,0.7)' }}
                      >
                        {step.index}
                      </span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div
                        className="w-px flex-1 mt-1"
                        style={{
                          background: 'rgba(196,168,130,0.12)',
                          minHeight: 20,
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-5">
                    <p
                      className="text-[12px] font-medium mb-1.5"
                      style={{ color: 'rgba(226,223,208,0.80)' }}
                    >
                      {step.title}
                    </p>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: 'rgba(226,223,208,0.38)' }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── Answer Quality ──────────────────────────────────────────── */}
          <section>
            <SectionLabel>Answer quality</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-4"
              style={{ color: '#E2DFD0' }}
            >
              Every answer is scored, not just generated
            </h2>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              Most AI systems generate an answer and stop. This one evaluates it.
              The quality panel on the Ask page shows live scores for every response.
            </p>

            <div className="flex flex-col gap-2">
              {[
                {
                  label: 'Evidence Relevance',
                  detail: 'Are the retrieved chunks topically relevant to the question?',
                  phase: 'Pre-generation',
                },
                {
                  label: 'Evidence Coverage',
                  detail: 'Do the chunks contain enough specific facts to actually answer?',
                  phase: 'Pre-generation',
                },
                {
                  label: 'Groundedness',
                  detail: 'Are all claims in the answer directly supported by the evidence?',
                  phase: 'Post-generation',
                },
                {
                  label: 'Completeness',
                  detail: 'Did the answer use all the relevant information available?',
                  phase: 'Post-generation',
                },
                {
                  label: 'Unsupported Claims',
                  detail: 'Did the answer assert anything not present in the source documents?',
                  phase: 'Post-generation',
                },
              ].map(({ label, detail, phase }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-xl px-4 py-3"
                  style={{
                    background: 'rgba(226,223,208,0.03)',
                    border: '0.5px solid rgba(226,223,208,0.07)',
                  }}
                >
                  <div className="flex-1">
                    <p
                      className="text-[11px] font-medium mb-0.5"
                      style={{ color: 'rgba(226,223,208,0.72)' }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[10px] leading-relaxed"
                      style={{ color: 'rgba(226,223,208,0.33)' }}
                    >
                      {detail}
                    </p>
                  </div>
                  <span
                    className="text-[8px] tracking-[0.1em] uppercase whitespace-nowrap mt-0.5 px-2 py-0.5 rounded-full flex-shrink-0"
                    style={
                      phase === 'Pre-generation'
                        ? {
                            background: 'rgba(196,168,130,0.08)',
                            border: '0.5px solid rgba(196,168,130,0.18)',
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
              ))}
            </div>
          </section>

          <Divider />

          {/* ── Tech Stack ──────────────────────────────────────────────── */}
          <section>
            <SectionLabel>Tech stack</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-6"
              style={{ color: '#E2DFD0' }}
            >
              What it&apos;s built on
            </h2>

            <div className="flex flex-col gap-0">
              {STACK.map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex items-baseline gap-4 py-3"
                  style={{
                    borderBottom: i < STACK.length - 1
                      ? '1px solid rgba(226,223,208,0.05)'
                      : 'none',
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.06em] w-28 flex-shrink-0"
                    style={{ color: 'rgba(196,168,130,0.55)' }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[11px] leading-relaxed"
                    style={{ color: 'rgba(226,223,208,0.50)' }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* ── The Bigger Picture ──────────────────────────────────────── */}
          <section>
            <SectionLabel>What&apos;s next</SectionLabel>
            <h2
              className="text-xl font-light tracking-[-0.03em] mb-4"
              style={{ color: '#E2DFD0' }}
            >
              The same system, built for any candidate
            </h2>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              This profile is Chase&apos;s. But the underlying system is document-agnostic.
              The ingestion pipeline, retrieval graph, evidence gate, and evaluation layer
              are designed to work with any candidate&apos;s career artifacts.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(226,223,208,0.45)' }}
            >
              A future version of this product would let any candidate upload their
              resume and supporting documents, then generate a fully interactive,
              evidence-backed AI profile — replacing the traditional resume with
              something that actually answers questions.
            </p>
          </section>

        </div>
      </main>
    </>
  )
}
