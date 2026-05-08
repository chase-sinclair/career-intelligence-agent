export interface ProjectStat {
  label: string
  value: string
}

export interface ProjectFeature {
  title: string
  description: string
}

export interface ProjectStep {
  number: string
  title: string
  description: string
}

export interface ProjectDetail {
  slug: string
  title: string
  category: string
  categoryTag: string
  tags: string[]
  summary: string
  stats: ProjectStat[]
  problem: {
    heading: string
    body: string[]
  }
  solution: {
    heading: string
    body: string
    features: ProjectFeature[]
  }
  architecture: {
    heading: string
    steps: ProjectStep[]
    stack: string[]
  }
  impact: {
    stats: ProjectStat[]
    takeaway: string
  }
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  'kb-agent': {
    slug: 'kb-agent',
    title: 'KB Agent — Proposal Intelligence Platform',
    category: 'Agentic RAG',
    categoryTag: 'rag',
    tags: ['Python', 'Qdrant', 'Claude Opus', 'FastMCP', 'Slack Bolt SDK', 'MS Graph API'],
    summary:
      'Production Slack bot that turns a SharePoint document library into a queryable proposal intelligence system — automated ingestion, hybrid dense+sparse search, and six purpose-built LLM analytical workflows for government proposal teams.',
    stats: [
      { label: 'Analytical workflows', value: '6' },
      { label: 'Search architecture', value: 'Hybrid RRF' },
    ],
    problem: {
      heading: 'Proposal research takes hours that teams do not have',
      body: [
        'Government proposal teams operate under brutal time pressure. An RFP drops with a two-week deadline and the first question is always the same: what have we done before that is relevant to this? Finding that answer means manually searching through SharePoint folders, pinging subject matter experts, and piecing together fragments from prior proposals — a process that routinely consumes half a day.',
        'The document library exists. The institutional knowledge is in there. But it is locked in unstructured files with no retrieval layer that understands proposal domain terminology. Traditional keyword search returns noise and misses anything phrased differently.',
        'Teams need a way to ask the question directly — in plain English — and get a grounded, evidence-backed answer drawn from the actual document library, not from general LLM training data.',
      ],
    },
    solution: {
      heading: 'Six analytical workflows over a hybrid-indexed document library',
      body: 'KB Agent ingests a SharePoint document library via the Microsoft Graph API, indexes every document using Qdrant hybrid search (dense vectors + BM25-style sparse), and exposes six Claude-powered analytical workflows through a Slack bot interface. The retrieval layer uses a manually implemented Reciprocal Rank Fusion merge after diagnosing a Qdrant client v1.17.1 serialization bug that broke the native hybrid search path.',
      features: [
        {
          title: 'Hybrid Dense + Sparse Retrieval',
          description:
            'Manual RRF implementation merging dense semantic vectors with BM25-style sparse vectors — built after diagnosing a serialization bug in Qdrant client v1.17.1 that broke the native hybrid path.',
        },
        {
          title: 'Proposal Narrative Drafting',
          description:
            'Generates draft proposal sections grounded in retrieved evidence, with explicit [EVIDENCE MISSING] flags wherever the document library does not support a required claim.',
        },
        {
          title: 'RFP Gap Analysis',
          description:
            'Compares an uploaded RFP against the document library to identify capability gaps — requirements the team has not demonstrated in prior work.',
        },
        {
          title: 'RFP Relevance Scoring',
          description:
            'Scores a new RFP against prior work, win themes, and core competencies to give leadership a fast fit signal before investing in full bid pursuit.',
        },
        {
          title: 'Thread-Aware Conversation',
          description:
            'Maintains conversation context within Slack threads — follow-up questions resolve correctly against prior exchanges without the user restating context.',
        },
        {
          title: 'Fault-Tolerant Ingestion',
          description:
            'Typed quarantine system with LOCKED_FILE, CORRUPT_FILE, and TRANSIENT_ERROR categories. SHA-256 change detection skips unchanged files on re-ingestion runs.',
        },
      ],
    },
    architecture: {
      heading: 'From SharePoint to grounded answer in one pipeline',
      steps: [
        {
          number: '01',
          title: 'SharePoint Ingestion',
          description:
            'Microsoft Graph API polling fetches new and changed files from SharePoint. Files are quarantined by error type on failure; SHA-256 hashing prevents redundant re-processing of unchanged documents.',
        },
        {
          number: '02',
          title: 'Hybrid Indexing',
          description:
            'Documents are chunked, embedded with dense vectors for semantic similarity, and indexed alongside BM25-style sparse vectors in Qdrant — enabling retrieval on both meaning and exact terminology.',
        },
        {
          number: '03',
          title: 'RRF Merge',
          description:
            'At query time, dense and sparse results are retrieved separately and merged using a manually implemented Reciprocal Rank Fusion formula — necessary after diagnosing a client-level serialization bug in Qdrant v1.17.1.',
        },
        {
          number: '04',
          title: 'MCP Tool Dispatch',
          description:
            'A FastMCP server exposes each analytical workflow as a named tool. The Slack Bolt SDK routes incoming messages to the correct tool based on intent detection.',
        },
        {
          number: '05',
          title: 'Claude Opus Generation',
          description:
            'Claude Opus synthesizes grounded answers from retrieved chunks. The system prompt enforces evidence-only assertions and marks gaps with explicit [EVIDENCE MISSING] flags.',
        },
      ],
      stack: ['Python', 'Qdrant', 'Claude Opus', 'FastMCP', 'Slack Bolt SDK', 'MS Graph API'],
    },
    impact: {
      stats: [
        { label: 'Research time', value: 'Hours → Seconds' },
        { label: 'Bug fix', value: 'Qdrant RRF patch' },
        { label: 'Status', value: 'Production' },
      ],
      takeaway:
        'KB Agent demonstrates end-to-end production AI engineering: identifying a retrieval architecture limitation, diagnosing a client-level bug, implementing a custom fix, and delivering a tool measurably faster than the manual process it replaces.',
    },
  },

