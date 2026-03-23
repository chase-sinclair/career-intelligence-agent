import json
from pathlib import Path

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.core.logging import get_logger
from app.models.profile import CandidateProfile, SiteContent

logger = get_logger(__name__)

CONTENT_SYSTEM_PROMPT = """You are a professional copywriter creating UI content for a recruiter-facing career portfolio app.

Given a structured candidate profile, generate polished, recruiter-friendly copy for the website.
Write in third person. Be specific — use real numbers and technologies from the profile. Do not invent details.

Return ONLY a valid JSON object matching this exact schema — no preamble, no markdown:
{
  "hero_headline": "Short punchy headline (8-12 words) that captures the candidate's value proposition",
  "hero_subhead": "One sentence expanding on the headline with the most compelling proof point",
  "about_paragraphs": [
    "Paragraph 1: professional background and core expertise (2-3 sentences)",
    "Paragraph 2: what makes them distinctive — approach, impact, or philosophy (2-3 sentences)"
  ],
  "project_cards": [
    {
      "name": "Project Name",
      "summary": "2-3 sentence description suitable for a project card",
      "tech_stack": ["tech1", "tech2"],
      "impact_bullets": ["Specific measurable impact"],
      "links": {}
    }
  ],
  "suggested_prompts": [
    "Question a recruiter might actually ask (5-8 questions total)"
  ]
}"""


def generate_site_content(profile: CandidateProfile) -> SiteContent:
    """Generate UI-ready site_content.json from a CandidateProfile."""
    llm = ChatOpenAI(
        model=settings.openai_generation_model,
        api_key=settings.openai_api_key,
        temperature=0.3,
    )

    profile_json = profile.model_dump_json(indent=2)

    messages = [
        SystemMessage(content=CONTENT_SYSTEM_PROMPT),
        HumanMessage(content=f"Candidate profile:\n\n{profile_json}"),
    ]

    response = llm.invoke(messages)
    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    content_data = json.loads(raw)
    content = SiteContent(**content_data)

    out_path = Path(settings.data_dir) / "site_content.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(content.model_dump_json(indent=2), encoding="utf-8")

    logger.info(f"Wrote site_content.json to {out_path}")
    return content
