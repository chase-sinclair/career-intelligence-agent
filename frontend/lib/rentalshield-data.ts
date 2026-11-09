/**
 * Content for the RentalShield NYC case study.
 *
 * PRELIMINARY. Every fact is carried over from the `rentalshield-nyc` entry in
 * `lib/project-details.ts`. Nothing is invented. Visuals are not finalized, so
 * the hero uses a CSS placeholder frame and every figure is drawn in CSS.
 */

export const HERO_PLACEHOLDER = {
  label: 'Risk report screen',
  note: 'Screenshot pending',
} as const

/** §4: the four live external integrations, revealed in sequence. */
export const INTEGRATIONS: ReadonlyArray<readonly [string, string]> = [
  ['screenshots', 'Claude Sonnet 4 via AWS Bedrock'],
  ['market rent', 'RentCast API'],
  ['broker license', 'NYS Department of State'],
  ['address', 'geocoding and validation'],
]

/** §4: the services in the pipeline, named as the source names them. */
export const SERVICES: ReadonlyArray<string> = [
  'listing parser',
  'multimodal analysis',
  'geocoder',
  'rent comparison',
  'license lookup',
  'composite scorer',
  'persistence',
]

/**
 * §5: the signals the composite scorer weighs. `weightHint` is a presentation
 * value for the bar width only. The source states that the score is weighted
 * and that factors are ranked by severity, but not the actual weights, so
 * these bars are illustrative and the figure says so on the page.
 */
export const SIGNALS: ReadonlyArray<{ name: string; from: string; weightHint: number }> = [
  { name: 'Photo authenticity', from: 'Multimodal analysis', weightHint: 86 },
  { name: 'Pricing anomaly', from: 'Market rent comparison', weightHint: 72 },
  { name: 'Broker credentials', from: 'NYS license lookup', weightHint: 64 },
  { name: 'Address mismatch', from: 'Geocoding', weightHint: 45 },
  { name: 'Listing inconsistency', from: 'Multimodal analysis', weightHint: 38 },
]

export const CAPABILITIES: ReadonlyArray<{
  id: string
  short: string
  title: string
  body: string
  output: string
}> = [
  {
    id: 'multimodal',
    short: 'Screenshot analysis',
    title: 'Multimodal screenshot analysis',
    body: 'Claude Sonnet 4 via AWS Bedrock processes uploaded screenshots as image bytes, flagging stock photos, inconsistent room details, watermarks from other platforms, and visual signals common in fraudulent listings.',
    output: 'Photo authenticity signals and a visual confidence score',
  },
  {
    id: 'rent',
    short: 'Rent comparison',
    title: 'Live rent comparison',
    body: 'RentCast API provides real-time market rent data for the listed address and comparable properties. Listings priced significantly below market range trigger a pricing anomaly flag.',
    output: 'A pricing anomaly flag against live comparables',
  },
  {
    id: 'license',
    short: 'License check',
    title: 'Broker license verification',
    body: 'Automated lookup against the NYS Department of State license database confirms whether the listed broker name and license number are valid and currently active.',
    output: 'Valid, expired, mismatched or missing',
  },
  {
    id: 'address',
    short: 'Address check',
    title: 'Address verification',
    body: 'Geocoding and address validation confirms the property exists at the stated location and matches the neighborhood and building type described in the listing.',
    output: 'Whether the building is really there',
  },
  {
    id: 'scoring',
    short: 'Risk scoring',
    title: 'Explainable risk scoring',
    body: 'A composite risk score computed from weighted signals across all services. Output includes a ranked list of contributing factors so renters understand exactly what triggered each risk level.',
    output: 'A score plus the ranked reasons behind it',
  },
  {
    id: 'calibration',
    short: 'Calibration',
    title: 'Calibrated false-positive handling',
    body: 'Scoring thresholds tuned across a real test case suite to minimize false positives, so legitimate listings in competitive neighborhoods are not flagged for normal pricing variation.',
    output: 'A real listing in a hot neighborhood stays unflagged',
  },
]

export const PIPELINE: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Submit', v: 'A listing URL and optional screenshots come in through the Next.js frontend.' },
  { k: 'Parse', v: 'Address, rent, broker name, license number and listing text are extracted.' },
  { k: 'Analyze', v: 'Screenshots go to Claude Sonnet 4 via Bedrock as image bytes.' },
  { k: 'Verify', v: 'RentCast, the NYS license database and geocoding are queried in turn.' },
  { k: 'Score', v: 'Signals are weighted into a composite score and persisted in Supabase.' },
]
