# Career Intelligence Agent — Project Memory

## Product Vision
The current priority is Chase's public recruiter-facing profile (landing page, Architect Profile, Career Knowledge Base, Projects). Longer term, this becomes a self-serve platform where any user uploads career artifacts and the app builds their profile, knowledge base, project highlights, and private job-matching workflows. Job-search and job-agent pages should eventually be private/user-only, not part of the public recruiter path.

## Project Overview
A recruiter-facing AI Career Intelligence App. Recruiters can ask questions about Chase Sinclair's background, skills, and projects. Answers are grounded in a RAG pipeline built from a resume and career artifacts. Single-user MVP designed to demonstrate RAG, agentic workflow design, orchestration, and LLM output evaluation.

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Python 3.10+, FastAPI, Uvicorn, Pydantic
- Orchestration: LangGraph 0.2.28
- LLM Provider: OpenAI (GPT-4o for generation, text-embedding-3-small for embeddings, gpt-4o-mini for evaluation)
- Vector DB: Chroma
- Schemas/Settings: Pydantic Settings (env-based config)
- Storage: Local file storage + JSON (dev), upgradeable to Supabase/Postgres

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
Public recruiter-facing routes (in sidebar nav):
- /                       → Landing page (ConstellationCanvas hero, 6 entry cards, no sidebar)
- /about                  → Architect Profile (structured resume view)
- /knowledge-base         → Ask About Chase (RAG chat + right panel: evidence check + answer quality + sources)
- /projects               → Project cards grid (8 cards, filter pills, deep-dive overlay)
- /projects/[slug]        → Redirects to /projects?open=<slug> — auto-opens overlay for that project
- /projects/deallens      → Dedicated full-screen product demo page (8 story sections, interactive hotspots, gallery, CTA)
- /projects/peai-chat-assistant       → Standalone case study (8 sections, per-section graphics, expandable citations)
- /projects/peai-book-ml-model-matrix → Standalone case study (7 sections, one sticky AbilityGrid in 3 modes)
- /how-it-works           → How It Works (pipeline explanation, tech stack, product vision)

Hidden routes (functional, not in nav):
- /diagnostics            → Answer Quality Check (session-based eval, linked from knowledge-base panel)
- /job-preferences        → Job preferences editor
- /top-fit-jobs           → Ranked jobs with fit scoring and shortlist
- /admin                  → Demo Lab (upload, rebuild, regenerate)

## Project Cards System
Eight cards in `frontend/app/projects/page.tsx`:
1. KB Agent — Proposal Intelligence Platform (rag)
2. RentalShield NYC (full-stack)
3. AI Venture Architect (multi-agent)
4. PEAI Chat Assistant (rag) — **standalone route**
5. DealLens — PE CIM Intelligence Workflow (workflow) — **standalone route**
6. PEAI Book — ML Model Matrix (published) — **standalone route**
7. Career Radar — Labor Market Intelligence (full-stack)
8. OSS Dependency Risk Agent (data-eng)

Each card has a `bgImage` prop pointing to `frontend/public/images/projects/<slug>.(png|jpg)`.

Cards open the deep-dive overlay (`ProjectDeepDive`) **unless** their slug is in the
`STANDALONE_ROUTES` set at the top of `projects/page.tsx`. Those slugs own a full page under
`app/projects/<slug>/` and the card click calls `router.push('/projects/<slug>')` instead.
A hand-written `?open=<slug>` for a standalone slug also redirects to the real page.
Currently: `deallens`, `peai-chat-assistant`, `peai-book-ml-model-matrix`.

**Route precedence:** a static segment beats the dynamic `[slug]` catch-all in the App Router,
so standalone pages are authoritative automatically. `[slug]/page.tsx` needs no change when
adding one.

Deep-dive overlay content lives in `frontend/lib/project-details.ts`.

