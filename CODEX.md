# Career Intelligence Agent - Project Memory

## Project Overview
A recruiter-facing AI Career Intelligence App. Recruiters can ask questions about the owner's background, skills, and projects. Answers are grounded in a RAG pipeline built from a resume and career artifacts. This is a single-user MVP designed to demonstrate RAG, agentic workflow design, orchestration, and LLM output evaluation.

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Python 3.10+, FastAPI, Uvicorn, Pydantic
- Orchestration: LangGraph 0.2.28
- LLM Provider: OpenAI (GPT-4o for generation, text-embedding-3-small for embeddings, gpt-4o-mini for evaluation)
- Vector DB: Chroma
- Schemas/Settings: Pydantic Settings (env-based config)
- Storage: Local file storage + SQLite for metadata (dev), upgradeable to Supabase/Postgres
- Deployment: Vercel (frontend), Python-friendly host or Docker (backend)

## Repo Structure
career-intelligence-agent/
  frontend/         -> Next.js app (App Router, TS, Tailwind)
  backend/          -> FastAPI app
    app/
      api/          -> Route handlers
      core/         -> Config, logging, shared utilities
      services/     -> ingestion, retrieval, generation, evaluation
      workflows/    -> LangGraph graphs (ingestion, profile, chat, eval)
      models/       -> Pydantic schemas
      evals/        -> Test sets and scoring logic
    data/           -> candidate_profile.json, site_content.json (gitignored if repo is public)
    uploads/        -> Uploaded resumes and docs (always gitignored)
    tests/
  docs/             -> Architecture notes, API docs
  README.md

## Key Backend Endpoints
POST /upload                -> Upload resume and docs
POST /ingest/rebuild        -> Trigger full ingestion LangGraph workflow
POST /profile/generate      -> Regenerate candidate_profile.json + site_content.json
POST /chat                  -> RAG query: returns answer + sources + eval scores
POST /eval/run              -> Run batch evaluation test set
GET  /eval/results          -> Fetch evaluation results
GET  /projects              -> Return project cards from site_content.json
GET  /profile               -> Return structured profile
GET  /about-content         -> Return about page content
GET  /admin/status          -> Return ingestion/index status

## Core Data Files
- backend/data/candidate_profile.json - Canonical structured profile (name, headline, experience, skills, projects, etc.)
- backend/data/site_content.json - UI-ready copy generated from profile (hero, about, project cards)
- backend/uploads/ - Raw uploaded files (resume PDF, project docs)

## LangGraph Workflows (4 agents)
1. Ingestion Agent - file intake -> text extraction -> chunking -> embedding -> indexing -> profile update
2. Profile Synthesis Agent - build candidate_profile.json and site_content.json from source materials
3. Recruiter Q&A Agent - retrieve evidence -> compose grounded answer -> cite sources
4. Evaluation Agent - LLM-as-judge using gpt-4o-mini: compare answer to evidence -> score groundedness + completeness -> flag unsupported claims

## Build Phases
- [x] Phase 0: Scaffolding + AGENTS.md setup
- [x] Phase 1: Backend core (upload, parse, chunk, embed, Chroma index, /chat endpoint)
- [x] Phase 2: Structured profile (profile generation, candidate_profile.json, site_content.json)
- [x] Phase 3: Frontend shell (Home, About, Projects, chat integration)
- [x] Phase 4: Admin + rebuild flow (upload page, rebuild button, status)
- [x] Phase 5: Evaluation layer (live scoring, batch test set, diagnostics page)
- [x] Phase 6: Job Agent Foundations (preferences capture, job schemas/storage, ingestion scaffolding, fit scoring surfaces)
- [x] Phase 7: Efficient Job Discovery Pipeline (career-ops-inspired source tiers, scan history, refresh deltas, liveness-aware discovery, shortlist-first evaluation)
- [x] Phase 8: Broad Discovery Expansion (multi-board ATS source packs, wider AI/company coverage, preference-responsive search universe, career-ops-style discovery breadth)
- [x] Phase 9: Top Fit Jobs Diversification + UX Simplification (company-cap display logic, smarter pack recommendations, direct-board expansion, cleaner 2-column jobs view)
- [x] Phase 10: Project Deep-Dive Routing Foundation (animated project detail template, OSS Dependency Risk Agent first deep dive, reusable project-detail pattern)
- [ ] Phase 11: Recruiter-Facing AI Architect Profile Finish (finalize Chase-facing profile, RAG accuracy, project deep dives, and public/private platform boundaries before resuming full multi-user platform work)

## Current Phase
Phase 11 in progress - Recruiter-Facing AI Architect Profile Finish

## Run Command
Always run uvicorn from the `backend/` directory (not repo root):
```powershell
cd backend
..\.venv\Scripts\python -m uvicorn main:app --reload
```

