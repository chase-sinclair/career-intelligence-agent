from fastapi import APIRouter

from app.models.jobs import JobPreferences
from app.services.job_preferences import load_job_preferences, save_job_preferences

router = APIRouter()


@router.get("/job-preferences", response_model=JobPreferences)
async def get_job_preferences() -> JobPreferences:
    """Return the saved single-user job-search preferences."""
    return load_job_preferences()


@router.put("/job-preferences", response_model=JobPreferences)
async def update_job_preferences(preferences: JobPreferences) -> JobPreferences:
    """Persist the saved single-user job-search preferences."""
    return save_job_preferences(preferences)