  'rentalshield-nyc': {
    slug: 'rentalshield-nyc',
    title: 'RentalShield NYC',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tags: ['Next.js 15', 'TypeScript', 'AWS Bedrock', 'Claude Sonnet 4', 'Supabase', 'RentCast API'],
    summary:
      'AI-powered rental scam screening for Manhattan apartment seekers — multimodal screenshot analysis, live rent comparison, broker license verification, and explainable risk scoring with ranked contributing factors.',
    stats: [
      { label: 'Service pipeline', value: '7 services' },
      { label: 'AI reasoning', value: 'Multimodal' },
    ],
    problem: {
      heading: 'NYC rental scams target the urgency of the apartment search',
      body: [
        "New York City's rental market creates perfect conditions for fraud. Competition is intense, listings disappear within hours, and renters feel pressure to commit quickly. Scammers exploit this — listing properties they do not own, fabricating broker credentials, and quoting rents well below market to attract applicants willing to pay deposits before viewing.",
        'The financial exposure is significant: application fees, security deposits of one to two months rent, and broker fees of 15% of annual rent can combine to several thousand dollars of upfront risk on a single listing. For a fraudulent listing, that exposure is a total loss.',
        'No existing tool combined multimodal AI image analysis, live rent market comparison, and broker license verification in one screening workflow. Renters were left to manually cross-reference StreetEasy, the NYS license database, and neighborhood rent data — with no automated risk synthesis.',
      ],
    },
    solution: {
      heading: 'Seven-service screening pipeline with explainable risk scores',
      body: 'RentalShield NYC orchestrates seven independently executable services: a listing parser extracts structured data from the submission, Claude Sonnet 4 via AWS Bedrock performs multimodal reasoning over uploaded screenshots, a geocoder confirms the property address, RentCast API provides live market rent comparisons, NYS license lookup verifies broker credentials, and a calibrated composite scorer synthesizes all signals into a ranked list of contributing risk factors.',
      features: [
        {
          title: 'Multimodal Screenshot Analysis',
          description:
            'Claude Sonnet 4 via AWS Bedrock processes uploaded screenshots as image bytes — flagging stock photos, inconsistent room details, watermarks from other platforms, and visual signals common in fraudulent listings.',
        },
        {
          title: 'Live Rent Comparison',
          description:
            'RentCast API provides real-time market rent data for the listed address and comparable properties. Listings priced significantly below market range trigger a pricing anomaly flag.',
        },
        {
          title: 'Broker License Verification',
          description:
            'Automated lookup against the NYS Department of State license database confirms whether the listed broker name and license number are valid and currently active.',
        },
        {
          title: 'Address Verification',
          description:
            'Geocoding and address validation confirms the property exists at the stated location and matches the neighborhood and building type described in the listing.',
        },
        {
          title: 'Explainable Risk Scoring',
          description:
            'Composite risk score computed from weighted signals across all services. Output includes a ranked list of contributing factors so renters understand exactly what triggered each risk level.',
        },
        {
          title: 'Calibrated False-Positive Handling',
          description:
            'Scoring thresholds tuned across a real test case suite to minimize false positives — legitimate listings in competitive neighborhoods should not be flagged due to normal pricing variation.',
        },
      ],
    },
    architecture: {
      heading: 'Seven services, one screening pipeline',
      steps: [
        {
          number: '01',
          title: 'Listing Submission',
          description:
            'User submits a listing URL and optional screenshots via the Next.js 15 frontend. The listing parser extracts structured fields: address, rent, broker name, license number, and listing text.',
        },
        {
          number: '02',
          title: 'Multimodal AI Analysis',
          description:
            'Screenshots are sent to Claude Sonnet 4 via AWS Bedrock as image bytes. The model returns structured findings: photo authenticity signals, listing inconsistencies, and a visual confidence score.',
        },
        {
          number: '03',
          title: 'Market Rent Comparison',
          description:
            'RentCast API is queried for the listed address and comparable units in the same neighborhood. Significant underpricing relative to market range is flagged as a pricing anomaly.',
        },
        {
          number: '04',
          title: 'Broker License Lookup',
          description:
            'NYS Department of State API is called with the broker name and license number. Missing, expired, or mismatched credentials trigger a verification failure flag.',
        },
        {
          number: '05',
          title: 'Risk Synthesis and Storage',
          description:
            'All service outputs are aggregated by the scoring engine. A weighted composite score is computed, contributing factors are ranked by severity, and the result is persisted in Supabase.',
        },
      ],
      stack: ['Next.js 15', 'TypeScript', 'AWS Bedrock', 'Claude Sonnet 4', 'Supabase', 'RentCast API'],
    },
    impact: {
      stats: [
        { label: 'External integrations', value: '4 live APIs' },
        { label: 'AI capability', value: 'Multimodal' },
        { label: 'Status', value: 'Production-ready' },
      ],
      takeaway:
        'RentalShield NYC demonstrates full-stack AI engineering with real external integrations — AWS Bedrock multimodal inference, live market data, government license databases, and persistent storage — combined into a product that addresses a real consumer problem with measurable financial stakes.',
    },
  },