## Important Conventions
- All secrets in environment variables via Pydantic Settings (never hardcoded)
- Admin routes must be restricted (not public)
- Raw private docs must not be committed if repo is public
- backend/data/*.json must be gitignored if repo is public (contains resume content)
- Pydantic models for all request/response schemas
- FastAPI lifespan events for startup/shutdown
- Keep chunk metadata rich: doc_id, doc_type, chunk_id, section, project_name, source_filename
- Chroma is the vector DB for MVP; Pinecone upgrade is possible later but not planned for v1
- OpenAI is the sole LLM provider for v1 - do not abstract for multi-provider until v2
- Pin LangGraph at 0.2.28 - do not upgrade without explicit instruction

## OpenAI Model Assignments
- Generation (chat answers): gpt-4o
- Embeddings: text-embedding-3-small
- Evaluation (LLM-as-judge): gpt-4o-mini

## Session Notes
<!-- Codex: update this section at the end of every session with what was completed and what is next -->
### Session 1 - 2026-03-23
Completed: Phase 0 scaffolding + Phase 1 backend core.
- Phase 0: full monorepo structure, AGENTS.md files, slash commands, .env.example, .gitignore, requirements.txt, README.md
- Phase 1: ingestion service (PDF/txt/md), chunking (tiktoken, cl100k_base, size by doc_type), embedding+indexing (Chroma via langchain-chroma), retrieval, generation (GPT-4o), LangGraph ingestion and chat workflows, /upload + /ingest/rebuild + /chat endpoints
- All Phase 1 smoke tests passed: upload -> ingest -> chat returning grounded answers
- Run server from backend/ dir: `cd backend && ../.venv/Scripts/python -m uvicorn main:app --reload`

### Session 2 - 2026-03-23
Completed: Phase 2 - Structured profile.
- Extended models/profile.py with SiteContent and ProjectCard schemas
- services/profile_builder.py - GPT-4o extracts CandidateProfile from Chroma chunks, writes candidate_profile.json
- services/content_generator.py - GPT-4o generates UI copy (hero, about, project cards, suggested prompts), writes site_content.json
- workflows/profile_graph.py - LangGraph: retrieve_all -> build_profile -> generate_content
- api/profile.py - POST /profile/generate, GET /profile
- api/about.py - GET /about-content
- api/projects.py - GET /projects
- All Phase 2 smoke tests passed
Next: Phase 3 - Frontend shell (Next.js App Router, Tailwind, shadcn/ui, Home/About/Projects pages)

### Session 3 - 2026-03-23
Completed: Phase 3 - Frontend shell.
- Scaffolded Next.js 14 App Router project (package.json, tsconfig, tailwind.config, postcss, globals.css, layout)
- tailwind.config.ts: full design system color palette + font families (Inter, JetBrains Mono, Space Grotesk) from DESIGN.md
- lib/types.ts: TypeScript types mirroring all backend Pydantic models (ChatRequest/Response, EvaluationScores, CandidateProfile, AboutContent, ProjectCard)
- lib/api.ts: typed API client - chat(), getProfile(), getAboutContent(), getProjects() via NEXT_PUBLIC_API_URL
- components/Sidebar.tsx: shared left nav with active-route highlighting (usePathname)
- components/TopNav.tsx: shared header with hasRightPanel prop (right-80 vs right-0)
- app/page.tsx: full chat interface - dynamic candidate name + suggested prompts, message history, loading state, POST /chat wired, right panel with live quality metrics + source evidence
- app/about/page.tsx: Stitch-converted Deep-Dive page - profile.name/headline, skills/tools/certifications badges, experience timeline, education; wired to GET /profile + GET /about-content
- app/projects/page.tsx: Stitch-converted Projects page - dynamic cards with name, summary, tech badges, impact bullets, link buttons; wired to GET /projects
- Run frontend: `cd frontend && npm install && npm run dev` (requires NEXT_PUBLIC_API_URL in .env.local)
Next: Phase 4 - Admin + rebuild flow (upload page, rebuild button, status panel)

### Session 4 - 2026-03-23
Completed: Phase 4 - Admin + rebuild flow.
- backend/app/api/admin.py - GET /admin/status: upload dir exists/count/filenames, Chroma index exists, profile+site_content exists, ISO last-modified timestamps
- backend/main.py - registered admin router
- frontend/lib/types.ts - added DocType, UploadResponse, IngestResponse, GenerateResponse, AdminStatus
- frontend/lib/api.ts - added getAdminStatus(), uploadFile() (FormData), rebuildIndex(), generateProfile()
- frontend/components/Sidebar.tsx - added Admin nav item (admin_panel_settings icon)
- frontend/app/admin/page.tsx - three sections: System Status (indicator dots, file list, timestamps, refresh), File Upload (drop zone, doc_type select, project_name input, result cards), Operations (Rebuild Index + Regenerate Profile buttons with loading state + inline results, auto-refresh status on success)
Next: Phase 5 - Evaluation layer (live scoring, batch test set, diagnostics page)

### Session 5 - 2026-03-23
Completed: Chroma stale-data bug fix.
- backend/app/services/embedding.py - added clear_collection(): calls vectorstore.delete_collection() then resets _vectorstore singleton to None so next get_vectorstore() creates a fresh collection
- backend/app/api/ingest.py - calls clear_collection() once before the file loop in POST /ingest/rebuild, ensuring stale chunks are wiped before reindexing current uploads
Next: Phase 5 - Evaluation layer (live scoring, batch test set, diagnostics page)

### Session 6 - 2026-03-23
Completed: Phase 5 - Evaluation layer.
- backend/app/services/evaluation.py - gpt-4o-mini LLM-as-judge: evaluate_answer(query, answer, chunks) -> EvaluationScores; structured JSON output via response_format; safe defaults on failure
- backend/app/workflows/eval_graph.py - LangGraph eval agent (EvalState TypedDict, single judge_node, run_evaluation() public entry point)
- backend/app/workflows/chat_graph.py - removed _PLACEHOLDER_SCORES, added evaluate_node wired after generate_node (retrieve -> generate -> evaluate -> END)
- backend/app/evals/scoring.py - batch runner: EvalQuestionResult + EvalRunResult Pydantic models, run_batch_eval() loads recruiter_questions.json, calls run_chat() per question, checks must_mention keywords, persists to backend/data/eval_results.json
- backend/app/api/eval.py - POST /eval/run + GET /eval/results (404 if not yet run)
- backend/main.py - registered eval router
- frontend/lib/types.ts - added EvalQuestionResult, EvalRunResult interfaces
- frontend/lib/api.ts - added runEval() (POST /eval/run), getEvalResults() (GET /eval/results)
- frontend/app/diagnostics/page.tsx - full diagnostics page: MetricBar + PassBadge helpers, aggregate metrics panel, run controls panel, per-question results table with line-clamp explanations
MVP complete - all 5 phases done.

### Session 7 - 2026-04-13
Completed: Local environment and stale-data cleanup.
- Diagnosed frontend fetch failures as a combination of port conflicts and CORS mismatches between `localhost` and `127.0.0.1`
- Confirmed the frontend was accidentally talking to a different local backend on port `8000` and re-routed local testing to `127.0.0.1:8765`
- Identified the persistent Jane Doe contamination as a path-resolution bug: relative backend paths were resolving to `backend/backend/...` when Uvicorn was launched from the `backend/` directory
- backend/app/core/config.py - changed storage paths to resolve to absolute repo paths for `backend/data`, `backend/uploads`, and Chroma persistence
- backend/app/api/upload.py - added per-upload metadata sidecar files so rebuilds preserve `doc_type` and `project_name`
- backend/app/api/ingest.py - updated rebuild flow to load saved upload metadata instead of relying only on file extensions
- Removed the stale runtime directory at `backend/backend`, including the old Jane Doe uploads and stale Chroma artifacts after stopping the server
- Verified updated backend files compile successfully with `python -m compileall backend/app`
Next: Re-upload Chase's current resume, rebuild the index, regenerate the profile, and then convert the app from demo-first behavior to a persistent default-profile experience for recruiters.

### Session 8 - 2026-04-13
Completed: Input-source readiness check.
- Confirmed the local resume source exists at `C:\Users\chase\Documents\Overall Resume\Chase-Sinclair-Resume.pdf`
- Checked for MCP/plugin resources and templates; no GitHub plugin resources were exposed in this session yet
Next: Prepare the app for a persistent default-profile mode using the resume as the starter source, then connect GitHub project inputs once the plugin is available in-session.

### Session 9 - 2026-04-13
Completed: Persistent default-profile setup for recruiter-facing mode.
- Confirmed GitHub plugin access and used repository content plus the local resume as seed sources for Chase's default profile
- backend/app/services/bootstrap.py - added startup bootstrap logic that restores default public profile assets from committed seed files and seeds the public Chroma knowledge base when the collection is empty
- backend/main.py - now calls `ensure_default_public_assets()` during startup after initializing Chroma
- backend/app/core/config.py - updated Pydantic settings config to ignore unrelated env vars from the shared repo `.env`, which unblocked local scripting and bootstrap tooling
- backend/seed/candidate_profile.default.json - added committed default structured profile for Chase
- backend/seed/site_content.default.json - added committed default homepage/about/projects content for Chase
- backend/seed/default_candidate_context.md - added committed default recruiter-facing knowledge-base source text built from resume and project summaries
- backend/data/candidate_profile.json - refreshed local runtime profile to match the new default profile content
- backend/data/site_content.json - refreshed local runtime site content to match the new default public content
- backend/scripts/refresh_public_profile.py - added a one-command script to copy seed files into runtime data and rebuild the public knowledge base
- backend/seed/README.md - documented the quick future update workflow for public profile maintenance
- Verified backend compilation with `python -m compileall backend/app`
- Verified the refresh flow end to end by running `python backend/scripts/refresh_public_profile.py`, which successfully rebuilt the default Chroma collection from the committed seed context
Next: Restart the backend and frontend, verify the recruiter-facing chat responds with Chase-specific evidence from the seeded public profile, and then refine the seeded projects/content once Chase provides fuller updated details.

### Session 10 - 2026-04-13
Completed: Admin page redesign into a polished Demo Lab experience.
- Reframed the `/admin` surface from a utilitarian system-admin console into a recruiter-facing capability demo page while keeping the underlying upload pipeline intact
- frontend/app/admin/page.tsx - replaced the old multi-section admin UI with a landing-page style Demo Lab experience that:
  - explains the concept and intended use of the feature
  - labels the surface clearly as a demo
  - includes a future demo-video placeholder
  - collapses the old upload -> rebuild -> regenerate workflow into a single guided `Run Demo Pipeline` action
  - preserves status visibility and caveats about runtime overwrite behavior
- frontend/components/Sidebar.tsx - renamed the navigation label from `Admin` to `Demo Lab`
- Verified the frontend compiles cleanly with `npm run build`
Next: Refine the demo messaging further if needed, and later separate demo runtime state from Chase's public runtime state so demo runs never overwrite the live recruiter profile.

### Session 11 - 2026-04-13
Completed: Information architecture rename and new landing page flow.
- Changed the app entry experience so `/` is now a recruiter-oriented overview landing page instead of dropping users directly into the chat interface
- frontend/app/page.tsx - added a new landing page that explains the product, highlights the primary recruiter path, and routes users first to Chase's Architect Profile
- frontend/app/knowledge-base/page.tsx - moved the previous chat/RAG experience into a dedicated `Career Knowledge Base` route
- frontend/components/Sidebar.tsx - renamed and reordered navigation labels to `Overview`, `Architect Profile`, `Career Knowledge Base`, `Projects`, `Demo Lab`, and `Evaluations`
- frontend/app/about/page.tsx - retitled the page to `Architect Profile` and added a standout outbound CTA that opens the Career Knowledge Base
- Adopted the naming split:
  - product/platform: `Career Architect`
  - structured profile surface: `Architect Profile`
  - RAG/chat surface: `Career Knowledge Base`
- Verified the updated frontend routing and UI compile successfully with `npm run build`
Next: Optionally refine the landing-page polish further, wire the resume download button, and later separate demo runtime state from the live public runtime state.

### Session 12 - 2026-04-13
Completed: Reframed evaluation UX into a session-based Answer Quality Check.
- frontend/components/Sidebar.tsx - removed the old `Evaluations` item from main navigation so recruiter-facing IA stays focused on overview, profile, knowledge base, projects, and demo workflow
- frontend/app/knowledge-base/page.tsx - added session capture for live Q&A turns by storing question, answer, sources, snippets, and judge scores in `sessionStorage` under the current browser session
- frontend/app/knowledge-base/page.tsx - added an outbound `Answer Quality Check` link so the trust/QA surface is reachable from the Career Knowledge Base without appearing as a primary nav destination
- frontend/app/diagnostics/page.tsx - replaced the old benchmark-oriented diagnostics UI with a new `Answer Quality Check` experience that:
  - reads only from the current browser session
  - summarizes average groundedness, completeness, confidence, unsupported-claim rate, and source coverage
  - lists each answered question with its per-answer quality metrics and judge explanation
  - includes controls to clear the current session check and return to the Career Knowledge Base
- Removed recruiter-facing references to the old "gold recruiter question set" wording from the UI; the quality page now reflects only live session answers
Next: Verify the new session-based quality flow with live local usage, then consider whether to retire or simplify the old backend batch-eval endpoints now that the frontend no longer depends on them.

### Session 13 - 2026-04-14
Completed: Phase 6 foundation pass for the personal jobs agent.
- Defined a new active build phase: `Phase 6 - Job Agent Foundations`, focused on turning Career Architect into a stronger single-user job-matching agent before introducing any multi-user/auth system
- backend/app/models/jobs.py - added the canonical `JobPreferences` model for target roles, locations, salary floor, industry preferences, tech focus, avoid terms, and stretch-role behavior
- backend/app/services/job_preferences.py - added a dedicated persistence layer for loading and saving `backend/data/job_preferences.json`
- backend/app/api/job_preferences.py - added `GET /job-preferences` and `PUT /job-preferences` so the frontend can manage saved job-agent targeting data
- backend/seed/job_preferences.default.json - added committed default preferences for Chase so the jobs-agent flow has a live starter configuration
- backend/app/services/bootstrap.py - now bootstraps `job_preferences.json` into runtime data alongside the existing default profile assets when missing
- backend/main.py - registered the new job-preferences API router
- frontend/lib/types.ts and frontend/lib/api.ts - added the `JobPreferences` interface plus typed API helpers for loading and saving preferences
- frontend/app/job-preferences/page.tsx - added a polished new Job Preferences page that:
  - captures target titles, keywords, locations, remote preference, seniority, salary floor, industries, company types, tech focus, avoid terms, and supporting notes
  - previews what the future daily jobs brief will optimize for
  - includes a readiness panel showing how complete the current preference signal is
  - persists changes back to the backend with a recruiter-consistent UI style
- frontend/components/Sidebar.tsx - added `Job Preferences` to the primary app navigation
- frontend/app/page.tsx - added a landing-page card for the jobs-agent foundation so the new capability is visible from the overview experience
Next: Add job-posting schemas and storage, build the first Greenhouse/Lever ingestion layer, and create an initial `Top Fit Jobs` surface that scores roles against Chase's Architect Profile plus saved preferences.

### Session 14 - 2026-04-14
Completed: First scored `Top Fit Jobs` surface for the stronger jobs agent.
- backend/app/models/jobs.py - expanded the jobs domain model with `JobPosting`, `JobFitResult`, and `TopFitJobsResponse` so ranked opportunities have a stable backend contract
- backend/app/services/jobs.py - added the first rules-based fit scorer that compares each job against:
  - saved job preferences
  - Chase's current Architect Profile skills/tools
  - work-style and location preferences
  - avoid-keyword penalties
  - likely resume/story angles for each role
- backend/app/api/jobs.py - added `GET /jobs/top-fit` to return ranked opportunities for the new jobs page
- backend/seed/jobs_cache.default.json and backend/data/jobs_cache.json - added clearly labeled seeded research targets so the ranking surface is usable immediately while live Greenhouse/Lever ingestion is still pending
- backend/app/services/bootstrap.py - now bootstraps `jobs_cache.json` automatically alongside the other default runtime assets when missing
- backend/main.py - registered the new jobs API router
- frontend/lib/types.ts and frontend/lib/api.ts - added typed frontend models and API helpers for scored jobs
- frontend/app/top-fit-jobs/page.tsx - added a new Top Fit Jobs experience that:
  - displays ranked opportunities with fit buckets and overall scores
  - explains why each role matches
  - surfaces strengths, watchouts, and likely resume angles
  - makes it clear that current listings are a seeded scouting preview rather than live-source ingestion
- frontend/components/Sidebar.tsx - added `Top Fit Jobs` to the primary navigation
- frontend/app/page.tsx - added a `Top Fit Jobs` overview card so the new jobs-agent output is visible from the landing page
- Recalibrated the initial ranking thresholds so the seeded queue produces meaningful `Best Fit`, `Strong Consideration`, and `Stretch` buckets instead of uniformly weak outputs
- Verified backend ranking output locally: current seeded queue returns 4 ranked roles with top matches led by `Lead Applied AI Strategist` and `Staff Data Platform Scientist`
Next: Replace the seeded scouting targets with live Greenhouse/Lever ingestion, persist normalized job cache updates, and add filtering/history so the morning-brief workflow can run on fresh postings instead of only starter data.

### Session 15 - 2026-04-14
Completed: Live Greenhouse/Lever ingestion and refresh workflow for Top Fit Jobs.
- backend/app/services/job_sources.py - added live source refresh support using `httpx` with normalized fetchers for:
  - Greenhouse public boards via the Greenhouse boards API
  - Lever public postings via the Lever postings API
- backend/app/models/jobs.py - expanded the jobs contract with:
  - `JobSourceConfig`
  - `JobRefreshResponse`
  - extra live-ingestion metadata on `JobPosting`
  - live/fallback summary fields on `TopFitJobsResponse`
- backend/app/api/jobs.py - added:
  - `GET /job-sources`
  - `POST /jobs/refresh`
  so the frontend can inspect tracked sources and trigger live refreshes
- backend/seed/job_sources.default.json and backend/data/job_sources.json - added the first tracked live-source list for Greenhouse and Lever board ingestion
- backend/app/services/bootstrap.py - now bootstraps tracked job sources alongside default profile assets when runtime files are missing
- backend/app/services/jobs.py - updated ranking to prefer live jobs over seeded fallback jobs whenever live-source refresh succeeds
- frontend/lib/types.ts and frontend/lib/api.ts - added typed support for tracked sources and refresh responses
- frontend/app/top-fit-jobs/page.tsx - upgraded the page to:
  - trigger live refreshes from the UI
  - show live-source status and fallback mode
  - display tracked Greenhouse/Lever boards
  - surface refresh errors directly when a source fails
- Verified live refresh locally outside the sandbox:
  - current default source set refreshes successfully with 81 live jobs fetched across 3 enabled sources
  - seeded jobs are no longer used when live refresh succeeds
- Tightened title-mismatch penalties in the scorer so the live queue is less likely to over-rank broad adjacent roles
- Disabled the broken `Tractable` starter source in defaults until the correct public board identifier is verified
Next: Replace the generic starter boards with a more personalized source list, add source editing in the UI, and layer in freshness/history filtering so the morning brief can focus on relevant newly posted roles instead of the full live cache.

### Session 16 - 2026-04-14
Completed: Editable source management for the live jobs agent.
- backend/app/services/job_sources.py - added `save_job_sources()` so tracked boards can now be persisted from the frontend instead of being static JSON only
- backend/app/api/jobs.py - added `PUT /job-sources` to update the tracked Greenhouse/Lever board list
- frontend/lib/api.ts - added typed source-update support for the new save route
- frontend/app/top-fit-jobs/page.tsx - upgraded the live jobs page with editable tracked-source management:
  - add new source entries directly in the UI
  - edit company label, platform, board identifier, enabled status, and notes
  - remove source entries
  - save the full tracked-source set back to the backend
  - keep refresh and ranking controls on the same page so source tuning and live refresh happen in one place
- This makes the jobs agent materially more usable because the source mix can now be tailored without touching local JSON files by hand
Next: Add freshness/history filters and tune the default source list toward boards that better reflect Chase's target role direction so the ranked queue becomes more relevant day to day.

### Session 17 - 2026-04-14
Completed: Relevance hardening for live job matches.
- backend/app/models/jobs.py - added `exclude_title_keywords` to saved job preferences so hard-excluded role families can be captured explicitly
- backend/seed/job_preferences.default.json and backend/data/job_preferences.json - populated initial exclusion terms for clearly off-target roles such as account, sales, marketing, recruiter, and product-management variants
- frontend/lib/types.ts and frontend/app/job-preferences/page.tsx - exposed the new `Exclude Title Keywords` control in the Job Preferences UI so these filters are editable without touching JSON files
- backend/app/services/jobs.py - added stronger prefilters so live jobs are discarded before scoring when:
  - the title hits an excluded role-family keyword
  - the title does not meaningfully overlap with target role families
  - the location/work-style setup does not align with saved preferences
- backend/app/services/jobs.py - upgraded title matching from exact substring logic to fuzzy token overlap, which materially improves scoring for titles like `Data Scientist` even when the saved preference is `Lead Data Scientist`
- backend/app/services/jobs.py - increased title-family weighting in both preference-match and profile-match scoring so relevant role names drive the ranking more than generic buzzword overlap
- backend/seed/job_sources.default.json and backend/data/job_sources.json - swapped the starter live-source list toward more relevant NYC/data-science-friendly boards (`PortPro`, `US Mobile`, `CompStak`, `The Voleon Group`) instead of the earlier generic starter mix
- Verified live refresh against the new source set:
  - 94 live jobs fetched on the first refresh with the updated sources
  - 74 live jobs fetched on the follow-up refresh when one source timed out
  - the ranked queue now suppresses the earlier weak `Account Director` / commercial-role results
- Verified current top ranked roles are now at least role-family relevant, led by:
  - `Senior Research Engineer - Voleon Securities`
  - `Data Scientist` at `PortPro`
Next: Add freshness filters, duplicate suppression, and tighter company/source curation so the queue becomes not just relevant in title family, but also sharper in seniority, domain, and day-to-day actionability.

### Session 18 - 2026-04-14
Completed: Actionability filters for the live jobs queue.
- backend/app/services/jobs.py - added optional actionability filters before ranking:
  - `recent_days` freshness window
  - duplicate suppression by normalized `company + title`
- backend/app/services/jobs.py - added timestamp parsing helpers so posted-at and fetched-at metadata can drive recency filtering cleanly
- backend/app/api/jobs.py - extended `GET /jobs/top-fit` with query params for `recent_days` and `dedupe`
- frontend/lib/api.ts - updated the top-fit jobs client to request ranking results with freshness and dedupe controls
- frontend/app/top-fit-jobs/page.tsx - added UI controls for:
  - freshness window (`7`, `14`, `30`, `60`, or all cached jobs)
  - duplicate suppression toggle
- Kept the default view on `all cached jobs` instead of a strict recency window because the current live-source set is still sparse enough that a `30` or `60` day default can empty the queue entirely
- This makes the page much more useful as a scouting surface because it can now bias toward recent, distinct openings instead of showing a raw cache slice
Next: Add stronger seniority/domain filters and begin layering a brief-style summary on top of the filtered queue so the morning agent can highlight what changed since the last refresh.

### Session 19 - 2026-04-14
Completed: Morning-brief style summary layer for Top Fit Jobs.
- backend/app/models/jobs.py - expanded `TopFitJobsResponse` with briefing metadata:
  - `brief_headline`
  - `brief_summary`
  - `new_since_refresh_count`
  - bucket counts for `Best Fit`, `Strong Consideration`, and `Stretch`
- backend/app/services/jobs.py - added summary generation on top of the filtered ranked queue so the jobs page now produces a concise top-line briefing instead of only a raw list
- backend/app/services/jobs.py - added recent-refresh detection based on `fetched_at` timestamps so the summary can report what is newly refreshed in the current live queue
- frontend/lib/types.ts - updated the top-fit jobs response contract for the new briefing fields
- frontend/app/top-fit-jobs/page.tsx - added a `Morning Brief Preview` section that:
  - leads with a human-readable queue summary
  - surfaces the strongest current lead
  - shows new-since-refresh counts
  - summarizes how many roles survive in each fit bucket
- This shifts the page closer to the intended agent experience: users can now scan the queue quickly before diving into the per-role cards
Next: Add stronger seniority/domain preferences and begin tracking what changed between refreshes more explicitly so the brief can say not just how many jobs are present, but which opportunities are newly worth attention.

### Session 20 - 2026-04-14
Completed: Defined and started Phase 7 - Efficient Job Discovery Pipeline.
- Researched the open-source `santifer/career-ops` repository and extracted the most relevant job-search patterns to adapt:
  - source-tiered discovery (`direct board -> ATS API -> broad search`)
  - hard title gating before deeper evaluation
  - persistent scan history and dedupe
  - liveness awareness for noisy discovery sources
  - shortlist-first processing instead of treating every fetched role equally
- Promoted the new build track into the phase plan as `Phase 7 - Efficient Job Discovery Pipeline`
- backend/app/models/jobs.py - expanded the jobs-domain contract with:
  - `discovery_mode` and `priority_tier` on `JobSourceConfig`
  - `JobScanHistoryEntry` for persistent discovery-state tracking
  - refresh delta fields on `JobRefreshResponse` (`added_jobs`, `dropped_jobs`, `unchanged_jobs`, preview lists)
- backend/app/services/job_sources.py - added the first `career-ops`-style discovery-state layer:
  - persistent `job_scan_history.json` load/save helpers
  - source refresh ordering by `priority_tier`
  - delta comparison between the previous live cache and the latest refresh
  - scan-history syncing that marks roles as `active` or `missing`
  - preview summaries for newly seen and no-longer-returned roles
- backend/app/services/bootstrap.py - now bootstraps `backend/data/job_scan_history.json` from a committed seed file when missing
- backend/seed/job_scan_history.default.json - added an empty committed default for runtime bootstrapping
- frontend/lib/types.ts - extended frontend job-source and refresh-result contracts for the new discovery metadata
- frontend/app/top-fit-jobs/page.tsx - upgraded the UI so the refresh surface now shows:
  - added / unchanged / dropped role counts
  - preview lists for newly seen roles and roles that disappeared since the last refresh
  - editable `discovery_mode` and `priority_tier` fields for each tracked source
- Verified the backend compiles cleanly with `python -m compileall app`
- Verified the frontend builds cleanly with `npm run build`
Next: Add the next two high-impact Phase 7 pieces:
- direct-board / liveness-aware verification for noisier sources before they influence the ranked queue
- tracked shortlist / candidate queue states so only high-signal roles move into deeper scoring and eventual morning-brief recommendations

### Session 21 - 2026-04-14
Completed: First shortlist workflow and UI de-emphasis of crawler internals.
- backend/app/models/jobs.py - expanded the jobs contract again to support:
  - job-level liveness metadata on `JobPosting`
  - shortlist state on `JobFitResult`
  - persistent `JobShortlistEntry` / `JobShortlistUpdate` models
  - queue summary counts on `TopFitJobsResponse` (`ready_to_review_count`, `shortlisted_count`, `applied_count`)
- backend/app/services/job_shortlist.py - added a dedicated persistence layer for `backend/data/job_shortlist.json`
- backend/app/services/bootstrap.py - now bootstraps `job_shortlist.json` from a committed default seed file when missing
- backend/seed/job_shortlist.default.json - added an empty committed shortlist store
- backend/app/api/jobs.py - added shortlist endpoints:
  - `GET /jobs/shortlist`
  - `PUT /jobs/{job_id}/shortlist`
- backend/app/services/jobs.py - now attaches shortlist state to ranked job results and computes review/shortlist/applied counts for the top-level brief
- backend/app/services/job_sources.py - now stamps ATS-sourced jobs with explicit liveness metadata (`live` plus a source-verification note) and carries through source-tier metadata onto each posting
- backend/data/job_sources.json and backend/seed/job_sources.default.json - updated the tracked-source defaults to include explicit `discovery_mode` and `priority_tier`
- frontend/lib/types.ts and frontend/lib/api.ts - added typed support for shortlist actions plus job-level liveness metadata
- frontend/app/top-fit-jobs/page.tsx - shifted the page further toward a real jobs-agent workflow:
  - each role card now shows liveness/source-verification context
  - each role can now be moved into `review`, `shortlisted`, or `archived` queue states
  - queue actions refresh page-level summary counts after changes
  - the previous source-editing form is now tucked behind an `Advanced Source Tuning` toggle instead of sitting in the main path
  - the page copy now explicitly explains that the source panel is crawler tuning, not the main user-facing workflow
- Verified backend compilation with `python -m compileall app`
- Verified frontend build with `npm run build`
Next: Implement the remaining Phase 7 liveness-aware path for noisier discovery modes (especially non-ATS sources) so only verified-live roles can influence the ranked queue when broader discovery is introduced.

### Session 22 - 2026-04-14
Completed: Closed Phase 7 with liveness-aware discovery gating.
- backend/app/models/jobs.py - expanded the jobs contract to support:
  - `liveness_checked_at` on `JobPosting`
  - refresh-level liveness rollups on `JobRefreshResponse` (`verified_live_jobs`, `unverified_jobs`)
- backend/app/services/job_sources.py - added discovery-mode-aware liveness verification:
  - `ats_api` sources remain trusted unless the source response itself indicates failure
  - non-ATS discovery modes now perform per-posting URL verification with page-content heuristics
  - postings are marked `live`, `unverified`, or `expired` with explanatory notes
  - refresh responses now summarize how many roles were clearly verified live versus left unverified
- backend/app/services/jobs.py - added the liveness gate in the ranking pipeline:
  - ATS-sourced roles are allowed unless explicitly expired
  - non-ATS roles must be positively verified as live before they can influence the ranked queue
  - empty-queue messaging now reflects the role of liveness verification, not just preference filters
- frontend/lib/types.ts - extended the refresh-result contract for liveness verification counts
- frontend/app/top-fit-jobs/page.tsx - updated the refresh summary UI to surface:
  - verified-live role counts
  - unverified role counts
  - clearer explanation that advanced source controls are crawler tuning, while the main page is for decision-making
- Verified backend compilation with `python -m compileall app`
- Verified frontend build with `npm run build`
Next: Phase 7 is complete. The next likely build track is a delivery layer on top of the finished jobs pipeline: a true morning-brief experience, automation, and possibly tailored application materials fed by the shortlist queue.

### Session 23 - 2026-04-14
Completed: Defined and started Phase 8 - Broad Discovery Expansion.
- Promoted the next build track into the phase plan as `Phase 8 - Broad Discovery Expansion`
- Clarified the key problem this phase solves: the jobs agent was re-ranking a narrow 4-board universe instead of expanding outward the way `career-ops` does
- Set the immediate phase goal to broaden the discovery window before adding more UI or automation:
  - expand tracked ATS boards beyond the initial NYC-focused test set
  - follow the same kind of multi-company source strategy used in `career-ops`
  - make the fetched job universe much more responsive to changing preferences because the source pool is no longer so narrow
- backend/seed/job_sources.default.json - replaced the 4-board sandbox source list with a broader AI/solutions-oriented ATS source pack spanning companies and boards inspired by the `career-ops` tracked-company set, including:
  - Greenhouse: Anthropic, Vercel, Temporal, Airtable, RunPod, Glean, Speechmatics, Wayve
  - Lever: Mistral AI, Weights & Biases, Palantir, Qonto, Pigment, Spotify, Vinted
- backend/data/job_sources.json - updated the current runtime tracked-source set to match the broader seed pack so local testing immediately reflects the wider discovery universe
- This intentionally keeps the implementation inside currently supported ATS providers (`greenhouse`, `lever`) as the fastest safe step toward `career-ops`-style discovery breadth before adding additional providers like Ashby or Workable
Next: Continue Phase 8 by adding the next breadth-building layer:
- more ATS provider support where it materially expands coverage (starting with Ashby)
- preset source packs or source-set switching so preferences can pull from different discovery universes without hand-editing the full board list
- validation of the widened source pack via live refresh so we can see whether the ranked queue begins surfacing the broader role families you expect

### Session 24 - 2026-04-14
Completed: Closed Phase 8 - Broad Discovery Expansion.
- backend/app/models/jobs.py - added `JobSourcePack` so broader discovery presets are first-class typed objects in the API and frontend contracts
- backend/app/services/bootstrap.py - now bootstraps `backend/data/job_source_packs.json` from a committed seed file so discovery packs exist automatically on a fresh checkout
- backend/seed/job_source_packs.default.json - added committed discovery presets:
  - `AI Platform & Solutions`
  - `Data & Analytics`
- backend/app/services/job_sources.py - expanded the discovery layer to support:
  - loading and applying named source packs
  - Ashby public job board ingestion alongside Greenhouse and Lever
  - preserved liveness verification and refresh-delta tracking while broadening the source universe
- backend/app/api/jobs.py - added:
  - `GET /job-source-packs`
  - `POST /job-source-packs/{pack_id}/apply`
- frontend/lib/types.ts and frontend/lib/api.ts - added typed frontend support for discovery packs and pack application
- frontend/app/top-fit-jobs/page.tsx - upgraded the jobs UI with:
  - a new `Discovery Packs` section for switching between broader tracked-board universes
  - direct application of source packs without hand-editing the advanced crawler controls
  - Ashby as a supported editable source platform in `Advanced Source Tuning`
  - refreshed hero copy reflecting Greenhouse + Lever + Ashby coverage
- backend/seed/job_sources.default.json - replaced the old narrow sandbox with a much broader default tracked-source universe across AI platform, solutions, and data-adjacent companies
- Validation:
  - backend compile passed with `python -m compileall app`
  - frontend build passed with `npm run build`
  - live refresh succeeded against the expanded source universe:
    - 15 enabled sources
    - 1,558 live jobs fetched
    - refresh deltas reported correctly (`8` added, `4` dropped, `1,550` unchanged)
    - verified-live counts remained intact
- Cleanup after validation:
  - removed two dead default boards that returned 404s (`Weights & Biases`, `Vinted`)
  - replaced them in the default tracked-source universe with live Ashby-backed sources (`Cohere`, `Pinecone`, `LangChain`) so the widened discovery set is broader and cleaner out of the box
Next: The next likely build track is a delivery and intelligence layer on top of the broadened jobs pipeline:
- morning brief generation from refresh deltas + shortlist state
- smarter preference-to-pack recommendations
- deeper search expansion beyond ATS boards when needed

### Session 25 - 2026-04-14
Completed: Closed Phase 9 - Top Fit Jobs Diversification + UX Simplification.
- backend/app/models/jobs.py - expanded the jobs response contract to support:
  - ranked company/title rollups
  - recommended discovery-pack metadata
  - explicit visible company-cap metadata for the top list
- backend/app/services/jobs.py - upgraded ranking output behavior:
  - top displayed roles are now diversified with a hard cap of `2` roles per company
  - added smarter pack recommendations based on saved target titles, keywords, and focus areas
  - added ranked-pool summaries for top companies and top title families
  - improved the title-rollup logic so the trend panel groups similar role families instead of just showing unique one-off titles
- backend/app/services/job_sources.py - added the first deeper non-ATS expansion path:
  - new `direct` platform support for direct-board career pages
  - direct-board parsing of JSON-LD `JobPosting` entries when available
  - non-ATS pages still route through liveness verification before they influence the queue
- frontend/lib/types.ts - extended the UI contracts to render:
  - pack recommendations
  - top company/title rollups
  - visible company-cap messaging
- frontend/app/top-fit-jobs/page.tsx - redesigned the page to be much less vertical and easier to scan:
  - simplified the hero copy and metric explanations
  - clarified what each top-level number means (`Roles Passing Filters`, `Live Openings Scanned`, `Best-Fit Roles in Pool`, `Display Rule`)
  - made `Apply Pack` immediately refresh the new source universe instead of only swapping configs
  - surfaced the recommended pack clearly in the UI
  - added visual ranked-pool summaries for top companies and top job-title families
  - switched the top job list to a 2-column grid on wider screens
  - updated advanced source tuning to explain direct-board usage and allow a `Direct Board` platform with full URL identifiers
- Validation:
  - backend compile passed with `python -m compileall app`
  - frontend build passed with `npm run build`
  - `get_top_fit_jobs()` now returns:
    - `display_company_cap: 2`
    - recommended pack metadata
    - top companies/title-family summaries
    - diversified visible top matches instead of a single-company wall
Next: The next likely build track is the delivery layer:
- true morning-brief generation from refresh deltas and shortlist changes
- application-tailoring flows for shortlisted roles
- deeper broad-search provider coverage beyond ATS and direct-board pages

### Session 26 - 2026-04-14
Completed: Closed Phase 10 - Project Deep-Dive Routing Foundation.
- frontend/components/AnimatedReveal.tsx - added a reusable scroll-reveal wrapper using `IntersectionObserver`, so project sections animate into view without introducing a new animation dependency
- frontend/lib/project-details.ts - added the first reusable project-detail content model plus the initial structured deep-dive dataset for `OSS Dependency Risk Agent`
- frontend/app/projects/[slug]/page.tsx - added a native Next.js project-detail route that recreates the long-form showcase style from the provided mockup:
  - animated section reveals while scrolling
  - sticky back navigation
  - modular sections for problem, workflow, pipeline, health signals, agent design, sample output, semantic search, technical highlights, metrics, lessons learned, and roadmap
- frontend/app/projects/page.tsx - updated the project cards so supported projects can open internal deep-dive pages through a `View Deep Dive` CTA instead of only linking outward
- Validation:
  - frontend build passed with `npm run build`
  - the app now exposes a dynamic project-detail route at `/projects/[slug]`
  - `OSS Dependency Risk Agent` is the first reusable case-study page in the portfolio
Next: Continue the project-page track by:
- polishing the OSS detail page visuals and adding richer visuals/media if needed
- expanding the `project-details` dataset as more projects get their own deep-dive pages
- optionally introducing richer project-specific media sections (screenshots, diagrams, short demo videos) inside the same reusable template

### Session 27 - 2026-04-14
Completed: Reframed the product roadmap around a recruiter-first public experience plus a future private platform layer.
- Clarified the `Future State` product direction:
  - users eventually upload career artifacts and the platform automatically builds:
    - an Architect Profile
    - a Career Knowledge Base / RAG layer
    - project highlights
    - personalized job matching
  - user-only workflow pages such as job matching remain private/internal
  - recruiter/public users only see the polished public-facing outputs
- Locked the `Current Objective` for the next build track:
  - fully build out Chase Sinclair's AI Architect Profile first
  - refine and finalize the visible public profile experience before resuming platform expansion
- Defined Phase 11 as the next explicit execution track:
  - gather and incorporate more of Chase's career experience data
  - finalize the Architect Profile page and what it should surface
  - tighten RAG retrieval / grounding quality so the knowledge base is reliable and recruiter-ready
  - continue building dedicated deep-dive pages for each highlighted project
  - formalize public vs private platform boundaries so recruiter visitors do not see internal-only workflow tools
- Product framing for the landing page going forward:
  - explain what the platform is today
  - explain what the platform is becoming
  - keep the current recruiter-facing version as the polished portfolio layer, while the broader self-serve platform remains an intentional future-state story
Next: Start Phase 11 execution by prioritizing:
- source-of-truth career data intake from Chase
- Architect Profile refinements
- RAG quality tuning
- additional project deep dives
- public/private page access strategy
