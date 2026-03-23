from pydantic import BaseModel
from typing import Literal


class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    chunk_text: str
    doc_type: Literal["resume", "project_doc", "bio_notes", "case_study"]
    section: str | None = None
    project_name: str | None = None
    source_filename: str
    token_count: int
