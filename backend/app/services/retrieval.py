from langchain_chroma import Chroma

from app.core.logging import get_logger
from app.services.embedding import get_vectorstore

logger = get_logger(__name__)


def retrieve(query: str, k: int = 5, filters: dict | None = None) -> list[dict]:
    """Retrieve top-k chunks from Chroma by similarity.

    Returns list of dicts with 'text' and 'metadata' keys.
    """
    vectorstore: Chroma = get_vectorstore()

    search_kwargs = {"k": k}
    if filters:
        search_kwargs["filter"] = filters

    results = vectorstore.similarity_search(query, **search_kwargs)

    chunks = []
    for doc in results:
        chunks.append({"text": doc.page_content, "metadata": doc.metadata})

    logger.info(f"Retrieved {len(chunks)} chunks for query: {query[:60]!r}")
    return chunks
