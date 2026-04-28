# Career Intelligence Agent — Project Memory

## Product Vision
The current priority is Chase's public recruiter-facing profile (landing page, Architect Profile, Career Knowledge Base, Projects). Longer term, this becomes a self-serve platform where any user uploads career artifacts and the app builds their profile, knowledge base, project highlights, and private job-matching workflows. Job-search and job-agent pages should eventually be private/user-only, not part of the public recruiter path.

## Project Overview
A recruiter-facing AI Career Intelligence App. Recruiters can ask questions about Chase Sinclair's background, skills, and projects. Answers are grounded in a RAG pipeline built from a resume and career artifacts. Single-user MVP designed to demonstrate RAG, agentic workflow design, orchestration, and LLM output evaluation.

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Python 3.10+, FastAPI, Uvicorn, Pydantic
- Orchestration: LangGraph 0.2.28
- LLM Provider: OpenAI (GPT-4o for generation, text-embedding-3-small for embeddings, gpt-4o-mini for evaluation)
- Vector DB: Chroma
- Schemas/Settings: Pydantic Settings (env-based config)
- Storage: Local file storage + JSON/SQLite (dev), upgradeable to Supabase/Postgres

## Repo Structure
career-intelligence-agent/
  frontend/         → Next.js app (App Router, TS, Tailwind)
  backend/          → FastAPI app
    app/
      api/          → Route handlers
      core/         → Config, logging, shared utilities
      services/     → ingestion, retrieval, generation, evaluation, job services
      workflows/    → LangGraph graphs (ingestion, profile, chat, eval)
      models/       → Pydantic schemas
      evals/        → Test sets and scoring logic
    data/           → Runtime JSON files + Chroma (gitignored)
    seed/           → Default public profile assets (committed)
    uploads/        → Uploaded resumes and docs (always gitignored)
    scripts/        → refresh_public_profile.py
  docs/             → Architecture notes
  README.md

## Key Backend Endpoints
POST /upload                → Upload resume and docs
POST /ingest/rebuild        → Trigger full ingestion LangGraph workflow
POST /profile/generate      → Regenerate candidate_profile.json + site_content.json
POST /chat                  → RAG query: returns answer + sources + eval scores
POST /eval/run              → Run batch evaluation test set
GET  /eval/results          → Fetch evaluation results
GET  /projects              → Return project cards from site_content.json
GET  /profile               → Return structured profile
GET  /about-content         → Return about page content
GET  /admin/status          → Return ingestion/index status
GET/PUT /job-preferences    → Read/write job preferences
GET  /jobs/top-fit          → Ranked job list with fit scores
GET/PUT /job-sources        → Manage tracked ATS job sources
GET  /job-source-packs      → Discovery pack presets
POST /job-source-packs/{id}/apply → Apply a source pack
POST /jobs/refresh          → Fetch live jobs from enabled sources
GET  /jobs/shortlist        → Current shortlist state
PUT  /jobs/{id}/shortlist   → Update shortlist status

## Core Data Files
- backend/data/candidate_profile.json — Canonical structured profile
- backend/data/site_content.json — UI-ready copy (hero, about, project cards)
- backend/seed/ — Default public profile assets auto-loaded on startup if data/ is missing
- backend/uploads/ — Raw uploaded files

## Frontend Pages (Current)
- /                  → Landing page (hero, 6 entry cards)
- /about             → Architect Profile (structured resume view)
- /knowledge-base    → Career Knowledge Base (RAG chat + quality scores panel)
- /projects          → Project cards
- /projects/[slug]   → Project deep dives (animated reveal sections)
- /job-preferences   → Job preferences editor
- /top-fit-jobs      → Ranked jobs with fit scoring and shortlist
- /admin             → Demo Lab (upload, rebuild, regenerate)
- /diagnostics       → Answer Quality Check (session-based eval)

## LangGraph Workflows (4 agents)
1. Ingestion Agent — file intake → text extraction (+ YAML front matter parsing for .md) → chunking → embedding → indexing
2. Profile Synthesis Agent — build candidate_profile.json and site_content.json from source materials
3. Recruiter Q&A Agent — query rewrite (if history) → retrieve (k=12) → evidence gate → generate grounded answer (with conversation history) → cite sources → evaluate answer
4. Evaluation Agent — LLM-as-judge using gpt-4o-mini: groundedness + completeness + unsupported claim flag

