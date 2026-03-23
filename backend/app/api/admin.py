from datetime import datetime
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

SUPPORTED_EXTENSIONS = {".pdf", ".md", ".txt", ".text"}


class AdminStatus(BaseModel):
    upload_dir_exists: bool
    upload_file_count: int
    uploaded_files: list[str]
    chroma_index_exists: bool
    profile_exists: bool
    site_content_exists: bool
    profile_last_modified: str | None
    site_content_last_modified: str | None


def _iso_mtime(path: Path) -> str | None:
    if path.exists():
        return datetime.fromtimestamp(path.stat().st_mtime).isoformat()
    return None


@router.get("/admin/status", response_model=AdminStatus)
def get_admin_status() -> AdminStatus:
    """Return current state of the upload directory, Chroma index, and generated data files."""
    upload_dir = Path(settings.upload_dir)
    data_dir = Path(settings.data_dir)
    chroma_dir = Path(settings.chroma_persist_dir)

    if upload_dir.exists():
        files = [
            f for f in upload_dir.iterdir()
            if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS
        ]
        uploaded_files = sorted(f.name for f in files)
    else:
        uploaded_files = []

    profile_path = data_dir / "candidate_profile.json"
    site_content_path = data_dir / "site_content.json"

    return AdminStatus(
        upload_dir_exists=upload_dir.exists(),
        upload_file_count=len(uploaded_files),
        uploaded_files=uploaded_files,
        chroma_index_exists=chroma_dir.exists(),
        profile_exists=profile_path.exists(),
        site_content_exists=site_content_path.exists(),
        profile_last_modified=_iso_mtime(profile_path),
        site_content_last_modified=_iso_mtime(site_content_path),
    )
