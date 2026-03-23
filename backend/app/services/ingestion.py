import uuid
from pathlib import Path

from pypdf import PdfReader

from app.core.logging import get_logger

logger = get_logger(__name__)


def extract_text(file_path: str, doc_type: str, project_name: str | None = None) -> dict:
    """Extract text from a file and return text + metadata dict."""
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        text = _extract_pdf(path)
    elif suffix in (".md", ".txt", ".text"):
        text = path.read_text(encoding="utf-8")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    metadata = {
        "doc_id": str(uuid.uuid4()),
        "doc_type": doc_type,
        "title": path.stem,
        "source_filename": path.name,
        "project_name": project_name,
        "tags": [],
    }

    logger.info(f"Extracted {len(text)} chars from {path.name}")
    return {"text": text, "metadata": metadata}


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages.append(page_text)
    return "\n\n".join(pages)
