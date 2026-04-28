import re
import uuid
from pathlib import Path

from pypdf import PdfReader

from app.core.logging import get_logger

logger = get_logger(__name__)

_FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?", re.DOTALL)


def _parse_front_matter(raw: str) -> tuple[dict, str]:
    """Return (front_matter_fields, body_text). Fields dict is empty if no front matter found."""
    match = _FRONT_MATTER_RE.match(raw)
    if not match:
        return {}, raw

    fields: dict = {}
    for line in match.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()

    body = raw[match.end():]
    return fields, body


def extract_text(file_path: str, doc_type: str, project_name: str | None = None) -> dict:
    """Extract text from a file and return text + metadata dict.

    For markdown files, YAML front matter is stripped from the body and its
    values (doc_type, doc_id, project_name, source_filename) override the
    caller-supplied defaults where present.
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    front_matter: dict = {}

    if suffix == ".pdf":
        text = _extract_pdf(path)
    elif suffix in (".md", ".txt", ".text"):
        raw = path.read_text(encoding="utf-8")
        if suffix == ".md":
            front_matter, text = _parse_front_matter(raw)
        else:
            text = raw
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    metadata = {
        "doc_id": front_matter.get("doc_id") or str(uuid.uuid4()),
        "doc_type": front_matter.get("doc_type") or doc_type,
        "title": path.stem,
        "source_filename": front_matter.get("source_filename") or path.name,
        "project_name": front_matter.get("project_name") or project_name,
        "tags": [],
    }

    logger.info(f"Extracted {len(text)} chars from {path.name} (front_matter={bool(front_matter)})")
    return {"text": text, "metadata": metadata}


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            pages.append(page_text)
    return "\n\n".join(pages)
