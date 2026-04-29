"""Tests for the evidence gate (pre-generation evidence sufficiency check).

Run from the backend/ directory:
    python -m pytest tests/test_evidence_gate.py -v --tb=short

Groups:
  unit     — no LLM calls, instant
  service  — gpt-4o-mini calls with controlled mock chunks (~2-3 LLM calls)
  pipeline — full run_chat() with real Chroma + all LLMs (~3-4 LLM calls each)
"""
import pytest

# ── Fixtures / mock data ──────────────────────────────────────────────────────

RELEVANT_CHUNKS = [
    {
        "text": (
            "Chase Sinclair is a Solutions Architect and AI Engineer with 7+ years of experience "
            "building data pipelines, analytics platforms, and AI-powered systems for federal "
            "government clients at Booz Allen Hamilton. He has led teams of 3–8 engineers and "
            "delivered production ML systems at agencies including FEMA, DOL, and USDA."
        ),
        "metadata": {"source_filename": "chase-sinclair-core-profile.md", "doc_type": "resume"},
    },
    {
        "text": (
            "Technical Skills: Python, SQL, FastAPI, LangChain, LangGraph, OpenAI API, "
            "AWS (EC2, S3, Lambda, SageMaker), Docker, Kubernetes, React, Next.js, TypeScript. "
            "Strong background in RAG pipeline design, LLM evaluation, and prompt engineering."
        ),
        "metadata": {"source_filename": "chase-sinclair-core-profile.md", "doc_type": "resume"},
    },
]

IRRELEVANT_CHUNKS = [
    {
        "text": (
            "To make a classic beef bourguignon, start by browning the beef in batches. "
            "Add carrots, onions, and garlic, then deglaze with Burgundy wine. Braise for 2–3 hours."
        ),
        "metadata": {"source_filename": "recipes.md", "doc_type": "unknown"},
    },
    {
        "text": (
            "The proper technique for folding egg whites into a soufflé batter is crucial for "
            "achieving maximum lift. Use a rubber spatula and fold in three additions."
        ),
        "metadata": {"source_filename": "cooking-guide.md", "doc_type": "unknown"},
    },
]


# ── Unit tests — no LLM calls ─────────────────────────────────────────────────

class TestEvidenceSufficiencyModel:
    """Validate the Pydantic model itself."""

    def test_model_constructs_correctly(self):
        from app.models.evaluation import EvidenceSufficiency
        s = EvidenceSufficiency(
            relevance=0.8,
            coverage=0.75,
            source_quality=1.0,
            conflict_flag=False,
            should_answer=True,
            explanation="Evidence is strong and relevant.",
        )
        assert s.relevance == 0.8
        assert s.coverage == 0.75
        assert s.source_quality == 1.0
        assert s.conflict_flag is False
        assert s.should_answer is True
        assert s.explanation == "Evidence is strong and relevant."
        print("\n  EvidenceSufficiency model: all fields correct")

    def test_model_in_chat_response(self):
        from app.models.evaluation import EvaluationScores, EvidenceSufficiency
        from app.models.chat import ChatResponse
        resp = ChatResponse(
            answer="Test answer",
            sources=["source.md"],
            evidence_snippets=["snippet"],
            scores=EvaluationScores(
                groundedness=0.9,
                completeness=0.8,
                unsupported_claim=False,
                confidence=0.95,
                explanation="Good answer",
            ),
            evidence_sufficiency=EvidenceSufficiency(
                relevance=0.85,
                coverage=0.80,
                source_quality=1.0,
                conflict_flag=False,
                should_answer=True,
                explanation="Evidence is sufficient.",
            ),
        )
        assert hasattr(resp, "evidence_sufficiency")
        assert resp.evidence_sufficiency.should_answer is True
        print("\n  ChatResponse includes evidence_sufficiency: confirmed")


class TestFallbackConstants:
    """Verify fallback constants are set to safe values."""

    def test_fallback_sufficiency_fails_open(self):
        from app.workflows.chat_graph import _FALLBACK_SUFFICIENCY
        assert _FALLBACK_SUFFICIENCY.should_answer is True, (
            "_FALLBACK_SUFFICIENCY must fail open (should_answer=True) "
            "so a broken gate never silently blocks legitimate answers"
        )
        print(f"\n  _FALLBACK_SUFFICIENCY.should_answer = {_FALLBACK_SUFFICIENCY.should_answer} (fail-open: correct)")

    def test_fallback_scores_are_zeroed(self):
        from app.workflows.chat_graph import _FALLBACK_SCORES
        assert _FALLBACK_SCORES.groundedness == 0.0
        assert _FALLBACK_SCORES.completeness == 0.0
        assert _FALLBACK_SCORES.confidence == 0.0
        print(f"\n  _FALLBACK_SCORES: groundedness={_FALLBACK_SCORES.groundedness}, completeness={_FALLBACK_SCORES.completeness}")


