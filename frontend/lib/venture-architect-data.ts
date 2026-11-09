/**
 * Content for the AI Venture Architect case study.
 *
 * PRELIMINARY. Every fact is carried over from the `ai-venture-architect`
 * entry in `lib/project-details.ts`. Nothing is invented. Visuals are not
 * finalized, so the hero uses a CSS placeholder frame.
 */

export const HERO_PLACEHOLDER = {
  label: 'Live progress feed',
  note: 'Screenshot pending',
} as const

/** §4: what the clarity gate reads before letting an idea through. */
export const GATE_META: ReadonlyArray<readonly [string, string]> = [
  ['input', 'a rough product idea'],
  ['check', 'clarity score'],
  ['if low', 'up to 3 targeted questions'],
  ['if high', 'straight to analysis'],
]

/** §5: the two agents that run at the same time. */
export const PARALLEL_AGENTS: ReadonlyArray<{
  name: string
  kind: string
  detail: string
  finds: string
}> = [
  {
    name: 'Market research',
    kind: 'Tavily',
    detail: 'Searches current web data rather than training knowledge.',
    finds: 'Competitive landscape, grounded',
  },
  {
    name: 'Solution architecture',
    kind: 'Generation',
    detail: 'Produces stack recommendations and feasibility notes.',
    finds: 'Can this actually be built',
  },
]

/** §6: the four scores computed outside the generation path. */
export const SCORES: ReadonlyArray<string> = ['uniqueness', 'feasibility', 'risk', 'confidence']

export const CAPABILITIES: ReadonlyArray<{
  id: string
  short: string
  title: string
  body: string
  output: string
}> = [
  {
    id: 'gate',
    short: 'Clarification gate',
    title: 'Clarification gate',
    body: 'Low-clarity submissions are detected before analysis begins. The workflow pauses, surfaces up to three targeted clarifying questions, and only proceeds once the input meets a minimum clarity threshold.',
    output: 'No analysis runs on an idea too vague to analyze',
  },
  {
    id: 'parallel',
    short: 'Parallel agents',
    title: 'Parallel agent execution',
    body: 'Market research and solution architecture agents run simultaneously via asyncio.gather, cutting total analysis time roughly in half compared to sequential execution.',
    output: 'Roughly half the wall clock of running them in turn',
  },
  {
    id: 'scoring',
    short: 'Deterministic scoring',
    title: 'Deterministic scoring',
    body: 'Uniqueness, feasibility, risk, and confidence scores are computed by a standalone utility using explicit criteria, separate from LLM generation, so scores are reproducible and explainable.',
    output: 'The same input scores the same way every time',
  },
  {
    id: 'sse',
    short: 'Live progress',
    title: 'Live SSE progress streaming',
    body: 'A FastAPI Server-Sent Events endpoint streams live progress updates to the Next.js frontend as the workflow executes, so users see which agent is running in real time.',
    output: 'A live activity feed instead of a spinner',
  },
  {
    id: 'tavily',
    short: 'Grounded research',
    title: 'Tavily market research',
    body: 'The market research agent uses Tavily search to ground analysis in current web data rather than LLM training knowledge, reducing hallucination on competitive landscape questions.',
    output: 'Competitors that exist now, not in the training set',
  },
  {
    id: 'langfuse',
    short: 'Observability',
    title: 'Langfuse observability',
    body: 'All agent runs are traced through Langfuse: token usage, latency per node, and score outputs. This enabled iterative calibration of the clarification gate threshold and the scoring rubric.',
    output: 'The traces that let the gate threshold be tuned',
  },
]

export const PIPELINE: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Gate', v: 'Score the idea on clarity, and ask questions if it is too vague.' },
  { k: 'Analyze', v: 'Market research and architecture agents run via asyncio.gather.' },
  { k: 'Synthesize', v: 'A third agent combines both into a structured opportunity report.' },
  { k: 'Score', v: 'A standalone utility applies explicit rubrics outside the LLM path.' },
  { k: 'Stream', v: 'Each stage emits progress through a FastAPI SSE endpoint.' },
]
