import uuid
from typing import Literal

import tiktoken

from app.core.logging import get_logger
from app.models.chunks import Chunk

logger = get_logger(__name__)

_ENCODING = tiktoken.get_encoding("cl100k_base")

# Chunk sizes by doc type
CHUNK_CONFIG = {
    "resume": {"size": 250, "overlap": 50},
    "project_doc": {"size": 450, "overlap": 75},
    "bio_notes": {"size": 350, "overlap": 60},
    "case_study": {"size": 450, "overlap": 75},
}


def chunk_document(text: str, metadata: dict) -> list[Chunk]:
    """Split document text into overlapping token-based chunks."""
    doc_type = metadata["doc_type"]
    config = CHUNK_CONFIG.get(doc_type, CHUNK_CONFIG["project_doc"])
    chunk_size = config["size"]
    overlap = config["overlap"]

    tokens = _ENCODING.encode(text)
    chunks: list[Chunk] = []
    start = 0

    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text = _ENCODING.decode(chunk_tokens)

        chunks.append(
            Chunk(
                chunk_id=str(uuid.uuid4()),
                doc_id=metadata["doc_id"],
                chunk_text=chunk_text,
                doc_type=metadata["doc_type"],
                section=_detect_section(chunk_text, doc_type),
                project_name=metadata.get("project_name"),
                source_filename=metadata["source_filename"],
                token_count=len(chunk_tokens),
            )
        )

        if end == len(tokens):
            break
        start += chunk_size - overlap

    logger.info(f"Chunked {metadata['source_filename']} into {len(chunks)} chunks")
    return chunks


def _detect_section(text: str, doc_type: str) -> str | None:
    """Heuristic section detection for resumes."""
    if doc_type != "resume":
        return None

    text_lower = text.lower()
    section_keywords = {
        "experience": ["experience", "employment", "work history"],
        "education": ["education", "degree", "university", "college"],
        "skills": ["skills", "technologies", "tools", "languages"],
        "projects": ["projects", "portfolio"],
        "summary": ["summary", "objective", "profile", "about"],
        "certifications": ["certifications", "certificates", "credentials"],
    }

    for section, keywords in section_keywords.items():
        if any(kw in text_lower for kw in keywords):
            return section

    return None
