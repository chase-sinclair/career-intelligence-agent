from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.logging import get_logger
from app.services.ingestion import extract_text
from app.services.chunking import chunk_document
from app.services.embedding import embed_and_index

logger = get_logger(__name__)


class IngestionState(TypedDict):
    file_path: str
    doc_type: str
    project_name: str | None
    text: str
    metadata: dict
    chunks: list
    indexed_count: int
    error: str | None


def extract_node(state: IngestionState) -> IngestionState:
    try:
        result = extract_text(state["file_path"], state["doc_type"], state.get("project_name"))
        return {**state, "text": result["text"], "metadata": result["metadata"], "error": None}
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return {**state, "error": str(e)}


def chunk_node(state: IngestionState) -> IngestionState:
    if state.get("error"):
        return state
    try:
        chunks = chunk_document(state["text"], state["metadata"])
        return {**state, "chunks": chunks}
    except Exception as e:
        logger.error(f"Chunking failed: {e}")
        return {**state, "error": str(e)}


def embed_node(state: IngestionState) -> IngestionState:
    if state.get("error"):
        return state
    try:
        count = embed_and_index(state["chunks"])
        return {**state, "indexed_count": count}
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        return {**state, "error": str(e)}


def build_ingestion_graph():
    graph = StateGraph(IngestionState)
    graph.add_node("extract", extract_node)
    graph.add_node("chunk", chunk_node)
    graph.add_node("embed", embed_node)

    graph.set_entry_point("extract")
    graph.add_edge("extract", "chunk")
    graph.add_edge("chunk", "embed")
    graph.add_edge("embed", END)

    return graph.compile()


ingestion_graph = build_ingestion_graph()


def run_ingestion(file_path: str, doc_type: str, project_name: str | None = None) -> dict:
    """Run the ingestion workflow for a single file."""
    initial_state: IngestionState = {
        "file_path": file_path,
        "doc_type": doc_type,
        "project_name": project_name,
        "text": "",
        "metadata": {},
        "chunks": [],
        "indexed_count": 0,
        "error": None,
    }
    result = ingestion_graph.invoke(initial_state)
    return {
        "file": file_path,
        "indexed_count": result["indexed_count"],
        "error": result.get("error"),
    }