## DealLens Product Demo Page
`frontend/app/projects/deallens/page.tsx` — self-contained, full-screen (position: fixed, z-index: 60).
- Sticky scroll progress bar (gold gradient)
- Sticky back nav ("← Back to Projects")
- 8 story sections with useInView scroll animations (split and full-width alternating)
- Section 3: Zapier workflow diagram with 13 interactive pulsing hotspots
- Section 4: Airtable workspace with 8 interactive pulsing hotspots
- Section 7: Slack/memo image with 3 annotation pill overlays
- Section 8: closing attribution strip
- Section 9: gallery (14 screenshots, thumbnail strip with prev/next, click-to-select)
- Section 10: CTA (GitHub link + scroll-to-top)

Image assets live in `frontend/public/images/deallens/` (8 section images) and
`frontend/public/images/deallens/gallery/` (14 gallery images). All placed and committed.

## PEAI Standalone Case Study Pages
Both follow the DealLens routing precedent and the How It Works visual system. Server
component exporting `metadata`, rendering one client component. Page shell is `main.pl-5`
with an inner `px-6 md:px-10 pb-24 pt-24 mx-auto w-full max-w-[1280px]`. CSS is scoped
`<style jsx global>` under a page-root class (`.peai-chat`, `.peai-book`), so nothing leaks
to other routes.

**PEAI Chat Assistant** — `app/projects/peai-chat-assistant/page.tsx` +
`components/peai-chat/PeaiChatPage.tsx`, data in `lib/peai-chat-data.ts`.
Eight sections, each owning its own graphic. **No sticky mechanic by design** — do not add one.
The only dark element is the hero screenshot (`public/peai-chat/homepage-chat.png`), a real
product capture. Citation strings and metadata field names in the data file are verbatim
product output and must not be reworded.
**Do not name the generation model anywhere** — it is claimed three ways across sources and
is unresolved.

**PEAI Book, ML Model Matrix** — `app/projects/peai-book-ml-model-matrix/page.tsx` +
`components/peai-book/PeaiBookPage.tsx` and `AbilityGrid.tsx`, data in `lib/peai-book-data.ts`.
Seven sections. One `<AbilityGrid>` instance carries §4–6 in three modes (`intro` / `explore` /
`worked`); it is never unmounted between modes, so cells re-light in place.
Assets in `public/peai/` (cover + two page scans; the p8 periodic table is reference only and
is not shipped).

Three things on this page are easy to break:
- **Mode ownership is measured per frame**, not from IntersectionObserver. Each narrative
  section extends 42vh past its text, so several boxes intersect at once and the last in
  document order would win. Distance from an anchor line to each section's inner `.owns` block
  picks one winner.
- **`.chapter` must become `display: block` under 1000px.** A sticky grid item's containing
  block is its own grid row, which gives it no travel. `.gridcol` is first in source order and
  placed with explicit `grid-column` / `grid-row` on desktop, because `order` does nothing once
  the container is a block.
- **The compact `@media (max-width: 1000px)` block must stay LAST in the stylesheet.** At equal
  specificity the later rule wins, so mid-sheet it silently fails to override the rules defined
  below it while appearing to work.

Facts fixed on this page, do not regress: role is **authored the matrix + peer reviewer**
(never author, co-author, or chapter), year is **2026**, and the matrix strings are verbatim
from the book (no RNNs, ARIMA, GPT or few-shot). The author-is-Chase's-father line appears
**exactly once**, inside §2 "The background".

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
- [x] Phase 11: Knowledge base population, RAG hardening, conversation history
- [x] Phase 12: Product identity pivot — public nav trimmed; job/admin pages hidden; "How It Works" added; landing page rebuilt
- [x] Phase 13: Project cards overhaul — 3D tilt/parallax cards, bgImage support, deep-dive overlay system (all 6 projects), DealLens card, sidebar flicker fix
- [x] Phase 14: DealLens product demo page — dedicated /projects/deallens with 8 story sections, interactive hotspots, scroll progress, gallery
- [x] Phase 15: PEAI standalone case study pages (Chat + Book), shared typography atoms
- [ ] Phase 16: Public/private route separation (gate /admin, /top-fit-jobs, /job-preferences)

