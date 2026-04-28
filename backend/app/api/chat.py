from fastapi import APIRouter
from pydantic import BaseModel

from app.core.logging import get_logger
from app.models.chat import ChatRequest, ChatResponse
from app.workflows.chat_graph import run_chat

logger = get_logger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """RAG query endpoint: retrieve → generate → return answer with sources and scores."""
    result = run_chat(request.query, request.conversation_history)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        evidence_snippets=result["evidence_snippets"],
        scores=result["scores"],
        evidence_sufficiency=result["evidence_sufficiency"],
    )