  'ai-venture-architect': {
    slug: 'ai-venture-architect',
    title: 'AI Venture Architect',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    tags: ['LangGraph', 'FastAPI', 'Next.js', 'AWS Bedrock', 'Tavily', 'Langfuse', 'PostgreSQL'],
    summary:
      'Multi-agent platform that transforms rough AI product ideas into structured opportunity reports — market analysis, technical architecture, feasibility scoring, and evaluation with a clarification gate and live SSE progress streaming.',
    stats: [
      { label: 'Agent architecture', value: '3 agents' },
      { label: 'Execution model', value: 'Parallel' },
    ],
    problem: {
      heading: 'AI product ideation requires simultaneous analysis across three dimensions',
      body: [
        'Evaluating whether an AI product idea is worth pursuing requires three types of analysis that are normally done sequentially: market research (does this solve a real problem?), technical architecture (can this be built?), and feasibility scoring (how confident are we?). Done manually, this takes days.',
        'The challenge is that these three analyses are largely independent — market research does not need to wait for technical architecture. But most agentic workflows run sequentially by default, even when parallel execution is safe.',
        'A second problem: users often submit ideas too vague to analyze well. A clarification gate that pauses before analysis and asks targeted questions produces dramatically better outputs than blindly processing a low-signal input.',
      ],
    },
    solution: {
      heading: 'Clarification gate, parallel agents, deterministic scoring',
      body: 'AI Venture Architect runs a LangGraph multi-agent workflow in three phases: a clarification gate that routes low-clarity inputs through targeted questions before proceeding; parallel market research and technical architecture agents via asyncio.gather; and a synthesis agent that combines outputs into a structured opportunity report. Feasibility scores are computed deterministically — not LLM-generated — for reproducible, auditable results.',
      features: [
        {
          title: 'Clarification Gate',
          description:
            'Low-clarity submissions are detected before analysis begins. The workflow pauses, surfaces up to three targeted clarifying questions, and only proceeds once the input meets a minimum clarity threshold.',
        },
        {
          title: 'Parallel Agent Execution',
          description:
            'Market research and solution architecture agents run simultaneously via asyncio.gather, cutting total analysis time roughly in half compared to sequential execution.',
        },
        {
          title: 'Deterministic Scoring',
          description:
            'Uniqueness, feasibility, risk, and confidence scores are computed by a standalone utility using explicit criteria — separate from LLM generation, so scores are reproducible and explainable.',
        },
        {
          title: 'Live SSE Progress Streaming',
          description:
            'A FastAPI Server-Sent Events endpoint streams live progress updates to the Next.js frontend as the workflow executes — users see which agent is running in real time.',
        },
        {
          title: 'Tavily Market Research',
          description:
            'The market research agent uses Tavily search to ground analysis in current web data rather than LLM training knowledge, reducing hallucination on competitive landscape questions.',
        },
        {
          title: 'Langfuse Observability',
          description:
            'All agent runs traced through Langfuse — token usage, latency per node, and score outputs. This enabled iterative calibration of the clarification gate threshold and scoring rubric.',
        },
      ],
    },
    architecture: {
      heading: 'LangGraph workflow with conditional routing and parallel execution',
      steps: [
        {
          number: '01',
          title: 'Clarity Gate',
          description:
            'Incoming idea submissions are scored on clarity. Low-clarity inputs are routed to a clarification loop that surfaces targeted questions. High-clarity inputs proceed directly to analysis.',
        },
        {
          number: '02',
          title: 'Parallel Analysis',
          description:
            'Market research and technical architecture agents execute simultaneously via asyncio.gather. Market agent uses Tavily search; architecture agent generates stack recommendations and feasibility notes.',
        },
        {
          number: '03',
          title: 'Synthesis',
          description:
            'A third agent combines market findings and architecture notes into a structured opportunity report with section headings, evidence references, and identified risks.',
        },
        {
          number: '04',
          title: 'Deterministic Scoring',
          description:
            'A standalone Python utility applies explicit rubrics to produce uniqueness, feasibility, risk, and confidence scores — outside the LLM generation path for reproducibility.',
        },
        {
          number: '05',
          title: 'SSE Delivery',
          description:
            'Each pipeline stage emits progress events through a FastAPI SSE endpoint. The Next.js frontend renders a live activity feed as the workflow executes.',
        },
      ],
      stack: ['LangGraph', 'FastAPI', 'Next.js', 'AWS Bedrock', 'Tavily', 'Langfuse', 'PostgreSQL'],
    },
    impact: {
      stats: [
        { label: 'Execution model', value: 'Parallel agents' },
        { label: 'Eval coverage', value: 'Built-in from day one' },
        { label: 'Scoring', value: 'Deterministic' },
      ],
      takeaway:
        'AI Venture Architect demonstrates production agentic system design: conditional routing, safe parallelism, evaluation infrastructure baked in from the start, and reproducible scoring separated from generation — patterns that distinguish reliable AI systems from demos.',
    },
  },

