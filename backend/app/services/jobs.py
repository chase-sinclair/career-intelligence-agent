import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.core.config import settings
from app.models.jobs import JobFitResult, JobPosting, JobPreferences, JobShortlistEntry, TopFitJobsResponse
from app.models.profile import CandidateProfile
from app.services.job_preferences import load_job_preferences
from app.services.job_shortlist import load_job_shortlist


JOBS_CACHE_FILENAME = "jobs_cache.json"
SEED_JOBS_CACHE_FILENAME = "jobs_cache.default.json"


def get_jobs_cache_path() -> Path:
    return Path(settings.data_dir) / JOBS_CACHE_FILENAME


def load_jobs_cache() -> list[JobPosting]:
    path = get_jobs_cache_path()
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    return [JobPosting(**item) for item in data]


def load_candidate_profile() -> CandidateProfile:
    path = Path(settings.data_dir) / "candidate_profile.json"
    return CandidateProfile(**json.loads(path.read_text(encoding="utf-8")))


def get_top_fit_jobs(limit: int = 12, recent_days: int | None = 0, dedupe: bool = True) -> TopFitJobsResponse:
    profile = load_candidate_profile()
    preferences = load_job_preferences()
    shortlist = load_job_shortlist()
    jobs = load_jobs_cache()
    live_jobs = [job for job in jobs if job.source != "seeded_demo"]
    ranked_input = live_jobs if live_jobs else jobs
    filtered_input = _apply_actionability_filters(ranked_input, recent_days=recent_days, dedupe=dedupe)

    ranked = [
        _score_job(job=job, profile=profile, preferences=preferences)
        for job in filtered_input
        if _passes_prefilters(job=job, preferences=preferences)
    ]
    ranked = [_attach_shortlist_state(item, shortlist) for item in ranked]
    ranked.sort(key=lambda item: item.overall_score, reverse=True)
    best_fit_count = sum(1 for item in ranked if item.match_bucket == "Best Fit")
    strong_consideration_count = sum(1 for item in ranked if item.match_bucket == "Strong Consideration")
    stretch_count = sum(1 for item in ranked if item.match_bucket == "Stretch")
    ready_to_review_count = sum(1 for item in ranked if item.shortlist_status == "review")
    shortlisted_count = sum(1 for item in ranked if item.shortlist_status == "shortlisted")
    applied_count = sum(1 for item in ranked if item.shortlist_status == "applied")
    new_since_refresh_count = sum(1 for item in ranked if _is_recently_fetched(item.job))
    brief_headline, brief_summary = _build_brief(
        ranked=ranked,
        profile_name=profile.name,
        uses_seed_fallback=not bool(live_jobs),
        new_since_refresh_count=new_since_refresh_count,
    )

    return TopFitJobsResponse(
        total_jobs=len(ranked),
        generated_for=profile.name,
        live_jobs_count=len(live_jobs),
        uses_seed_fallback=not bool(live_jobs),
        brief_headline=brief_headline,
        brief_summary=brief_summary,
        new_since_refresh_count=new_since_refresh_count,
        best_fit_count=best_fit_count,
        strong_consideration_count=strong_consideration_count,
        stretch_count=stretch_count,
        ready_to_review_count=ready_to_review_count,
        shortlisted_count=shortlisted_count,
        applied_count=applied_count,
        top_matches=ranked[:limit],
    )


def _apply_actionability_filters(
    jobs: list[JobPosting],
    recent_days: int | None,
    dedupe: bool,
) -> list[JobPosting]:
    filtered = [job for job in jobs if _passes_liveness_gate(job)]
    if recent_days is not None and recent_days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=recent_days)
        filtered = [
            job for job in filtered
            if _job_datetime(job) is None or _job_datetime(job) >= cutoff
        ]

    if dedupe:
        deduped: dict[str, JobPosting] = {}
        for job in filtered:
            key = _dedupe_key(job)
            existing = deduped.get(key)
            if existing is None:
                deduped[key] = job
                continue
            if (_job_datetime(job) or datetime.min.replace(tzinfo=timezone.utc)) > (
                _job_datetime(existing) or datetime.min.replace(tzinfo=timezone.utc)
            ):
                deduped[key] = job
        filtered = list(deduped.values())

    return filtered


