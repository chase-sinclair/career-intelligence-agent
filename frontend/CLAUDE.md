# Frontend — Career Intelligence Agent

## Stack
Next.js App Router, TypeScript, Tailwind CSS

## Pages
- /                  → Landing page (hero + 4 recruiter-facing entry cards)
- /about             → Architect Profile (structured resume view: skills, timeline, education)
- /knowledge-base    → Ask About Chase (RAG chat, right panel with evidence check + answer quality + source evidence)
- /projects          → Project cards grid
- /projects/[slug]   → Project deep dives (AnimatedReveal scroll sections, data from project-details.ts)
- /how-it-works      → How It Works (static page: pipeline explanation, tech stack, product vision)
- /diagnostics       → Answer Quality Check (session-based, reads from sessionStorage — linked from knowledge-base panel)
- /job-preferences   → Job preferences editor (HIDDEN from nav — backend intact)
- /top-fit-jobs      → Ranked jobs with fit scoring, shortlist workflow (HIDDEN from nav — backend intact)
- /admin             → Demo Lab (HIDDEN from nav — backend intact)

## API Calls
All API calls go to the FastAPI backend. Base URL in env var NEXT_PUBLIC_API_URL (default: http://127.0.0.1:8765).
- POST /chat → answer + sources + evidence + scores
- GET /profile → structured profile data
- GET /about-content → about page copy
- GET /projects → project card data
- POST /upload → multipart file upload
- POST /ingest/rebuild → trigger ingestion
- POST /profile/generate → regenerate profile
- GET /admin/status → processing status
- GET/PUT /job-preferences → job preferences
- GET /jobs/top-fit → ranked job list
- GET/PUT /job-sources → ATS source management
- GET /job-source-packs → discovery pack presets
- POST /job-source-packs/{id}/apply → apply a pack
- POST /jobs/refresh → live job refresh
- GET/PUT /jobs/shortlist + /jobs/{id}/shortlist → shortlist management

## Navigation (Public — Recruiter Facing)
Sidebar shows 5 items only:
- Overview → /
- Architect Profile → /about
- Ask About Chase → /knowledge-base
- Projects → /projects
- How It Works → /how-it-works

Hidden routes (/job-preferences, /top-fit-jobs, /admin, /diagnostics) are still functional — just not in the sidebar or homepage cards.

## Layout Convention
- Sidebar is fixed, 64px (w-64) wide on the left
- TopNav is fixed, 64px (h-16) tall at the top
- All page main content must use at least pt-24 top padding to clear the nav
- knowledge-base has a fixed right panel (w-80), so main uses mr-80
- knowledge-base TopNav uses hasRightPanel prop (right-80 instead of right-0)

## Conventions
- All interactive pages use 'use client'
- Tailwind for all styling — no custom CSS
- No shadcn/ui components currently active (plain Tailwind components throughout)
- TopNav receives subtitle prop for page name; landing page has no TopNav
- Custom Tailwind tokens: primary, secondary, tertiary, surface, on-surface, surface-container-low/high/highest/lowest, outline-variant, etc.
