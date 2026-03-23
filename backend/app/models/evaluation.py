from pydantic import BaseModel


class EvaluationScores(BaseModel):
    groundedness: float       # 0.0–1.0
    completeness: float       # 0.0–1.0
    unsupported_claim: bool
    confidence: float         # 0.0–1.0
    explanation: str
