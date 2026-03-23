import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class AboutContent(BaseModel):
    hero_headline: str
    hero_subhead: str
    about_paragraphs: list[str]
    suggested_prompts: list[str]


@router.get("/about-content", response_model=AboutContent)
async def get_about_content():
    """Return about page copy from site_content.json."""
    path = Path(settings.data_dir) / "site_content.json"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Site content not found. Run POST /profile/generate first.",
        )
    data = json.loads(path.read_text(encoding="utf-8"))
    return AboutContent(
        hero_headline=data["hero_headline"],
        hero_subhead=data["hero_subhead"],
        about_paragraphs=data.get("about_paragraphs", []),
        suggested_prompts=data.get("suggested_prompts", []),
    )
