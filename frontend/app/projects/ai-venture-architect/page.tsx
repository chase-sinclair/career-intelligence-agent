import type { Metadata } from 'next'
import VentureArchitectPage from '@/components/venture-architect/VentureArchitectPage'

/**
 * Standalone case study. A static segment takes precedence over the `[slug]`
 * catch-all, so this page is authoritative for this slug.
 *
 * Content is preliminary. See the header in `lib/venture-architect-data.ts`.
 */
export const metadata: Metadata = {
  title: 'AI Venture Architect | Chase Sinclair',
  description:
    'A LangGraph multi-agent platform that turns rough AI product ideas into structured opportunity reports. A clarification gate, parallel market and architecture agents, and deterministic scoring held outside the generation path.',
}

export default function Page() {
  return <VentureArchitectPage />
}
