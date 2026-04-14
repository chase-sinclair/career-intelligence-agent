import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app.core.config import settings  # noqa: E402
from app.services.bootstrap import (  # noqa: E402
    SEED_CONTEXT_PATH,
    SEED_PROFILE_PATH,
    SEED_SITE_CONTENT_PATH,
)
from app.services.embedding import clear_collection  # noqa: E402
from app.workflows.ingestion_graph import run_ingestion  # noqa: E402


def main() -> None:
    data_dir = Path(settings.data_dir)
    data_dir.mkdir(parents=True, exist_ok=True)

    shutil.copy2(SEED_PROFILE_PATH, data_dir / "candidate_profile.json")
    shutil.copy2(SEED_SITE_CONTENT_PATH, data_dir / "site_content.json")

    clear_collection()
    result = run_ingestion(str(SEED_CONTEXT_PATH), "bio_notes", "public-profile")
    if result.get("error"):
        raise RuntimeError(result["error"])

    print("Public profile runtime files refreshed from backend/seed")


if __name__ == "__main__":
    main()
