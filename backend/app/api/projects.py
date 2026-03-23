import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.models.profile import ProjectCard

router = APIRouter()


@router.get("/projects", response_model=list[ProjectCard])
async def get_projects():
    """Return project cards from site_content.json."""
    path = Path(settings.data_dir) / "site_content.json"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Site content not found. Run POST /profile/generate first.",
        )
    data = json.loads(path.read_text(encoding="utf-8"))
    return [ProjectCard(**card) for card in data.get("project_cards", [])]
