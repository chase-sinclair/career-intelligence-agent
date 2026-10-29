// Approved October 29 handoff, Appendix A. Keep narrative copy verbatim.
export const copy = [
  {
    eyebrow: 'AI WORKFLOW / PRIVATE EQUITY / WORKING PROTOTYPE',
    title: 'DealLens.',
    subtitle: 'One PDF in. A first-pass deal review out.',
    body: [
      'When someone drops a company-sale document into a designated Google Drive folder, DealLens starts automatically.',
      'It extracts financials and company information, scores the opportunity, flags potential risks, drafts follow-up questions and an investment memo, then organizes everything in one workspace for an analyst to review.',
    ],
    detail: [],
    transition: null,
  },
  {
    eyebrow: 'THE PROBLEM',
    title: 'Before you can evaluate a deal, you have to organize it.',
    subtitle: null,
    body: [
      'When a company is for sale, prospective buyers receive a detailed document describing the business, its financial performance, and the opportunity. In private equity, this is called a confidential information memorandum (CIM).',
      'Investment teams screen many potential acquisitions, but only a fraction move forward. Even opportunities they ultimately pass on require considerable upfront work:',
      'DealLens automates that first-pass assembly, so analysts can spend more time evaluating the opportunity instead of assembling the information.',
    ],
    detail: [],
    transition: null,
  },
  {
    eyebrow: '01 / GOOGLE DRIVE INTAKE',
    title: 'One file starts the whole process.',
    subtitle: null,
    body: [
      'An analyst drops a company-sale PDF into a Google Drive folder called CIM Intake. The folder is watched for new files, so within seconds of an upload, the workflow starts on its own.',
      "That's the only manual step in the workflow. There's no separate intake portal, no form to fill in, and no one to hand the file off to.",
    ],
    detail: [
      "The first of three automations, Zap 1 — CIM Intake, uses Zapier's Google Drive new-file-in-folder trigger. It captures the file name, Drive file ID, source link, and upload timing information. As the workflow processes the document, these details are saved to linked CIM Documents and Workflow Runs records in Airtable, preserving the source and processing history. The other two automations will be introduced when their work appears later in the story.",
    ],
    transition: 'Next: Read the document →',
  },
  {
    eyebrow: '02 / DOCUMENT EXTRACTION',
    title: 'The document becomes usable text.',
    subtitle: null,
    body: [
      'The uploaded document contains company descriptions, financial tables, and business information spread across its pages. DealLens extracts that content and prepares it as one continuous block of text for a large language model (LLM) to analyze.',
      'At this point, nothing has been scored or organized into deal fields. The workflow is simply getting the document ready for the next stage.',
    ],
    detail: [
      'Zap 1 uses PDF.co to extract text from the uploaded PDF. A Code by Zapier step then flattens the extracted content and captures the page count.',
      "The prepared text is passed to an OpenAI-hosted large language model (LLM) for structured analysis in Stage 03. This stage is document text extraction; the LLM's identification of financial metrics, risks, and investment signals occurs in the next stage.",
    ],
    transition: 'Next: Find the important information →',
  },
  {
    eyebrow: '03 / STRUCTURED AI ANALYSIS',
    title: 'Different documents. One consistent set of facts.',
    subtitle: null,
    body: [
      'DealLens sends the extracted text to a large language model (LLM) with a predefined checklist of what to look for: company details, financial performance, potential risks, and missing information.',
      'Instead of writing another lengthy summary, the LLM organizes its findings into the same labeled categories for every deal. This makes the information easier to review, compare, and use throughout the workflow.',
      'When information is missing, the LLM is instructed to flag it as “not disclosed” rather than invent an answer.',
    ],
    detail: [
      'The workflow uses the OpenAI API with a predefined extraction prompt and a structured JSON output schema. The schema specifies the expected fields and formats, including company information, financial metrics, risks, initial screening scores, missing fields, and draft memo content.',
      "The schema is maintained separately in the project repository and referenced by URL. OpenAI's structured-output functionality helps keep results consistent for downstream processing.",
      'A Code by Zapier step then normalizes financial values and percentages for Airtable. For example, a ratio of 0.138 is converted to 13.8% for the destination field.',
      'Initial screening scores are generated during this analysis, but their reasoning and presentation will be explained later in the case study.',
    ],
    transition: 'Next: Give the information a home →',
  },
  {
    eyebrow: '04 / THE DEAL RECORD',
    title: 'The facts become a deal page, not another file.',
    subtitle: null,
    body: [
      'Instead of scattered documents and spreadsheets, each company gets a page in a shared workspace. Its financials, source document, and processing history stay connected, with more information added as the workflow continues.',
    ],
    detail: [
      "Zap 1 creates linked Airtable records across Deals, CIM Documents, Financial Metrics, and Workflow Runs. Northstar's extraction includes FY2023 through TTM financial data, but the current demonstration writes one FY2025 Financial Metrics row per deal. The data model supports additional reporting periods; automating their storage would require extending the workflow. Later automations add diligence questions and investment criteria.",
    ],
    transition: 'Next: Notify the team and prepare its first draft →',
  },
  {
    eyebrow: '05 / THE HANDOFF',
    title: 'The team starts with a draft, not a blank page.',
    subtitle: null,
    body: [
      "The workflow sends a Slack alert with the deal's key financials, match score, risks, and recommended next step.",
      'It also creates a first-draft investment memo in Google Docs and saves the link to the deal page, giving the analyst an organized starting point for review.',
    ],
    detail: [
      "Zap 1 posts the screening results to Slack, then uses the structured LLM output to populate a Google Docs investment committee memo. It saves the resulting document URL to the deal's Memo Link field in Airtable. A subsequent Looping by Zapier step creates five individually linked Risk records for Northstar. The memo also includes preliminary diligence priorities; the separate question-generation workflow in Stage 06 produces tailored follow-up questions.",
    ],
    transition:
      'Next: Prepare the follow-up questions and investment criteria →',
  },
  {
    eyebrow: '06 / THE NEXT STEPS',
    title: 'The workflow shows what to ask—and what meets the bar.',
    subtitle: null,
    body: [
      "DealLens turns flagged risks into specific follow-up questions for the seller. It also compares each company's financials and initial evaluation against investment criteria, showing where an opportunity meets expectations and where it falls short.",
      'The result is a clearer starting point for deciding what to investigate and which deals deserve further attention.',
    ],
    detail: [
      'Two independently triggered automations',
      "Zap 2 — Diligence Builder: An LLM uses the deal's company information and identified risks to generate tailored follow-up questions, which are saved as individual Airtable records.",
      'Zap 3 — Investment Criteria Builder: Code by Zapier derives investment criteria from existing deal scores and financial information, creating records with thresholds, scores, and supporting explanations.',
      'The initial match score is produced during Stage 03. This stage makes the evaluation easier to inspect, rather than calculating that original score again.',
    ],
    transition: 'Next: Explore the connected data →',
  },
  {
    eyebrow: 'BEHIND THE WORKSPACE',
    title: 'One deal. All the work behind it.',
    subtitle: null,
    body: [
      'Different parts of the workflow produce different results. DealLens brings them together under one company, keeping the financials, risks, follow-up questions, and supporting documents organized in one place.',
      'Instead of piecing together information from separate tools, an analyst can start with the deal and explore everything connected to it.',
    ],
    detail: [
      'DealLens uses a relational Airtable base with seven populated tables: Deals, CIM Documents, Financial Metrics, Workflow Runs, Risks, Diligence Questions, and Investment Criteria. Zap 1 creates the initial deal, source, financial, run and risk records. Zap 2 independently adds tailored questions and a separate run record. Zap 3 independently adds investment criteria. The outputs connect to the central Deal record; the generated Google Docs memo is linked from that record.',
    ],
    transition: 'Next: See the analyst workspace →',
  },
  {
    eyebrow: 'THE ANALYST WORKSPACE',
    title: 'The team sees what needs attention—and why.',
    subtitle: null,
    body: [
      "The automated first pass doesn't end as a pile of separate files. It lands in two views built for review: a dashboard that compares opportunities, and a deal page that keeps the supporting information together.",
      'The team can see which of the three example companies should move forward, which needs more information, and which should be passed on. Opening a deal brings its financials, risks, follow-up questions, screening checks, and original source within reach.',
    ],
    detail: [
      'Airtable provides two analyst-facing interfaces. The Executive Dashboard shows a portfolio-level overview with recommendation breakdown, deal prioritization by fit and data completeness, a deal table, and workflow health. The Deal Review interface brings one company’s summary, financial metrics, investment criteria, risks, and diligence questions together for analyst inspection. Both read from the linked records built by the three Zaps.',
    ],
    transition: 'Next: See the working build →',
  },
  {
    eyebrow: 'BUILT & TESTED',
    title: 'Not just a concept. A workflow that runs end to end.',
    subtitle: null,
    body: [
      'DealLens was tested with three synthetic company-sale documents, each presenting different financials, risks, and review outcomes. The same connected workflow processed all three, producing structured deal records, first-draft memos, and material for analyst review.',
    ],
    detail: [
      'The prototype was tested end-to-end against Northstar Field Services (proceed to initial review), MedAxis Revenue Solutions (request more information), and BrightCart Consumer Goods (pass). It uses Google Drive, Zapier, PDF.co, an OpenAI-hosted LLM, Airtable, Slack, and Google Docs. These are synthetic test cases, not live investment decisions or production performance benchmarks.',
    ],
    transition: 'Next: What I learned building it →',
  },
  {
    eyebrow: 'BEHIND THE BUILD',
    title: 'Making the AI useful was the real design challenge.',
    subtitle: 'From a manual process to an AI-powered workflow.',
    body: [
      'I designed and built DealLens end to end, from the AI extraction instructions and workflow architecture to the connected data model and analyst-facing interfaces.',
      'The biggest lesson was that generating information with AI is only part of the solution. The output also needs to be consistent, organized, and delivered in a form that someone can actually use.',
      'The prototype demonstrates the full first-pass workflow using synthetic deals. The next iteration would strengthen financial validation, improve failure handling, and automatically store every extracted reporting period—not just the initial screening year.',
      'DealLens demonstrates how I approach applied AI: identify repetitive work, design a practical automation, and build the tools that make its results useful.',
    ],
    detail: [
      'The working prototype uses three Zapier automations, an OpenAI-hosted LLM with a structured JSON schema, a seven-table Airtable data model, and integrations with Google Drive, PDF.co, Slack, and Google Docs.',
      'Current limitations include testing against three synthetic documents, storing one financial reporting period per deal in Airtable, and the need for stronger automated validation and error handling before production use.',
    ],
    transition: null,
  },
] as const
