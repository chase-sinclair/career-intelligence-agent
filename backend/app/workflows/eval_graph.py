from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.logging import get_logger
from app.models.evaluation import EvaluationScores
from app.services.evaluation import evaluate_answer

logger = get_logger(__name__)


class EvalState(TypedDict):
    query: str
    answer: str
    chunks: list[dict]
    scores: EvaluationScores
    error: str | None


def judge_node(state: EvalState) -> EvalState:
    try:
        scores = evaluate_answer(state["query"], state["answer"], state["chunks"])
        return {**state, "scores": scores, "error": None}
    except Exception as e:
        logger.error(f"Judge node failed: {e}")
        return {**state, "error": str(e)}


def build_eval_graph():
    graph = StateGraph(EvalState)
    graph.add_node("judge", judge_node)
    graph.set_entry_point("judge")
    graph.add_edge("judge", END)
    return graph.compile()


eval_graph = build_eval_graph()

_FALLBACK_SCORES = EvaluationScores(
    groundedness=0.5,
    completeness=0.5,
    unsupported_claim=False,
    confidence=0.0,
    explanation="Evaluation unavailable.",
)


def run_evaluation(query: str, answer: str, chunks: list[dict]) -> EvaluationScores:
    """Run the evaluation agent for a single answer. Returns EvaluationScores."""
    initial_state: EvalState = {
        "query": query,
        "answer": answer,
        "chunks": chunks,
        "scores": _FALLBACK_SCORES,
        "error": None,
    }
    result = eval_graph.invoke(initial_state)
    return result["scores"]
