# API Reference

| Method | Path | Phase | Description |
|---|---|---|---|
| POST | /upload | 1 | Multipart file upload. Save to uploads/. Return upload status. |
| POST | /ingest/rebuild | 1 | Run full Ingestion Agent LangGraph graph. Return processing summary. |
| POST | /chat | 1 | RAG query. Returns answer, sources, evidence snippets, eval scores. |
| POST | /profile/generate | 2 | Regenerate candidate_profile.json and site_content.json. |
| GET | /profile | 2 | Return full structured profile. |
| GET | /about-content | 2 | Return about page copy. |
| GET | /projects | 2 | Return project card data from site_content.json. |
| GET | /admin/status | 4 | Return ingestion and index status. |
| POST | /eval/run | 5 | Run batch evaluation against gold question set. |
| GET | /eval/results | 5 | Fetch latest evaluation results. |