  'peai-chat-assistant': {
    slug: 'peai-chat-assistant',
    title: 'PEAI Chat Assistant',
    category: 'RAG System',
    categoryTag: 'rag',
    tags: ['Python', 'Flask', 'Pinecone Assistant', 'RAG', 'Prompt Engineering'],
    summary:
      "Two-pass source prioritization RAG system for the AI Operating Partners website — enforces book-first retrieval that Pinecone Assistant doesn't natively support, with a custom citation framework per source type.",
    stats: [
      { label: 'Retrieval strategy', value: '2-pass' },
      { label: 'Deployment', value: 'Live in production' },
    ],
    problem: {
      heading: "Pinecone Assistant doesn't support source prioritization — the product required it",
      body: [
        "The AI Operating Partners website needed a chat assistant grounded primarily in The Private Equity AI Operating Partner book — their core intellectual property. General questions should draw from the book first, with fallback to broader website content only when the book lacks a sufficient answer.",
        "Pinecone Assistant's managed retrieval pipeline does not expose the controls needed to enforce this priority. A single retrieval pass returns the highest-similarity chunks regardless of source, which means general AI questions consistently surface website content ahead of the proprietary book.",
        "Solving this required building a retrieval orchestration layer above Pinecone Assistant — one that enforces book-first retrieval programmatically, evaluates sufficiency before deciding to fall back, and applies different citation formats depending on which source type answered.",
      ],
    },
    solution: {
      heading: 'Two-pass retrieval with programmatic sufficiency evaluation',
      body: "The PEAI Chat Assistant implements a two-pass retrieval strategy as a Python Flask proxy: Pass 1 restricts retrieval to book content via Pinecone metadata filter. A programmatic evaluation layer assesses whether the answer is sufficient. If not, Pass 2 retrieves from the broader corpus. Citation formatting is applied per-source — chapter/page citations on book answers, stripped default markers on fallback answers.",
      features: [
        {
          title: 'Book-First Retrieval',
          description:
            'Pass 1 applies a Pinecone metadata filter restricting retrieval to book chunks only. This enforces proprietary content priority before any other source is considered.',
        },
        {
          title: 'Programmatic Sufficiency Check',
          description:
            "A Python evaluation layer assesses whether the Pass 1 answer meets a sufficiency threshold. Short answers, uncertainty phrases, and 'I don't know' patterns trigger the fallback path.",
        },
        {
          title: 'Fallback to Broader Corpus',
          description:
            'When Pass 1 is insufficient, Pass 2 retrieves from the full index without source restriction. The citation format switches to indicate the answer comes from supplementary content.',
        },
        {
          title: 'Custom Citation Framework',
          description:
            'Book answers receive chapter and page citations. Fallback answers have Pinecone default markers stripped and replaced with a different attribution pattern.',
        },
        {
          title: 'Flask Proxy Simulation',
          description:
            'A standalone Flask proxy app was built to fully simulate and debug the chatbot before production integration — enabling rapid iteration without touching the production environment.',
        },
        {
          title: 'Per-Path Prompt Engineering',
          description:
            "System prompts tuned separately for book-answer and fallback-answer paths — different instructions on citation format, confidence hedging, and scope boundaries for each retrieval tier.",
        },
      ],
    },
    architecture: {
      heading: 'Two-pass retrieval above a managed vector service',
      steps: [
        {
          number: '01',
          title: 'Query Intake',
          description:
            'User question arrives at the Flask proxy. The query is preprocessed and routed to Pass 1 with a book-only metadata filter applied.',
        },
        {
          number: '02',
          title: 'Pass 1 — Book Retrieval',
          description:
            'Pinecone Assistant retrieves top-k chunks filtered to book content only. Claude generates an answer from the book evidence with chapter/page citation instructions.',
        },
        {
          number: '03',
          title: 'Sufficiency Evaluation',
          description:
            "The evaluation layer inspects the Pass 1 answer. Short responses, uncertainty phrases, and 'I don't know' patterns trigger the fallback condition.",
        },
        {
          number: '04',
          title: 'Pass 2 — Full Corpus (conditional)',
          description:
            'When Pass 1 is insufficient, Pinecone Assistant retrieves from the full index without source restriction. A different system prompt governs citation formatting for this path.',
        },
        {
          number: '05',
          title: 'Citation Formatting and Delivery',
          description:
            'The final answer has source-appropriate citation markers applied before delivery. The client receives a consistently formatted response regardless of which pass answered.',
        },
      ],
      stack: ['Python', 'Flask', 'Pinecone Assistant', 'Claude API', 'Prompt Engineering'],
    },
    impact: {
      stats: [
        { label: 'Deployment', value: 'Live production' },
        { label: 'Source priority', value: 'Book-first enforced' },
        { label: 'Debug tooling', value: 'Full proxy simulation' },
      ],
      takeaway:
        "PEAI Chat Assistant demonstrates that production RAG systems often require orchestration layers above managed services — Pinecone Assistant handles vector storage and similarity search, but retrieval strategy, source prioritization, and citation logic are engineering problems the managed layer doesn't solve.",
    },
  },