def _passes_liveness_gate(job: JobPosting) -> bool:
    if job.discovery_mode == "ats_api":
        return job.liveness_status != "expired"
    return job.liveness_status == "live"


def _score_job(job: JobPosting, profile: CandidateProfile, preferences: JobPreferences) -> JobFitResult:
    haystack = " ".join(
        [
            job.title,
            job.company,
            job.location,
            job.description,
            " ".join(job.normalized_tags),
            job.remote_type or "",
        ]
    ).lower()

    title_hits = _title_overlap_score(job.title, preferences.target_titles)
    keyword_hits = _count_matches(preferences.target_keywords, haystack)
    industry_hits = _count_matches(preferences.preferred_industries, haystack)
    company_type_hits = _count_matches(preferences.preferred_company_types, haystack)
    tech_hits = _count_matches(preferences.tech_focus_areas, haystack)
    profile_hits = _count_matches(profile.skills + profile.tools, haystack)
    seniority_hits = _count_matches(preferences.target_seniority, haystack)
    avoid_hits = _count_matches(preferences.avoid_keywords, haystack)

    location_score = _location_score(job.location, job.remote_type, preferences)
    remote_score = _remote_score(job.remote_type, preferences.remote_preference)

    preference_match_score = min(
        1.0,
        (
            title_hits * 0.35
            + keyword_hits * 0.18
            + industry_hits * 0.12
            + company_type_hits * 0.06
            + tech_hits * 0.16
            + seniority_hits * 0.08
            + location_score * 0.10
            + remote_score * 0.10
        ),
    )

    profile_match_score = min(
        1.0,
        (
            profile_hits * 0.22
            + tech_hits * 0.18
            + keyword_hits * 0.15
            + title_hits * 0.22
            + seniority_hits * 0.05
            + location_score * 0.05
        ),
    )

    penalty = min(0.35, avoid_hits * 0.15)
    if title_hits == 0:
        penalty += 0.12 if preferences.stretch_roles_allowed else 0.18
    overall_score = max(
        0.0,
        min(1.0, (preference_match_score * 0.55) + (profile_match_score * 0.45) - penalty),
    )

    strengths: list[str] = []
    if title_hits > 0:
        strengths.append("Role title aligns closely with saved target positions.")
    if tech_hits > 0 or profile_hits > 0:
        strengths.append("Technical stack overlaps with your profile and recent project work.")
    if location_score >= 0.8:
        strengths.append("Location and work-style preferences are a strong match.")
    if keyword_hits > 0:
        strengths.append("Core job language overlaps with your preferred focus areas.")
    if not strengths:
        strengths.append("Broad alignment exists, but this role likely needs deeper fit review.")

    risks: list[str] = []
    if avoid_hits > 0:
        risks.append("The posting includes one or more terms currently marked as avoid criteria.")
    if title_hits == 0 and not preferences.stretch_roles_allowed:
        risks.append("Role title is adjacent rather than directly inside your target list.")
    if location_score < 0.4:
        risks.append("Location or work-style preference is weaker than your saved targets.")
    if seniority_hits == 0:
        risks.append("Seniority language is not an obvious match to the level you saved.")

    resume_angles = _resume_angles(job, profile)

    if overall_score >= 0.38:
        match_bucket = "Best Fit"
    elif overall_score >= 0.26:
        match_bucket = "Strong Consideration"
    else:
        match_bucket = "Stretch"

    why_it_fits = _build_fit_summary(
        job=job,
        profile=profile,
        title_hits=title_hits,
        keyword_hits=keyword_hits,
        tech_hits=tech_hits,
        location_score=location_score,
        match_bucket=match_bucket,
    )

    return JobFitResult(
        job=job,
        overall_score=round(overall_score, 3),
        profile_match_score=round(profile_match_score, 3),
        preference_match_score=round(preference_match_score, 3),
        strengths=strengths[:3],
        risks=risks[:3],
        why_it_fits=why_it_fits,
        likely_resume_angles=resume_angles[:3],
        match_bucket=match_bucket,
    )


