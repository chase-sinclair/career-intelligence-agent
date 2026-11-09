import type { Metadata } from 'next'
import RentalShieldPage from '@/components/rentalshield/RentalShieldPage'

/**
 * Standalone case study. A static segment takes precedence over the `[slug]`
 * catch-all, so this page is authoritative for this slug.
 *
 * Content is preliminary. See the header in `lib/rentalshield-data.ts`.
 */
export const metadata: Metadata = {
  title: 'RentalShield NYC | Chase Sinclair',
  description:
    'AI rental scam screening for Manhattan apartment seekers. Multimodal screenshot analysis, live rent comparison, broker license verification, and an explainable risk score with ranked contributing factors.',
}

export default function Page() {
  return <RentalShieldPage />
}
