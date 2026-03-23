# Backend — Career Intelligence Agent

## Stack
Python 3.10+, FastAPI, Uvicorn, Pydantic, LangGraph==0.2.28, Chroma

## LLM Provider: OpenAI
- Generation: gpt-4o (via langchain-openai ChatOpenAI)
- Embeddings: text-embedding-3-small (via langchain-openai OpenAIEmbeddings)
- Evaluation: gpt-4o-mini (via langchain-openai ChatOpenAI, separate client instance)
- API key loaded via Pydantic Settings from OPENAI_API_KEY env var — never hardcoded

## Module Responsibilities
- api/          → FastAPI route handlers only. No business logic here.
- services/     → All business logic: ingestion, chunking, embedding, retrieval, generation, evaluation
- workflows/    → LangGraph graphs for each agent workflow
- models/       → Pydantic schemas for all request/response/data models
- core/         → Config (Pydantic Settings), logging, shared utilities
- evals/        → Gold test set (recruiter_questions.json) + scoring logic

## Chunking Strategy
- Resume: smaller chunks (~200-300 tokens), preserve section structure
- Project docs: larger chunks (~400-500 tokens)
- All chunks tagged with: doc_id, doc_type, section, project_name, source_filename
- Supported doc_types: resume, project_doc, bio_notes, case_study

## Retrieval Strategy
- Default: top-k similarity search from Chroma
- Filtered retrieval by doc_type or project_name when query implies it
- No complex reranking in v1 — basic similarity is sufficient unless answers feel weak

## Evaluation Design
- Live: every /chat response triggers a gpt-4o-mini LLM-as-judge call
- Judge receives: the generated answer + the retrieved evidence chunks
- Judge returns structured JSON: groundedness score, completeness score, unsupported_claim flag, explanation
- Batch: gold set of 15-25 recruiter questions in evals/recruiter_questions.json
- See Section 10 of the project outline for full judge prompt and response schema

## Environment Variables (via Pydantic Settings)
- OPENAI_API_KEY — required, never hardcoded
- OPENAI_GENERATION_MODEL=gpt-4o
- OPENAI_EMBEDDING_MODEL=text-embedding-3-small
- OPENAI_EVAL_MODEL=gpt-4o-mini
- CHROMA_PERSIST_DIR
- UPLOAD_DIR
- DATA_DIR (for candidate_profile.json and site_content.json)
- ALLOWED_ORIGINS (comma-separated, for CORS middleware)

## Conventions
- No business logic in route handlers
- All schemas defined in models/
- FastAPI lifespan events for initializing Chroma client at startup
- CORS middleware configured at app startup using ALLOWED_ORIGINS env var
- Never commit API keys or raw private docs
- Pin LangGraph at 0.2.28 in requirements.txt — do not upgrade without explicit instruction
