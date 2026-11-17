/**
 * Content for the AI Evaluation Lab case study.
 *
 * Every figure comes from the Lab's committed record in the
 * `chase-sinclair/ai-evaluation-lab` repository: `docs/portfolio/*.md` for the
 * six case studies and `docs/portfolio/lab-summary.md` for the decisions.
 * Nothing is rounded beyond what is stated here, and nothing is invented.
 *
 * Wording rules this page holds to, because the record draws these lines:
 * - The fact-checker study was graded with AI assistance and accepted by the
 *   owner. Never call it human-graded or independently graded.
 * - The standard answers made no unsupported claims, so the fact-checker had
 *   nothing unsupported to catch. The baseline's 4 misses were safe but
 *   incomplete, so never say it had "no errors", and never say the checker
 *   "caught no errors" as if it had missed some.
 * - Name matching rests on 4 live queries. It is directional only.
 * - Recovery rules were written with the test inventory visible, so the tie is
 *   close to built in. The page says so.
 * - Costs are usage-priced at list rates. There are no invoices.
 * - Model vs context (the Lab's Experiments 006 and 007, one study): the GPT and
 *   Claude columns do not rank the providers. Settings were not calibrated
 *   across providers and the prompts were developed on GPT. Strict scores are
 *   the official result; the format-lenient Claude scores are post-hoc. Three
 *   draws describe variation, so no significance language.
 */

export interface ScoreBar {
  label: string
  /** Value the bar is drawn from. */
  value: number
  /** Full-scale value the bar is drawn against. */
  max: number
  /** Readout beside the bar. */
  readout: string
  /** The arm the decision favours. */
  best?: boolean
  /**
   * Heading for a run of bars, e.g. one configuration measured on two
   * providers. A new heading starts whenever the value changes.
   */
  group?: string
}

/** Site tokens a version card may be tinted with. */
export type VersionTone = 'accent' | 'blue' | 'purple' | 'orange'

/** One compared version of the assistant, shown as a card. */
export interface Version {
  tag: string
  name: string
  /** Score readout, matching the chart. */
  score: string
  tone: VersionTone
  /** One sentence on what this version was given. */
  summary: string
  /** One to four details. */
  details: ReadonlyArray<string>
}

export interface Experiment {
  id: string
  question: string
  /** Short topic label shown above the question. */
  topic: string
  /** One sentence with the number that matters, shown on the collapsed row. */
  result: string
  /** The business decision behind the experiment. */
  why: string
  /** Workload, the versions compared and how answers were scored. */
  setup: string
  /** Optional version cards, shown after `setup`. */
  versions?: ReadonlyArray<Version>
  /** Optional text shown after the version cards. */
  setupAfter?: string
  /** What the bars measure, shown above them. */
  measure: string
  bars: ReadonlyArray<ScoreBar>
  /** Three or four short findings. */
  findings: ReadonlyArray<string>
  /** The business call the result supports. */
  call: string
  /** The boundary on the evidence, in plain words. */
  caveat: string
  /** The full write-up in the Lab repository. */
  caseStudy: string
}

export const REPO_URL = 'https://github.com/chase-sinclair/ai-evaluation-lab'

const caseStudy = (file: string) => `${REPO_URL}/blob/main/docs/portfolio/${file}.md`

/** Hero stat strip. */
export const AT_A_GLANCE: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Experiments', value: '6' },
  { label: 'Draws context beat a 20× model', value: '6 of 6' },
  { label: 'Retries allowed', value: '0' },
  { label: 'Live runs audited', value: 'All' },
]

