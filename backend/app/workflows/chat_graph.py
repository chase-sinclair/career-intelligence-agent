from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.logging import get_logger
from app.services.retrieval import retrieve
from app.services.generation import generate_answer, rewrite_query
from app.models.evaluation import EvaluationScores
from app.workflows.eval_graph import run_evaluation

logger = get_logger(__name__)


class ChatState(TypedDict):
    query: str
    retrieval_query: str
    conversation_history: list[dict]
    chunks: list[dict]
    answer: str
    sources: list[str]
    evidence_snippets: list[str]
    scores: EvaluationScores


def retrieve_node(state: ChatState) -> ChatState:
    history = state.get("conversation_history") or []
    query = state["query"]
    retrieval_query = rewrite_query(query, history) if history else query
    chunks = retrieve(retrieval_query, k=12)
    return {**state, "retrieval_query": retrieval_query, "chunks": chunks}


def generate_node(state: ChatState) -> ChatState:
    result = generate_answer(
        state["query"],
        state["chunks"],
        state.get("conversation_history"),
    )
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
        "retrieval_query": "",
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
