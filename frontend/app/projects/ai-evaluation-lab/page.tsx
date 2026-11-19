import type { Metadata } from 'next'
import EvalLabPage from '@/components/eval-lab/EvalLabPage'

/**
 * Standalone case study. A static segment takes precedence over the `[slug]`
 * catch-all, so this page is authoritative for this slug.
 *
 * Figures come from the Lab's committed record. See the header in
 * `lib/eval-lab-data.ts` for the wording rules the page holds to.
 */
export const metadata: Metadata = {
  title: 'AI Evaluation Lab | Chase Sinclair',
  description:
    'On GPT and Claude, a budget model with curated finance definitions beat a schema-only premium model priced at 20 times the per-token rate in every draw.',
}

export default function Page() {
  return <EvalLabPage />
}