class TestEmptyChunksGate:
    """Empty chunks must block without making an LLM call."""

    def test_empty_chunks_blocks_immediately(self):
        from app.services.evaluation import evaluate_evidence
        result = evaluate_evidence("What are Chase's skills?", [])
        assert result.should_answer is False
        assert result.relevance == 0.0
        assert result.coverage == 0.0
        assert result.source_quality == 0.0
        print(f"\n  Empty chunks -> should_answer={result.should_answer}, explanation='{result.explanation}'")

    def test_empty_chunks_has_explanation(self):
        from app.services.evaluation import evaluate_evidence
        result = evaluate_evidence("test query", [])
        assert result.explanation, "Explanation must be non-empty"
        print(f"\n  Empty chunks explanation: '{result.explanation}'")


class TestChatStateShape:
    """ChatState TypedDict has all required keys."""

    def test_chat_state_fields(self):
        import typing
        from app.workflows.chat_graph import ChatState
        hints = typing.get_type_hints(ChatState)
        required = {"query", "retrieval_query", "conversation_history", "chunks",
                    "evidence_sufficiency", "answer", "sources", "evidence_snippets", "scores"}
        missing = required - set(hints.keys())
        assert not missing, f"ChatState missing fields: {missing}"
        print(f"\n  ChatState fields: {sorted(hints.keys())}")


# ── Service tests — real LLM calls with controlled mock chunks ─────────────────

class TestEvaluateEvidenceService:
    """Call evaluate_evidence() with mock chunks to verify gate logic."""

    def test_relevant_chunks_pass_gate(self):
        from app.services.evaluation import evaluate_evidence
        q = "What is Chase's background and experience?"
        result = evaluate_evidence(q, RELEVANT_CHUNKS)
        print(f"\n  Relevant chunks — relevance={result.relevance:.2f} coverage={result.coverage:.2f} "
              f"source_quality={result.source_quality:.2f} should_answer={result.should_answer}")
        print(f"  Explanation: {result.explanation}")
        assert result.should_answer is True, (
            f"Gate should pass for clearly relevant resume chunks. "
            f"Got should_answer={result.should_answer}, relevance={result.relevance:.2f}"
        )
        assert result.relevance >= 0.5, f"Relevance should be ≥ 0.5 for resume chunks, got {result.relevance:.2f}"
        assert result.coverage >= 0.4, f"Coverage should be ≥ 0.4 for resume chunks, got {result.coverage:.2f}"

    def test_irrelevant_chunks_block_gate(self):
        from app.services.evaluation import evaluate_evidence
        q = "What is Chase's Python experience?"
        result = evaluate_evidence(q, IRRELEVANT_CHUNKS)
        print(f"\n  Irrelevant chunks (cooking) — relevance={result.relevance:.2f} coverage={result.coverage:.2f} "
              f"source_quality={result.source_quality:.2f} should_answer={result.should_answer}")
        print(f"  Explanation: {result.explanation}")
        assert result.relevance < 0.5, (
            f"Relevance should be low for cooking-recipe chunks, got {result.relevance:.2f}"
        )
        assert result.should_answer is False, (
            f"Gate should block cooking-recipe chunks for a career question. "
            f"Got should_answer={result.should_answer}"
        )

    def test_source_quality_scores_resume_highly(self):
        from app.services.evaluation import evaluate_evidence
        result = evaluate_evidence("Tell me about Chase's skills", RELEVANT_CHUNKS)
        print(f"\n  Source quality for resume chunks: {result.source_quality:.2f}")
        assert result.source_quality >= 0.6, (
            f"Resume/project_doc sources should score ≥ 0.6, got {result.source_quality:.2f}"
        )

    def test_result_has_all_fields(self):
        from app.services.evaluation import evaluate_evidence
        result = evaluate_evidence("What tools does Chase use?", RELEVANT_CHUNKS)
        assert 0.0 <= result.relevance <= 1.0
        assert 0.0 <= result.coverage <= 1.0
        assert 0.0 <= result.source_quality <= 1.0
        assert isinstance(result.conflict_flag, bool)
        assert isinstance(result.should_answer, bool)
        assert isinstance(result.explanation, str) and result.explanation
        print(f"\n  All EvidenceSufficiency fields present and in-range")


# ── Pipeline tests — full run_chat() ─────────────────────────────────────────

