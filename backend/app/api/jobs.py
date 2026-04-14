from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.jobs import (
    JobRefreshResponse,
    JobShortlistEntry,
    JobShortlistUpdate,
    JobSourceConfig,
    TopFitJobsResponse,
)
from app.services.job_sources import (
    load_job_sources,
    refresh_jobs_cache_from_sources,
    save_job_sources,
)
from app.services.jobs import get_top_fit_jobs
from app.services.job_shortlist import load_job_shortlist, save_job_shortlist

router = APIRouter()


@router.get("/jobs/top-fit", response_model=TopFitJobsResponse)
async def top_fit_jobs(
    limit: int = 12,
    recent_days: int | None = 0,
    dedupe: bool = True,
) -> TopFitJobsResponse:
    """Return jobs ranked against the saved preferences and current profile."""
    return get_top_fit_jobs(limit=limit, recent_days=recent_days, dedupe=dedupe)


@router.get("/job-sources", response_model=list[JobSourceConfig])
async def get_job_sources() -> list[JobSourceConfig]:
    """Return tracked Greenhouse and Lever job sources."""
    return load_job_sources()


@router.put("/job-sources", response_model=list[JobSourceConfig])
async def update_job_sources(sources: list[JobSourceConfig]) -> list[JobSourceConfig]:
    """Persist tracked Greenhouse and Lever job sources."""
    return save_job_sources(sources)


@router.post("/jobs/refresh", response_model=JobRefreshResponse)
async def refresh_jobs() -> JobRefreshResponse:
    """Fetch live jobs from enabled sources and update the jobs cache."""
    return refresh_jobs_cache_from_sources()


@router.get("/jobs/shortlist", response_model=list[JobShortlistEntry])
async def get_job_shortlist() -> list[JobShortlistEntry]:
    """Return current shortlist/review queue state for tracked jobs."""
    return list(load_job_shortlist().values())


@router.put("/jobs/{job_id}/shortlist", response_model=JobShortlistEntry)
async def update_job_shortlist(job_id: str, payload: JobShortlistUpdate) -> JobShortlistEntry:
    """Persist shortlist state for a ranked job."""
    valid_statuses = {"new", "review", "shortlisted", "applied", "archived"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid shortlist status")

    entries = load_job_shortlist()
    entry = JobShortlistEntry(
        job_id=job_id,
        status=payload.status,
        note=payload.note.strip(),
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
    entries[job_id] = entry
    save_job_shortlist(entries)
    return entry
