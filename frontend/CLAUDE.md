# Frontend — Career Intelligence Agent

## Stack
Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui

## Pages
- / (Home) — hero, prompt suggestions, chat input, answer panel, evidence panel, score panel
- /about — summary card, skills grid, experience timeline, education, links
- /projects — project cards, tech stack badges, impact bullets
- /admin — file uploader, rebuild index button, regenerate profile button, status panel
- /diagnostics — evaluation test table, answer comparison, run eval button

## API Calls
All API calls go to the FastAPI backend. Base URL in env var NEXT_PUBLIC_API_URL.
- POST /chat → answer + sources + evidence + scores
- GET /profile → structured profile data
- GET /about-content → about page copy
- GET /projects → project card data
- POST /upload → multipart file upload
- POST /ingest/rebuild → trigger ingestion
- POST /profile/generate → regenerate profile
- GET /admin/status → processing status

## Conventions
- Use server components where possible
- Client components only where interactivity requires it
- Tailwind for all styling
- shadcn/ui for UI primitives
- No custom CSS files unless absolutely necessary
