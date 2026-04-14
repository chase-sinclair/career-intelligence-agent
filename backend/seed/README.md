# Public Profile Seed Files

These files are the committed source for the app's default recruiter-facing profile.

## Files
- `candidate_profile.default.json` -> structured default profile
- `site_content.default.json` -> homepage/about/projects copy
- `default_candidate_context.md` -> source text used to seed the public RAG knowledge base
- `job_preferences.default.json` -> default saved preferences for the upcoming jobs agent
- `jobs_cache.default.json` -> starter scouting targets used by the Top Fit Jobs preview surface
- `job_sources.default.json` -> tracked Greenhouse and Lever boards for live job refreshes

## Quick update workflow
1. Edit the seed files with new resume/project information.
2. Run:
   `.\.venv\Scripts\python backend\scripts\refresh_public_profile.py`
3. Restart the backend if it is running.

This keeps the public app aligned with your latest default profile while preserving the separate admin upload workflow for demos.

Job preferences are bootstrapped automatically at startup when `backend/data/job_preferences.json` is missing.
