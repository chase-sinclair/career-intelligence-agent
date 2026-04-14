import json
import re
from datetime import datetime, timezone
from pathlib import Path

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.models.jobs import (
    JobPosting,
    JobRefreshResponse,
    JobScanHistoryEntry,
    JobSourceConfig,
    JobSourcePack,
)
from app.services.jobs import get_jobs_cache_path, load_jobs_cache

logger = get_logger(__name__)

JOB_SOURCES_FILENAME = "job_sources.json"
JOB_SOURCE_PACKS_FILENAME = "job_source_packs.json"
JOB_SCAN_HISTORY_FILENAME = "job_scan_history.json"
SEED_SOURCE_NAME = "seeded_demo"
EXPIRED_PAGE_SIGNALS = (
    "job no longer available",
    "no longer open",
    "position has been filled",
    "this job has expired",
    "page not found",
    "job has been closed",
)
APPLY_PAGE_SIGNALS = ("apply", "submit application", "job application", "apply for this job")


def get_job_sources_path() -> Path:
    return Path(settings.data_dir) / JOB_SOURCES_FILENAME


def load_job_sources() -> list[JobSourceConfig]:
    path = get_job_sources_path()
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [JobSourceConfig(**item) for item in data]


def get_job_source_packs_path() -> Path:
    return Path(settings.data_dir) / JOB_SOURCE_PACKS_FILENAME


def load_job_source_packs() -> list[JobSourcePack]:
    path = get_job_source_packs_path()
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [JobSourcePack(**item) for item in data]


def get_job_scan_history_path() -> Path:
    return Path(settings.data_dir) / JOB_SCAN_HISTORY_FILENAME


def load_job_scan_history() -> list[JobScanHistoryEntry]:
    path = get_job_scan_history_path()
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [JobScanHistoryEntry(**item) for item in data]


def save_job_scan_history(entries: list[JobScanHistoryEntry]) -> list[JobScanHistoryEntry]:
    path = get_job_scan_history_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps([entry.model_dump() for entry in entries], indent=2),
        encoding="utf-8",
    )
    return entries


def save_job_sources(sources: list[JobSourceConfig]) -> list[JobSourceConfig]:
    path = get_job_sources_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps([source.model_dump() for source in sources], indent=2),
        encoding="utf-8",
    )
    return sources


def apply_job_source_pack(pack_id: str) -> list[JobSourceConfig]:
    packs = load_job_source_packs()
    for pack in packs:
        if pack.id == pack_id:
            return save_job_sources(pack.sources)
    raise ValueError(f"Unknown job source pack: {pack_id}")


def refresh_jobs_cache_from_sources() -> JobRefreshResponse:
    sources = sorted(
        [source for source in load_job_sources() if source.enabled],
        key=lambda item: (item.priority_tier, item.name.lower()),
    )
    source_errors: list[str] = []
    fetched_jobs: list[JobPosting] = []
    existing_jobs = load_jobs_cache()
    previous_live_jobs = [job for job in existing_jobs if job.source != SEED_SOURCE_NAME]

    for source in sources:
        try:
            fetched_jobs.extend(_fetch_source(source))
        except Exception as exc:
            logger.warning(f"Failed refreshing source {source.name}: {exc}")
            source_errors.append(f"{source.name}: {exc}")

    existing_seed_jobs = [job for job in existing_jobs if job.source == SEED_SOURCE_NAME]
    jobs_to_write = fetched_jobs + (existing_seed_jobs if not fetched_jobs else [])

    _write_jobs_cache(jobs_to_write)

    added_jobs = 0
    dropped_jobs = 0
    unchanged_jobs = 0
    added_previews: list[str] = []
    dropped_previews: list[str] = []
    verified_live_jobs = sum(1 for job in fetched_jobs if job.liveness_status == "live")
    unverified_jobs = len(fetched_jobs) - verified_live_jobs

    if fetched_jobs:
        previous_keys = {_history_key(job): job for job in previous_live_jobs}
        current_keys = {_history_key(job): job for job in fetched_jobs}

        added = [job for key, job in current_keys.items() if key not in previous_keys]
        dropped = [job for key, job in previous_keys.items() if key not in current_keys]
        unchanged_jobs = len(current_keys) - len(added)
        added_jobs = len(added)
        dropped_jobs = len(dropped)
        added_previews = [_preview_label(job) for job in added[:5]]
        dropped_previews = [_preview_label(job) for job in dropped[:5]]

        _sync_scan_history(fetched_jobs=fetched_jobs, dropped_jobs=dropped)

    return JobRefreshResponse(
        fetched_jobs=len(fetched_jobs),
        enabled_sources=len(sources),
        source_errors=source_errors,
        used_seed_fallback=not bool(fetched_jobs),
        added_jobs=added_jobs,
        dropped_jobs=dropped_jobs,
        unchanged_jobs=unchanged_jobs,
        added_previews=added_previews,
        dropped_previews=dropped_previews,
        verified_live_jobs=verified_live_jobs,
        unverified_jobs=unverified_jobs,
    )


