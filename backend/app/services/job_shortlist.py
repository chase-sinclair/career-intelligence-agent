import json
from pathlib import Path

from app.core.config import settings
from app.models.jobs import JobShortlistEntry


JOB_SHORTLIST_FILENAME = "job_shortlist.json"


def get_job_shortlist_path() -> Path:
    return Path(settings.data_dir) / JOB_SHORTLIST_FILENAME


def load_job_shortlist() -> dict[str, JobShortlistEntry]:
    path = get_job_shortlist_path()
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = [JobShortlistEntry(**item) for item in data]
    return {entry.job_id: entry for entry in entries}


def save_job_shortlist(entries: dict[str, JobShortlistEntry]) -> dict[str, JobShortlistEntry]:
    path = get_job_shortlist_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    ordered = sorted(entries.values(), key=lambda item: item.updated_at, reverse=True)
    path.write_text(
        json.dumps([entry.model_dump() for entry in ordered], indent=2),
        encoding="utf-8",
    )
    return entries
