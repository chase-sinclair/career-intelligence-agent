/**
 * Content for the Career Radar case study.
 *
 * PRELIMINARY. Every fact is carried over from the `career-radar` entry in
 * `lib/project-details.ts`. Nothing is invented. Visuals are not finalized,
 * so the hero uses a CSS placeholder frame.
 */

export const HERO_PLACEHOLDER = {
  label: 'Market briefing view',
  note: 'Screenshot pending',
} as const

/** §4: what the n8n pipeline does to a posting on its way into Supabase. */
export const PIPELINE_META: ReadonlyArray<readonly [string, string]> = [
  ['collect', 'SerpAPI and job-source connectors'],
  ['dedupe', 'canonical job records'],
  ['classify', 'role family'],
  ['extract', 'tools and skills'],
]

/** §4: the dimensions a company field is split into, verbatim from the source. */
export const COMPANY_DIMENSIONS: ReadonlyArray<string> = ['listing', 'hiring', 'canonical', 'company type']

/** §7: the seven dashboard views, named exactly as the source names them. */
export const VIEWS: ReadonlyArray<{
  id: string
  short: string
  title: string
  body: string
  output: string
}> = [
  {
    id: 'briefing',
    short: 'Market Briefing',
    title: 'Market Briefing',
    body: 'The top-level read on the market: what moved, which segments are hiring, and what the current evidence base supports. The narrative layer explains deterministic counts rather than producing its own.',
    output: 'The state of the market, grounded in counted evidence',
  },
  {
    id: 'evidence',
    short: 'Job Evidence',
    title: 'Job Evidence',
    body: 'The normalized postings themselves, preserved as the evidence behind every other view. Raw source evidence is kept alongside the canonical record rather than overwritten by it.',
    output: 'The postings any claim can be traced back to',
  },
  {
    id: 'emerging',
    short: 'Emerging Roles',
    title: 'Emerging Roles',
    body: 'Role families appearing or growing in the posting data, built on the classification step in the n8n pipeline rather than on keyword counts over raw titles.',
    output: 'Which roles are actually new, not just renamed',
  },
  {
    id: 'skills',
    short: 'Rising Skills',
    title: 'Rising Skills and Tools',
    body: 'Tools and skills extracted from posting text during enrichment, aggregated to show what employers are asking for and how that is shifting.',
    output: 'The tools demand is moving toward',
  },
  {
    id: 'segments',
    short: 'Market Segments',
    title: 'Market Segments',
    body: 'Demand broken out by the segments the project scopes to: AI adoption, workflow automation, business systems, RevOps, finance transformation, data analytics, AI governance, and software engineering.',
    output: 'Which parts of the market are driving demand',
  },
  {
    id: 'companies',
    short: 'Companies',
    title: 'Companies',
    body: 'Hiring activity by company, resting on the company dictionary mapping that separates the listing company from the hiring company, the canonical entity, and the company type.',
    output: 'Who is hiring, with agency listings untangled',
  },
  {
    id: 'methodology',
    short: 'Methodology',
    title: 'Methodology',
    body: 'How the numbers are produced: sources, deduplication, classification, enrichment versioning, and the known limits of the data. Shipped as a view rather than left implicit.',
    output: 'The caveats, stated in the product',
  },
]

export const PIPELINE: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Discover', v: 'SerpAPI and job-source connectors fetch listings, orchestrated by n8n.' },
  { k: 'Process', v: 'n8n dedupes, classifies by role family, and extracts tools and skills.' },
  { k: 'Transform', v: 'Supabase views expose app-ready evidence with canonical records.' },
  { k: 'Narrate', v: 'Server routes call OpenAI with deterministic data as context.' },
  { k: 'Render', v: 'Seven Next.js views read the Supabase views through typed contracts.' },
]
