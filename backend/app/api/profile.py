import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger
from app.models.profile import CandidateProfile
from app.workflows.profile_graph import run_profile_generation

logger = get_logger(__name__)
router = APIRouter()


class GenerateResponse(BaseModel):
    status: str
    profile_path: str | None = None
    content_path: str | None = None
    error: str | None = None


@router.post("/profile/generate", response_model=GenerateResponse)
async def generate_profile():
    """Run the Profile Synthesis workflow to regenerate candidate_profile.json and site_content.json."""
    result = run_profile_generation()
    return GenerateResponse(**result)


@router.get("/profile", response_model=CandidateProfile)
async def get_profile():
    """Return the structured candidate profile."""
    path = Path(settings.data_dir) / "candidate_profile.json"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Profile not found. Run POST /profile/generate first.",
        )
    return CandidateProfile(**json.loads(path.read_text(encoding="utf-8")))