def _attach_shortlist_state(
    result: JobFitResult,
    shortlist: dict[str, JobShortlistEntry],
) -> JobFitResult:
    entry = shortlist.get(result.job.id)
    if entry is None:
        return result
    result.shortlist_status = entry.status
    result.shortlist_note = entry.note
    return result


def _passes_prefilters(job: JobPosting, preferences: JobPreferences) -> bool:
    title = job.title.lower()
    description = job.description.lower()

    if any(keyword.lower() in title for keyword in preferences.exclude_title_keywords):
        return False

    title_family_terms = [
        *preferences.target_titles,
        *preferences.target_keywords,
        "data scientist",
        "machine learning engineer",
        "applied ai",
        "ai engineer",
        "analytics engineer",
        "decision science",
    ]
    has_title_overlap = _title_overlap_score(job.title, title_family_terms) > 0.34
    if not has_title_overlap:
        return False

    if not _location_prefilter(job, preferences):
        return False

    return True


def _count_matches(items: list[str], haystack: str) -> float:
    if not items:
        return 0.0
    hits = 0
    for item in items:
        if item and item.lower() in haystack:
            hits += 1
    normalization_target = min(len(items), 2)
    return min(1.0, hits / max(normalization_target, 1))


def _title_overlap_score(title: str, target_titles: list[str]) -> float:
    title_tokens = _normalized_tokens(title)
    if not title_tokens or not target_titles:
        return 0.0

    best_score = 0.0
    for target in target_titles:
        target_tokens = _normalized_tokens(target)
        if not target_tokens:
            continue
        overlap = len(title_tokens & target_tokens) / len(target_tokens)
        best_score = max(best_score, overlap)
    return best_score


def _normalized_tokens(value: str) -> set[str]:
    stopwords = {"and", "the", "of", "for", "to", "a", "an"}
    tokens = {
        token
        for token in re.split(r"[^a-z0-9]+", value.lower())
        if token and token not in stopwords and len(token) > 1
    }
    return tokens


def _dedupe_key(job: JobPosting) -> str:
    title = re.sub(r"\s+", " ", job.title.lower()).strip()
    company = re.sub(r"\s+", " ", job.company.lower()).strip()
    return f"{company}|{title}"


def _job_datetime(job: JobPosting) -> datetime | None:
    for value in [job.posted_at, job.fetched_at]:
        parsed = _parse_datetime(value)
        if parsed is not None:
            return parsed
    return None


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _is_recently_fetched(job: JobPosting, hours: int = 24) -> bool:
    fetched_at = _parse_datetime(job.fetched_at)
    if fetched_at is None:
        return False
    return fetched_at >= datetime.now(timezone.utc) - timedelta(hours=hours)


def _build_brief(
    ranked: list[JobFitResult],
    profile_name: str,
    uses_seed_fallback: bool,
    new_since_refresh_count: int,
) -> tuple[str, str]:
    if not ranked:
        return (
            "No high-signal matches yet.",
            f"The current queue is empty for {profile_name}. Tight filters, liveness verification, and the active source mix are limiting the result set, so the next best move is to tune tracked boards or broaden the filter window.",
        )

    top = ranked[0]
    headline = f"{len(ranked)} filtered roles with {new_since_refresh_count} newly refreshed opportunities."

    if uses_seed_fallback:
        summary = (
            f"The queue is still leaning on fallback scouting targets. The strongest current role is "
            f"`{top.job.title}` at `{top.job.company}`, but live-source coverage needs improvement before this behaves like a real morning brief."
        )
        return headline, summary

    summary = (
        f"The strongest current lead is `{top.job.title}` at `{top.job.company}` in `{top.job.location}`. "
        f"The queue is now filtered for role family and preference fit, with {sum(1 for item in ranked if item.match_bucket == 'Best Fit')} best-fit and "
        f"{sum(1 for item in ranked if item.match_bucket == 'Strong Consideration')} strong-consideration roles surviving the current gates."
    )
    return headline, summary


