import json
from pathlib import Path

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.core.logging import get_logger
from app.models.profile import CandidateProfile

logger = get_logger(__name__)

PROFILE_SYSTEM_PROMPT = """You are an expert at extracting structured career profiles from resume and career document text.

Extract a complete, accurate candidate profile from the provided document excerpts.
Use ONLY information present in the excerpts — do not invent or infer details not stated.
For any field where information is not available, use an empty list or empty string.

Return ONLY a valid JSON object matching this exact schema — no preamble, no markdown:
{
  "name": "Full Name",
  "headline": "One-line professional title/positioning",
  "summary": "2-3 sentence professional summary",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "start_date": "YYYY or Month YYYY",
      "end_date": "YYYY or Month YYYY or null if current",
      "description": "Brief role description",
      "impact_bullets": ["quantified achievement 1", "quantified achievement 2"]
    }
  ],
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "education": [{"institution": "...", "degree": "...", "year": "..."}],
  "certifications": ["cert1"],
  "projects": [
    {
      "name": "Project Name",
      "summary": "What it does and why it matters",
      "tech_stack": ["tech1", "tech2"],
      "impact_bullets": ["impact1"],
      "links": {}
    }
  ],
  "leadership_examples": ["Led X to achieve Y"],
  "quantified_impacts": ["Reduced X by Y%", "Grew Z from A to B"]
}"""


def build_profile(chunks: list[dict]) -> CandidateProfile:
    """Extract a structured CandidateProfile from document chunks using GPT-4o."""
    if not chunks:
        raise ValueError("No chunks provided — run ingestion first.")

    combined_text = "\n\n---\n\n".join(
        f"[{c['metadata'].get('source_filename', 'unknown')} | {c['metadata'].get('doc_type', '')}]\n{c['text']}"
        for c in chunks
    )

    llm = ChatOpenAI(
        model=settings.openai_generation_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )

    messages = [
        SystemMessage(content=PROFILE_SYSTEM_PROMPT),
        HumanMessage(content=f"Document excerpts:\n\n{combined_text}"),
    ]

    response = llm.invoke(messages)
    raw = response.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    profile_data = json.loads(raw)
    profile = CandidateProfile(**profile_data)

    out_path = Path(settings.data_dir) / "candidate_profile.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(profile.model_dump_json(indent=2), encoding="utf-8")

    logger.info(f"Wrote candidate_profile.json to {out_path}")
    return profile