/** The scorecard, strongest result first. */
export const EXPERIMENTS: ReadonlyArray<Experiment> = [
  {
    id: 'finops-sql',
    question: 'Does a finance SQL assistant need business context?',
    topic: 'Finance SQL',
    result: 'Correct answers rose from 1 to 18 out of 36 once the assistant had curated business definitions.',
    why: 'Finance questions hide accounting choices. "What was March net billed cost?" depends on whether charges count by the day they were used or the invoice they were billed on. I wanted to know how much business context an assistant needs before its numbers can be trusted.',
    setup:
      '36 questions on Meridian, a synthetic 22-table cloud-cost warehouse. Four versions of the assistant answered the same questions, each with different information to work from.',
    versions: [
      {
        tag: 'A',
        name: 'Schema only',
        score: '1/36',
        tone: 'blue',
        summary: 'Only the warehouse structure, with no business meaning attached.',
        details: [
          'The 22 tables with their columns and keys',
          'Nothing on which date, status or policy a finance report should use',
          'Cheapest to run, at about $0.011 in usage across all 36 questions',
        ],
      },
      {
        tag: 'B',
        name: 'Curated definitions',
        score: '18/36',
        tone: 'accent',
        summary: 'The schema plus a governed package explaining what the data means in business terms.',
        details: [
          'What each row represents and how the tables join',
          'How each metric is defined',
          'Which accounting policies apply, such as reporting by invoice posting period',
          'About $0.027 in usage across all 36 questions',
        ],
      },
      {
        tag: 'C',
        name: 'Expanded context',
        score: '18/36',
        tone: 'purple',
        summary: 'Everything in curated, plus the fuller reference material behind it.',
        details: [
          'The full data dictionary and data lineage',
          'Operational notes and worked examples from development data',
          'About 2.5 times the input of curated, but mostly cached, so it cost less at about $0.020',
        ],
      },
      {
        tag: 'D',
        name: 'Self-discovery',
        score: '5/36',
        tone: 'orange',
        summary: 'It started with no warehouse context and had to look up what it needed itself.',
        details: [
          'Could search the catalog, read entries and request example rows',
          'Up to 6 lookups per question, with earlier results carried into each new request',
          'Made 242 model requests in total, against 36 for curated',
          'The most expensive version, at about $0.045 in usage',
        ],
      },
    ],
    setupAfter:
      'Each SQL answer ran in a locked, offline sandbox and had to return the exact expected result on two separate data snapshots.',
    measure: 'Correct answers out of 36',
    bars: [
      { label: 'Schema only', value: 1, max: 36, readout: '1/36' },
      { label: 'Curated context', value: 18, max: 36, readout: '18/36', best: true },
      { label: 'Expanded context', value: 18, max: 36, readout: '18/36' },
      { label: 'Self-discovery', value: 5, max: 36, readout: '5/36' },
    ],
    findings: [
      'Context did the work. Curated definitions gained 17 answers over the schema alone and lost none.',
      'More context did not add accuracy. The larger package also scored 18 and cost less in usage, and each version got 4 questions the other missed.',
      'Self-discovery lost 14 questions that curated context got right, and used all 6 lookups on 33 of 36 questions.',
      'Even the best version left half the answers wrong or unresolved, so none was ready for unattended reporting.',
    ],
    call: 'Start with curated definitions, keep open-ended discovery out of the default path, and check results independently before release.',
    caveat:
      'Synthetic data and one run per question. Both reference answers share the same accounting assumptions. Grading of the 4 clarifying questions was AI-assisted and reviewed by me, with no finance expert.',
    caseStudy: caseStudy('finops-sql'),
  },
  {
    id: 'model-vs-context',
    question: 'Should a finance SQL assistant buy a bigger model or better context?',
    topic: 'Model vs context',
    result:
      'A low-cost model with curated context beat a model costing 20× more in every draw, on both GPT and Claude, for about a quarter of the cost.',
    why: 'A team can spend its budget on a model that costs about 20 times more per token, or on analyst time writing down what its financial terms mean. The first experiment showed that context lifts a low-cost model. It did not show whether a bigger model could close the gap on its own.',
    setup:
      'The same 36 finance questions on a 2 × 2 grid: a cheap and an expensive model, each given the schema only or the curated definitions. Every question ran three times per version, first on GPT models, then on Claude models at identical prices as a replication with its success criteria fixed in advance. 864 requests in all, graded exactly as in the first experiment.',
    measure: 'Mean correct out of 36, three draws',
    bars: [
      { group: 'Cheap model · schema', label: 'GPT', value: 3.7, max: 36, readout: '3.7' },
      { group: 'Cheap model · schema', label: 'Claude', value: 1.3, max: 36, readout: '1.3' },
      { group: 'Cheap model · curated', label: 'GPT', value: 15.3, max: 36, readout: '15.3', best: true },
      { group: 'Cheap model · curated', label: 'Claude', value: 17.0, max: 36, readout: '17.0', best: true },
      { group: 'Expensive model · schema', label: 'GPT', value: 6.7, max: 36, readout: '6.7' },
      { group: 'Expensive model · schema', label: 'Claude', value: 8.7, max: 36, readout: '8.7' },
      { group: 'Expensive model · curated', label: 'GPT', value: 24.0, max: 36, readout: '24.0' },
      { group: 'Expensive model · curated', label: 'Claude', value: 18.0, max: 36, readout: '18.0' },
    ],
    findings: [
      'Context beat model tier on both providers. The cheap model with context won all six draws against the expensive model without it: 15.3 against 6.7 on GPT and 17.0 against 8.7 on Claude.',
      'It cost about a quarter as much: 29% of the expensive configuration on GPT and 23% on Claude.',
      'On one question, every schema-only answer from the expensive model flipped the sign of a credit. The curated policy settled it in one sentence.',
      'Once context exists, the bigger model’s value depends on the vendor: +8.7 on GPT, +1.0 on Claude. Part of the Claude gap was answers that broke the required JSON format.',
    ],
    call: 'Fund curated definitions first. Price a bigger model only once the context exists, and measure it on your own questions.',
    caveat:
      'The questions were seen in the first experiment, and the warehouse is synthetic. Settings were not calibrated across providers, so the two columns do not rank GPT against Claude. Three draws show variation, not statistical significance.',
    caseStudy: caseStudy('model-vs-context'),
  },
  {
    id: 'rag-safeguards',
    question: 'Should a support assistant get an AI fact-checker?',
    topic: 'Support answers',
    result: 'The checker withheld 4 correct answers, found nothing unsupported to catch, and roughly doubled the cost.',
    why: 'A second AI check sounds like cheap insurance against wrong answers. But every reply it blocks sends the user to a person instead. I wanted to see whether a check catches enough errors to pay for the answers it withholds.',
    setup:
      '36 synthetic support questions, split evenly between routine requests, incomplete evidence and conflicting documents. All three versions used the same evidence and the same drafted reply: send it as is, check the evidence before answering, or have a second model verify the reply before it goes out.',
    measure: 'Fully correct answers out of 36',
    bars: [
      { label: 'Standard answer', value: 32, max: 36, readout: '32/36', best: true },
      { label: 'Evidence check first', value: 32, max: 36, readout: '32/36' },
      { label: 'AI checker after', value: 28, max: 36, readout: '28/36' },
    ],
    findings: [
      'The checker turned 4 fully correct replies into generic referrals, including one that correctly said contractors could not enter a closed building.',
      'The standard answers made no unsupported claims, so neither safeguard had anything to catch.',
      'Checking the evidence first kept all 32 correct answers but added 73% to cost and 82% to median response time.',
      "The standard version's 4 misses were safe but incomplete, such as declining to compute a ratio without giving the formula.",
    ],
    call: 'Start with standard retrieval. Add verification only where an error is costly enough to justify it.',
    caveat:
      'Synthetic support content with evidence chosen in advance, so live search was not tested. Answers were graded against a fixed key with AI assistance and reviewed by me, without an independent grader.',
    caseStudy: caseStudy('rag-safeguards'),
  },
  {
    id: 'tool-catalog',
    question: 'Should an agent see every available tool?',
    topic: 'Agent tools',
    result: '18 of 18 tasks were correct with 5, 10 or 20 tools. Twenty tools cost 82% more.',
    why: 'One shared tool catalog lets an agent handle more work, but every tool is sent with every request. I wanted to know whether a bigger catalog hurts accuracy, what it costs, and what happens when the right tool is missing.',
    setup:
      'Fictional freight-desk requests about invoices, dock bookings and carrier payouts, with catalogs of 5, 10 and 20 tools in two mirrored orders. 216 responses in all. A call passed only if it named the exact tool with the exact arguments.',
    measure: 'Cost relative to five tools',
    bars: [
      { label: '5 tools', value: 100, max: 182, readout: '1.00×', best: true },
      { label: '10 tools', value: 128, max: 182, readout: '1.28×' },
      { label: '20 tools', value: 182, max: 182, readout: '1.82×' },
    ],
    findings: [
      'Catalog size did not hurt accuracy. All 18 shared tasks passed at every size and in both orders.',
      'It did cost more. Input tokens more than doubled, and median response time rose from 1.19 to 1.48 seconds.',
      'The real risk was a missing tool. Asked to release payout PY-870, the 10-tool agent once proposed hold_payout instead: valid arguments, opposite action.',
    ],
    call: 'Give each workflow only the tools it needs, and gate any action that changes data.',
    caveat:
      'The tasks are single-call requests on a fictional freight desk. The agent only proposed calls, so no tool actually ran.',
    caseStudy: caseStudy('tool-catalog'),
  },
  {
    id: 'recovery',
    question: 'Should AI decide how to recover from a failed action?',
    topic: 'Failed actions',
    result: 'Written rules matched the AI on all 24 cases. Stopping without a recovery path finished only 9.',
    why: 'When an action fails, retrying can make things worse, like ordering the same goods twice. Stopping is safe but leaves work undone. I wanted to see whether AI judgment beats written rules at deciding what to do next.',
    setup:
      '24 scripted failures across purchasing, treasury and software administration, run in a local simulator. Three strategies: stop and report, apply written rules, or let AI propose one fix. An independent guard checked every proposed write, and a ledger caught any duplicate effect.',
    measure: 'Correct recovery decisions out of 24',
    bars: [
      { label: 'Stop and report', value: 9, max: 24, readout: '9/24' },
      { label: 'Written rules', value: 24, max: 24, readout: '24/24', best: true },
      { label: 'AI proposes', value: 24, max: 24, readout: '24/24' },
    ],
    findings: [
      'Rules and AI both made the right call on all 24, with zero duplicate payments and no unsafe proposals.',
      'The AI added cost and about 2 seconds per case without recovering anything the rules missed.',
      'Stopping by default left all 12 recoverable tasks unfinished.',
    ],
    call: 'Encode known fixes as rules, and send anything unresolved to a person.',
    caveat:
      'The rules were written knowing which failures would be tested, so a tie was likely. The clearer result is how much work a stop-only policy leaves unfinished.',
    caseStudy: caseStudy('recovery'),
  },
  {
    id: 'entity-matching',
    question: 'Should AI double-check every organization-name match?',
    topic: 'Name matching',
    result: 'Rules alone got 32 of 38 right. In a 4-query live test, AI fixed the one miss.',
    why: 'Funding analysts need name variants and acronyms to roll up to the right organization. A wrong link credits the wrong institution, while a skipped match leaves a gap someone can review. I wanted to know when a second look from a model is worth paying for.',
    setup:
      '38 funder names from Crossref, matched against the ROR registry by rules that either link or abstain. A live test then sent 4 names to a model, one call each, and replayed the results with different shares of names sent.',
    measure: 'Correct decisions in the live test',
    bars: [
      { label: 'Rules only', value: 3, max: 4, readout: '3/4' },
      { label: 'AI on every query', value: 4, max: 4, readout: '4/4', best: true },
    ],
    findings: [
      "Rules alone got 32 of 38 right, including all 18 names written the registry's way.",
      'The model fixed one missed link, and only when every name was sent. Sending a quarter or half of them fixed nothing.',
      'One miss was out of reach for any model: the right organization was not in the shortlist, so it could not be picked.',
    ],
    call: 'Keep rule-based matching that can abstain, and show AI corrections to a reviewer instead of writing them to the record.',
    caveat: 'Only 4 live queries, so this is directional. Real public data from Crossref and the ROR registry.',
    caseStudy: caseStudy('entity-matching'),
  },
]