class TestRunChatPipeline:
    """Full end-to-end run_chat() tests verifying the evidence gate is wired correctly."""

    def test_response_has_evidence_sufficiency_key(self):
        from app.workflows.chat_graph import run_chat
        result = run_chat("What programming languages does Chase know?")
        assert "evidence_sufficiency" in result, "run_chat() must return evidence_sufficiency"
        suf = result["evidence_sufficiency"]
        print(f"\n  Response keys: {sorted(result.keys())}")
        print(f"  evidence_sufficiency: relevance={suf.relevance:.2f} coverage={suf.coverage:.2f} "
              f"should_answer={suf.should_answer}")

    def test_in_scope_question_passes_gate(self):
        from app.workflows.chat_graph import run_chat
        result = run_chat("What is Chase's experience at Booz Allen Hamilton?")
        suf = result["evidence_sufficiency"]
        print(f"\n  In-scope question gate scores:")
        print(f"    relevance={suf.relevance:.2f} coverage={suf.coverage:.2f} "
              f"source_quality={suf.source_quality:.2f}")
        print(f"    should_answer={suf.should_answer}")
        print(f"    explanation: {suf.explanation}")
        print(f"  Answer ({len(result['answer'])} chars): {result['answer'][:120]}…")
        assert suf.should_answer is True, "In-scope career question should pass the evidence gate"
        assert result["answer"], "Answer must be non-empty when gate passes"
        assert result["sources"], "Sources must be present when gate passes"

    def test_in_scope_question_has_nonzero_scores(self):
        from app.workflows.chat_graph import run_chat
        result = run_chat("What AI or machine learning systems has Chase built?")
        suf = result["evidence_sufficiency"]
        scores = result["scores"]
        print(f"\n  Post-generation scores for in-scope question:")
        print(f"    groundedness={scores.groundedness:.3f} completeness={scores.completeness:.3f}")
        print(f"    unsupported_claim={scores.unsupported_claim}")
        print(f"    judge explanation: {scores.explanation}")
        assert suf.should_answer is True
        assert scores.groundedness > 0.0, "Groundedness should be > 0 for a well-evidenced answer"
        assert scores.completeness > 0.0, "Completeness should be > 0 for a well-evidenced answer"

    def test_out_of_scope_question_is_handled(self):
        from app.workflows.chat_graph import run_chat
        result = run_chat("What are the best restaurants in Paris?")
        suf = result["evidence_sufficiency"]
        print(f"\n  Out-of-scope question (Paris restaurants):")
        print(f"    relevance={suf.relevance:.2f} coverage={suf.coverage:.2f} "
              f"should_answer={suf.should_answer}")
        print(f"    explanation: {suf.explanation}")
        print(f"  Answer: {result['answer'][:200]}")
        if suf.should_answer:
            # Gate let it through — the answer should be hedged
            assert len(result["answer"]) > 0
            print("    NOTE: Gate passed but answer should acknowledge lack of relevant evidence")
        else:
            # Gate blocked — sources should be empty
            assert result["sources"] == [], "Blocked responses must have empty sources"
            assert result["evidence_snippets"] == [], "Blocked responses must have empty evidence_snippets"
            print("    Gate correctly blocked out-of-scope question")

    def test_gated_response_has_empty_sources(self):
        """When gate blocks, sources and evidence_snippets must be empty."""
        from app.workflows.chat_graph import run_chat
        # Use empty-ish query that's completely off-topic to force a block
        result = run_chat("How do I bake sourdough bread?")
        suf = result["evidence_sufficiency"]
        print(f"\n  Off-topic gate check (sourdough bread):")
        print(f"    should_answer={suf.should_answer}")
        if not suf.should_answer:
            assert result["sources"] == [], "Gated response must have empty sources"
            assert result["evidence_snippets"] == [], "Gated response must have empty evidence_snippets"
            assert result["answer"], "Gated response must still have an explanation message"
            print(f"    Gate blocked correctly. Message: {result['answer'][:120]}")
        else:
            print(f"    Gate passed (relevance={suf.relevance:.2f}). Answer: {result['answer'][:120]}")

    def test_all_result_keys_present(self):
        from app.workflows.chat_graph import run_chat
        result = run_chat("Does Chase have any certifications?")
        required_keys = {"answer", "sources", "evidence_snippets", "scores", "evidence_sufficiency"}
        missing = required_keys - set(result.keys())
        assert not missing, f"run_chat() result missing keys: {missing}"
        print(f"\n  All required keys present: {sorted(result.keys())}")
        suf = result["evidence_sufficiency"]
        scores = result["scores"]
        print(f"  evidence_sufficiency: relevance={suf.relevance:.2f} coverage={suf.coverage:.2f} "
              f"should_answer={suf.should_answer}")
        print(f"  scores: groundedness={scores.groundedness:.3f} completeness={scores.completeness:.3f}")
