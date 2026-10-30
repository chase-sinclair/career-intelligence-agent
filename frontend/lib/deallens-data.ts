import { copy } from './deallens-copy'

export const DEAL_LENS_REPO = 'https://github.com/chase-sinclair/DealLens'
export const journey = [
  'intake',
  'extract',
  'structure',
  'records',
  'deliver',
  'branches',
].map((id, i) => ({
  id,
  short: ['Intake', 'Read', 'Structure', 'Record', 'Handoff', 'Next steps'][i],
  ...copy[i + 2],
}))
// Values cross-checked with synthetic CIMs and the authentic Executive Dashboard.
export const northstar = {
  name: 'Northstar Field Services',
  source: 'Northstar Field Services · CIM.pdf',
  revenue: '$42.0M',
  growth: '13.8%',
  profit: '$6.39M',
  grossMargin: '33.1%',
  margin: '15.2%',
  concentration: '34%',
  score: 85,
  recommendation: 'Proceed to initial review',
} as const
export const financials = [
  ['Revenue', northstar.revenue],
  ['Revenue growth', northstar.growth],
  ['Gross margin', northstar.grossMargin],
  ['Profit (Adjusted EBITDA)', northstar.profit],
  ['Adjusted EBITDA margin', northstar.margin],
] as const
export const risks = [
  'Labor availability',
  'Founder dependency',
  'Customer concentration',
  'Seasonality',
  'Integration risk',
] as const
const northstarQuestions = [
  [
    'Customer concentration',
    'Provide customer-level sales for the top 20 accounts over the last 36 months.',
  ],
  [
    'Labor availability',
    'Provide technician utilization, turnover, and wage trends by market.',
  ],
  [
    'Acquisition integration',
    'What acquisitions are in the pipeline, and how would they be integrated?',
  ],
] as const
type FollowUp = readonly [risk: string, question: string]
type CompanyExample = {
  name: string
  short: string
  score: number
  recommendation:
    'Proceed to initial review' | 'Request more information' | 'Pass'
  values: readonly [number, number, number, number | null, number]
  display: readonly [string, string, string, string, string]
  questions: readonly FollowUp[]
}
export const companies = [
  {
    ...northstar,
    short: 'Northstar',
    values: [42, 13.8, 15.2, 34, 85],
    display: ['$42.0M', '13.8%', '15.2%', '34%', '85'],
    questions: northstarQuestions,
  },
  {
    name: 'MedAxis Revenue Solutions',
    short: 'MedAxis',
    score: 70,
    recommendation: 'Request more information',
    values: [68, 9, 18.1, 49, 70],
    display: ['$68.0M', '9.0%', '18.1%', '49%', '70'],
    questions: [
      [
        'Customer retention / disclosure',
        'Can you provide net revenue retention by customer cohort?',
      ],
      [
        'Customer concentration',
        'Can you share the contract renewal schedule for your largest customers?',
      ],
      [
        'Offshore delivery controls',
        'What controls monitor offshore service quality and compliance?',
      ],
    ],
  },
  {
    name: 'BrightCart Consumer Goods',
    short: 'BrightCart',
    score: 45,
    recommendation: 'Pass',
    values: [27, -4.3, 7.4, null, 45],
    display: ['$27.0M', '−4.3%', '7.4%', 'Not disclosed', '45'],
    questions: [
      [
        'Margin pressure',
        'Can you provide gross margins by sales channel and explain recent margin declines?',
      ],
      [
        'Inventory exposure',
        'Can you provide inventory aging and write-down history?',
      ],
      [
        'Concentration gap',
        'What percentage of revenue comes from the largest wholesale customers?',
      ],
    ],
  },
] as const satisfies readonly CompanyExample[]
export const criteria = [
  { need: '$30M+ revenue', threshold: 30 },
  { need: '10%+ revenue growth', threshold: 10 },
  { need: '15%+ profit margin', threshold: 15 },
  { need: 'Top five customers under 40%', threshold: 40, below: true },
  { need: 'Match score of 75+', threshold: 75 },
] as const
export const rawExcerpt =
  'Northstar Field Services is a facilities maintenance platform serving multi-site commercial customers across the Southeast. Financial Performance FY2025 Revenue $42.0M Revenue Growth 13.8% Adjusted EBITDA $6.391M Adjusted EBITDA Margin 15.2%. Customer Concentration Top 1 (11%); Top 5 (34%). Open Items Customer revenue by year for the top 20 customers.'