  'deallens': {
    slug: 'deallens',
    title: 'DealLens — PE CIM Intelligence Workflow',
    category: 'AI Automation',
    categoryTag: 'automation',
    tags: ['Zapier', 'OpenAI API', 'Airtable', 'PDF.co', 'Google Drive', 'Slack'],
    summary:
      'Fully automated private equity CIM intake pipeline — PDF upload triggers structured extraction, risk flagging, diligence question generation, IC memo drafting, and Slack alerts, with a polished Airtable deal operating system as the analyst-facing review surface.',
    stats: [
      { label: 'Automation workflows', value: '3 Zaps' },
      { label: 'Intake to IC memo', value: 'Minutes' },
    ],
    problem: {
      heading: 'First-pass CIM review is manual, repetitive, and structured enough to automate',
      body: [
        'Private equity analysts spend significant time on early-stage CIM review — a workflow that is largely manual, repetitive, and highly structured. When a CIM lands in a team\'s inbox, an analyst must read through lengthy PDFs, extract key financial metrics, flag risks, draft preliminary diligence questions, score the opportunity against investment criteria, and prepare an initial IC memo — all before the deal has been formally reviewed.',
        'This process is time-intensive, inconsistently executed across analysts, and creates no persistent structured record that can be queried or compared across deals. The problem is not that analysts lack intelligence — it is that the first-pass intake process is AI-automatable, yet most PE teams still do it entirely by hand.',
        'DealLens demonstrates what a fully automated first-pass CIM intelligence workflow looks like in practice: a real process, automated end-to-end, producing structured deal records, risk flags, diligence questions, IC memos, and Slack alerts — with a polished Airtable review interface that makes the output feel like a real PE operating system.',
      ],
    },
    solution: {
      heading: 'Three independent workflows, one automated deal pipeline',
      body: 'DealLens activates the moment a PDF is uploaded to a Google Drive intake folder. Within minutes, a raw CIM PDF becomes a structured deal record with linked financial metrics, risk flags, diligence questions, investment criteria scoring, a Slack analyst alert, and a first-pass IC memo in Google Docs — all without any manual analyst input. Three Zapier workflows with a clean separation of concerns handle intake, diligence generation, and investment criteria scoring independently.',
      features: [
        {
          title: 'Zap 1 — CIM Intake Pipeline',
          description:
            'Triggers on PDF upload to Google Drive. Extracts text via PDF.co, sends to OpenAI with a structured JSON extraction prompt, normalizes output, and simultaneously creates linked records across five Airtable tables, posts a Slack alert, and generates a Google Docs IC memo.',
        },
        {
          title: 'Zap 2 — Diligence Builder',
          description:
            'Watches the "Needs Diligence Questions" view in Airtable. Sends structured deal data to OpenAI to generate contextually grounded diligence questions specific to that deal\'s characteristics, then creates individual linked Question records.',
        },
        {
          title: 'Zap 3 — Investment Criteria Scorer',
          description:
            'Watches the "Needs Investment Criteria" view. Uses Code by Zapier to derive scoring dimensions programmatically from existing deal fields, then creates linked Investment Criteria records for structured, comparable scoring across the pipeline.',
        },
        {
          title: 'Airtable Deal Operating System',
          description:
            'Seven linked tables — Deals, CIM Documents, Financial Metrics, Risks, Diligence Questions, Workflow Runs, and Investment Criteria — connected relationally. Two custom interfaces (Executive Dashboard and Deal Review) make the output feel like a purpose-built PE tool.',
        },
        {
          title: 'Structured JSON Extraction',
          description:
            'Custom JSON schema defines the extraction contract, ensuring consistent field population across diverse CIM formats, industries, and deal structures without hardcoded company-specific logic.',
        },
        {
          title: 'Validated Across 3 Synthetic CIMs',
          description:
            'End-to-end validation across three synthetic CIMs representing different deal outcomes (proceed, request more info, pass). Workflow generalized successfully without any CIM-specific logic.',
        },
      ],
    },
    architecture: {
      heading: 'PDF upload to structured deal record in one automated loop',
      steps: [
        {
          number: '01',
          title: 'CIM Intake Trigger',
          description:
            'New PDF uploaded to Google Drive "CIM Intake" folder triggers Zap 1. PDF.co extracts full document text from the uploaded file.',
        },
        {
          number: '02',
          title: 'Structured Extraction',
          description:
            'Raw PDF text is sent to OpenAI with a custom JSON schema extraction prompt. The model returns structured fields: company overview, financial metrics, risk indicators, deal characteristics, and opportunity score.',
        },
        {
          number: '03',
          title: 'Airtable Record Creation',
          description:
            'Normalized JSON output populates linked records across five tables simultaneously — Deals, CIM Documents, Financial Metrics, Workflow Runs, and Risks — maintaining full relational integrity.',
        },
        {
          number: '04',
          title: 'IC Memo + Slack Alert',
          description:
            'In the same workflow run, a first-pass IC memo is generated in Google Docs and the link written back to the Deal record. A formatted Slack alert posts to the analyst team\'s DealLens channel.',
        },
        {
          number: '05',
          title: 'Diligence + Criteria (View-Triggered)',
          description:
            'Zaps 2 and 3 trigger independently when a deal enters the relevant Airtable view — generating contextual diligence questions and investment criteria scores as separate, maintainable workflows.',
        },
      ],
      stack: ['Zapier', 'OpenAI API', 'Airtable', 'PDF.co', 'Google Drive', 'Google Docs', 'Slack'],
    },
    impact: {
      stats: [
        { label: 'CIM intake time', value: 'Hours → Minutes' },
        { label: 'Manual steps', value: 'Zero' },
        { label: 'Validated deals', value: '3 CIM types' },
      ],
      takeaway:
        'DealLens demonstrates product judgment as much as technical skill: the three-Zap separation of concerns keeps workflows maintainable and independently triggerable, the Airtable interface makes AI-generated output feel like a real operating tool, and the synthetic validation dataset proves the system generalizes across deal types without hardcoded logic.',
    },
  },

