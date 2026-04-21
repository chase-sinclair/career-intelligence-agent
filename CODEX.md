# Career Intelligence Agent - Codex Project Memory

## Product Direction
Career Intelligence Agent is a recruiter-facing AI career profile for Chase Sinclair. The public experience should help recruiters understand Chase's background through:

- A polished landing page that explains the current app and future platform vision.
- An `Architect Profile`, which is the enhanced resume/profile surface.
- A `Career Knowledge Base`, which is the RAG/chat surface grounded in Chase's resume, projects, and career artifacts.
- A `Projects` section with reusable deep-dive pages for individual projects.

Longer term, this can become a self-serve platform where users upload career artifacts and the app builds their profile, knowledge base, project highlights, and private job-matching workflows. For the current version, the priority is Chase's public recruiter-facing profile. Job-search and workflow-agent pages should eventually be private/user-only, not part of the public recruiter path.

## Tech Stack
- Frontend: Next.js App Router, TypeScript, Tailwind CSS.
- Backend: FastAPI, Pydantic, Uvicorn, LangGraph.
- LLMs: OpenAI only for v1.
- Generation model: `gpt-4o`.
- Embeddings: `text-embedding-3-small`.
- Evaluation: `gpt-4o-mini`.
- Vector store: Chroma for MVP. Pinecone is not planned for v1.
- Persistence: local JSON/data files for MVP, with a future path to Supabase/Postgres.

## Run Commands
Run backend from the backend directory:

```powershell
cd C:\Users\chase\Documents\career-intelligence-agent\backend
..\.venv\Scripts\python -m uvicorn main:app --reload --host 127.0.0.1 --port 8765
```

Run frontend separately:

```powershell
cd C:\Users\chase\Documents\career-intelligence-agent\frontend
npm run dev
```

