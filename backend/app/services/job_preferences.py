import json
from pathlib import Path

from app.core.config import settings
from app.models.jobs import JobPreferences


JOB_PREFERENCES_FILENAME = "job_preferences.json"


def get_job_preferences_path() -> Path:
    return Path(settings.data_dir) / JOB_PREFERENCES_FILENAME


def load_job_preferences() -> JobPreferences:
    path = get_job_preferences_path()
    if not path.exists():
        return JobPreferences()
    return JobPreferences(**json.loads(path.read_text(encoding="utf-8")))


def save_job_preferences(preferences: JobPreferences) -> JobPreferences:
    path = get_job_preferences_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        preferences.model_dump_json(indent=2),
        encoding="utf-8",
    )
    return preferences

