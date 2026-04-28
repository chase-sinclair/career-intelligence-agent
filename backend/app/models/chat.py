from pydantic import BaseModel
from .evaluation import EvaluationScores, EvidenceSufficiency


class ChatRequest(BaseModel):
    query: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    evidence_snippets: list[str]
    scores: EvaluationScores
    evidence_sufficiency: EvidenceSufficiency
