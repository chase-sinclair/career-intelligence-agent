export interface ProjectDetailMetric {
  label: string
  value: string
}

export interface ProjectDetailSignal {
  signal: string
  description: string
}

export interface ProjectDetailScore {
  project: string
  score: string
  status: 'Healthy' | 'Warning' | 'Critical'
}

export interface ProjectDetailStep {
  label: string
  description: string
}

export interface ProjectDetailSectionCard {
  title: string
  description: string
}

export interface ProjectDetailData {
  slug: string
  name: string
  subtitle: string
  summary: string
  techStack: string[]
  metrics: ProjectDetailMetric[]
  problemParagraphs: string[]
  problemCallout: string
  whatItDoes: ProjectDetailStep[]
  dataPipeline: ProjectDetailSectionCard[]
  healthSignals: ProjectDetailSignal[]
  healthScores: ProjectDetailScore[]
  agentNodes: ProjectDetailStep[]
  aiAssessment: {
    subject: string
    primaryRisk: string
    mitigatingFactors: string
    recommendedAction: string
  }
  semanticQueries: string[]
  technicalHighlights: ProjectDetailSectionCard[]
  lessonsLearned: string[]
  roadmap: string[]
}

export const PROJECT_DETAILS: Record<string, ProjectDetailData> = {
  'oss-dependency-risk-agent': {
    slug: 'oss-dependency-risk-agent',
    name: 'OSS Dependency Risk Agent',
    subtitle: 'Technical Project',
    summary:
      'Autonomous AI system that monitors open-source software health and flags dependency risks before they become engineering incidents.',
    techStack: ['AWS S3', 'Databricks', 'dbt', 'LangGraph', 'Claude AI', 'Pinecone', 'Streamlit', 'Python'],
    metrics: [
      { label: 'GitHub events processed', value: '500M+' },
      { label: 'Projects monitored', value: '200+' },
      { label: 'dbt models', value: '7' },
      { label: 'Data quality tests', value: '21' },
      { label: 'Agent nodes', value: '5' },
      { label: 'Health signals', value: '6' },
      { label: 'Pipeline runtime', value: '~15 min' },
    ],
    problemParagraphs: [
      'Every software product is built on top of dozens, and sometimes hundreds, of open-source libraries maintained by distributed communities. When one of those libraries becomes unmaintained, development slows down, security vulnerabilities go unpatched, and engineering teams get forced into expensive migration work.',
      'Most companies still do not have a systematic way to detect this risk early. Engineers often rely on gut feel, GitHub stars, or scattered community chatter to make decisions that affect core architecture and product stability.',
      'This project reframes dependency health as a measurable operational problem. The system continuously monitors OSS projects, scores their health, and escalates early warning signs before a dependency becomes a production or roadmap issue.',
    ],
    problemCallout:
      'Think of it as a credit-rating system for open-source software: a way to continuously score the engineering health of the libraries your company depends on.',
    whatItDoes: [
      { label: '01', description: 'Collects activity data from GitHub across 200 open-source projects.' },
      { label: '02', description: 'Scores each project across six health signals tied to maintenance risk.' },
      { label: '03', description: 'Flags any project showing deterioration or concentration risk.' },
      { label: '04', description: 'Investigates autonomously by fetching recent issues, pull requests, and contributor activity.' },
      { label: '05', description: 'Delivers a plain-English risk assessment with a recommendation to replace, upgrade, or monitor.' },
    ],
    dataPipeline: [
      {
        title: 'Bronze Layer - AWS S3',
        description:
          'GitHub Archive hourly event dumps are stored as raw JSON in S3, creating a replayable source-of-truth audit trail.',
      },
      {
        title: 'Silver Layer - Databricks PySpark',
        description:
          'Schema enforcement, SHA-256 deduplication, and clean Delta tables normalize the noisy raw event stream.',
      },
      {
        title: 'Gold Layer - dbt',
        description:
          'Seven dbt models transform events into project-level health metrics with 21 quality tests guarding the outputs.',
      },
    ],
    healthSignals: [
      { signal: 'Commit Frequency', description: 'How actively is code being written?' },
      { signal: 'Issue Resolution Rate', description: 'Are bug reports being addressed?' },
      { signal: 'PR Merge Rate', description: 'Are contributions being accepted?' },
      { signal: 'Contributor Diversity', description: 'Is the project dependent on one person?' },
      { signal: 'Bus Factor Risk', description: 'What happens if the top contributor leaves?' },
      { signal: 'Community Engagement', description: 'Is the project ecosystem growing or shrinking?' },
    ],
    healthScores: [
      { project: 'grafana/grafana', score: '7.96', status: 'Healthy' },
      { project: 'getsentry/sentry', score: '7.56', status: 'Healthy' },
      { project: 'microsoft/vscode', score: '7.35', status: 'Healthy' },
      { project: 'pytorch/pytorch', score: '6.81', status: 'Warning' },
      { project: 'huggingface/transformers', score: '6.70', status: 'Warning' },
      { project: 'lancedb/lancedb', score: '0.16', status: 'Critical' },
    ],
    agentNodes: [
      { label: 'Monitor', description: 'Queries the gold layer for projects that fall below the health threshold.' },
      { label: 'Investigate', description: 'Fetches live GitHub signals such as issues, pull requests, and contributor changes.' },
      { label: 'Synthesize', description: 'Calls Claude to produce a structured three-point risk assessment.' },
      { label: 'Recommend', description: 'Maps each project to a decision path: replace, upgrade, or monitor.' },
      { label: 'Deliver', description: 'Writes a markdown report and indexes the findings into Pinecone for semantic search.' },
    ],
    aiAssessment: {
      subject: 'lancedb/lancedb',
      primaryRisk:
        'Issue resolution rate and PR merge rate both collapsed to zero while the project accumulated a large unresolved issue backlog, pointing to a severe maintenance bottleneck.',
      mitigatingFactors:
        'The project still shows community validation and some recent activity, which suggests it is not abandoned outright, but maintainer bandwidth is too constrained to treat it as healthy.',
      recommendedAction:
        'Freeze new adoption, establish direct maintainer contact if possible, and budget engineering time to evaluate alternatives before the risk becomes a forced migration.',
    },
    semanticQueries: [
      'Which ML frameworks are safe to build on long term?',
      'Show me projects with governance issues similar to lancedb.',
      'Find infrastructure projects with high bus-factor risk.',
    ],
    technicalHighlights: [
      {
        title: 'Idempotent ingestion',
        description:
          'A SHA-256 sentinel key pattern prevents duplicate S3 uploads across reruns, so each hour-file is only written once.',
      },
      {
        title: 'Serverless compute workaround',
        description:
          'Because Databricks Serverless SQL Warehouses do not support Spark cache in the same way as classic clusters, the pipeline materializes to temporary Delta tables as a production-safe fallback.',
      },
      {
        title: 'dbt LAG bucketing fix',
        description:
          'Early health scores were misleading because event grain collapsed into one monthly partition. Reworking the model grain and transparency fields corrected the trend math.',
      },
      {
        title: 'Unity Catalog external location',
        description:
          'S3 access from Databricks Serverless was solved through Unity Catalog external locations and IAM trust relationships, which is the enterprise-safe cross-cloud pattern.',
      },
    ],
    lessonsLearned: [
      'Data engineering at scale is mostly about failure handling. Archive gaps, flaky uploads, and compute constraints matter as much as the happy path.',
      'LLM output quality depends on input quality. Once the dbt metrics were corrected, the agent recommendations became materially more useful.',
      'Monitoring products need warm-start coverage. Seeding the platform with a curated project set makes the tool valuable from day one instead of after months of drift collection.',
    ],
    roadmap: [
      'Slack or Teams alerts for replace-priority projects.',
      'Airflow orchestration for enterprise-grade scheduling.',
      'Security-vulnerability and CVE dataset integration.',
      'Predictive health scoring six months forward.',
      'Automated pull-request scanning for risky dependencies.',
    ],
  },
}

export function hasProjectDetail(slug: string): boolean {
  return slug in PROJECT_DETAILS
}

export function projectSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