/** "Looks right, isn't": three outputs that passed a format check and failed the task. */
export const LOOKS_RIGHT: ReadonlyArray<{ kind: string; asked: string; output: string; outcome: string }> = [
  {
    kind: 'Tool call',
    asked: 'Release a held payout',
    output: 'hold_payout(PY-870)',
    outcome: 'Valid arguments, opposite action. No tool ran.',
  },
  {
    kind: 'SQL query',
    asked: 'What was March net billed cost?',
    output: 'filtered by usage date',
    outcome: 'Ran cleanly, counted the wrong March charges.',
  },
  {
    kind: 'Fact-checker',
    asked: 'A correct, sourced answer',
    output: 'withheld',
    outcome: 'The safeguard blocked a right answer.',
  },
]

/** How every live run was handled. */
export const PROTOCOL: ReadonlyArray<{ k: string; v: string }> = [
  { k: 'Freeze', v: 'The exact requests were locked and fingerprinted before anything was sent.' },
  { k: 'Approve', v: 'I signed off on that frozen set with a hard spending cap.' },
  { k: 'Run once', v: 'One pass, no retries, and a stop on anything unexpected.' },
  { k: 'Seal', v: 'Every response receipt was sealed so it could not change afterward.' },
  { k: 'Audit', v: 'Results were graded offline, by code wherever the answer allowed it.' },
]

/** Suggested questions that open Ask About Chase with the question filled in. */
export const ASK_PROMPTS: ReadonlyArray<string> = [
  'Why did curated context beat self-discovery in the SQL experiment?',
  'Did a bigger model beat business context?',
  'Why did the AI fact-checker lose?',
  'How were the SQL answers graded?',
  'What would Chase test next in the evaluation lab?',
]
