import json
import uuid
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger
from app.models.evaluation import EvaluationScores
from app.workflows.chat_graph import run_chat

logger = get_logger(__name__)

_GOLD_SET_PATH = Path(__file__).parent / "recruiter_questions.json"


# ── Result schemas ─────────────────────────────────────────────────────────────

class EvalQuestionResult(BaseModel):
    id: str
    question: str
    answer: str
    sources: list[str]
    scores: EvaluationScores
    must_mention_pass: bool


class EvalRunResult(BaseModel):
    run_id: str
    timestamp: str
    total_questions: int
    avg_groundedness: float
    avg_completeness: float
    avg_confidence: float
    unsupported_claim_rate: float
    must_mention_pass_rate: float
    results: list[EvalQuestionResult]


# ── Runner ─────────────────────────────────────────────────────────────────────

def run_batch_eval() -> EvalRunResult:
    """Run the gold question set through the full chat pipeline and score each answer."""
    gold_questions = json.loads(_GOLD_SET_PATH.read_text(encoding="utf-8"))
    logger.info(f"Running batch eval on {len(gold_questions)} questions")

    results: list[EvalQuestionResult] = []

    for q in gold_questions:
        qid = q["id"]
        question = q["question"]
        must_mention: list[str] = q.get("must_mention", [])

        logger.info(f"Evaluating [{qid}]: {question[:60]!r}")
        chat_result = run_chat(question)

        answer: str = chat_result["answer"]
        answer_lower = answer.lower()
        must_mention_pass = all(kw.lower() in answer_lower for kw in must_mention)

        results.append(EvalQuestionResult(
            id=qid,
            question=question,
            answer=answer,
            sources=chat_result["sources"],
            scores=chat_result["scores"],
            must_mention_pass=must_mention_pass,
        ))

    n = len(results)
    avg_groundedness = sum(r.scores.groundedness for r in results) / n
    avg_completeness = sum(r.scores.completeness for r in results) / n
    avg_confidence   = sum(r.scores.confidence   for r in results) / n
    unsupported_claim_rate  = sum(1 for r in results if r.scores.unsupported_claim) / n
    must_mention_pass_rate  = sum(1 for r in results if r.must_mention_pass) / n

    run_result = EvalRunResult(
        run_id=str(uuid.uuid4()),
        timestamp=datetime.utcnow().isoformat(),
        total_questions=n,
        avg_groundedness=round(avg_groundedness, 4),
        avg_completeness=round(avg_completeness, 4),
        avg_confidence=round(avg_confidence, 4),
        unsupported_claim_rate=round(unsupported_claim_rate, 4),
        must_mention_pass_rate=round(must_mention_pass_rate, 4),
        results=results,
    )

    # Persist to data dir
    out_path = Path(settings.data_dir) / "eval_results.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(run_result.model_dump_json(indent=2), encoding="utf-8")
    logger.info(f"Eval results saved to {out_path}")

    return run_result
