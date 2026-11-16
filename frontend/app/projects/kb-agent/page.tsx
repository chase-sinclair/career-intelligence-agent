import type { Metadata } from 'next'
import KbAgentPage from '@/components/kb-agent/KbAgentPage'

/**
 * Standalone case study for KB Agent, following the same precedent as the two
 * PEAI pages: a static route that takes precedence over the `[slug]` redirect,
 * so this page is authoritative for this slug rather than bouncing to the
 * projects overlay.
 *
 * Sections 01-06 and the unnumbered Project Reflection are implemented; see
 * the header comment in `components/kb-agent/KbAgentPage.tsx`. A closing
 * knowledge-base CTA and project navigation follow the reflection.
 */
export const metadata: Metadata = {
  title: 'KB Agent — Slack + Notion Proposal Workflow | Chase Sinclair',
  description:
    'An AI agent that keeps shared proposal documents searchable and current, investigates evidence in Slack, and turns unresolved issues into assigned Notion tasks after human review.',
}

export default function Page() {
  return <KbAgentPage />
}
