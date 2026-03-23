# Career Intelligence Agent

A recruiter-facing AI app that answers questions about my professional background using evidence-grounded retrieval from my resume and career artifacts. Built to demonstrate four production AI capabilities: RAG pipeline with visible sources, agentic LangGraph workflows, multi-agent orchestration, and live LLM output evaluation using an LLM-as-judge pattern.

## Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Python 3.10+, FastAPI, LangGraph 0.2.28
- **Vector DB:** Chroma
- **LLM Provider:** OpenAI (gpt-4o, text-embedding-3-small, gpt-4o-mini)

## Setup

1. Copy `.env.example` to `.env` and fill in your `OPENAI_API_KEY`
2. Install backend deps: `pip install -r backend/requirements.txt`
3. Install frontend deps: `cd frontend && npm install`
4. Run backend: `uvicorn backend.main:app --reload`
5. Run frontend: `cd frontend && npm run dev`
