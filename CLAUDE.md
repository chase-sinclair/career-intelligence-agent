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
  CODEX.md          → Detailed project history and product direction
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
1. Ingestion Agent — file intake → text extraction → chunking → embedding → indexing
2. Profile Synthesis Agent — build candidate_profile.json and site_content.json from source materials
3. Recruiter Q&A Agent — retrieve evidence → compose grounded answer → cite sources
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

## OpenAI Model Assignments
- Generation (chat answers): gpt-4o
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
