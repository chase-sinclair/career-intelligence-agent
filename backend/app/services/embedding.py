from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings
from app.core.logging import get_logger
from app.models.chunks import Chunk

logger = get_logger(__name__)

_embeddings: OpenAIEmbeddings | None = None
_vectorstore: Chroma | None = None


def get_vectorstore() -> Chroma:
    global _embeddings, _vectorstore
    if _vectorstore is None:
        _embeddings = OpenAIEmbeddings(
            model=settings.openai_embedding_model,
            api_key=settings.openai_api_key,
        )
        _vectorstore = Chroma(
            collection_name="career_docs",
            embedding_function=_embeddings,
            persist_directory=settings.chroma_persist_dir,
        )
        logger.info(f"Chroma initialized at {settings.chroma_persist_dir}")
    return _vectorstore


def clear_collection() -> None:
    """Delete all documents from the Chroma collection. Called before a full rebuild."""
    global _vectorstore
    vs = get_vectorstore()
    vs.delete_collection()
    _vectorstore = None  # force re-initialisation on next get_vectorstore() call
    logger.info("Chroma collection 'career_docs' cleared")


def embed_and_index(chunks: list[Chunk]) -> int:
    """Embed chunks and upsert to Chroma. Returns count of indexed chunks."""
    if not chunks:
        return 0

    vectorstore = get_vectorstore()

    texts = [c.chunk_text for c in chunks]
    metadatas = [
        {
            "chunk_id": c.chunk_id,
            "doc_id": c.doc_id,
            "doc_type": c.doc_type,
            "section": c.section or "",
            "project_name": c.project_name or "",
            "source_filename": c.source_filename,
            "token_count": c.token_count,
        }
        for c in chunks
    ]
    ids = [c.chunk_id for c in chunks]

    vectorstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
    logger.info(f"Indexed {len(chunks)} chunks into Chroma")
    return len(chunks)
