# Career Intelligence Agent — Project Memory

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
  frontend/         → Next.js app (App Router, TS, Tailwind)
  backend/          → FastAPI app
    app/
      api/          → Route handlers
      core/         → Config, logging, shared utilities
      services/     → ingestion, retrieval, generation, evaluation
      workflows/    → LangGraph graphs (ingestion, profile, chat, eval)
      models/       → Pydantic schemas
      evals/        → Test sets and scoring logic
    data/           → candidate_profile.json, site_content.json (gitignored if repo is public)
    uploads/        → Uploaded resumes and docs (always gitignored)
    tests/
  docs/             → Architecture notes, API docs
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

## Core Data Files
- backend/data/candidate_profile.json — Canonical structured profile (name, headline, experience, skills, projects, etc.)
- backend/data/site_content.json — UI-ready copy generated from profile (hero, about, project cards)
- backend/uploads/ — Raw uploaded files (resume PDF, project docs)

## LangGraph Workflows (4 agents)
1. Ingestion Agent — file intake → text extraction → chunking → embedding → indexing → profile update
2. Profile Synthesis Agent — build candidate_profile.json and site_content.json from source materials
3. Recruiter Q&A Agent — retrieve evidence → compose grounded answer → cite sources
4. Evaluation Agent — LLM-as-judge using gpt-4o-mini: compare answer to evidence → score groundedness + completeness → flag unsupported claims

## Build Phases
- [x] Phase 0: Scaffolding + CLAUDE.md setup
- [x] Phase 1: Backend core (upload, parse, chunk, embed, Chroma index, /chat endpoint)
- [x] Phase 2: Structured profile (profile generation, candidate_profile.json, site_content.json)
- [ ] Phase 3: Frontend shell (Home, About, Projects, chat integration)
- [ ] Phase 4: Admin + rebuild flow (upload page, rebuild button, status)
- [ ] Phase 5: Evaluation layer (live scoring, batch test set, diagnostics page)

## Current Phase
Phase 2 complete — ready for Phase 3

## Run Command
Always run uvicorn from the `backend/` directory (not repo root):
```
cd backend && ../.venv/Scripts/python -m uvicorn main:app --reload
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
- OpenAI is the sole LLM provider for v1 — do not abstract for multi-provider until v2
- Pin LangGraph at 0.2.28 — do not upgrade without explicit instruction

## OpenAI Model Assignments
- Generation (chat answers): gpt-4o
- Embeddings: text-embedding-3-small
- Evaluation (LLM-as-judge): gpt-4o-mini

## Session Notes
<!-- Claude: update this section at the end of every session with what was completed and what is next -->
### Session 1 — 2026-03-23
Completed: Phase 0 scaffolding + Phase 1 backend core.
- Phase 0: full monorepo structure, CLAUDE.md files, slash commands, .env.example, .gitignore, requirements.txt, README.md
- Phase 1: ingestion service (PDF/txt/md), chunking (tiktoken, cl100k_base, size by doc_type), embedding+indexing (Chroma via langchain-chroma), retrieval, generation (GPT-4o), LangGraph ingestion and chat workflows, /upload + /ingest/rebuild + /chat endpoints
- All Phase 1 smoke tests passed: upload → ingest → chat returning grounded answers
- Run server from backend/ dir: `cd backend && ../.venv/Scripts/python -m uvicorn main:app --reload`
### Session 2 — 2026-03-23
Completed: Phase 2 — Structured profile.
- Extended models/profile.py with SiteContent and ProjectCard schemas
- services/profile_builder.py — GPT-4o extracts CandidateProfile from Chroma chunks, writes candidate_profile.json
- services/content_generator.py — GPT-4o generates UI copy (hero, about, project cards, suggested prompts), writes site_content.json
- workflows/profile_graph.py — LangGraph: retrieve_all → build_profile → generate_content
- api/profile.py — POST /profile/generate, GET /profile
- api/about.py — GET /about-content
- api/projects.py — GET /projects
- All Phase 2 smoke tests passed
Next: Phase 3 — Frontend shell (Next.js App Router, Tailwind, shadcn/ui, Home/About/Projects pages)