## Build Phases
- [x] Phase 0: Scaffolding + CLAUDE.md setup
- [x] Phase 1: Backend core (upload, parse, chunk, embed, Chroma index, /chat endpoint)
- [x] Phase 2: Structured profile (profile generation, candidate_profile.json, site_content.json)
- [x] Phase 3: Frontend shell (Home, About, Projects, chat integration)
- [x] Phase 4: Admin + rebuild flow (upload page, rebuild button, status)
- [x] Phase 5: Evaluation layer (live scoring, batch test set, diagnostics page)
- [x] Phase 6–10: IA rework, persistent public profile, Demo Lab, session-based eval, job agent, project deep dives
- [ ] Phase 11: Recruiter-facing profile finish — expanded career data, more deep dives, public/private separation

## Current Phase
Phase 11 — Recruiter-Facing AI Architect Profile Finish

## Run Commands
Backend (run from backend/ dir, port 8765):
```powershell
cd C:\Users\chase\Documents\career-intelligence-agent\backend
..\.venv\Scripts\python -m uvicorn main:app --reload --host 127.0.0.1 --port 8765
```

Frontend:
```powershell
cd C:\Users\chase\Documents\career-intelligence-agent\frontend
npm run dev
```

Frontend .env.local must have:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8765
```

## Important Conventions
- All secrets in environment variables via Pydantic Settings (never hardcoded)
- Admin routes must be restricted (not public)
- Raw private docs must not be committed if repo is public
- backend/data/*.json must be gitignored if repo is public (contains resume content)
- Pydantic models for all request/response schemas
- FastAPI lifespan events for startup/shutdown
- Keep chunk metadata rich: doc_id, doc_type, chunk_id, section, project_name, source_filename
- Chroma is the vector DB for MVP; Pinecone upgrade not planned for v1
- OpenAI is the sole LLM provider for v1 — do not abstract for multi-provider until v2
- Pin LangGraph at 0.2.28 — do not upgrade without explicit instruction
- All pages with a fixed TopNav (h-16 = 64px) must have at least pt-16 top padding; use pt-24 for breathing room

## Ingestion Conventions
- All source documents in uploads/ must be .md, .pdf, .txt, or .text
- Markdown files should include a YAML front matter block at the top with: doc_type, doc_id, project_name (if applicable), source_filename
- Front matter values override the caller-supplied defaults (from .meta.json or extension fallback)
- Valid doc_type values: resume, project_doc, bio_notes, case_study
- Front matter is stripped before chunking — it never appears in chunk text
- Retrieval k is set to 12 — do not lower without testing for retrieval regressions

## Evidence Gate (Pre-Generation Check)
The chat pipeline runs an evidence sufficiency check after retrieval, before generation. A gpt-4o-mini judge reads the retrieved chunks and scores them on relevance, coverage, and source quality. If `should_answer=False`, the pipeline skips generation entirely and returns a standard "insufficient evidence" message — no fabricated answer, no post-generation evaluation. The gate fails open on error (defaults to `should_answer=True`) so a broken LLM call never silently blocks legitimate answers.

- New Pydantic model: `EvidenceSufficiency` (relevance, coverage, source_quality, conflict_flag, should_answer, explanation)
- New service function: `evaluate_evidence()` in `services/evaluation.py`
- New graph node: `evidence_gate_node` in `chat_graph.py`, wired between retrieve and generate using a conditional edge
- `ChatResponse` now includes `evidence_sufficiency` alongside `scores`
- Frontend right panel shows Evidence Check scores (pre-generation) above Answer Quality scores (post-generation)
- Diagnostics page shows gate block rate, avg relevance/coverage, and per-entry gate status

## Conversation History
- The /chat endpoint accepts `conversation_history: list[{role, content}]` in the request body
- On follow-up turns, `rewrite_query()` uses gpt-4o-mini to resolve pronouns/references into a standalone retrieval query
- The last 3 exchanges (6 messages) of history are injected into the generation LLM call as prior context
- The frontend sends full session history on every request (knowledge-base/page.tsx)

## OpenAI Model Assignments
- Generation (chat answers): gpt-4o
- Query rewriting (follow-up resolution): gpt-4o-mini
- Embeddings: text-embedding-3-small
- Evaluation (LLM-as-judge): gpt-4o-mini

## Session Notes
<!-- Claude: update this section at the end of every session with what was completed and what is next -->

### Sessions 1–6 Summary (2026-03-23)
Full MVP built across 6 sessions: backend core (ingestion, chunking, Chroma, RAG, generation), structured profile synthesis, Next.js frontend shell, admin rebuild flow, Chroma stale-data fix, LLM-as-judge evaluation layer.

### Sessions 7–10 Summary (condensed in CODEX.md — 2026-04-21)
Major rework: IA/naming changes (Career Knowledge Base, Architect Profile, Demo Lab), persistent public profile with seed assets + bootstrap logic, job agent foundation (preferences, top-fit jobs, sources, packs, shortlist, scan history), project deep-dive system with AnimatedReveal component, session-based Answer Quality Check replacing static batch eval, backend port standardized to 8765.

### Session 11 — 2026-04-21
Completed: Pre-career-data code review and layout fixes.
- Fixed content-under-nav bug on 3 pages: `about/page.tsx`, `diagnostics/page.tsx`, `job-preferences/page.tsx` — all used `p-10` (40px) as top padding but the fixed TopNav is 64px, causing the top portion of page content to be hidden. Changed to `px-10 pb-10 pt-24` to match the pattern used by all other pages.
- Reviewed full codebase: all backend routes, LangGraph workflows, frontend pages, types, and API client are consistent and correct.
- Identified remaining gaps: only 1 of many project deep dives populated (`oss-dependency-risk-agent`), gold eval set has only 3 questions, no public/private route separation yet.
- Updated CLAUDE.md with current state; removed stale session history.
Next: Intake Chase's updated career data, ingest into knowledge base, expand project deep dives.

### Session 12 — 2026-04-28
Completed: Landing page rebuild + frontend housekeeping.
- Rebuilt `frontend/app/page.tsx` — full-viewport landing with ConstellationCanvas hero, bottom-anchored headline ("The Career / *Architect.*"), pill CTA linking to /knowledge-base, and 6 glassmorphism cards (2-col mobile / 3-col desktop).
- Created `frontend/components/ConstellationCanvas.tsx` — 44-node animated canvas with mouse proximity glow, edge rendering, and pulsing nodes.
- Created `frontend/components/ConditionalSidebar.tsx` — hides sidebar on `/` only; all other pages unaffected.
- Updated `frontend/app/layout.tsx` — added Instrument Serif via next/font/google (CSS variable `--font-instrument-serif`), swapped Sidebar for ConditionalSidebar.
- Updated `frontend/tailwind.config.ts` — added `surface-dark`, `cream`, `gold` color tokens + `serif` font family.
- Installed `lucide-react`.
- Deleted CODEX.md; merged product vision into CLAUDE.md.
- Wrote full recruiter briefing doc + career data organization guide for RAG ingestion.
Next: Chase to provide updated career data. Ingest files → rebuild index → regenerate profile → refresh seed assets → expand project deep dives.

### Session 13 — 2026-04-28
Completed: Knowledge base population, RAG pipeline hardening, and conversation history.

**Ingestion pipeline fix:**
- Updated `backend/app/services/ingestion.py:extract_text()` to parse YAML front matter from .md files using `_parse_front_matter()`. Front matter is stripped from chunk text; values for doc_type, doc_id, project_name, source_filename override caller-supplied defaults. .meta.json remains a fallback if front matter is absent.

**Knowledge base populated:**
- Ingested 16 career data markdown files across 4 categories: core profile (resume), Booz Allen Hamilton project/work highlight docs, personal project docs, and certification docs.
- All files use YAML front matter for self-describing metadata.
- chase-sinclair-core-profile.md updated to include a Certifications section (all credentials in one place) and a Target Roles / What I'm Looking For section.

**RAG pipeline improvements (35-question test suite across 6 categories):**
- Retrieval k raised from 5 → 12 (`chat_graph.py`) — fixed retrieval failures on vector databases, prompt engineering, private equity projects, React/frontend, AWS certifications.
- Generation system prompt updated: scan every evidence snippet before concluding absence; treat source filenames as evidence; don't conflate absence of mention with absence of experience.
- LLM judge prompt updated: honest "I don't know" answers score 1.0/1.0; source filenames count as grounding evidence; unsupported_claim only fires on positive assertions not in evidence.

**Conversation history (follow-up questions):**
- Added `rewrite_query()` to `generation.py` — uses gpt-4o-mini to resolve pronouns/references ("that", "he", "there") into standalone queries before retrieval. Only fires when history is non-empty.
- Updated `generate_answer()` to accept `conversation_history` and inject last 3 exchanges as HumanMessage/AIMessage pairs before the evidence block.
- Updated `chat_graph.py`: added `retrieval_query` field to `ChatState`; `retrieve_node` calls rewrite; `generate_node` passes history to generator.
- Frontend was already sending conversation_history — it now works end-to-end.

**Known remaining data gaps (add to uploads when content is ready):**
- Education (degree, school, graduation year)
- Security clearance status
- Why Chase is open to new roles / motivation for leaving BAH
- Years of experience per technology
- Lockheed Martin internship detail doc

Next: Add remaining career data docs → rebuild index → expand project deep dives → public/private route separation (Phase 11).
