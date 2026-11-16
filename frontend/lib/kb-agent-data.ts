/**
 * Content for the KB Agent standalone case study.
 *
 * SECTIONS 01-06 + PROJECT REFLECTION. Every user-facing string in this file
 * is approved copy, rendered verbatim: Sections 01-03 from their 2026-11-10
 * handoffs, Section 04 from `KB_AGENT_SECTION_04_SITE_IMPLEMENTATION_HANDOFF.md`
 * and its refinement passes, Section 05 from its revised handoff and
 * refinement pass, Section 06 from
 * `KB_AGENT_SECTION_06_NARRATIVE_FIRST_HANDOFF.md`, and the Project Reflection
 * from Chase directly. There is no Section 07.
 *
 * What was here before: the preliminary deep-dive mock content carried over
 * from `lib/project-details.ts` (HERO_PLACEHOLDER, INGESTION_META,
 * QUARANTINE_CATEGORIES, RETRIEVAL_LEGS, CAPABILITIES, PIPELINE, STACK). It
 * was removed together with the mock sections it fed. Nothing outside
 * `components/kb-agent/` imported it.
 */

/**
 * Secondary hero CTA target.
 *
 * UNRESOLVED. There is no KB Agent repository URL anywhere in this codebase:
 * `FeaturedProject.tsx` and `ProjectCard.tsx` both render this project's
 * source link as `href="#"` behind a `preventDefault`, and `lib/` only
 * defines `DEAL_LENS_REPO`. The handoff requires the existing configured URL
 * and forbids inventing one, so the hero ships with the same `'#'` the rest
 * of the site uses for this project. Replace this one constant with the real
 * URL and the hero link, the featured band and the card can all be pointed at
 * it together.
 *
 * Candidate: the local KB Agent checkout's git remote is
 * https://github.com/chase-sinclair/kb-folder-agent. Use it only after Chase
 * confirms that repository is public and approved to link.
 */
export const KB_AGENT_REPO = '#'

/** True once `KB_AGENT_REPO` is a real URL. Drives external-link attributes. */
export const KB_AGENT_REPO_RESOLVED = KB_AGENT_REPO !== '#'

/** Anchor the primary CTA scrolls to: Section 04 (`KbWalkthroughSection`). */
export const KB_WALKTHROUGH_ID = 'kb-walkthrough'

/** Section 01 hero copy. Verbatim from the approved handoff, section 3. */
export const KB_HERO = {
  eyebrow: 'AGENTIC AI · SLACK + NOTION WORKFLOW',
  headline: 'An AI agent that knows what’s proven, what’s missing, and what changed.',
  paragraphs: [
    'When consulting firms compete for contracts, they assemble proposals—detailed pitches combining past work, pricing, and a delivery plan. Those shared folders get messy fast, and with multiple people editing the same bid, staying aligned can mean another meeting just to learn what\'s changed or who owns the next step.',
    'I independently built KB Agent to keep shared documents searchable and current, investigate evidence in Slack, and turn unresolved issues into assigned Notion tasks—so teams can spend less time chasing updates. I’ve since submitted the prototype through my company’s official AI use-case review process and shared it with technical leaders.',
  ],
  /**
   * Deliberately all non-accent: the handoff makes these subordinate to both
   * the copy and the CTA, and `.chip.a` would make them compete with the
   * primary button for the eye.
   */
  chips: [
    { label: 'Claude + MCP' },
    { label: 'Hybrid search' },
    { label: 'OneDrive' },
    { label: 'Slack + Notion' },
  ],
  primaryCta: 'Explore the walkthrough',
  secondaryCta: 'View source',
} as const

/**
 * The four approved preview states.
 *
 * `label` is per-state by design: Find is a natural-language question, so it
 * reads EXAMPLE QUERY; the other three are syntactically structured, so they
 * read EXAMPLE COMMAND. Never LIVE, RECORDED DEMO, or anything implying these
 * are captured model output.
 *
 * `watcher` exists only on Updates, and renders as a visually separate,
 * neutral, dashed indicator above the command bubble. It carries the truth
 * boundary: a background watcher indexes changed documents, while `/kb diff`
 * explains a change only when a person asks for it. Nothing here should read
 * as an automatic Slack alert.
 *
 * `benefits` is a fixed two-tuple. These are capability explanations, not bot
 * responses, and the panel styles them as such.
 */
export interface KbPreviewState {
  id: string
  tab: string
  label: 'EXAMPLE QUERY' | 'EXAMPLE COMMAND'
  command: string
  watcher?: string
  benefits: readonly [string, string]
}