def _location_score(location: str, remote_type: str | None, preferences: JobPreferences) -> float:
    if remote_type and "remote" in remote_type.lower() and "remote" in " ".join(preferences.preferred_locations).lower():
        return 1.0
    location_lower = location.lower()
    for preferred in preferences.preferred_locations:
        if preferred.lower() in location_lower:
            return 1.0
    if remote_type and "hybrid" in remote_type.lower() and preferences.remote_preference in {"remote_or_hybrid", "hybrid_only"}:
        return 0.8
    return 0.25


def _location_prefilter(job: JobPosting, preferences: JobPreferences) -> bool:
    location = job.location.lower()
    remote_value = (job.remote_type or "").lower()

    if preferences.remote_preference == "remote_only":
        return "remote" in remote_value

    if preferences.remote_preference == "remote_or_hybrid" and ("remote" in remote_value or "hybrid" in remote_value):
        return True

    if preferences.preferred_locations:
        if any(preferred.lower() in location for preferred in preferences.preferred_locations):
            return True
        if "remote" in remote_value and any(preferred.lower() == "remote" for preferred in preferences.preferred_locations):
            return True
        if preferences.remote_preference == "open_to_on_site":
            return any(preferred.lower() in location for preferred in preferences.preferred_locations)

        if preferences.remote_preference != "open_to_on_site":
            return False

    return True


def _remote_score(remote_type: str | None, remote_preference: str) -> float:
    remote_value = (remote_type or "").lower()
    if remote_preference == "remote_only":
        return 1.0 if "remote" in remote_value else 0.2
    if remote_preference == "remote_or_hybrid":
        return 1.0 if ("remote" in remote_value or "hybrid" in remote_value) else 0.35
    if remote_preference == "hybrid_only":
        return 1.0 if "hybrid" in remote_value else 0.25
    return 0.8


def _resume_angles(job: JobPosting, profile: CandidateProfile) -> list[str]:
    angles: list[str] = []
    description = job.description.lower()
    if "rag" in description or "retrieval" in description:
        angles.append("Lead with the production-grade RAG chatbot and grounded-answer evaluation work.")
    if "dashboard" in description or "analytics" in description or "metrics" in description:
        angles.append("Highlight KPI design, executive dashboards, and analytics transformation outcomes.")
    if "public sector" in description or "federal" in description or "government" in description:
        angles.append("Emphasize mission-critical federal platform work and executive stakeholder support.")
    if "data platform" in description or "pipeline" in description or "etl" in description:
        angles.append("Show pipeline modernization work across AWS, Snowflake, and automated ingestion workflows.")
    if not angles and profile.projects:
        angles.append(f"Use {profile.projects[0].name} as a portfolio proof point for technical depth and execution.")
    return angles


def _build_fit_summary(
    job: JobPosting,
    profile: CandidateProfile,
    title_hits: float,
    keyword_hits: float,
    tech_hits: float,
    location_score: float,
    match_bucket: str,
) -> str:
    phrases = [f"This role lands in the {match_bucket.lower()} bucket for {profile.name}."]
    if title_hits > 0:
        phrases.append("The title direction lines up with saved target roles.")
    if keyword_hits > 0 or tech_hits > 0:
        phrases.append("The posting language overlaps with your preferred AI, analytics, and platform themes.")
    if location_score >= 0.8:
        phrases.append("Work style and location are aligned with your saved preferences.")
    else:
        phrases.append("The fit is stronger on responsibilities than on location or work-style setup.")
    return " ".join(phrases)
