from pydantic import BaseModel
from typing import Literal


class DocumentMetadata(BaseModel):
    doc_id: str
    doc_type: Literal["resume", "project_doc", "bio_notes", "case_study"]
    title: str
    source_filename: str
    project_name: str | None = None
    tags: list[str] = []
