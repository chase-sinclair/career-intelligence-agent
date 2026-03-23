from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are an AI assistant representing a job candidate to recruiters.
Answer questions about the candidate's background, skills, and experience using ONLY the evidence provided.
Be specific, cite the evidence, and do not invent or assume information not present in the evidence.
If the evidence does not contain enough information to answer the question, say so clearly."""


def generate_answer(query: str, chunks: list[dict]) -> dict:
    """Generate a grounded answer from retrieved chunks.

    Returns:
        answer: str
        sources: list[str]
        evidence_snippets: list[str]
    """
    if not chunks:
        return {
            "answer": "I don't have enough information in my knowledge base to answer that question yet. Please upload a resume or relevant documents first.",
            "sources": [],
            "evidence_snippets": [],
        }

    formatted_evidence = _format_evidence(chunks)
    sources = _extract_sources(chunks)
    evidence_snippets = [c["text"][:300] for c in chunks]

    llm = ChatOpenAI(
        model=settings.openai_generation_model,
        api_key=settings.openai_api_key,
        temperature=0.1,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Question: {query}\n\nEvidence:\n{formatted_evidence}"),
    ]

    response = llm.invoke(messages)
    answer = response.content

    logger.info(f"Generated answer ({len(answer)} chars) for: {query[:60]!r}")
    return {
        "answer": answer,
        "sources": sources,
        "evidence_snippets": evidence_snippets,
    }


def _format_evidence(chunks: list[dict]) -> str:
    lines = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk["metadata"]
        source = meta.get("source_filename", "unknown")
        section = meta.get("section", "")
        doc_type = meta.get("doc_type", "")
        label = f"(source: {source}, type: {doc_type}" + (f", section: {section}" if section else "") + ")"
        lines.append(f"[{i}] {label}\n{chunk['text']}")
    return "\n\n".join(lines)


def _extract_sources(chunks: list[dict]) -> list[str]:
    seen = set()
    sources = []
    for chunk in chunks:
        src = chunk["metadata"].get("source_filename", "unknown")
        if src not in seen:
            seen.add(src)
            sources.append(src)
    return sources
