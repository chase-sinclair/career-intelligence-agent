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
    'Five controlled experiments comparing an AI addition with a version without it, from finance SQL context to AI fact-checkers. In four of five, the extra layer did not pay for itself.',
}

export default function Page() {
  return <EvalLabPage />
}
