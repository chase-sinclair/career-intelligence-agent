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
export const questions = [
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
export const companies = [
  {
    ...northstar,
    short: 'Northstar',
    values: [42, 13.8, 15.2, 34, 85],
    display: ['$42.0M', '13.8%', '15.2%', '34%', '85'],
  },
  {
    name: 'MedAxis Revenue Solutions',
    short: 'MedAxis',
    score: 70,
    recommendation: 'Request more information',
    values: [68, 9, 18.1, 49, 70],
    display: ['$68.0M', '9.0%', '18.1%', '49%', '70'],
  },
  {
    name: 'BrightCart Consumer Goods',
    short: 'BrightCart',
    score: 45,
    recommendation: 'Pass',
    values: [27, -4.3, 7.4, null, 45],
    display: ['$27.0M', '−4.3%', '7.4%', 'Not disclosed', '45'],
  },
] as const
export const criteria = [
  { need: '$30M+ revenue', threshold: 30 },
  { need: '10%+ revenue growth', threshold: 10 },
  { need: '15%+ profit margin', threshold: 15 },
  { need: 'Top five customers under 40%', threshold: 40, below: true },
  { need: 'Match score of 75+', threshold: 75 },
] as const
export const rawExcerpt =
  'Northstar Field Services is a facilities maintenance platform serving multi-site commercial customers across the Southeast. Financial Performance FY2025 Revenue $42.0M Revenue Growth 13.8% Adjusted EBITDA $6.391M Adjusted EBITDA Margin 15.2%. Customer Concentration Top 1 (11%); Top 5 (34%). Open Items Customer revenue by year for the top 20 customers.'
const galleryRoot = '/images/deallens/gallery/'
export const evidence = [
  {
    file: 'Screenshot 2026-05-03 210009.png',
    title: 'Drive workspace',
    category: 'Intake',
    caption:
      'The real Drive workspace separates CIM Intake, CIM Archive, and Generated Memos.',
  },
  {
    file: 'Screenshot 2026-05-03 210111.png',
    title: 'Three synthetic CIMs',
    category: 'Intake',
    caption:
      'Northstar, MedAxis, and BrightCart PDFs in the designated intake folder.',
  },
  {
    file: 'Screenshot_3-5-2026_204123_airtable.com.jpeg',
    title: 'Executive Dashboard',
    category: 'Airtable',
    caption:
      'Portfolio-level screening: recommendations, deal prioritization, review data, and workflow health.',
  },
  {
    file: 'Screenshot_3-5-2026_204141_airtable.com.jpeg',
    title: 'Deal Review',
    category: 'Airtable',
    caption:
      'Northstar Field Services with its financials, criteria, risks, diligence questions, and workflow runs.',
  },
  {
    file: 'Screenshot_3-5-2026_204211_zapier.com.jpeg',
    title: 'CIM Intake orchestration',
    category: 'Zapier',
    caption:
      'The implemented Zap 1 connects Drive intake to extraction, record creation, notification, memo, and risk-loop steps.',
  },
  {
    file: 'Screenshot_3-5-2026_204255_zapier.com.jpeg',
    title: 'Airtable field mapping',
    category: 'Zapier',
    caption:
      'Structured outputs mapped into typed Deal fields, including revenue, EBITDA, and margin.',
  },
  {
    file: 'Screenshot_3-5-2026_205215_zapier.com.jpeg',
    title: 'Normalization code',
    category: 'Zapier',
    caption:
      'Code by Zapier parses the model output and prepares consistent values for downstream fields.',
  },
  {
    file: 'Screenshot_3-5-2026_205251_zapier.com.jpeg',
    title: 'Slack alert mapping',
    category: 'Zapier',
    caption:
      'Company context, screening signals, and source links assembled into the analyst notification.',
  },
  {
    file: 'Screenshot_3-5-2026_205316_zapier.com.jpeg',
    title: 'Three coordinated Zaps',
    category: 'Zapier',
    caption:
      'CIM Intake, Diligence Builder, and Investment Criteria Builder are separate automations.',
  },
  {
    file: 'Screenshot_3-5-2026_205342_zapier.com.jpeg',
    title: 'Diligence Builder',
    category: 'Zapier',
    caption:
      'Airtable trigger → OpenAI → workflow log → question loop → linked records.',
  },
  {
    file: 'Screenshot_3-5-2026_20541_zapier.com.jpeg',
    title: 'Investment Criteria Builder',
    category: 'Zapier',
    caption:
      'Airtable trigger → Code by Zapier → line-item loop → linked criteria records.',
  },
  {
    file: 'Screenshot_3-5-2026_205623_zapier.com.jpeg',
    title: 'Automation activity',
    category: 'Zapier',
    caption:
      'Recorded task activity from the build. Task volume is operational evidence, not a performance benchmark.',
  },
  {
    file: 'Screenshot_3-5-2026_205639_zapier.com.jpeg',
    title: 'Workflow usage',
    category: 'Zapier',
    caption:
      'The three workflows and their recorded task usage during MVP testing.',
  },
  {
    file: 'Screenshot_3-5-2026_205747_app.slack.com.jpeg',
    title: 'Analyst Slack alert',
    category: 'Outputs',
    caption:
      'An authentic DealLens notification for the synthetic Northstar example, with screening context and source access.',
  },
].map((item) => ({ ...item, src: galleryRoot + item.file }))