export const KB_PREVIEW_STATES: ReadonlyArray<KbPreviewState> = [
  {
    id: 'find',
    tab: 'Find',
    label: 'EXAMPLE QUERY',
    command:
      '/kb agent Which capabilities can we actually support with the past work we’ve collected so far?',
    benefits: [
      'Finds relevant information across shared documents.',
      'Shows what the team can back up—and what’s still missing.',
    ],
  },
  {
    id: 'draft',
    tab: 'Draft',
    label: 'EXAMPLE COMMAND',
    command: '/kb draft pastperformance "Summarize our relevant project experience"',
    benefits: [
      'Turns existing project files into a useful first draft.',
      'Clearly flags details that still need supporting evidence.',
    ],
  },
  {
    id: 'updates',
    tab: 'Updates',
    label: 'EXAMPLE COMMAND',
    command: '/kb diff CostVolume PricingStrategy_Notes.md',
    watcher: 'Folder updated',
    benefits: [
      'New edits are automatically added to the knowledge base.',
      'Explains what changed, without rereading the whole file.',
    ],
  },
  {
    id: 'assign',
    tab: 'Assign',
    label: 'EXAMPLE COMMAND',
    command: '/kb ticket "Review the outstanding pricing question" high 2026-11-20',
    benefits: [
      'Review the task, choose an owner, and add notes.',
      'Create an assigned Notion task after approval.',
    ],
  },
]

/** Auto-cycle dwell. Handoff asks for 6-7s. */
export const KB_CYCLE_MS = 6500

/** One of the four recurring questions in Section 02's right-hand panel. */
export interface KbProblemQuestion {
  /** Rendered in the rail column only. */
  ordinal: string
  /** Category micro-label. The ordinal is no longer repeated here. */
  topic: string
  question: string
  explanation: string
}

/** Section 02 copy. Verbatim from the approved handoff, section 2. */
export const KB_PROBLEM = {
  eyebrow: '02 / CONTEXT',
  heading: 'The Problem',
  paragraphs: [
    'During a proposal, several people update technical writeups, past performance narratives, and pricing files while new reference documents are added. A shared folder holds the files, but it does not tell the team which claims are supported, what changed, or who owns an open question.',
    'Teams also use AI to research and draft responses. In a standalone AI chat, someone may need to gather and upload the relevant files first. When teammates revise drafts or add new material, that uploaded copy can quickly fall behind. The next person may have to repeat the setup just to get an answer based on the latest documents.',
  ],
  panelEyebrow: 'FOUR RECURRING QUESTIONS',
  questions: [
    {
      ordinal: '01',
      topic: 'EVIDENCE',
      question: 'Which files support this claim?',
      explanation: 'A reviewer needs to trace statements back to the original documents.',
    },
    {
      ordinal: '02',
      topic: 'AI CONTEXT',
      question: 'Does our AI have the latest files?',
      explanation:
        'Uploaded documents can become outdated as the team adds and revises material.',
    },
    {
      ordinal: '03',
      topic: 'CHANGES',
      question: 'What changed in the latest draft?',
      explanation:
        'Technical, pricing, and past performance sections evolve while work is underway.',
    },
    {
      ordinal: '04',
      topic: 'OWNERSHIP',
      question: 'Who is handling the open question?',
      explanation: 'Follow ups can get lost between meetings, messages, and document reviews.',
    },
  ] as ReadonlyArray<KbProblemQuestion>,
} as const

/**
 * One watched document category in Section 03's left zone.
 *
 * `cue` is fixed per category rather than random, so the cycle is
 * deterministic and shows both of the things the watcher detects: additions
 * and revisions. It illustrates detection; it is not a claim about a specific
 * real-time production event.
 */
export interface KbLibraryRow {
  name: string
  cue: 'Added' | 'Updated'
}

/**
 * The document categories shown in Section 03's library card. All six stay on
 * screen; one is active at a time.
 */
export const KB_LIBRARY: ReadonlyArray<KbLibraryRow> = [
  { name: 'Past performance', cue: 'Updated' },
  { name: 'Technical drafts', cue: 'Updated' },
  { name: 'Pricing', cue: 'Updated' },
  { name: 'RFP', cue: 'Added' },
  { name: 'Resumes', cue: 'Added' },
  { name: 'Contracts', cue: 'Added' },
]

/** One full watch-and-index cycle. Handoff asks for a gentle 7-10s repeat. */
/** Rows visible in the library card at once; the window slides per cycle. */
export const KB_LIBRARY_WINDOW = 3

export const KB_BUILD_CYCLE_MS = 8000

/**
 * Section 03 copy. The eyebrow, heading and both paragraphs are verbatim from
 * the approved handoff, section 2. The diagram's short labels are the
 * handoff's own recommended strings from section 3; where it offered a choice
 * the pick is noted.
 */