  'career-radar': {
    slug: 'career-radar',
    title: 'Career Radar — Labor Market Intelligence',
    category: 'Full-Stack AI',
    categoryTag: 'full-stack',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'n8n', 'OpenAI API', 'SerpAPI'],
    summary:
      'Full-stack labor market intelligence app that ingests real job postings, normalizes and enriches them via an n8n automation pipeline, and presents structured insights across seven purpose-built dashboard views — with a grounded OpenAI narrative layer that explains deterministic data without inventing facts.',
    stats: [
      { label: 'Postings processed', value: '~1,000' },
      { label: 'Dashboard views', value: '7' },
    ],
    problem: {
      heading: 'Labor market signals for AI and automation roles are scattered with no intelligence layer',
      body: [
        'Job postings contain useful signals about how roles are changing — which skills are rising, which segments are hiring, how traditional jobs are evolving as AI and automation reshape work. But that information is scattered across job boards, career sites, and recruiter listings with no analytical layer that turns raw listings into structured market intelligence.',
        'The goal was not to collect job listings. It was to answer the questions that actually matter for understanding where the market is going: which roles are emerging, which tools are rising, which industries are driving demand, and how AI and automation are reshaping work across sectors.',
        'Existing job boards surface listings but not patterns. Answering "what are the fastest-growing AI operations roles this quarter?" requires a data product with ingestion, normalization, classification, enrichment, and analysis — not a search box.',
      ],
    },
    solution: {
      heading: 'n8n ingestion pipeline feeding a Supabase intelligence layer with a grounded AI narrative',
      body: 'Career Radar collects real job postings via an n8n orchestration pipeline, normalizes and enriches them through a Supabase transformation layer, and presents structured labor market intelligence across seven purpose-built dashboard views. A deliberately constrained OpenAI narrative layer summarizes deterministic data rather than generating its own — all counts, rankings, and company references come from the structured data layer.',
      features: [
        {
          title: 'n8n Ingestion Pipeline',
          description:
            'Workflow orchestrated via n8n: collects listings from external sources, structures raw data, deduplicates postings, classifies roles by family, extracts tools and skills, and delivers cleaned records into Supabase for app-facing views.',
        },
        {
          title: 'Supabase as Transformation Layer',
          description:
            'Supabase serves as more than a database — it handles deduplication logic, canonical job records, enrichment versioning, company dictionary mapping, URL quality metadata, role family normalization, and app-facing views for consistent frontend reads.',
        },
        {
          title: 'Grounded OpenAI Narrative',
          description:
            'OpenAI acts as an interpretation layer over deterministic data, not as the source of truth. AI-generated copy is treated as optional enhancement — the app falls back to deterministic text if the AI layer is unavailable, and all counts and rankings come from the structured data layer.',
        },
        {
          title: 'Seven Analytics Views',
          description:
            'Market Briefing, Job Evidence, Emerging Roles, Rising Skills and Tools, Market Segments, Companies, and Methodology — purpose-built views that turn normalized job evidence into actionable labor market intelligence.',
        },
        {
          title: 'Real-World Data Reliability',
          description:
            'Designed for messy real-world job data: agency listings, missing company names, inconsistent URLs, weak role classifications. Company fields separated into listing, hiring, canonical, and company type dimensions. Role family filtering tightened to prevent over-inclusion from weak keyword matches.',
        },
        {
          title: 'Focused Market Coverage',
          description:
            'Scope constrained to roles tied to AI adoption, workflow automation, business systems, RevOps, finance transformation, data analytics, AI governance, and software engineering — maximizing signal quality over breadth.',
        },
      ],
    },
    architecture: {
      heading: 'From raw job postings to structured market intelligence in one automated pipeline',
      steps: [
        {
          number: '01',
          title: 'Job Discovery',
          description:
            'SerpAPI and job-source connectors fetch listings from external sources. n8n orchestrates the collection and initial structuring of raw job data.',
        },
        {
          number: '02',
          title: 'n8n Processing Pipeline',
          description:
            'n8n workflow deduplicates postings, classifies roles by family, extracts tools and skills, normalizes company fields, and delivers cleaned records into Supabase with enrichment metadata.',
        },
        {
          number: '03',
          title: 'Supabase Transformation Layer',
          description:
            'Supabase views expose app-ready job evidence. Deduplication logic, canonical record management, company dictionary mapping, and role family normalization all live here — preserving raw source evidence while providing normalized market data.',
        },
        {
          number: '04',
          title: 'OpenAI Narrative Generation',
          description:
            'Server-side API routes call OpenAI with deterministic data as context to generate explanatory summaries. Output is optional — the app falls back to deterministic text if the AI layer fails or returns invalid output.',
        },
        {
          number: '05',
          title: 'Next.js Dashboard',
          description:
            'Seven purpose-built views render structured market intelligence from Supabase views. TypeScript throughout for typed data contracts between the API layer and the UI.',
        },
      ],
      stack: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'n8n', 'OpenAI API', 'SerpAPI'],
    },
    impact: {
      stats: [
        { label: 'Real postings processed', value: '~1,000' },
        { label: 'Dashboard views', value: '7' },
        { label: 'AI integration', value: 'Grounded only' },
      ],
      takeaway:
        'Career Radar demonstrates the ability to build more than a frontend demo — it is a full data product with ingestion, transformation, enrichment, analysis, and presentation layers. The project shows practical experience with n8n automation, Supabase data modeling, and responsible AI integration — using OpenAI as an interpretation layer over deterministic data rather than as the source of truth.',
    },
  },

  'oss-dependency-risk-agent': {
    slug: 'oss-dependency-risk-agent',
    title: 'OSS Dependency Risk Agent',
    category: 'Multi-Agent',
    categoryTag: 'multi-agent',
    tags: ['Python', 'LangGraph', 'Claude Sonnet', 'Databricks', 'dbt', 'Pinecone', 'FastAPI', 'Next.js 14'],
    summary:
      'Daily automated health monitoring pipeline for 800+ open-source dependencies — GitHub Archive ingestion, multi-hop lakehouse transformation, 7-signal composite scoring, and a LangGraph agent powered by Claude Sonnet that synthesizes risk assessments and flags repos for upgrade or replacement.',
    stats: [
      { label: 'Repos monitored', value: '800+' },
      { label: 'Pipeline cadence', value: 'Daily automated' },
    ],
    problem: {
      heading: 'Engineering teams discover OSS risk too late — after the CVE lands or the maintainer leaves',
      body: [
        'Every software team has hidden supply-chain exposure: the open-source libraries their products depend on are maintained by people who may abandon them, slow their review cadence, accumulate security vulnerabilities, or concentrate knowledge in a single contributor. Most teams only discover this risk after it materializes — when a critical CVE lands, PR reviews stop, or a widely-used package goes unmaintained.',
        'There is no off-the-shelf product that continuously monitors an entire portfolio of OSS dependencies for health deterioration across multiple signals simultaneously. Manual audits are expensive, infrequent, and do not scale to hundreds of dependencies across diverse technology categories.',
        'The system needed to solve three distinct problems: ingest enough raw GitHub event data to compute meaningful health signals, normalize those signals into a stable composite score, and use an AI agent to synthesize qualitative context that quantitative scores alone cannot provide.',
      ],
    },
    solution: {
      heading: 'Multi-hop data pipeline + 7-signal scoring model + LangGraph risk synthesis agent',
      body: 'The OSS Dependency Risk Agent monitors 800+ repos across 15 technology categories on a daily automated pipeline. Raw GitHub Archive events are ingested hourly, deduplicated and windowed in Databricks, transformed by nine dbt models into seven health signal views, and scored into a composite 0–10 health index. A five-node LangGraph agent then monitors for low-scoring repos, fetches live signals from GitHub, calls Claude Sonnet to synthesize a risk assessment per repo, maps the score to a REPLACE/UPGRADE/MONITOR action, and delivers a tiered Markdown report indexed into Pinecone for semantic search.',
      features: [
        {
          title: 'Multi-Hop Lakehouse Pipeline',
          description:
            'GitHub Archive events flow hourly from data.gharchive.org → AWS S3 Bronze → Databricks PySpark Silver (48-day rolling window, MERGE-based deduplication) → dbt Gold Delta Tables. Nine dbt models produce seven intermediate signal views and two Gold tables consumed by the scoring layer.',
        },
        {
          title: '7-Signal Composite Scoring',
          description:
            'Commit frequency, issue resolution rate, PR merge throughput, contributor diversity, governance signals (license, branch protection, code review), and security signals (CVE count, Dependabot) combine into a weighted 0–10 health score. Logarithmic scaling on activity metrics makes the score stable across the 48-day data window. Missing data defaults to 5.0 — neutral rather than penalizing repos with incomplete coverage.',
        },
        {
          title: '5-Node LangGraph Agent',
          description:
            'Monitor → Investigate → Synthesize → Recommend → Deliver. The Monitor node queries gold_health_scores and flags repos below threshold. Investigate fetches live GitHub metadata, issues, and PRs. Synthesize calls Claude Sonnet for a 3-bullet risk assessment per repo. Recommend maps the score to REPLACE/UPGRADE/MONITOR. Deliver renders a tiered Markdown report and triggers Pinecone indexing.',
        },
        {
          title: 'Governance + Security Signals',
          description:
            'A separate batch process calls the GitHub REST API and the OSV (Open Source Vulnerabilities) API for every repo to collect branch protection status, code review requirements, security policy presence, unpatched CVE count, and dependency update tooling — fed into two of the nine dbt models.',
        },
        {
          title: 'Pinecone Semantic Search',
          description:
            'AI-written risk assessments are indexed into a Pinecone serverless index using llama-text-embed-v2 (1024-dim) with SHA256-hashed vector IDs for idempotent upserts. The Next.js frontend exposes a two-mode semantic search interface over the full assessment corpus.',
        },
        {
          title: 'Manifest-Based Onboarding',
          description:
            'Drag-and-drop manifest upload parses requirements.txt, package.json, go.mod, pom.xml, and Cargo.toml. A GitHub resolver classifies each dependency as READY (already scored), ADDED (newly registered), or UNRESOLVED (no GitHub repo found).',
        },
      ],
    },
    architecture: {
      heading: 'From raw GitHub events to AI-written risk report in one automated pipeline',
      steps: [
        {
          number: '01',
          title: 'Ingestion — GitHub Archive → S3 Bronze',
          description:
            'Hourly GitHub Archive dumps (PushEvent, IssuesEvent, PullRequestEvent, IssueCommentEvent) are filtered to 800+ monitored repos, compressed to gzipped NDJSON, and written to an S3 Bronze bucket. A separate batch process calls the GitHub REST API and OSV API for governance and security signals per repo.',
        },
        {
          number: '02',
          title: 'Processing — Databricks PySpark Silver',
          description:
            'A PySpark job on serverless Databricks compute performs MERGE-based deduplication on event_id via row_number() windowing and maintains a 48-day rolling event window in a Silver Delta Lake table. DataFrames are materialized to temp Delta tables rather than cached — serverless clusters do not support .cache().',
        },
        {
          number: '03',
          title: 'Transformation — dbt Gold',
          description:
            'Nine dbt models execute in DAG order via the Databricks REST API: staging deduplication → six intermediate signal views (commit activity, issue health, PR throughput, contributor diversity, governance, security) → two Gold tables: gold_project_health (wide metrics) and gold_health_scores (composite 0–10 score with flags).',
        },
        {
          number: '04',
          title: 'Agent Run — LangGraph + Claude Sonnet',
          description:
            'The Monitor node queries gold_health_scores and flags repos below threshold sorted by score. Investigate fetches live GitHub metadata, open issues, and recent PRs per flagged repo. Synthesize calls Claude Sonnet for a structured 3-bullet risk assessment. Recommend maps to REPLACE/UPGRADE/MONITOR. Deliver renders the tiered report and triggers Pinecone indexing.',
        },
        {
          number: '05',
          title: 'Frontend Delivery — FastAPI + Next.js',
          description:
            'FastAPI exposes five routers covering health scores, per-project deep metrics, risk report access, Pinecone semantic search, and agent invocation with UUID run tracking. The Next.js 14 frontend provides portfolio KPI cards, project deep-dives, an agent control panel with live status polling, and a drag-and-drop manifest onboarding flow.',
        },
      ],
      stack: ['Python', 'LangGraph', 'Claude Sonnet', 'Databricks', 'dbt', 'AWS S3', 'Pinecone', 'FastAPI', 'Next.js 14'],
    },
    impact: {
      stats: [
        { label: 'Repos scored', value: '705 daily' },
        { label: 'Tech categories', value: '15' },
        { label: 'Pipeline', value: 'End-to-end automated' },
      ],
      takeaway:
        'The OSS Dependency Risk Agent demonstrates full-stack engineering across the modern data stack — from raw event ingestion through cloud warehousing, dbt transformation, LLM-orchestrated analysis, and a polished frontend — integrated into one coherent system. The scoring model went through multiple data-driven iterations (PR formula refactored from ratio to log-scale for window stability; bus-factor weight zeroed after identifying a 48-day data bias), reflecting the kind of analytical rigor expected at the senior level.',
    },
  },

  'peai-book-ml-model-matrix': {
    slug: 'peai-book-ml-model-matrix',
    title: 'PEAI Book — ML Model Matrix',
    category: 'Published Work',
    categoryTag: 'published',
    tags: ['AI Strategy', 'Framework Design', 'Published 2024'],
    summary:
      'Authored the AI Model Capability Matrix chapter in The Private Equity AI Operating Partner — a 12-category framework mapping atomic AI abilities to ML model types and training paradigms for finance and operations professionals.',
    stats: [
      { label: 'Framework categories', value: '12' },
      { label: 'Publication year', value: '2024' },
    ],
    problem: {
      heading: 'PE operators making AI decisions lack a structured model selection framework',
      body: [
        'Private equity firms are accelerating AI adoption across portfolio companies — but the decision-makers driving those investments are not machine learning engineers. Operations leaders, deal teams, and functional heads need to evaluate AI solutions, assess vendor claims, and direct internal builds without deep technical training.',
        'Existing resources failed these readers in one of two ways: too technical (assuming ML background), or too vague (offering AI strategy without enough specificity to act on). There was no practitioner-level framework mapping specific business problems to specific model types in a way a non-technical operator could use.',
        'The gap was not conceptual understanding of AI — most PE operators grasp the high-level promise. The gap was a structured vocabulary for evaluating which AI capability applies to which problem, and which modeling approach delivers it.',
      ],
    },
    solution: {
      heading: 'A 12-category Atomic Abilities framework designed for operators, not engineers',
      body: "The AI Model Capability Matrix organizes ML capabilities into 12 Atomic Ability categories — discrete things AI systems can do at the level of a business operation. Each category maps to the model architectures that deliver it, the training paradigms involved, and the business contexts where it applies. Designed as a decision-support tool first: operators navigate from the business problem to the right modeling approach, not the reverse.",
      features: [
        {
          title: '12 Atomic Ability Categories',
          description:
            'Capabilities decomposed into discrete, named atomic abilities — classification, anomaly detection, forecasting, generation, reasoning, retrieval, and others — each with a precise definition anchored to business outcomes.',
        },
        {
          title: 'Model Architecture Mapping',
          description:
            'Each atomic ability maps to the architectures that deliver it: tree models (XGBoost, Random Forest), neural architectures (CNNs, RNNs), language models (GPT-family), and specialized types (ARIMA, diffusion models).',
        },
        {
          title: 'Training Paradigm Explanation',
          description:
            'Supervised, unsupervised, reinforcement, and few-shot learning paradigms explained in business terms — what data is required, what the model learns, and what failure looks like.',
        },
        {
          title: 'Business Context Anchoring',
          description:
            'Every capability grounded in PE-relevant scenarios: deal sourcing, portfolio monitoring, operational efficiency, financial modeling, and risk assessment.',
        },
        {
          title: 'Decision-Support Design',
          description:
            'The matrix is explicitly designed to be navigated starting from the business problem — operators move from "I need to predict churn" to the correct modeling approach, not from model to application.',
        },
        {
          title: 'Practitioner-Level Writing',
          description:
            'Written for operations leaders making live investment and operational decisions — accessible without ML background while precise enough to support real vendor evaluation and build-vs-buy decisions.',
        },
      ],
    },
    architecture: {
      heading: 'Framework structure: from business problem to modeling choice',
      steps: [
        {
          number: '01',
          title: 'Define the Business Problem',
          description:
            'Start with the operational outcome: predict, classify, generate, detect, retrieve, or optimize. Each maps to one or more of the 12 Atomic Ability categories.',
        },
        {
          number: '02',
          title: 'Identify the Atomic Ability',
          description:
            'The 12 categories provide precise vocabulary for the capability being sought — distinguishing, for example, anomaly detection from forecasting from classification.',
        },
        {
          number: '03',
          title: 'Match to Model Architecture',
          description:
            'Each atomic ability maps to the model families that deliver it. Some abilities are served by traditional ML (XGBoost); others require deep learning or large language models.',
        },
        {
          number: '04',
          title: 'Assess Training Requirements',
          description:
            'The training paradigm tells operators what data they need, how much, and what labeling burden is involved — critical inputs for build-vs-buy and vendor evaluation.',
        },
        {
          number: '05',
          title: 'Apply to the Investment Decision',
          description:
            'Framework closes with PE-specific application guidance: using atomic ability mapping in due diligence, portfolio value creation, and AI initiative scoping.',
        },
      ],
      stack: ['AI Strategy', 'ML Framework Design', 'Technical Writing', 'Published 2024'],
    },
    impact: {
      stats: [
        { label: 'Published', value: '2024' },
        { label: 'Framework depth', value: '12 categories' },
        { label: 'Audience', value: 'PE practitioners' },
      ],
      takeaway:
        "The ML Model Matrix demonstrates the ability to translate complex ML concepts into structured, decision-ready frameworks for non-technical stakeholders — a skill as valuable in enterprise AI strategy as technical engineering. Available in The Private Equity AI Operating Partner at aioperatingpartners.ai/peai-book.",
    },
  },
}

export function getProjectDetail(slug: string): ProjectDetail | null {
  return PROJECT_DETAILS[slug] ?? null
}

export function getAdjacentSlugs(
  slug: string,
  allSlugs: string[]
): { prev: string | null; next: string | null } {
  const idx = allSlugs.indexOf(slug)
  return {
    prev: idx > 0 ? allSlugs[idx - 1] : null,
    next: idx < allSlugs.length - 1 ? allSlugs[idx + 1] : null,
  }
}
