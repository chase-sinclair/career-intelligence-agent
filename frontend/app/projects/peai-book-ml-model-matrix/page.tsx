import type { Metadata } from 'next'
import PeaiBookPage from '@/components/peai-book/PeaiBookPage'

/**
 * Standalone case study for the ML Model Matrix contributed to The Private
 * Equity AI Operating Partner. Follows the DealLens precedent: a static route
 * that takes precedence over the `[slug]` redirect, so this page is
 * authoritative for this slug rather than bouncing to the projects overlay.
 */
export const metadata: Metadata = {
  title: 'PEAI Book — ML Model Matrix | Chase Sinclair',
  description:
    'The model selection matrix contributed to The Private Equity AI Operating Partner: twelve atomic AI abilities mapped to the model types, families and training paradigms that deliver each one.',
}

export default function Page() {
  return <PeaiBookPage />
}
