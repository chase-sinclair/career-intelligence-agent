from typing import TypedDict

from langgraph.graph import StateGraph, END

from app.core.logging import get_logger
from app.models.profile import CandidateProfile, SiteContent
from app.services.retrieval import retrieve
from app.services.profile_builder import build_profile
from app.services.content_generator import generate_site_content

logger = get_logger(__name__)


class ProfileState(TypedDict):
    chunks: list[dict]
    profile: CandidateProfile | None
    site_content: SiteContent | None
    error: str | None


def retrieve_all_node(state: ProfileState) -> ProfileState:
    """Fetch a broad sample of chunks to give the profile builder full context."""
    try:
        # Use a generic query to surface broad coverage across the document
        chunks = retrieve("experience skills projects education background", k=20)
        logger.info(f"Retrieved {len(chunks)} chunks for profile synthesis")
        return {**state, "chunks": chunks, "error": None}
    except Exception as e:
        logger.error(f"Retrieval failed: {e}")
        return {**state, "error": str(e)}


def build_profile_node(state: ProfileState) -> ProfileState:
    if state.get("error"):
        return state
    try:
        profile = build_profile(state["chunks"])
        return {**state, "profile": profile}
    except Exception as e:
        logger.error(f"Profile build failed: {e}")
        return {**state, "error": str(e)}


def generate_content_node(state: ProfileState) -> ProfileState:
    if state.get("error"):
        return state
    try:
        content = generate_site_content(state["profile"])
        return {**state, "site_content": content}
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        return {**state, "error": str(e)}


def build_profile_graph():
    graph = StateGraph(ProfileState)
    graph.add_node("retrieve_all", retrieve_all_node)
    graph.add_node("build_profile", build_profile_node)
    graph.add_node("generate_content", generate_content_node)

    graph.set_entry_point("retrieve_all")
    graph.add_edge("retrieve_all", "build_profile")
    graph.add_edge("build_profile", "generate_content")
    graph.add_edge("generate_content", END)

    return graph.compile()


profile_graph = build_profile_graph()


def run_profile_generation() -> dict:
    """Run the full profile synthesis workflow."""
    initial_state: ProfileState = {
        "chunks": [],
        "profile": None,
        "site_content": None,
        "error": None,
    }
    result = profile_graph.invoke(initial_state)

    if result.get("error"):
        return {"status": "error", "error": result["error"]}

    return {
        "status": "ok",
        "profile_path": "backend/data/candidate_profile.json",
        "content_path": "backend/data/site_content.json",
    }
