from pydantic import BaseModel
from .evaluation import EvaluationScores, EvidenceSufficiency


class EvidenceSnippet(BaseModel):
    citation_index: int
    source: str
    text: str


class ChatRequest(BaseModel):
    query: str
    conversation_history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    evidence_snippets: list[EvidenceSnippet]
    scores: EvaluationScores
    evidence_sufficiency: EvidenceSufficiency
