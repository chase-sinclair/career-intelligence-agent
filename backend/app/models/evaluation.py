from pydantic import BaseModel


class EvaluationScores(BaseModel):
    groundedness: float       # 0.0–1.0
    completeness: float       # 0.0–1.0
    unsupported_claim: bool
    confidence: float         # 0.0–1.0
    explanation: str


class EvidenceSufficiency(BaseModel):
    relevance: float       # 0.0–1.0: are chunks topically relevant?
    coverage: float        # 0.0–1.0: do chunks collectively cover what's needed?
    source_quality: float  # 0.0–1.0: how authoritative are the sources?
    conflict_flag: bool    # contradictions detected between chunks?
    should_answer: bool    # gate decision — True means proceed to generation
    explanation: str