def _fetch_source(source: JobSourceConfig) -> list[JobPosting]:
    with httpx.Client(timeout=20.0, follow_redirects=True) as client:
        if source.platform == "greenhouse":
            return _fetch_greenhouse_jobs(client, source)
        if source.platform == "lever":
            return _fetch_lever_jobs(client, source)
        if source.platform == "ashby":
            return _fetch_ashby_jobs(client, source)
        if source.platform == "direct":
            return _fetch_direct_board_jobs(client, source)
    raise ValueError(f"Unsupported source platform: {source.platform}")


def _fetch_greenhouse_jobs(client: httpx.Client, source: JobSourceConfig) -> list[JobPosting]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{source.identifier}/jobs?content=true"
    response = client.get(url)
    response.raise_for_status()
    payload = response.json()

    jobs: list[JobPosting] = []
    fetched_at = _now_iso()

    for item in payload.get("jobs", []):
        content = _strip_html(item.get("content", ""))
        location = (item.get("location") or {}).get("name", "Unknown")
        metadata_values = [
            value.get("value", "")
            for value in (item.get("metadata") or [])
            if isinstance(value, dict)
        ]
        tags = [tag for tag in metadata_values if tag]
        remote_type = _detect_remote_type(location=location, description=content)

        job = JobPosting(
                id=f"{source.platform}:{source.id}:{item.get('id')}",
                source=source.platform,
                source_label=source.name,
                title=item.get("title", "Untitled role"),
                company=source.name,
                location=location,
                posted_at=item.get("updated_at") or item.get("first_published"),
                salary_text=None,
                description=content,
                employment_type=None,
                remote_type=remote_type,
                normalized_tags=tags,
                url=item.get("absolute_url"),
                fetched_at=fetched_at,
                discovery_mode=source.discovery_mode,
                priority_tier=source.priority_tier,
                liveness_status="live",
                liveness_note="Verified through Greenhouse public board API.",
                liveness_checked_at=fetched_at,
            )
        jobs.append(_verify_job_liveness(client, job))

    return jobs


def _fetch_lever_jobs(client: httpx.Client, source: JobSourceConfig) -> list[JobPosting]:
    url = f"https://api.lever.co/v0/postings/{source.identifier}?mode=json"
    response = client.get(url)
    response.raise_for_status()
    payload = response.json()

    jobs: list[JobPosting] = []
    fetched_at = _now_iso()

    for item in payload:
        categories = item.get("categories", {}) or {}
        location = categories.get("location") or "Unknown"
        team = categories.get("team") or ""
        commitment = categories.get("commitment") or None
        workplace_type = item.get("workplaceType") or item.get("workplace_type")
        description = _strip_html(
            item.get("descriptionPlain")
            or item.get("description")
            or item.get("lists")
            or ""
        )
        tags = [value for value in [team, workplace_type, commitment] if value]
        remote_type = workplace_type or _detect_remote_type(location=location, description=description)

        job = JobPosting(
                id=f"{source.platform}:{source.id}:{item.get('id')}",
                source=source.platform,
                source_label=source.name,
                title=item.get("text", "Untitled role"),
                company=source.name,
                location=location,
                posted_at=_lever_timestamp_to_iso(item.get("createdAt")),
                salary_text=None,
                description=description,
                employment_type=commitment,
                remote_type=remote_type,
                normalized_tags=tags,
                url=item.get("hostedUrl"),
                fetched_at=fetched_at,
                discovery_mode=source.discovery_mode,
                priority_tier=source.priority_tier,
                liveness_status="live",
                liveness_note="Verified through Lever public postings API.",
                liveness_checked_at=fetched_at,
            )
        jobs.append(_verify_job_liveness(client, job))

    return jobs


