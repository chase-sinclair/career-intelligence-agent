import type { Metadata } from 'next'
import KbAgentPage from '@/components/kb-agent/KbAgentPage'

/**
 * Standalone case study for KB Agent, following the same precedent as the two
 * PEAI pages: a static route that takes precedence over the `[slug]` redirect,
 * so this page is authoritative for this slug rather than bouncing to the
 * projects overlay.
 *
 * Content is preliminary. See the header comment in `lib/kb-agent-data.ts`.
 */
export const metadata: Metadata = {
  title: 'KB Agent — Proposal Intelligence Platform | Chase Sinclair',
  description:
    'A production Slack bot that turns a SharePoint document library into a queryable proposal intelligence system. Hybrid dense and sparse retrieval, a hand written Reciprocal Rank Fusion merge, and six analytical workflows for government proposal teams.',
}

export default function Page() {
  return <KbAgentPage />
}