export const KB_BUILD = {
  eyebrow: '03 / BUILD',
  heading: 'The Build',
  paragraphs: [
    'After working on several proposal teams at Booz Allen Hamilton, I wanted to test a tool that could fit into how teams already work. I built KB Agent as an agentic RAG prototype that monitors shared folders, retrieves relevant evidence when asked, and supports research and drafting through Slack, with optional task handoff to Notion.',
    'To test it without using company or client materials, I used AI to help create and carefully curate 40 synthetic documents across five related folders. The files reference common projects and proposal details, with deliberate missing evidence and conflicting information, so I could see how the agent handled realistic questions rather than isolated sample files.',
  ],

  /** Card title. Generic on purpose: a fictional test set, not client records. */
  libraryName: 'Shared proposal library',

  linkMonitor: 'Monitor / index',
  linkAsk: 'Ask / results',

  hubName: 'KB Agent',
  /**
   * Capability rows. Worded to keep the product truth: indexing follows
   * detected changes, retrieval happens on a question, and change tracking is
   * something a person asks for.
   */
  hubCapabilities: [
    'Indexes new and revised files',
    'Retrieves relevant evidence',
    'Tracks document changes',
  ],
  /** Transient acknowledgement; rides in the hub header, no persistent row. */
  indexedCue: 'Changes indexed',

  slackName: 'Slack',
  /** Two rows of two checked bullets. */
  slackActions: ['Ask', 'Compare evidence', 'Draft', 'Review changes'],
  notionName: 'Notion',
  notionActions: ['Review open issues', 'Assign after approval'],
  /** Marks Notion as the optional side of the pair. */
  notionGate: 'Optional',
  /** States the Notion relationship in words, under the pair. */
  notionNote:
    'Notion tasks are an optional, human confirmed action started from Slack, not an automatic parallel output.',

  diagramSummary:
    'System diagram, top to bottom. KB Agent monitors a shared proposal library of synthetic test documents and indexes files after it detects that they were added or changed. It retrieves relevant evidence and tracks document changes. Teammates ask questions, compare evidence, draft responses and review changes from Slack, and results return to Slack. Creating a Notion task to review open issues and assign follow up work is an optional step a person submits after review.',
} as const

// ── Section 04 · Interactive walkthrough ─────────────────────────────────────

/**
 * Section 04 copy. Heading, intro line and disclosure are verbatim from
 * `KB_AGENT_SECTION_04_SITE_IMPLEMENTATION_HANDOFF.md` §2. The Slack replay's
 * own captured content lives with the demo component
 * (`SlackWalkthroughSection04.tsx`, `DEMO_STEPS`); this file only holds the
 * portfolio-authored text that frames it.
 */
export const KB_WALKTHROUGH = {
  eyebrow: '04 / WALKTHROUGH',
  heading: 'See KB Agent in Action',
  /** Pass 3 copy. */
  intro:
    'Explore how KB Agent researches past work, checks proposal claims against supporting evidence, drafts responses, and turns unresolved issues into assigned tasks. Select any of the eight commands to replay its results.',
  /** Pass 3: the one full disclosure on the section; not repeated elsewhere. */
  disclosure: {
    title: 'About this demonstration',
    text: 'This interactive replay uses recorded KB Agent results from a synthetic proposal library. Some responses are shortened or reformatted for readability. Activity animations are illustrative, and no live services are connected.',
  },


  expandLabel: 'Expand Slack',
  collapseLabel: 'Return to split view',

  /**
   * One-line key under the Slack window (Pass 3). Labels only: the disclosure
   * above the walkthrough carries the explanation.
   */
  legend: [
    { kind: 'recorded', label: 'Recorded responses' },
    { kind: 'synthetic', label: 'Synthetic documents' },
    { kind: 'reconstructed', label: 'Reconstructed interface' },
  ],

  /**
   * Editorial notes shown under the Slack frame once the step's result is on
   * screen, outside the bot message (§7). Only Step 04's composite-score
   * caveat remains; the Step 07 and Step 08 notes were removed at the owner's
   * request after Pass 3.
   */
  replayNotes: {
    3: 'The raw output header reported COMPOSITE: 6.5/10. That figure is a holistic model estimate, not a validated calculation: the six criterion scores (7, 7, 7, 6, 5, 3) have an unweighted mean of about 5.83. This replay shows the criterion-level findings instead.',
  } as Readonly<Record<number, string>>,
} as const

