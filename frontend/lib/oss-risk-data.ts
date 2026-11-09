/**
 * Content for the OSS Dependency Risk Agent case study.
 *
 * PRELIMINARY. Every fact is carried over from the `oss-dependency-risk-agent`
 * entry in `lib/project-details.ts`. Nothing is invented. Visuals are not
 * finalized, so the hero uses a CSS placeholder frame.
 *
 * Note on the two repo counts: the source says 800+ repos monitored across 15
 * categories, and 705 scored daily. Both appear on the page, each where it
 * belongs, rather than silently reconciled into one number.
 */

export const HERO_PLACEHOLDER = {
  label: 'Portfolio health board',
  note: 'Screenshot pending',
} as const

/** §4: the medallion hops, in order. */
export const HOPS: ReadonlyArray<{ tier: string; where: string; what: string }> = [
  {
    tier: 'Bronze',
    where: 'AWS S3',
    what: 'Hourly GitHub Archive dumps filtered to the monitored repos, gzipped NDJSON.',
  },
  {
    tier: 'Silver',
    where: 'Databricks PySpark',
    what: 'MERGE-based deduplication on event_id, 48-day rolling window in Delta Lake.',
  },
  {
    tier: 'Gold',
    where: 'dbt Delta tables',
    what: 'Nine models in DAG order into gold_project_health and gold_health_scores.',
  },
]

/** §4: the GitHub Archive event types ingested, verbatim. */
export const EVENT_TYPES: ReadonlyArray<string> = [
  'PushEvent',
  'IssuesEvent',
  'PullRequestEvent',
  'IssueCommentEvent',
]

/**
 * §5: the seven signals behind the composite score. `weightHint` drives bar
 * width only. The source states the score is weighted but not the weights, so
 * the figure says on the page that the bars are illustrative.
 */
export const SIGNALS: ReadonlyArray<{ name: string; from: string; weightHint: number }> = [
  { name: 'Commit frequency', from: 'Push events, log-scaled', weightHint: 84 },
  { name: 'Issue resolution rate', from: 'Issue events', weightHint: 76 },
  { name: 'PR merge throughput', from: 'Pull request events, log-scaled', weightHint: 71 },
  { name: 'Contributor diversity', from: 'Actor spread', weightHint: 58 },
  { name: 'Governance', from: 'License, branch protection, code review', weightHint: 52 },
  { name: 'Security', from: 'CVE count, Dependabot', weightHint: 80 },
  { name: 'Unpatched CVEs', from: 'OSV API', weightHint: 68 },
]

/** §7: the five agent nodes, in order. */
export const NODES: ReadonlyArray<{
  id: string
  short: string
  title: string
  body: string
  output: string
}> = [
  {
    id: 'monitor',
    short: 'Monitor',
    title: 'Monitor',
    body: 'Queries gold_health_scores and flags repos below threshold, sorted by score, so the run starts from the portfolio rather than from a single repo someone happened to ask about.',
    output: 'The repos worth looking at today',
  },
  {
    id: 'investigate',
    short: 'Investigate',
    title: 'Investigate',
    body: 'Fetches live GitHub metadata, open issues, and recent PRs for each flagged repo, so the assessment sees current state and not only the windowed event aggregate.',
    output: 'Live context on top of the scored window',
  },
  {
    id: 'synthesize',
    short: 'Synthesize',
    title: 'Synthesize',
    body: 'Calls Claude Sonnet for a structured three-bullet risk assessment per repo. This is the qualitative read that a composite number cannot give on its own.',
    output: 'Three bullets on why this repo is a risk',
  },
  {
    id: 'recommend',
    short: 'Recommend',
    title: 'Recommend',
    body: 'Maps the health score to one of REPLACE, UPGRADE or MONITOR. The mapping is deterministic, so the action attached to a score does not drift between runs.',
    output: 'REPLACE, UPGRADE or MONITOR',
  },
  {
    id: 'deliver',
    short: 'Deliver',
    title: 'Deliver',
    body: 'Renders a tiered Markdown report and triggers Pinecone indexing, using llama-text-embed-v2 at 1024 dimensions with SHA256-hashed vector IDs so upserts are idempotent.',
    output: 'A tiered report, semantically searchable',
  },
]

export const PIPELINE: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Ingest', v: 'GitHub Archive events hourly into an S3 Bronze bucket.' },
  { k: 'Process', v: 'PySpark dedupes on event_id into a 48-day Silver window.' },
  { k: 'Transform', v: 'Nine dbt models build seven signal views and two Gold tables.' },
  { k: 'Assess', v: 'A five-node LangGraph agent calls Claude Sonnet per flagged repo.' },
  { k: 'Serve', v: 'FastAPI exposes five routers behind a Next.js 14 frontend.' },
]
