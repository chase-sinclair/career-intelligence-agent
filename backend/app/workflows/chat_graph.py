from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.logging import get_logger
from app.services.retrieval import retrieve
from app.services.generation import generate_answer
from app.models.evaluation import EvaluationScores
from app.workflows.eval_graph import run_evaluation

logger = get_logger(__name__)


class ChatState(TypedDict):
    query: str
    conversation_history: list[dict]
    chunks: list[dict]
    answer: str
    sources: list[str]
    evidence_snippets: list[str]
    scores: EvaluationScores


def retrieve_node(state: ChatState) -> ChatState:
    chunks = retrieve(state["query"], k=5)
    return {**state, "chunks": chunks}


def generate_node(state: ChatState) -> ChatState:
    result = generate_answer(state["query"], state["chunks"])
    return {
        **state,
        "answer": result["answer"],
        "sources": result["sources"],
        "evidence_snippets": result["evidence_snippets"],
    }


def evaluate_node(state: ChatState) -> ChatState:
    scores = run_evaluation(state["query"], state["answer"], state["chunks"])
    return {**state, "scores": scores}


def build_chat_graph():
    graph = StateGraph(ChatState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)
    graph.add_node("evaluate", evaluate_node)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", "evaluate")
    graph.add_edge("evaluate", END)

    return graph.compile()


chat_graph = build_chat_graph()

_FALLBACK_SCORES = EvaluationScores(
    groundedness=0.0,
    completeness=0.0,
    unsupported_claim=False,
    confidence=0.0,
    explanation="Evaluation unavailable.",
)


def run_chat(query: str, conversation_history: list[dict] | None = None) -> dict:
    """Run the Q&A workflow for a recruiter query."""
    initial_state: ChatState = {
        "query": query,
        "conversation_history": conversation_history or [],
        "chunks": [],
        "answer": "",
        "sources": [],
        "evidence_snippets": [],
        "scores": _FALLBACK_SCORES,
    }
    result = chat_graph.invoke(initial_state)
    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "evidence_snippets": result["evidence_snippets"],
        "scores": result["scores"],
    }
