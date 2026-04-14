import shutil
from pathlib import Path

from app.core.config import PROJECT_ROOT, settings
from app.core.logging import get_logger
from app.services.embedding import get_vectorstore
from app.workflows.ingestion_graph import run_ingestion

logger = get_logger(__name__)

SEED_DIR = PROJECT_ROOT / "backend" / "seed"
SEED_PROFILE_PATH = SEED_DIR / "candidate_profile.default.json"
SEED_SITE_CONTENT_PATH = SEED_DIR / "site_content.default.json"
SEED_CONTEXT_PATH = SEED_DIR / "default_candidate_context.md"
SEED_JOB_PREFERENCES_PATH = SEED_DIR / "job_preferences.default.json"
SEED_JOBS_CACHE_PATH = SEED_DIR / "jobs_cache.default.json"
SEED_JOB_SOURCES_PATH = SEED_DIR / "job_sources.default.json"
SEED_JOB_SCAN_HISTORY_PATH = SEED_DIR / "job_scan_history.default.json"
SEED_JOB_SHORTLIST_PATH = SEED_DIR / "job_shortlist.default.json"
SEED_JOB_SOURCE_PACKS_PATH = SEED_DIR / "job_source_packs.default.json"


def ensure_default_public_assets() -> None:
    """Restore the recruiter-facing default profile assets when runtime files are missing."""
    data_dir = Path(settings.data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)

    _copy_if_missing(SEED_PROFILE_PATH, data_dir / "candidate_profile.json")
    _copy_if_missing(SEED_SITE_CONTENT_PATH, data_dir / "site_content.json")
    _copy_if_missing(SEED_JOB_PREFERENCES_PATH, data_dir / "job_preferences.json")
    _copy_if_missing(SEED_JOBS_CACHE_PATH, data_dir / "jobs_cache.json")
    _copy_if_missing(SEED_JOB_SOURCES_PATH, data_dir / "job_sources.json")
    _copy_if_missing(SEED_JOB_SOURCE_PACKS_PATH, data_dir / "job_source_packs.json")
    _copy_if_missing(SEED_JOB_SCAN_HISTORY_PATH, data_dir / "job_scan_history.json")
    _copy_if_missing(SEED_JOB_SHORTLIST_PATH, data_dir / "job_shortlist.json")

    vectorstore = get_vectorstore()
    try:
        has_documents = vectorstore._collection.count() > 0
    except Exception as exc:
        logger.warning(f"Could not inspect Chroma collection state: {exc}")
        has_documents = True

    if has_documents:
        logger.info("Chroma collection already has documents; skipping default seed ingestion")
        return

    if not SEED_CONTEXT_PATH.exists():
        logger.warning(f"Default seed context missing at {SEED_CONTEXT_PATH}")
        return

    result = run_ingestion(str(SEED_CONTEXT_PATH), "bio_notes", "public-profile")
    if result.get("error"):
        logger.error(f"Default seed ingestion failed: {result['error']}")
        return

    logger.info("Default public knowledge base seeded into Chroma")


def _copy_if_missing(source: Path, destination: Path) -> None:
    if destination.exists():
        return
    if not source.exists():
        logger.warning(f"Default seed file missing at {source}")
        return

    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    logger.info(f"Bootstrapped runtime asset from {source.name} -> {destination}")
