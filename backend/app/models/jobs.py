from pydantic import BaseModel, Field


class JobPreferences(BaseModel):
    target_titles: list[str] = Field(default_factory=list)
    exclude_title_keywords: list[str] = Field(default_factory=list)
    target_keywords: list[str] = Field(default_factory=list)
    preferred_locations: list[str] = Field(default_factory=list)
    remote_preference: str = "remote_or_hybrid"
    salary_floor: int | None = None
    target_seniority: list[str] = Field(default_factory=list)
    preferred_industries: list[str] = Field(default_factory=list)
    preferred_company_types: list[str] = Field(default_factory=list)
    tech_focus_areas: list[str] = Field(default_factory=list)
    public_sector_interest: str = ""
    work_authorization_notes: str = ""
    avoid_keywords: list[str] = Field(default_factory=list)
    stretch_roles_allowed: bool = True


class JobPosting(BaseModel):
    id: str
    source: str
    source_label: str = ""
    title: str
    company: str
    location: str
    posted_at: str | None = None
    salary_text: str | None = None
    description: str
    employment_type: str | None = None
    remote_type: str | None = None
    normalized_tags: list[str] = Field(default_factory=list)
    url: str | None = None
    fetched_at: str | None = None
    discovery_mode: str = "ats_api"
    priority_tier: int = 1
    liveness_status: str = "live"
    liveness_note: str = ""
    liveness_checked_at: str | None = None


class JobSourceConfig(BaseModel):
    id: str
    name: str
    platform: str
    identifier: str
    discovery_mode: str = "ats_api"
    priority_tier: int = 1
    enabled: bool = True
    notes: str = ""


class JobSourcePack(BaseModel):
    id: str
    name: str
    description: str
    recommended_for: list[str] = Field(default_factory=list)
    sources: list[JobSourceConfig] = Field(default_factory=list)


class JobScanHistoryEntry(BaseModel):
    key: str
    url: str | None = None
    title: str
    company: str
    source: str
    first_seen: str
    last_seen: str
    status: str = "active"


class JobFitResult(BaseModel):
    job: JobPosting
    overall_score: float
    profile_match_score: float
    preference_match_score: float
    strengths: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    why_it_fits: str
    likely_resume_angles: list[str] = Field(default_factory=list)
    match_bucket: str
    shortlist_status: str = "new"
    shortlist_note: str = ""


class JobShortlistEntry(BaseModel):
    job_id: str
    status: str = "new"
    note: str = ""
    updated_at: str


class JobShortlistUpdate(BaseModel):
    status: str
    note: str = ""


class TopFitJobsResponse(BaseModel):
    total_jobs: int
    generated_for: str
    live_jobs_count: int = 0
    uses_seed_fallback: bool = False
    brief_headline: str = ""
    brief_summary: str = ""
    new_since_refresh_count: int = 0
    best_fit_count: int = 0
    strong_consideration_count: int = 0
    stretch_count: int = 0
    ready_to_review_count: int = 0
    shortlisted_count: int = 0
    applied_count: int = 0
    top_matches: list[JobFitResult] = Field(default_factory=list)


class JobRefreshResponse(BaseModel):
    fetched_jobs: int
    enabled_sources: int
    source_errors: list[str] = Field(default_factory=list)
    used_seed_fallback: bool = False
    added_jobs: int = 0
    dropped_jobs: int = 0
    unchanged_jobs: int = 0
    added_previews: list[str] = Field(default_factory=list)
    dropped_previews: list[str] = Field(default_factory=list)
    verified_live_jobs: int = 0
    unverified_jobs: int = 0
