# Architecture Notes

## Data Flow (full cycle)
1. Admin uploads resume and docs → `POST /upload`
2. Backend parses + normalizes text
3. Ingestion LangGraph workflow: extract entities → chunk → embed → index Chroma → update structured profile
4. `candidate_profile.json` and `site_content.json` written to `backend/data/`
5. Frontend renders About/Projects from `site_content.json` via `GET /about-content` and `GET /projects`
6. Recruiter submits question → `POST /chat`
7. Q&A workflow: retrieve top-k chunks → compose grounded answer (GPT-4o) → attach evidence → score with evaluator (GPT-4o-mini LLM-as-judge)
8. Response returned: answer + sources + evidence excerpts + evaluation scores

## Five Layers
| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind | UI, file uploads, chat, admin views |
| API/Backend | FastAPI, Python 3.10+ | Endpoints, file handling, orchestration entry points |
| Orchestration | LangGraph 0.2.28 | Ingestion, profile synthesis, Q&A, evaluation workflows |
| Retrieval | Chroma (MVP) | Embedding storage, vector search, metadata filtering |
| Content/Model | OpenAI (GPT-4o / text-embedding-3-small / gpt-4o-mini) | Extraction, generation, evaluation |