/** Right-panel introduction, shown until the visitor's first Send (§4A). */
export const KB_WALKTHROUGH_INTRO = {
  title: 'Explore KB Agent',
  body: 'You’re joining a proposal team preparing a federal contract bid. Explore how KB Agent helps the team research past work, review supporting evidence, draft content, track changes, and assign follow up tasks.',
  howTitle: 'How to use the walkthrough',
  how: 'Select any of the eight prepared Slack commands. Press Send to replay its captured result. Review what the agent found and why it matters in this panel.',
} as const

/**
 * One step's portfolio explanation. Verbatim from the handoff §5. Written by
 * the portfolio owner; never presented as something the bot said.
 */
export interface KbStepExplanation {
  number: string
  title: string
  whyLabel: 'WHY RUN THIS COMMAND?' | 'WHY RUN THESE COMMANDS?'
  why: string
  outcomeLabel: 'WHAT DID IT FIND?' | 'WHAT DID IT PRODUCE?'
  outcome: string
  /**
   * Step 07 only: the part of `outcome` that is true after the first of its
   * two commands. It is the opening sentence of the approved copy, not new
   * text; the rest appears once `/kb diff` has returned.
   */
  partialOutcome?: string
  matters: string
}

export const KB_STEP_EXPLANATIONS: ReadonlyArray<KbStepExplanation> = [
  {
    number: '01',
    title: 'Explore the Knowledge Base',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'Before preparing a proposal, the team wants to understand what information is available in its shared document library.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'KB Agent identified five indexed document collections containing 274 searchable text chunks. These include contracts, pricing materials, past performance records, resumes, and technical documents.',
    matters: 'The team has a single place to search across its existing proposal materials.',
  },
  {
    number: '02',
    title: 'Investigate Past Experience',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'The proposal team needs to know which capabilities it can confidently claim based on work completed for previous clients.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'The agent identified documented deployments of Splunk and Elastic Security, including measured improvements of 67% in detection time and 44% in response time. It also found that some proposed AI automation capabilities lacked matching delivery evidence in the available documents.',
    matters:
      'The team can distinguish demonstrated experience from capabilities it still needs to substantiate.',
  },
  {
    number: '03',
    title: 'Compare the Evidence',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'The team wants to compare what it has delivered before with what it is promising in the current proposal.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'The agent compared past performance and technical proposal documents across six areas. One important finding was that previous projects measured different outcomes: detection time versus response time. The new proposal did not specify comparable targets.',
    matters:
      'The team can address inconsistent claims and strengthen its supporting evidence before a reviewer identifies the gaps.',
  },
  {
    number: '04',
    title: 'Review the Requirements',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'The proposal must address the customer’s specific requirements, not simply describe capabilities the company possesses.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'KB Agent evaluated six requirement areas individually. It identified weak support for monitoring across hybrid cloud environments and gave monthly detection and response reporting a 3/10 because the required measurements and reporting approach were not documented.',
    matters:
      'The team can identify which requirements need attention instead of relying on a general impression that the proposal is ready.',
  },
  {
    number: '05',
    title: 'Find Missing Evidence',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'Before submitting pricing, the team needs to confirm that its cost assumptions and supporting documentation are consistent.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'The agent identified missing cost support and different overhead rates across two pricing documents: 42% and 30%. Because the rates also use different calculation bases, Finance must confirm which schedule applies.',
    matters:
      'An important pricing discrepancy becomes a specific issue that someone can investigate before submission.',
  },
  {
    number: '06',
    title: 'Draft from Existing Evidence',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'A proposal writer needs to turn information from completed projects into a first draft without losing the supporting details.',
    outcomeLabel: 'WHAT DID IT PRODUCE?',
    outcome:
      'KB Agent drafted a past performance narrative using retrieved project information, including contract values, performance periods, and measurable results. It also inserted two explicit evidence warnings where the documents did not support claims about sustained operations and staffing.',
    matters:
      'The writer receives a useful starting point while retaining visibility into what still needs human review and supporting documentation.',
  },
  {
    number: '07',
    title: 'Understand Document Changes',
    whyLabel: 'WHY RUN THESE COMMANDS?',
    why: 'A teammate has revised a pricing document. The rest of the team needs to understand what changed without manually comparing the entire file.',
    outcomeLabel: 'WHAT DID IT FIND?',
    outcome:
      'The document watcher detected and indexed the revision. The requested comparison then explained a newly added section documenting the conflicting rate schedules and the need for Finance to confirm which one applies.',
    partialOutcome: 'The document watcher detected and indexed the revision.',
    matters:
      'Team members can understand significant revisions and outstanding decisions without relying entirely on meetings or manual document reviews.',
  },
  {
    number: '08',
    title: 'Assign the Next Action',
    whyLabel: 'WHY RUN THIS COMMAND?',
    why: 'The pricing discrepancy remains unresolved and needs an assigned owner, supporting context, and a deadline.',
    outcomeLabel: 'WHAT DID IT PRODUCE?',
    outcome:
      'KB Agent opened a Slack review form with the task details, priority, due date, assignee, and supporting notes. After human confirmation, it created and verified a Notion task assigned to Chase Sinclair with High priority and a November 20, 2026 deadline.',
    matters:
      'The investigation results in an assigned task that the team can track instead of leaving an unresolved issue in a chat conversation.',
  },
]

