import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger
from app.services.embedding import clear_collection
from app.workflows.ingestion_graph import run_ingestion

logger = get_logger(__name__)
router = APIRouter()

# Map file extensions to default doc_type when upload metadata is unavailable.
_EXT_DOC_TYPE = {
    ".pdf": "resume",
    ".md": "project_doc",
    ".txt": "project_doc",
    ".text": "project_doc",
}


class IngestResponse(BaseModel):
    processed: int
    results: list[dict]
    errors: list[str]


def _load_upload_metadata(file_path: Path) -> dict:
    meta_path = file_path.with_suffix(".meta.json")
    if meta_path.exists():
        return json.loads(meta_path.read_text(encoding="utf-8"))
    return {
        "doc_type": _EXT_DOC_TYPE[file_path.suffix.lower()],
        "project_name": None,
    }


@router.post("/ingest/rebuild", response_model=IngestResponse)
async def rebuild_index():
    """Run the ingestion workflow on all files in the upload directory."""
    upload_dir = Path(settings.upload_dir)
    if not upload_dir.exists():
        raise HTTPException(status_code=400, detail="Upload directory does not exist. Upload files first.")

    files = [f for f in upload_dir.iterdir() if f.is_file() and f.suffix.lower() in _EXT_DOC_TYPE]
    if not files:
        raise HTTPException(status_code=400, detail="No supported files found in upload directory.")

    clear_collection()
    logger.info("Chroma collection cleared - starting fresh rebuild")

    results = []
    errors = []

    for file_path in files:
        upload_meta = _load_upload_metadata(file_path)
        doc_type = upload_meta["doc_type"]
        project_name = upload_meta.get("project_name")
        result = run_ingestion(str(file_path), doc_type, project_name)
        results.append(result)
        if result.get("error"):
            errors.append(f"{file_path.name}: {result['error']}")

    logger.info(f"Ingestion complete: {len(results)} files, {len(errors)} errors")
    return IngestResponse(processed=len(results), results=results, errors=errors)
