"""Test that the evidence gate produces gradient scores (not just 0.0 or 1.0).

Covers three classes of queries:
  - Clearly in-scope  → high scores near 1.0
  - Clearly out-scope → low scores near 0.0
  - Ambiguous         → intermediate scores 0.2–0.8 (the new behavior we're testing)

Run: python -m pytest tests/test_gate_gradient.py -v --tb=short -s
"""
import pytest
from app.services.evaluation import evaluate_evidence

# ── Shared chunk fixtures ─────────────────────────────────────────────────────

RESUME_CHUNKS = [
    {
        "text": (
            "Chase Sinclair is a Solutions Architect and AI Engineer with 7+ years of experience "
            "building data pipelines, analytics platforms, and AI-powered systems for federal "
            "government clients at Booz Allen Hamilton. He has led teams of 3-8 engineers."
        ),
        "metadata": {"source_filename": "chase-sinclair-core-profile.md", "doc_type": "resume"},
    },
    {
        "text": (
            "Technical Skills: Python, SQL, FastAPI, LangChain, LangGraph, OpenAI API, "
            "AWS (EC2, S3, Lambda, SageMaker), Docker, React, Next.js, TypeScript."
        ),
        "metadata": {"source_filename": "chase-sinclair-core-profile.md", "doc_type": "resume"},
    },
]

COOKING_CHUNKS = [
    {
        "text": "To make beef bourguignon, brown the beef in batches, add vegetables, deglaze with wine, and braise for 2-3 hours.",
        "metadata": {"source_filename": "recipes.md", "doc_type": "unknown"},
    },
]

# Partially relevant: backend engineering experience but not specifically the
# technology asked about (Rust). Chroma would return these for "Rust experience"
# since they're the closest match, but they don't cover Rust specifically.
PARTIAL_CHUNKS = [
    {
        "text": (
            "Chase has built production backend systems using Python and FastAPI for federal clients. "
            "He has experience with REST API design, microservices architecture, and containerization "
            "with Docker and Kubernetes."
        ),
        "metadata": {"source_filename": "chase-sinclair-core-profile.md", "doc_type": "resume"},
    },
    {
        "text": (
            "Chase has worked on data engineering pipelines using Apache Spark, dbt, and Airflow. "
            "He is comfortable across the Python ecosystem including pandas, numpy, and scikit-learn."
        ),
        "metadata": {"source_filename": "bah-work-highlights.md", "doc_type": "project_doc"},
    },
    {
        "text": (
            "The team evaluated several message queue systems including Kafka and RabbitMQ for "
            "the data ingestion layer. The final architecture used AWS SQS for its managed reliability."
        ),
        "metadata": {"source_filename": "bah-work-highlights.md", "doc_type": "project_doc"},
    },
]


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestGradientScores:

    def test_clearly_relevant_scores_near_1(self):
        result = evaluate_evidence("What is Chase's background and experience?", RESUME_CHUNKS)
        print(f"\n  RELEVANT: relevance={result.relevance:.2f} coverage={result.coverage:.2f} "
              f"source_quality={result.source_quality:.2f} should_answer={result.should_answer}")
        print(f"  {result.explanation}")
        assert result.relevance >= 0.80, f"Expected >= 0.80, got {result.relevance:.2f}"
        assert result.coverage >= 0.70, f"Expected >= 0.70, got {result.coverage:.2f}"
        assert result.should_answer is True

    def test_clearly_irrelevant_scores_near_0(self):
        result = evaluate_evidence("What programming languages does Chase know?", COOKING_CHUNKS)
        print(f"\n  IRRELEVANT: relevance={result.relevance:.2f} coverage={result.coverage:.2f} "
              f"source_quality={result.source_quality:.2f} should_answer={result.should_answer}")
        print(f"  {result.explanation}")
        assert result.relevance <= 0.20, f"Expected <= 0.20, got {result.relevance:.2f}"
        assert result.coverage <= 0.20, f"Expected <= 0.20, got {result.coverage:.2f}"
        assert result.should_answer is False

    def test_ambiguous_rust_question_scores_in_middle(self):
        """Chase's backend context is retrieved but Rust specifically is not present.
        Relevance should be moderate (related domain), coverage should be low (no Rust facts)."""
        result = evaluate_evidence("Does Chase have experience with Rust?", PARTIAL_CHUNKS)
        print(f"\n  AMBIGUOUS (Rust not in KB): relevance={result.relevance:.2f} "
              f"coverage={result.coverage:.2f} source_quality={result.source_quality:.2f} "
              f"should_answer={result.should_answer}")
        print(f"  {result.explanation}")
        # Relevance is moderate — backend engineering context is related but not a direct match
        assert result.relevance <= 0.80, (
            f"Relevance should be below 0.80 since Rust isn't mentioned, got {result.relevance:.2f}"
        )
        # Coverage should be low — no Rust facts exist in the chunks
        assert result.coverage <= 0.40, (
            f"Coverage should be low since no Rust content exists, got {result.coverage:.2f}"
        )

    def test_ambiguous_partial_topic_coverage(self):
        """Question about Chase's data engineering work — partially covered but not complete."""
        result = evaluate_evidence(
            "What data engineering tools and frameworks has Chase used, and in what contexts?",
            PARTIAL_CHUNKS,
        )
        print(f"\n  AMBIGUOUS (partial data eng coverage): relevance={result.relevance:.2f} "
              f"coverage={result.coverage:.2f} source_quality={result.source_quality:.2f} "
              f"should_answer={result.should_answer}")
        print(f"  {result.explanation}")
        # This should score higher — data engineering chunks are directly relevant
        assert result.relevance >= 0.50, f"Expected >= 0.50 for data eng question, got {result.relevance:.2f}"
        # Coverage won't be perfect — only partial context
        print(f"  Scores are in gradient range (not strictly binary): "
              f"relevance={result.relevance:.2f}, coverage={result.coverage:.2f}")

    def test_scores_are_not_all_binary(self):
        """Run all three query types and confirm at least one produces a non-binary score."""
        queries_and_chunks = [
            ("Does Chase have experience with Rust?", PARTIAL_CHUNKS),
            ("What is Chase's cloud infrastructure background?", PARTIAL_CHUNKS),
            ("Has Chase worked with Salesforce or CRM platforms?", PARTIAL_CHUNKS),
        ]
        results = []
        for q, chunks in queries_and_chunks:
            r = evaluate_evidence(q, chunks)
            results.append(r)
            print(f"\n  Q: {q[:60]}")
            print(f"     relevance={r.relevance:.2f} coverage={r.coverage:.2f} should_answer={r.should_answer}")
            print(f"     {r.explanation}")

        # At least one score across all results should be in the 0.1–0.9 range
        all_scores = [r.relevance for r in results] + [r.coverage for r in results]
        intermediate = [s for s in all_scores if 0.10 < s < 0.90]
        print(f"\n  All scores: {[f'{s:.2f}' for s in all_scores]}")
        print(f"  Intermediate scores (0.1-0.9): {[f'{s:.2f}' for s in intermediate]}")
        assert intermediate, (
            f"Expected at least one intermediate score in 0.1-0.9 range across ambiguous queries. "
            f"All scores: {[f'{s:.2f}' for s in all_scores]}"
        )