Local frontend config should point to:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8765
```

## Important Conventions
- Keep `CODEX.md` updated after meaningful project sessions.
- Do not commit private raw uploads or sensitive career documents.
- Preserve Chroma for MVP unless Chase explicitly asks to migrate.
- Admin/demo/upload flows must not overwrite the live public recruiter profile once public/private boundaries are implemented.
- Keep source metadata rich for RAG: document type, project name, company, section, source filename, and visibility where possible.
- Public recruiter pages should focus on the profile, knowledge base, and project evidence.
- Internal pages like `Job Preferences`, `Top Fit Jobs`, and parts of `Demo Lab` should eventually be locked or hidden from public visitors.

## Main Updates Completed

### MVP Foundation
- Built the initial monorepo structure with `frontend`, `backend`, and docs.
- Implemented FastAPI backend endpoints for upload, ingestion rebuild, profile generation, chat, projects, profile, about content, admin status, and evaluations.
- Added LangGraph workflows for ingestion, profile synthesis, recruiter Q&A, and evaluation.
- Added Chroma-backed RAG retrieval, OpenAI embeddings, grounded answer generation, source evidence, and LLM-as-judge scoring.
- Built the original Next.js frontend shell with dashboard/chat, profile/about, projects, admin, and diagnostics pages.

### Local Runtime and Stale Data Fixes
- Diagnosed frontend fetch failures as CORS/port mismatches and standardized local backend testing on `127.0.0.1:8765`.
- Fixed path-resolution bugs where running Uvicorn from `backend/` created `backend/backend/...` runtime folders.
- Removed stale Jane Doe sample data and stale Chroma artifacts from the accidental runtime folder.
- Added upload metadata sidecars so rebuilds preserve document type and project name.
- Added safe Chroma collection clearing before re-ingestion to prevent stale chunks from contaminating answers.

### Persistent Public Profile Mode
- Added committed seed assets for Chase's default public profile:
  - `backend/seed/candidate_profile.default.json`
  - `backend/seed/site_content.default.json`
  - `backend/seed/default_candidate_context.md`
- Added backend bootstrap logic to restore public profile assets and seed Chroma when runtime data is missing.
- Added `backend/scripts/refresh_public_profile.py` as the one-command refresh path for public profile data.
- Confirmed the default profile can auto-load without requiring recruiters to upload documents.

### Information Architecture and Naming
- Reworked the app entry point into a recruiter-oriented landing page.
- Renamed the structured profile surface to `Architect Profile`.
- Moved the chat/RAG experience into `Career Knowledge Base`.
- Renamed the old admin surface to `Demo Lab`.
- Removed the old `Evaluations` page from main navigation and reframed diagnostics as an `Answer Quality Check` linked from the knowledge base.
- Adopted the naming split:
  - Product/platform: `Career Architect`
  - Enhanced profile: `Architect Profile`
  - RAG/chat layer: `Career Knowledge Base`

### Demo Lab
- Replaced the utilitarian admin page with a polished `Demo Lab` landing experience.
- Collapsed upload, rebuild, and regenerate into a more guided demo pipeline.
- Added explanatory copy, demo labeling, and a future demo-video placeholder.
- Still needs a stronger public/private separation so demo uploads never affect Chase's live public profile.

### Answer Quality Check
- Reframed quality checks around the current browser session instead of a static gold question set.
- Stored live Q&A turns in `sessionStorage`.
- Added a session quality page showing groundedness, completeness, source coverage, unsupported-claim rate, and per-answer judge notes.

### Job Agent Work
- Added a private single-user job agent foundation:
  - Job preferences page.
  - Top Fit Jobs page.
  - Job source configuration.
  - Job cache, shortlist, scan history, and source-pack storage.
  - Fit scoring against Chase's profile and saved preferences.
- Added career-ops-inspired discovery logic:
  - Source tiers.
  - Greenhouse, Lever, Ashby, and direct-board support.
  - Refresh deltas.
  - Liveness checks.
  - Shortlist workflow.
  - Discovery packs.
  - Broader AI/data/analytics source universe.
- Improved Top Fit Jobs UX:
  - Two-column role cards.
  - Company cap of two roles in the displayed top list.
  - Top company and title-family summaries.
  - Clearer metrics and pack recommendations.
- Job-agent work is useful but is currently lower priority than completing the public recruiter-facing profile and project pages.

### Project Deep Dives
- Added a reusable animated project-detail system:
  - `frontend/components/AnimatedReveal.tsx`
  - `frontend/lib/project-details.ts`
  - `frontend/app/projects/[slug]/page.tsx`
- Added internal deep-dive routing from the Projects page.
- Built the first deep-dive page for `OSS Dependency Risk Agent`, including scroll-reveal sections for problem, workflow, pipeline, agent design, sample output, semantic search, technical highlights, metrics, lessons learned, and roadmap.
- Future project deep dives should reuse the same data/model pattern.

## Current Phase
Phase 11: Recruiter-Facing AI Architect Profile Finish.

Current objective:
- Incorporate Chase's expanded career data.
- Finalize the Architect Profile page content and structure.
- Improve RAG quality and grounding for recruiter questions.
- Build dedicated project deep dives for each major project.
- Separate public recruiter pages from private platform/job-agent pages.
- Update the landing page so it explains both the current recruiter-facing app and the future self-serve platform vision.

## Career Data Organization Guidance
Best source structure for new career data:

```text
career-data/
  00-core-profile/
  01-role-highlights/
  02-projects/
  03-certifications/
  04-supporting-artifacts/
```

Each project or major initiative should ideally include:

```text
Project name
Problem
My role
Solution
Technical details
Impact
Skills demonstrated
Recruiter takeaway
Evidence notes
```

This structure should improve RAG retrieval because each document can be chunked with clear topical metadata instead of being buried inside one large resume file.

## Next Best Work
- Intake Chase's expanded resume, Booz Allen highlights, certification notes, and individual project documents.
- Convert the new source material into structured project/profile data.
- Refresh the public knowledge-base seed context after the new source material is incorporated.
- Expand the Projects page with additional deep-dive pages.
- Design and implement public/private route boundaries before deployment.

## Last Condensed
2026-04-21 - Condensed prior 27-session detail into this durable project memory.
