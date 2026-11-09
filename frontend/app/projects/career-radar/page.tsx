import type { Metadata } from 'next'
import CareerRadarPage from '@/components/career-radar/CareerRadarPage'

/**
 * Standalone case study. A static segment takes precedence over the `[slug]`
 * catch-all, so this page is authoritative for this slug.
 *
 * Content is preliminary. See the header in `lib/career-radar-data.ts`.
 */
export const metadata: Metadata = {
  title: 'Career Radar — Labor Market Intelligence | Chase Sinclair',
  description:
    'A full-stack labor market intelligence product: real job postings ingested through n8n, normalized and enriched in Supabase, and read through seven views, with an OpenAI layer that explains deterministic data rather than producing it.',
}

export default function Page() {
  return <CareerRadarPage />
}
