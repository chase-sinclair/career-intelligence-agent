import type { Metadata } from 'next'
import PeaiChatPage from '@/components/peai-chat/PeaiChatPage'

/**
 * Standalone case study for the PEAI Chat Assistant, following the DealLens
 * precedent: a static route that takes precedence over the `[slug]` redirect,
 * so this page is authoritative for this slug rather than bouncing to the
 * projects overlay.
 */
export const metadata: Metadata = {
  title: 'PEAI Chat Assistant | Chase Sinclair',
  description:
    'A production retrieval assistant that answers from a private equity firm’s book and names the exact page behind every claim. Page level ingestion, two pass routing, and the evaluation work that makes citations trustworthy.',
}

export default function Page() {
  return <PeaiChatPage />
}