def _fetch_ashby_jobs(client: httpx.Client, source: JobSourceConfig) -> list[JobPosting]:
    url = "https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams"
    response = client.post(
        url,
        json={
            "operationName": "ApiJobBoardWithTeams",
            "variables": {"organizationHostedJobsPageName": source.identifier},
            "query": """
                query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
                  jobBoardWithTeams(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
                    jobBoard {
                      jobPostings {
                        id
                        title
                        locationName
                        employmentType
                        secondaryLocations
                        compensationTierSummary
                      }
                    }
                  }
                }
            """,
        },
    )
    response.raise_for_status()
    payload = response.json()
    postings = (
        payload.get("data", {})
        .get("jobBoardWithTeams", {})
        .get("jobBoard", {})
        .get("jobPostings", [])
    )

    jobs: list[JobPosting] = []
    fetched_at = _now_iso()
    for item in postings:
        title = item.get("title", "Untitled role")
        location = item.get("locationName") or "Unknown"
        secondary_locations = item.get("secondaryLocations") or []
        secondary_text = " ".join(
            loc.get("locationName", "") for loc in secondary_locations if isinstance(loc, dict)
        )
        description = " ".join(
            filter(
                None,
                [
                    title,
                    location,
                    secondary_text,
                    item.get("employmentType", ""),
                    item.get("compensationTierSummary", ""),
                ],
            )
        )
        remote_type = _detect_remote_type(location=location, description=description)
        hosted_url = f"https://jobs.ashbyhq.com/{source.identifier}/{item.get('id')}"

        job = JobPosting(
            id=f"{source.platform}:{source.id}:{item.get('id')}",
            source=source.platform,
            source_label=source.name,
            title=title,
            company=source.name,
            location=location,
            posted_at=None,
            salary_text=item.get("compensationTierSummary"),
            description=description,
            employment_type=item.get("employmentType"),
            remote_type=remote_type,
            normalized_tags=[secondary_text] if secondary_text else [],
            url=hosted_url,
            fetched_at=fetched_at,
            discovery_mode=source.discovery_mode,
            priority_tier=source.priority_tier,
            liveness_status="live",
            liveness_note="Verified through Ashby public board API.",
            liveness_checked_at=fetched_at,
        )
        jobs.append(_verify_job_liveness(client, job))

    return jobs


def _fetch_direct_board_jobs(client: httpx.Client, source: JobSourceConfig) -> list[JobPosting]:
    url = source.identifier.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise ValueError("Direct board sources must use a full URL identifier.")

    response = client.get(url)
    response.raise_for_status()
    page_html = response.text
    json_ld_items = _extract_json_ld_job_postings(page_html)
    fetched_at = _now_iso()

    jobs: list[JobPosting] = []
    for index, item in enumerate(json_ld_items):
        title = item.get("title") or item.get("name") or f"{source.name} role {index + 1}"
        location = _extract_direct_location(item) or "Unknown"
        description = _strip_html(item.get("description", ""))
        hosted_url = item.get("url") or url

        job = JobPosting(
            id=f"{source.platform}:{source.id}:{index}",
            source=source.platform,
            source_label=source.name,
            title=title,
            company=source.name,
            location=location,
            posted_at=item.get("datePosted"),
            salary_text=_extract_salary_text(item),
            description=description or title,
            employment_type=item.get("employmentType"),
            remote_type=_detect_remote_type(location=location, description=description),
            normalized_tags=[],
            url=hosted_url,
            fetched_at=fetched_at,
            discovery_mode=source.discovery_mode,
            priority_tier=source.priority_tier,
            liveness_status="unverified",
            liveness_note="Discovered from a direct careers page and awaiting liveness verification.",
            liveness_checked_at=fetched_at,
        )
        jobs.append(_verify_job_liveness(client, job))

    if jobs:
        return jobs

    fallback_job = JobPosting(
        id=f"{source.platform}:{source.id}:page",
        source=source.platform,
        source_label=source.name,
        title=f"{source.name} careers page",
        company=source.name,
        location="Unknown",
        posted_at=None,
        salary_text=None,
        description=_strip_html(page_html)[:1200],
        employment_type=None,
        remote_type=None,
        normalized_tags=[],
        url=url,
        fetched_at=fetched_at,
        discovery_mode=source.discovery_mode,
        priority_tier=source.priority_tier,
        liveness_status="unverified",
        liveness_note="Direct careers page discovered without structured job metadata.",
        liveness_checked_at=fetched_at,
    )
    return [_verify_job_liveness(client, fallback_job)]


def _write_jobs_cache(jobs: list[JobPosting]) -> None:
    path = get_jobs_cache_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps([job.model_dump() for job in jobs], indent=2),
        encoding="utf-8",
    ) 


def _extract_json_ld_job_postings(page_html: str) -> list[dict]:
    scripts = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        page_html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    postings: list[dict] = []
    for script in scripts:
        try:
            payload = json.loads(script.strip())
        except json.JSONDecodeError:
            continue
        postings.extend(_flatten_job_postings(payload))
    return postings


def _flatten_job_postings(payload: object) -> list[dict]:
    if isinstance(payload, list):
        results: list[dict] = []
        for item in payload:
            results.extend(_flatten_job_postings(item))
        return results

    if not isinstance(payload, dict):
        return []

    payload_type = payload.get("@type")
    if payload_type == "JobPosting":
        return [payload]
    if payload_type == "ItemList":
        return _flatten_job_postings(payload.get("itemListElement"))
    if "@graph" in payload:
        return _flatten_job_postings(payload["@graph"])
    return []