## Current Phase
Phase 15 complete and merged to main. Both PEAI case study pages are live, DealLens image
assets are placed, and the knowledge base docs for both PEAI projects have been rewritten and
re-indexed.

Open: **public/private route separation** — `/admin`, `/top-fit-jobs` and `/job-preferences`
are hidden from nav but still reachable by URL, and `/admin` can trigger ingestion. This
matters before any public deployment. There is no Vercel or Netlify preview wired up to this
repo as of November 2026 (no config, no GitHub App, no deployment checks on PRs).

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

Backend venv uses Python 3.11.9 (not 3.13 — no pre-built numpy wheels exist for 3.13). Venv path: `C:\Users\chase\Documents\career-intelligence-agent\.venv`.

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
- Full-screen overlay pages (ProjectDeepDive, DealLens demo) use position: fixed, inset: 0, z-index: 60
- `Eyebrow`, `Heading2` and `Divider` live in `frontend/components/shared/typography.tsx` and are
  imported by how-it-works and both PEAI case study pages. Import them, never redefine them
- Long-form editorial pages scope their CSS with `<style jsx global>` under a page-root class
  rather than adding to globals.css, so one page's rules cannot reach another route
- No new color literals on editorial pages — use the existing tokens (`--accent`, `--accent-ink`,
  `--panel`, `--panel-2`, `--panel-solid`, `--ink-rgb`, `--accent-rgb`)
- `--accent` is dark: text on an accent fill must be `var(--accent-ink)`, not ink
- Scroll reveals are one shot. `useInView` never resets; for staged sequences use an observer
  that disconnects after firing. Nothing should replay on scroll back
- No em dashes in page prose. Exempt: verbatim product strings, matrix data, and project
  titles like "PEAI Book — ML Model Matrix", which is the site-wide title convention

## Ingestion Conventions
- All source documents in uploads/ must be .md, .pdf, .txt, or .text
- Markdown files should include a YAML front matter block at the top with: doc_type, doc_id, project_name (if applicable), source_filename
- Front matter values override the caller-supplied defaults (from .meta.json or extension fallback)
- Valid doc_type values: resume, project_doc, bio_notes, case_study
- Front matter is stripped before chunking — it never appears in chunk text
- Retrieval k is set to 12 — do not lower without testing for retrieval regressions

## Evidence Gate (Pre-Generation Check)
The chat pipeline runs an evidence sufficiency check after retrieval, before generation. A gpt-4o-mini judge reads the retrieved chunks and scores them on relevance, coverage, and source quality. If `should_answer=False`, the pipeline skips generation entirely and returns a standard "insufficient evidence" message — no fabricated answer, no post-generation evaluation. The gate fails open on error (defaults to `should_answer=True`) so a broken LLM call never silently blocks legitimate answers.

- Pydantic model: `EvidenceSufficiency` (relevance, coverage, source_quality, conflict_flag, should_answer, explanation)
- Service function: `evaluate_evidence()` in `services/evaluation.py`
- Graph node: `evidence_gate_node` in `chat_graph.py`, wired between retrieve and generate using a conditional edge
- `ChatResponse` includes `evidence_sufficiency` alongside `scores`
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

### Sessions 1–12 Summary (2026-03-23 → 2026-04-28)
Full backend and frontend built: ingestion pipeline, Chroma RAG, LangGraph workflows, evaluation layer, structured profile synthesis, landing page rebuild (ConstellationCanvas), knowledge base population (16 career docs), RAG hardening (k=12, evidence gate, conversation history), product identity pivot (recruiter-only nav, How It Works page).

