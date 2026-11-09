import type { Metadata } from 'next'
import OssRiskPage from '@/components/oss-risk/OssRiskPage'

/**
 * Standalone case study. A static segment takes precedence over the `[slug]`
 * catch-all, so this page is authoritative for this slug.
 *
 * Content is preliminary. See the header in `lib/oss-risk-data.ts`.
 */
export const metadata: Metadata = {
  title: 'OSS Dependency Risk Agent | Chase Sinclair',
  description:
    'Daily automated health monitoring for 800+ open-source dependencies. GitHub Archive ingestion, a multi-hop Databricks and dbt lakehouse, a seven-signal composite score, and a LangGraph agent that writes the risk assessment.',
}

export default function Page() {
  return <OssRiskPage />
}
