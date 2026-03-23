from pydantic import BaseModel


class ExperienceEntry(BaseModel):
    company: str
    title: str
    start_date: str
    end_date: str | None = None
    description: str
    impact_bullets: list[str] = []


class ProjectEntry(BaseModel):
    name: str
    summary: str
    tech_stack: list[str] = []
    impact_bullets: list[str] = []
    links: dict[str, str] = {}


class CandidateProfile(BaseModel):
    name: str
    headline: str
    summary: str
    experience: list[ExperienceEntry] = []
    skills: list[str] = []
    tools: list[str] = []
    education: list[dict] = []
    certifications: list[str] = []
    projects: list[ProjectEntry] = []
    leadership_examples: list[str] = []
    quantified_impacts: list[str] = []


class ProjectCard(BaseModel):
    name: str
    summary: str
    tech_stack: list[str] = []
    impact_bullets: list[str] = []
    links: dict[str, str] = {}


class SiteContent(BaseModel):
    hero_headline: str
    hero_subhead: str
    about_paragraphs: list[str] = []
    project_cards: list[ProjectCard] = []
    suggested_prompts: list[str] = []
