/**
 * Verbatim product data for the PEAI Chat Assistant case study.
 *
 * Everything in this file is quoted output or real metadata field names from
 * the shipped system. The handoff is explicit that these strings must not be
 * "corrected" for house style: the language rules about hyphens and em dashes
 * apply to prose only, never here. Do not reword, retitle or renumber.
 */

/** The live product this case study documents. */
export const LIVE_URL = 'https://aioperatingpartners.ai'

/**
 * Metadata attached to every ingested book page. Field names are verbatim from
 * the source document, so they stay snake_case and unprettified.
 */
export const INGESTION_META: ReadonlyArray<readonly [field: string, value: string]> = [
  ['section_label', 'Part 2'],
  ['section_title', 'Value Drivers'],
  ['true_page', '45'],
  ['source_type', 'peai_book_page'],
] as const

/** The Pass 1 filter expression, shown verbatim in the routing diagram. */
export const PASS_1_FILTER = 'source_type = "peai_book_page"'

/** Value driver groups as the assistant returns them. */
export const ANSWER_GROUPS: ReadonlyArray<{ group: string; levers: string }> = [
  { group: 'Revenue Growth', levers: 'Market Share Expansion, Customer Expansion, Pricing Optimization' },
  { group: 'Cost Reduction', levers: 'Margin Improvement, Operational Efficiency' },
  { group: 'Multiple Expansion', levers: 'Add On Acquisitions, Multiple Rerate' },
] as const

/** The book title as the assistant cites it. */
export const BOOK_TITLE = 'The PEAI Operating Partner Book'

/**
 * The four citations, verbatim and in this order. The mix of "Part" and
 * "Chapter" labels is the product's own, not an inconsistency to tidy.
 */
export const CITATIONS: ReadonlyArray<{ section: string; page: string }> = [
  { section: 'Part 2: Value Drivers', page: '45' },
  { section: 'Part 2: Value Drivers', page: '46' },
  { section: 'Chapter 6: Quantifying AI Value', page: '47' },
  { section: 'Chapter 6: Quantifying AI Value', page: '50' },
] as const

/** Collapsed chip label, e.g. "Part 2 · p. 45". */
export function citationChipLabel(citation: { section: string; page: string }): string {
  return `${citation.section.split(':')[0]} · p. ${citation.page}`
}
