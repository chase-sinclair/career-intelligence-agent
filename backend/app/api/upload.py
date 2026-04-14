import json
import shutil
import uuid
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".md", ".txt", ".text"}
DocType = Literal["resume", "project_doc", "bio_notes", "case_study"]


class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    saved_path: str
    doc_type: str
    status: str


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    doc_type: DocType = Form("resume"),
    project_name: str | None = Form(None),
):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}{suffix}"
    dest = upload_dir / safe_name
    meta_path = upload_dir / f"{doc_id}.meta.json"

    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    meta_path.write_text(
        json.dumps(
            {
                "doc_id": doc_id,
                "original_filename": file.filename,
                "stored_filename": safe_name,
                "doc_type": doc_type,
                "project_name": project_name,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    logger.info(f"Uploaded {file.filename!r} -> {dest} (doc_type={doc_type})")
    return UploadResponse(
        doc_id=doc_id,
        filename=file.filename,
        saved_path=str(dest),
        doc_type=doc_type,
        status="uploaded",
    )
