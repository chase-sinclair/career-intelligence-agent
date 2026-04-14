from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import get_logger
from app.services.bootstrap import ensure_default_public_assets
from app.services.embedding import get_vectorstore

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize Chroma client
    logger.info("Initializing Chroma vector store...")
    get_vectorstore()
    ensure_default_public_assets()
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down.")


app = FastAPI(title="Career Intelligence Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import upload, ingest, chat, profile, about, projects, admin, eval, job_preferences, jobs  # noqa: E402
app.include_router(upload.router)
app.include_router(ingest.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(about.router)
app.include_router(projects.router)
app.include_router(admin.router)
app.include_router(eval.router)
app.include_router(job_preferences.router)
app.include_router(jobs.router)


@app.get("/health")
def health():
    return {"status": "ok"}
