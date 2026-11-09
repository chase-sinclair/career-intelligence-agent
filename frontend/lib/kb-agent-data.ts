/**
 * Content for the KB Agent standalone case study.
 *
 * PRELIMINARY. Every fact here is carried over from the `kb-agent` entry in
 * `lib/project-details.ts`, which was the deep-dive overlay's source. Nothing
 * is invented. Two things are deliberately open and marked below:
 *
 *  1. No visuals are finalized. The hero and §4 use CSS-drawn placeholder
 *     frames rather than `next/image`, so the page builds and ships with no
 *     image assets at all. See `HERO_PLACEHOLDER`.
 *  2. The six analytical workflows are now named in `project-details.ts`:
 *     ask, agent, score, gaps, draft, and compare. §7 still presents six
 *     documented capabilities rather than those six workflows, because the
 *     mapping between the two is not one to one. Reconcile them in the
 *     content pass.
 */

/** Hero figure slot. Replace with a real screenshot once one exists. */
export const HERO_PLACEHOLDER = {
  label: 'Slack thread capture',
  note: 'Screenshot pending',
} as const

/** §4 ingestion metadata rows, revealed one at a time. */
export const INGESTION_META: ReadonlyArray<readonly [string, string]> = [
  ['source', 'watched folder tree, local or OneDrive'],
  ['change key', 'SHA-256 content hash'],
  ['vectors', 'dense + BM25-style sparse'],
  ['on failure', 'typed quarantine'],
]

/** §4 quarantine categories, verbatim from the source. */
export const QUARANTINE_CATEGORIES: ReadonlyArray<string> = [
  'LOCKED_FILE',
  'CORRUPT_FILE',
  'TRANSIENT_ERROR',
]

/** §5 retrieval legs merged by the application-level RRF pass. */
export const RETRIEVAL_LEGS: ReadonlyArray<{
  name: string
  kind: string
  detail: string
  finds: string
}> = [
  {
    name: 'Dense leg',
    kind: 'Semantic',
    detail: 'Embedding similarity over chunked documents.',
    finds: 'Catches a requirement phrased differently',
  },
  {
    name: 'Sparse leg',
    kind: 'Lexical',
    detail: 'BM25-style sparse vectors in the same collection.',
    finds: 'Catches exact proposal terminology',
  },
]

/**
 * §7 capabilities. Titles and descriptions track the `features` array in
 * `project-details.ts`; `output` is the one new field, kept to what each
 * feature description already implies.
 */
export const CAPABILITIES: ReadonlyArray<{
  id: string
  short: string
  title: string
  body: string
  output: string
}> = [
  {
    id: 'retrieval',
    short: 'Hybrid retrieval',
    title: 'Hybrid dense + sparse retrieval',
    body: 'Application-level Reciprocal Rank Fusion at k=60, merging dense semantic vectors with BM25-style sparse vectors, written after diagnosing a serialization bug in Qdrant client v1.17.1 that broke the server-side fusion path. Any failure in the hybrid path falls back to a dense-only query.',
    output: 'One ranked result set from two retrieval legs',
  },
  {
    id: 'drafting',
    short: 'Narrative drafting',
    title: 'Proposal narrative drafting',
    body: 'Generates draft proposal sections grounded in retrieved evidence, with explicit [EVIDENCE MISSING] flags wherever the document library does not support a required claim.',
    output: 'Draft section, gaps marked rather than filled',
  },
  {
    id: 'gap',
    short: 'Gap analysis',
    title: 'RFP gap analysis',
    body: 'Compares an uploaded RFP against the document library to identify capability gaps: requirements the team has not demonstrated in prior work.',
    output: 'The requirements with no prior work behind them',
  },
  {
    id: 'scoring',
    short: 'Relevance scoring',
    title: 'RFP relevance scoring',
    body: 'Scores a new RFP against prior work, win themes, and core competencies to give leadership a fast fit signal before investing in full bid pursuit.',
    output: 'A fit signal before the pursuit decision',
  },
  {
    id: 'thread',
    short: 'Thread context',
    title: 'Thread-aware conversation',
    body: 'Maintains conversation context within Slack threads, so follow-up questions resolve correctly against prior exchanges without the user restating context.',
    output: 'Follow-ups that work without repeating yourself',
  },
  {
    id: 'ingestion',
    short: 'Fault tolerance',
    title: 'Fault-tolerant ingestion',
    body: 'A typed quarantine system with LOCKED_FILE, CORRUPT_FILE, and TRANSIENT_ERROR categories. SHA-256 change detection skips unchanged files on re-ingestion runs.',
    output: 'One bad file never stops the run',
  },
]

/** §5 pipeline stages, condensed from the five architecture steps. */
export const PIPELINE: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Ingest', v: 'watchdog watches a local directory, or Microsoft Graph polls a OneDrive folder.' },
  { k: 'Index', v: 'Chunk, embed, and index dense and sparse vectors in Qdrant.' },
  { k: 'Merge', v: 'Retrieve both legs separately, then merge with RRF at k=60 in app code.' },
  { k: 'Dispatch', v: 'A FastMCP server exposes each workflow as a named tool.' },
  { k: 'Generate', v: 'Claude Opus answers from retrieved chunks only, flagging gaps.' },
]

export const STACK: ReadonlyArray<string> = [
  'Python',
  'Qdrant',
  'Claude Opus',
  'FastMCP',
  'Slack Bolt SDK',
  'MS Graph API',
]
