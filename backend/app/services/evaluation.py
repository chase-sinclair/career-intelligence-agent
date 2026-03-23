import json

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.core.logging import get_logger
from app.models.evaluation import EvaluationScores

logger = get_logger(__name__)

_JUDGE_SYSTEM_PROMPT = """You are an expert evaluator of AI-generated answers about job candidates.

You will receive:
- A recruiter's question
- The AI's generated answer
- The evidence chunks the AI was given to answer from

Evaluate on these four dimensions and respond with JSON only:

groundedness (float 0.0-1.0): Are all claims in the answer directly supported by the evidence?
  1.0 = every claim has clear evidence support
  0.0 = no claims are supported

completeness (float 0.0-1.0): Does the answer address all relevant points available in the evidence?
  1.0 = fully covers what the evidence allows
  0.0 = misses most relevant available information

unsupported_claim (boolean): Does the answer assert anything NOT found in the evidence?

confidence (float 0.0-1.0): Your confidence in this evaluation.

explanation (string): One or two sentences explaining the scores.

Return only a JSON object with keys: groundedness, completeness, unsupported_claim, confidence, explanation."""


def _format_evidence(chunks: list[dict]) -> str:
    lines = []
    for i, chunk in enumerate(chunks, 1):
        meta = chunk.get("metadata", {})
        source = meta.get("source_filename", "unknown")
        doc_type = meta.get("doc_type", "")
        lines.append(f"[{i}] (source: {source}, type: {doc_type})\n{chunk['text']}")
    return "\n\n".join(lines)


def evaluate_answer(query: str, answer: str, chunks: list[dict]) -> EvaluationScores:
    """Call gpt-4o-mini as an LLM judge to score a generated answer against retrieved evidence.

    Returns EvaluationScores. On any failure returns safe non-raising defaults.
    """
    if not chunks or not answer:
        return EvaluationScores(
            groundedness=0.5,
            completeness=0.5,
            unsupported_claim=False,
            confidence=0.0,
            explanation="No evidence or answer available to evaluate.",
        )

    try:
        llm = ChatOpenAI(
            model=settings.openai_eval_model,
            api_key=settings.openai_api_key,
            temperature=0.0,
            model_kwargs={"response_format": {"type": "json_object"}},
        )

        human_content = (
            f"QUESTION: {query}\n\n"
            f"ANSWER:\n{answer}\n\n"
            f"EVIDENCE:\n{_format_evidence(chunks)}"
        )

        response = llm.invoke([
            SystemMessage(content=_JUDGE_SYSTEM_PROMPT),
            HumanMessage(content=human_content),
        ])
        data = json.loads(response.content)

        scores = EvaluationScores(
            groundedness=float(data.get("groundedness", 0.5)),
            completeness=float(data.get("completeness", 0.5)),
            unsupported_claim=bool(data.get("unsupported_claim", False)),
            confidence=float(data.get("confidence", 0.0)),
            explanation=str(data.get("explanation", "")),
        )
        logger.info(
            f"Judge scores — groundedness={scores.groundedness:.3f} "
            f"completeness={scores.completeness:.3f} "
            f"unsupported={scores.unsupported_claim}"
        )
        return scores

    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        return EvaluationScores(
            groundedness=0.5,
            completeness=0.5,
            unsupported_claim=False,
            confidence=0.0,
            explanation=f"Evaluation error: {e}",
        )