def _extract_direct_location(item: dict) -> str | None:
    location = item.get("jobLocation")
    if isinstance(location, list):
        names = [_extract_direct_location({"jobLocation": loc}) for loc in location]
        names = [name for name in names if name]
        return ", ".join(names) if names else None
    if isinstance(location, dict):
        address = location.get("address")
        if isinstance(address, dict):
            pieces = [
                address.get("addressLocality"),
                address.get("addressRegion"),
                address.get("addressCountry"),
            ]
            return ", ".join(piece for piece in pieces if piece)
    return None


def _extract_salary_text(item: dict) -> str | None:
    salary = item.get("baseSalary")
    if not isinstance(salary, dict):
        return None
    value = salary.get("value")
    if isinstance(value, dict):
        min_value = value.get("minValue")
        max_value = value.get("maxValue")
        currency = salary.get("currency", "USD")
        if min_value or max_value:
            if min_value and max_value:
                return f"{currency} {min_value}-{max_value}"
            return f"{currency} {min_value or max_value}"
    return None


def _strip_html(value: object) -> str:
    text = value if isinstance(value, str) else json.dumps(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _detect_remote_type(location: str, description: str) -> str | None:
    combined = f"{location} {description}".lower()
    if "remote" in combined:
        return "Remote"
    if "hybrid" in combined:
        return "Hybrid"
    if "on-site" in combined or "onsite" in combined:
        return "On-site"
    return None


def _lever_timestamp_to_iso(value: object) -> str | None:
    if not isinstance(value, (int, float)):
        return None
    return datetime.fromtimestamp(value / 1000, tz=timezone.utc).isoformat()


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat()


def _verify_job_liveness(client: httpx.Client, job: JobPosting) -> JobPosting:
    if job.discovery_mode == "ats_api":
        return job

    checked_at = _now_iso()
    job.liveness_checked_at = checked_at

    if not job.url:
        job.liveness_status = "unverified"
        job.liveness_note = "No public posting URL was available to verify."
        return job

    try:
        response = client.get(job.url, timeout=12.0)
    except Exception as exc:
        job.liveness_status = "unverified"
        job.liveness_note = f"Could not verify posting liveness: {exc}"
        return job

    if response.status_code >= 400:
        job.liveness_status = "expired"
        job.liveness_note = f"Posting URL returned HTTP {response.status_code} during liveness verification."
        return job

    content = _strip_html(response.text).lower()
    if any(signal in content for signal in EXPIRED_PAGE_SIGNALS):
        job.liveness_status = "expired"
        job.liveness_note = "Posting page contains closure or expiry signals."
        return job

    title_present = job.title.lower() in content
    apply_present = any(signal in content for signal in APPLY_PAGE_SIGNALS)
    content_length_ok = len(content) >= 300

    if title_present and apply_present and content_length_ok:
        job.liveness_status = "live"
        job.liveness_note = "Verified against the public posting page."
        return job

    job.liveness_status = "unverified"
    job.liveness_note = "Posting URL responded, but the page did not clearly expose a live application surface."
    return job


def _history_key(job: JobPosting) -> str:
    if job.url:
        return job.url.strip().lower()
    title = re.sub(r"\s+", " ", job.title.lower()).strip()
    company = re.sub(r"\s+", " ", job.company.lower()).strip()
    return f"{company}|{title}"


def _preview_label(job: JobPosting) -> str:
    return f"{job.company} | {job.title}"


def _sync_scan_history(fetched_jobs: list[JobPosting], dropped_jobs: list[JobPosting]) -> None:
    now_iso = _now_iso()
    entries_by_key = {entry.key: entry for entry in load_job_scan_history()}

    for job in fetched_jobs:
        key = _history_key(job)
        existing = entries_by_key.get(key)
        if existing is None:
            entries_by_key[key] = JobScanHistoryEntry(
                key=key,
                url=job.url,
                title=job.title,
                company=job.company,
                source=job.source_label or job.source,
                first_seen=job.fetched_at or now_iso,
                last_seen=job.fetched_at or now_iso,
                status="active",
            )
            continue

        existing.url = job.url or existing.url
        existing.title = job.title
        existing.company = job.company
        existing.source = job.source_label or job.source
        existing.last_seen = job.fetched_at or now_iso
        existing.status = "active"

    for job in dropped_jobs:
        key = _history_key(job)
        existing = entries_by_key.get(key)
        if existing is None:
            continue
        existing.last_seen = now_iso
        existing.status = "missing"

    save_job_scan_history(sorted(entries_by_key.values(), key=lambda entry: entry.company.lower()))