// ── Section 05 · System architecture ─────────────────────────────────────────

/**
 * Section 05 copy and the architecture map's two views. Intro paragraphs and
 * the three cards are verbatim from the approved brief (unchanged in the
 * revised handoff). Diagram text comes from the reviewed Codex component in
 * `KB-Agent-Section-05-Site-Handoff/source/ArchitectureSection.jsx`, with the
 * two editorial corrections from START-HERE §8 and one factual correction
 * from the source audit (`technical.stateNote`, see SECTION_05_NOTES.md).
 *
 * Every node has an `overview` and a `technical` variant. Both are rendered
 * into the same grid cell, so each box is always as tall as its longer
 * variant and toggling never moves anything.
 */
export type KbArchView = 'overview' | 'technical'

export const KB_ARCH_VIEWS: ReadonlyArray<{ id: KbArchView; label: string }> = [
  { id: 'overview', label: 'System Overview' },
  { id: 'technical', label: 'Technical Architecture' },
]

export const KB_ARCH = {
  eyebrow: '05 / ARCHITECTURE',
  heading: 'System Architecture',
  paragraphs: [
    'KB Agent separates automatic document ingestion from on-demand analysis. The shared library stays indexed as files change, while user requests trigger targeted retrieval and AI analysis.',
    'I designed the system to avoid reprocessing entire document collections for every request and to support different types of research through a common retrieval infrastructure. Dedicated workflows handle specific tasks such as drafting and scoring, while the agentic workflow allows Claude to investigate across collections and request additional evidence as needed.',
  ],

  figureTitle: 'Architecture map',
  viewLegend: 'Architecture view',

  ingestLane: { label: '01 / INGESTION', title: 'Automatic ingestion', trigger: 'When files change' },
  analysisLane: { title: 'On-demand analysis', trigger: 'When someone runs a command' },

  ingest: [
    {
      id: 'sources',
      overview: { title: 'Document sources', body: 'Shared documents stored in a local folder or Microsoft OneDrive.' },
      technical: { title: 'Source backends', body: 'Local filesystem or Microsoft OneDrive. One backend supplies the watched folder tree.' },
    },
    {
      id: 'change',
      overview: { title: 'Change detection', body: 'Checks whether a file’s contents have changed and skips unchanged files.' },
      technical: {
        title: 'Watchers + content hashes',
        body: 'watchdog monitors local files. OneDrive polls Microsoft Graph. Matching SHA-256 hashes skip reprocessing.',
      },
    },
    {
      id: 'index',
      overview: {
        title: 'Passage indexing',
        body: 'Breaks files into meaningful passages based on their format and creates searchable representations of their content.',
      },
      technical: {
        title: 'Chunking + encoding',
        body: 'Parse by file type and extract metadata. Encode chunks with OpenAI {code} and BM25-style sparse vectors.',
        code: 'text-embedding-3-small',
      },
    },
    {
      id: 'library',
      overview: { title: 'Knowledge base', body: 'Stores indexed passages and their source information for later retrieval.' },
      technical: {
        title: 'Qdrant collections',
        body: 'Each folder has a collection. Each indexed chunk carries dense and sparse vectors, text, and source metadata.',
      },
    },
  ] as ReadonlyArray<{
    id: 'sources' | 'change' | 'index' | 'library'
    overview: { title: string; body: string }
    technical: { title: string; body: string; code?: string }
  }>,

  state: {
    overview: { title: 'Ingestion state', body: 'Remembers file versions and processing status.' },
    technical: { title: 'SQLite', body: 'File metadata, supported version snapshots, quarantine and retry state.' },
  },

  bridge: { up: 'Search indexed passages', down: 'Return relevant matches' },

  request: {
    label: 'Slack request',
    overview: { title: 'Ask in Slack', body: '“Which past performance examples mention FedRAMP?”', note: 'Illustrative question' },
    technical: { title: 'Slash command', body: 'Slack Bolt dispatches {code} commands to Python handlers.', code: '/kb' },
  },

  response: {
    label: 'Slack response',
    overview: {
      title: 'Evidence-backed response',
      body: 'Claude draws on retrieved passages and can reference supporting files.',
      qualifier: 'One illustrative finding · synthetic data',
      example: 'DHS example: FedRAMP High authorization in 11 months.',
      source: '2023_DHS_CyberTransformation.md',
    },
    technical: {
      title: 'Claude synthesis',
      body: 'The workflow returns Claude’s answer to Slack with source references where applicable.',
    },
  },

  orchestration: {
    label: '03 / ORCHESTRATION',
    title: 'Workflow orchestration',
    body: 'Coordinates how the request is investigated and answered.',
    dedicated: {
      title: 'Dedicated workflows',
      overview: 'Follow a predefined process to compare evidence, score requirements, find gaps, or draft a response.',
      technical: 'Python controls retrieval and applies a task-specific Claude prompt.',
      code: '/kb compare · /kb score · /kb gaps · /kb draft',
    },
    agent: {
      title: 'Agent investigation',
      overview: 'Claude chooses what to search, reviews the evidence, and can search again before answering.',
      technical: 'Claude requests tools. The Python loop dispatches calls via the orchestrator and returns tool results to Claude.',
      code: { overview: '/kb agent', technical: 'Claude ⇄ Python ⇄ FastMCP tools' },
    },
  },

  retrieval: {
    label: '02 / RETRIEVAL',
    overview: {
      title: 'Evidence retrieval',
      body: 'Searches by meaning and keywords, then combines the results into one ranked list of relevant passages.',
      note: 'One ranked list goes back to the workflow.',
    },
    technical: {
      title: 'Hybrid retrieval',
      body: 'Dense semantic search and sparse keyword search each rank chunks. Python merges both lists using custom Reciprocal Rank Fusion (k\u00a0=\u00a060).',
      note: 'Ranked chunks → workflow → Claude',
    },
  },

  stateNote: {
    overview: 'File history · Saved versions let the system report what changed in supported files.',
    /**
     * Corrected from the Codex text ("Status reads SQLite"): `/kb status`
     * combines Qdrant collection counts with SQLite quarantine records
     * (slack/bot.py `_handle_status`).
     */
    technical:
      'State lookups · Status combines index counts with SQLite quarantine records. Changes and diff use stored activity or snapshots and can call Claude without hybrid search.',
  },

  handoff: {
    label: 'Optional task handoff',
    command: '/kb ticket',
    review: { overview: 'Human review in Slack', technical: 'Confirm in Slack Block Kit' },
    create: 'Create task in Notion',
    note: 'User-initiated · assignee optional',
  },

  diagramSummary:
    'Architecture map in two lanes. Automatic ingestion runs when files change: document sources in a local folder or Microsoft OneDrive go through change detection, which skips unchanged files using content hashes, then passage indexing, which chunks files and creates dense and sparse vector representations, into a Qdrant knowledge base. A supporting SQLite store keeps ingestion state: file metadata, version snapshots, and quarantine and retry records. On-demand analysis runs when someone runs a Slack command: the request goes to workflow orchestration, which has two separate paths. Dedicated workflows such as compare, score, gaps and draft use application-controlled retrieval and task-specific Claude prompts. Agent investigation lets Claude request tools, which the Python application dispatches and answers, so Claude can search again before answering. Both paths send search requests to retrieval, which searches the indexed passages in Qdrant by meaning and by keyword and merges the two ranked lists with Reciprocal Rank Fusion, k equals 60, then returns one ranked list of evidence to orchestration. Orchestration returns the response to Slack. Some state and history commands read stored metadata or snapshots instead. A separate optional handoff, started with /kb ticket, opens a review form in Slack, and only after a person submits it is a task created in Notion; the assignee is optional.',

  cards: [
    {
      eyebrow: '01 / INGESTION',
      heading: 'Keeping data current',
      icon: 'layers',
      body: 'Content hashes prevent unnecessary reprocessing by comparing a file’s current contents against its previously indexed version. Files that change are processed using file-specific chunking strategies. Version snapshots preserve revision history, while quarantine and retry logic help manage ingestion failures.',
    },
    {
      eyebrow: '02 / RETRIEVAL',
      heading: 'Finding relevant evidence',
      icon: 'search',
      body: 'Dense search retrieves semantically similar content, while sparse search captures precise keyword matches. A custom Reciprocal Rank Fusion (RRF) implementation combines both result lists based on their rankings rather than their raw similarity scores, producing a unified list of evidence for Claude.',
    },
    {
      eyebrow: '03 / ORCHESTRATION',
      heading: 'Investigating with tools',
      icon: 'route',
      /** Refinement pass: replaces "Through MCP, Claude can search…" (approved). */
      body: 'Claude can request tools to investigate relevant document collections. The Python application executes those tools and returns the results to Claude, which evaluates the retrieved evidence and can request additional information before generating a response. Other commands use dedicated retrieval workflows and purpose-built prompts for tasks such as scoring requirements, comparing evidence, and drafting narratives.',
    },
  ],
} as const