### Session 13 — 2026-04-28
Completed: Knowledge base population, RAG pipeline hardening, conversation history.
- Ingestion pipeline updated to parse YAML front matter from .md files
- 16 career data markdown files ingested across 4 categories
- Retrieval k raised from 5 → 12; generation and judge prompts hardened
- `rewrite_query()` added to resolve follow-up pronouns before retrieval
- Conversation history injected into generation (last 3 exchanges)

### Session 14 — 2026-05-03
Completed: Project cards overhaul, deep-dive overlay system, DealLens card, sidebar fix.
- `ProjectCard.tsx` rebuilt with 3D tilt/parallax on hover, `bgImage` prop for background images
- `ProjectDeepDive.tsx` created — overlay slides up over the project grid, animated reveal, prev/next navigation, all 6 projects populated in `lib/project-details.ts`
- DealLens added as project card #05 (PEAI Book moved to #06)
- `AI Automation` filter added to projects page
- Sidebar flicker fix: `wrapperWide` state outlives `isExpanded` by 250ms, eliminating hover jitter during close animation
- `frontend/app/projects/[slug]/page.tsx` created — redirects to `/projects?open=<slug>`

### Session 15 — 2026-05-03/04
Completed: Background images wired to project cards, DealLens product demo page.
- `bgImage` paths added to all 6 project entries in `projects/page.tsx` (mixed .png/.jpg extensions)
- DealLens routing exception: card click calls `router.push('/projects/deallens')` instead of overlay
- `frontend/app/projects/deallens/page.tsx` created — self-contained full-screen product demo:
  - 8 story sections (split + full-width) with useInView scroll animations
  - Sections 3 + 4: interactive pulsing hotspot overlays (13 + 8 hotspots) with hover tooltips
  - Section 7: image annotation pill overlays
  - Section 8: attribution closing strip
  - Section 9: 14-image gallery with thumbnail carousel and prev/next
  - Section 10: GitHub CTA + scroll-to-top
  - Sticky scroll progress bar + sticky back nav

All image assets listed as pending in this session have since been placed and committed.

### Sessions 16–17 — October 2026
Recorded in detail in `IMPLEMENTATION_PROGRESS.md`; summarized here so the phase log is not
misleading. How It Works rebuilt into the chapter/scene layout it has now. DealLens second and
third passes (hero, journey, scenes, evidence, accessibility and layout-boundary work). Eval
coverage added for the two PEAI projects. Two cards added to the projects grid, taking it from
6 to 8: Career Radar and OSS Dependency Risk Agent.

### Session 18 — 2026-11-03/04 (cloud session)
Completed: both PEAI standalone case study pages, built from design handoffs and merged to main.

- `components/shared/typography.tsx` created. `Eyebrow`, `Heading2` and `Divider` lifted out of
  `how-it-works/page.tsx` and imported by all three editorial pages. How It Works' rendered
  output verified byte identical before and after.
- **PEAI Chat Assistant** page (PR #1, merged `b5bd8bd`). Eight sections, per-section graphics,
  no sticky. Card #04 stack corrected to Python and Flask; it had claimed Next.js.
- **PEAI Book, ML Model Matrix** page (PR #2, merged `1889ad1`). Seven sections, one AbilityGrid
  in three modes with measured mode ownership. Card #06 role claim and year corrected.
- `STANDALONE_ROUTES` added to `projects/page.tsx` so standalone slugs bypass the overlay.
  Confirmed the static segment beats `[slug]`, so `[slug]` needed no change.
- Verified with 45 browser checks on the Book page and 23 on the Chat page against production
  builds, plus build and typecheck. Note: this repo has **no ESLint config**, so `npm run lint`
  is not runnable; lint was run from an isolated ESLint install and should be reported that way.
- Design handoffs arrive as zips and extract to `design_handoff_*/`. Both that pattern and
  `*.zip` are gitignored; they hold unpublished book scans and must never be committed.

Next: public/private route separation (Phase 16). Deliberately deferred, not forgotten.
