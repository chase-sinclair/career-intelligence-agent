from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are an AI assistant representing a job candidate to recruiters.
Answer questions about the candidate's background, skills, and experience using ONLY the evidence provided.
Be specific, cite the evidence, and do not invent or assume information not present in the evidence.
If the evidence does not contain enough information to answer the question, say so clearly.

Important instructions:
- Before concluding that a skill, tool, or credential is absent, scan EVERY evidence snippet carefully — relevant information may appear in bullet lists, skill sections, or technical detail paragraphs, not just narrative text.
- The document name shown in each evidence block (e.g. "aws-ai-practitioner-professional-certificate.md") is itself evidence about what that document covers — treat it as such when identifying credentials, certifications, or project context.
- Do not conflate absence of explicit mention with absence of experience — if a skill clearly appears anywhere in the evidence, acknowledge it."""

_REWRITE_PROMPT = """Given a conversation history and a follow-up question, rewrite the follow-up question to be fully self-contained — resolving any pronouns, references like "that", "it", "there", or "him" using context from the history.

If the question is already self-contained and specific, return it unchanged.
Return only the rewritten question. No explanation, no punctuation changes beyond what is needed."""


def rewrite_query(query: str, conversation_history: list[dict]) -> str:
    """Rewrite a context-dependent follow-up query into a standalone query."""
    if not conversation_history:
        return query

    recent = conversation_history[-4:]
    history_text = "\n".join(
        f"{t['role'].upper()}: {t['content']}" for t in recent
    )

    llm = ChatOpenAI(
        model=settings.openai_eval_model,
        api_key=settings.openai_api_key,
        temperature=0.0,
    )

    response = llm.invoke([
        HumanMessage(content=f"{_REWRITE_PROMPT}\n\nConversation history:\n{history_text}\n\nFollow-up question: {query}"),
    ])
    rewritten = response.content.strip()
    if rewritten != query:
        logger.info(f"Query rewritten: {query!r} -> {rewritten!r}")
    return rewritten


def generate_answer(query: str, chunks: list[dict], conversation_history: list[dict] | None = None) -> dict:
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

    messages: list = [SystemMessage(content=SYSTEM_PROMPT)]

    # Inject the last 3 exchanges (6 messages) as conversation context
    for turn in (conversation_history or [])[-6:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=f"Question: {query}\n\nEvidence:\n{formatted_evidence}"))

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