/* -------------------------------------------------------------------------- */
/* SECTION 06 — Engineering Decisions & Reflections                           */
/* Copy from KB_AGENT_SECTION_06_NARRATIVE_FIRST_HANDOFF.md (supersedes the   */
/* earlier Section 06 copy). Figures verified read-only against               */
/* kb-folder-agent (see section notes).                                       */
/* -------------------------------------------------------------------------- */

export type KbDecisionArtifactRow = {
  label: string
  /** Final value, e.g. 91.0. The view adds one decimal and the percent sign. */
  value: number
  emphasis?: boolean
}

export type KbDecisionStory = {
  id: 'experimentation' | 'evaluation' | 'reliability'
  tab: string
  eyebrow: string
  /** Decision-first title; must make sense without technical knowledge. */
  title: string
  /** One opening explanation, full width under the title. */
  opening: string
  /** First narrative block: what was tested or what went wrong. */
  context: {
    label: string
    lead?: string
    /** Story 01 only: the three configurations, explained before any results. */
    configs?: readonly { name: string; text: string }[]
    paragraphs: readonly string[]
  }
  /** Closing narrative block (THE DECISION / THE LESSON). */
  conclusion: { label: string; text: string }
}

export const KB_DECISIONS = {
  eyebrow: '06 / DECISIONS',
  heading: 'Engineering Decisions & Reflections',
  intro: [
    'I built KB Agent around a shared document library and familiar proposal tools. In proposal work, finding the right past experience matters just as much as avoiding unsupported claims. Both depend on having reliable access to the underlying evidence.',
    'To test the prototype, I built a benchmark of 24 test cases using 40 synthetic documents. The decisions below show how I improved the search process, corrected flaws in how I measured the answers, and checked that the knowledge base contained everything it was supposed to.',
  ],
  tablistLabel: 'Engineering decisions',

  stories: [
    {
      id: 'experimentation',
      tab: 'Experimentation',
      eyebrow: '01 / EXPERIMENTATION',
      title: 'Use AI to reorder search results selectively',
      opening:
        'KB Agent already ranks matching passages before sending them to the AI. I tested whether an extra step that reorders those passages by relevance, called reranking, could improve the final answer enough to justify the added response time.',
      context: {
        label: 'The experiment',
        lead: 'I compared three ways of finding evidence for the same set of test cases:',
        configs: [
          { name: 'Standard search:', text: 'Retrieve relevant passages using the existing search rankings.' },
          { name: 'Wider search:', text: 'Retrieve more candidate passages but keep the existing ranking method.' },
          {
            name: 'AI-reordered search:',
            text: 'Ask a language model to reorder the larger pool of candidates based on their relevance to the question before selecting evidence for the answer.',
          },
        ],
        paragraphs: [
          'I ran the standard search twice to see how much the results could vary without changing anything. Six individual cases appeared to change with reranking, but two had also changed between the identical baseline runs. I counted only the four cases that were stable across both baselines as evidence of improvement.',
        ],
      },
      conclusion: {
        label: 'The decision',
        text: 'Searching a larger pool alone did not improve the overall score. Reordering that pool did, suggesting that the order of evidence mattered. I enabled reranking for question answering but left it off for drafting, scoring, comparison and gap analysis, where testing showed little benefit from the extra processing.',
      },
    },
    {
      id: 'evaluation',
      tab: 'Evaluation integrity',
      eyebrow: '02 / EVALUATION INTEGRITY',
      title: 'Fix the test before trusting the results',
      opening: 'I discovered that my benchmark was giving the AI poor scores for some answers that did exactly what I wanted them to do.',
      context: {
        label: 'How I tested the answers',
        paragraphs: [
          'I created test cases with expected outcomes, including questions the documents did not contain enough information to answer. For those questions, the AI was supposed to say that the information was missing rather than invent an answer.',
          'My scoring rule looked for only two specific phrases. When the AI expressed the same idea in different words, the test marked it as an error. Four of six appropriate responses were misclassified. I corrected the rule and rescored the same answers. The benchmark score rose from 74.8% to 91.4%, even though the AI’s answers had not changed.',
        ],
      },
      conclusion: {
        label: 'The lesson',
        text: 'I also found three cases where the system retrieved the expected source file but the answer still missed facts from that file. Finding the right document is only the first step. Evaluation must also check whether the answer contains the evidence needed to answer the question.',
      },
    },
    {
      id: 'reliability',
      tab: 'System reliability',
      eyebrow: '03 / SYSTEM RELIABILITY',
      title: 'Check the index against the original files',
      opening:
        'I corrected how the system handles failed document uploads and added a check against the original files to make sure the searchable library was complete.',
      context: {
        label: 'What went wrong',
        paragraphs: [
          'When a file cannot be indexed, KB Agent classifies the failure. A genuinely damaged document may need to be repaired or replaced. A temporary connection failure or locked file can be retried instead.',
          'During a burst of 30 uploads into the test library, a connection failure was mistaken for a damaged document. Eight healthy files were quarantined and repeatedly skipped, including three documents deliberately designed to challenge the search system. I corrected the classification so temporary connection failures could be retried.',
        ],
      },
      conclusion: {
        label: 'The decision',
        /* Handoff fallback wording: the audit is documented as the gate before
           benchmark runs (CLAUDE.md), but the eval runner does not enforce it. */
        text: 'A separate audit then revealed another problem: both databases recorded 213 indexed passages, but the original documents contained 274 expected passages. I added a source-based audit to check completeness before benchmark runs. It splits the original documents into passages again and checks that both databases contain the expected records, rather than relying on the databases agreeing with each other.',
      },
    },
  ] as readonly KbDecisionStory[],

  /** Story 01 evidence. Labels match the narrative's configuration names. */
  benchmark: {
    label: '24-CASE BENCHMARK',
    title: 'Weighted composite score',
    rows: [
      { label: 'Standard search (two-run average)', value: 91.0 },
      { label: 'Wider search (no reranking)', value: 90.8 },
      { label: 'AI-reordered search (LLM reranking)', value: 95.5, emphasis: true },
    ] as readonly KbDecisionArtifactRow[],
    baseline: 'Baseline runs: 90.6% and 91.4%. Observed difference: 0.8 percentage points.',
    weights:
      'Six weighted checks: source hits (30%), fact coverage (20%), required sections (20%), evidence flags, citations and correct refusals (10% each).',
    scope: 'End-to-end evaluation on synthetic documents, not retrieval accuracy alone.',
  },

  /** Story 02 evidence. Endpoints are fixed; only emphasis animates. */
  evaluation: {
    refusal: {
      label: 'SCORING RULE CORRECTION',
      from: '74.8%',
      to: '91.4%',
      caption: 'Same 24-case run, same AI answers. Only the scoring rule changed.',
      count: '4 of 6',
      countCaption: 'appropriate responses initially marked as errors.',
    },
    chunk: {
      label: 'RIGHT FILE, MISSING FACTS',
      value: '1.00',
      unit: 'Full source-file match',
      caption: 'Three cases received full credit for finding the expected files, but the answers still missed important facts.',
      technical: 'Source hit rate (filename-based metric)',
    },
  },

  /** Story 03 evidence. Two separate findings, not a causal chain. */
  reliability: {
    incident: {
      label: 'INITIAL INGESTION INCIDENT',
      error: 'ResponseHandlingException:',
      value: '8 files',
      caption: 'Healthy documents incorrectly quarantined, including three deliberately misleading test documents.',
    },
    audit: {
      label: 'LATER INDEPENDENT AUDIT',
      expected: 274,
      recorded: 213,
      missing: 61,
      rows: [
        { value: '274', text: 'expected passages from original files', tone: 'plain' },
        { value: '213', text: 'recorded in both databases', tone: 'plain' },
        { value: '61', text: 'missing passages', tone: 'warn' },
      ] as readonly { value: string; text: string; tone: 'plain' | 'warn' }[],
    },
  },
} as const

/* -------------------------------------------------------------------------- */
/* PROJECT REFLECTION — short closing section after Section 06 (unnumbered)   */
/* Copy supplied by Chase, verbatim; split into two paragraphs for reading.   */
/* -------------------------------------------------------------------------- */

export const KB_REFLECTION = {
  eyebrow: 'PROJECT REFLECTION',
  heading: 'Looking ahead',
  paragraphs: [
    'Having worked on several federal proposal efforts, I built KB Agent to address a challenge I experienced firsthand: finding relevant information across large collections of shared documents. I believe this approach could help proposal teams spend less time searching for evidence and more time developing compelling, well-supported proposals within the tools they already use.',
    'After independently building and testing the prototype, I presented it to technical leadership at Booz Allen Hamilton and submitted it through the company’s formal AI use case review process. The project is currently under review, and I hope to see some form of adoption that allows teams to benefit from its capabilities in the future.',
  ],
  figure: {
    caption: 'From documents to collective intelligence',
    description:
      'Animated illustration: scattered documents gradually turn into connected knowledge nodes around a shared hub, and small file icons travel between them, representing information becoming accessible across a team.',
  },
} as const
