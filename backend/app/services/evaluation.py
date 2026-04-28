import json

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings
from app.core.logging import get_logger
from app.models.evaluation import EvaluationScores, EvidenceSufficiency

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

Special cases:
- If the answer explicitly states that the evidence does not contain enough information to answer the question, and the evidence chunks indeed lack that information, this is a CORRECT and grounded response. Score it: groundedness=1.0, completeness=1.0, unsupported_claim=false. Do NOT penalize honest admissions of missing information.
- Only flag unsupported_claim=true if the answer makes a positive assertion about the candidate that is not found anywhere in the evidence.
- Source filenames shown in each evidence block (e.g. "aws-ai-practitioner-professional-certificate.md", "google-ai-professional-certificate.md") are themselves evidence about what credentials or documents exist. An answer that identifies a credential from a filename is grounded, not an unsupported claim.

Return only a JSON object with keys: groundedness, completeness, unsupported_claim, confidence, explanation."""


_GATE_SYSTEM_PROMPT = """You are evaluating whether retrieved evidence is sufficient to answer a recruiter's question about a job candidate.

You will receive:
- The recruiter's question
- Retrieved evidence chunks (text + source metadata)

Evaluate on these dimensions and respond with JSON only:

relevance (float 0.0-1.0): Are the retrieved chunks topically relevant to the question?
  1.0 = all chunks directly address the question topic
  0.0 = chunks are entirely off-topic

coverage (float 0.0-1.0): Do the chunks collectively contain enough specific information to answer?
  1.0 = the evidence fully contains the facts needed
  0.0 = the evidence lacks the key facts entirely

source_quality (float 0.0-1.0): How authoritative are the source documents?
  1.0 = primary sources (resume, project_doc, certifications)
  0.5 = supporting documents
  0.0 = no recognizable sources retrieved

conflict_flag (boolean): Do any chunks directly contradict each other on key facts?

should_answer (boolean): Should the system attempt to answer from this evidence?
  Set false only when evidence is clearly insufficient — relevance is very low OR specific facts are absent.
  Set true for borderline cases; score bars will communicate uncertainty to the recruiter.
  When in doubt, set true — a hedged answer from partial evidence is better than refusing a legitimate question.

explanation (string): One sentence explaining the gate decision.

Return only a JSON object with keys: relevance, coverage, source_quality, conflict_flag, should_answer, explanation."""


def evaluate_evidence(query: str, chunks: list[dict]) -> EvidenceSufficiency:
    """Pre-generation evidence gate: assess retrieved chunks before answer generation.

    Returns EvidenceSufficiency. Fails open on error (should_answer=True) so a
    broken gate never silently blocks legitimate answers.
    """
    if not chunks:
        return EvidenceSufficiency(
            relevance=0.0,
            coverage=0.0,
            source_quality=0.0,
            conflict_flag=False,
            should_answer=False,
            explanation="No evidence retrieved for this query.",
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
            f"EVIDENCE:\n{_format_evidence(chunks)}"
        )

        response = llm.invoke([
            SystemMessage(content=_GATE_SYSTEM_PROMPT),
            HumanMessage(content=human_content),
        ])
        data = json.loads(response.content)

        sufficiency = EvidenceSufficiency(
            relevance=float(data.get("relevance", 0.5)),
            coverage=float(data.get("coverage", 0.5)),
            source_quality=float(data.get("source_quality", 0.5)),
            conflict_flag=bool(data.get("conflict_flag", False)),
            should_answer=bool(data.get("should_answer", True)),
            explanation=str(data.get("explanation", "")),
        )
        logger.info(
            f"Evidence gate — relevance={sufficiency.relevance:.2f} "
            f"coverage={sufficiency.coverage:.2f} "
            f"should_answer={sufficiency.should_answer}"
        )
        return sufficiency

    except Exception as e:
        logger.error(f"Evidence gate failed: {e}")
        return EvidenceSufficiency(
            relevance=0.5,
            coverage=0.5,
            source_quality=0.5,
            conflict_flag=False,
            should_answer=True,
            explanation=f"Evidence check unavailable: {e}",
        )


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
