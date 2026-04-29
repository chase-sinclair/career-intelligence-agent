"""Test citation alignment on a question that pulls from many different source files."""
import re
from app.workflows.chat_graph import run_chat

questions = [
    "What AI systems has Chase built and what impact did they have?",
    "What is Chase's experience with Python and cloud infrastructure?",
]

for q in questions:
    print(f"\n{'='*60}")
    print(f"Q: {q}")
    print('='*60)
    result = run_chat(q)

    cited_in_answer = {int(m) for m in re.findall(r'\[(\d+)\]', result["answer"])}
    cited_in_snippets = {s["citation_index"] for s in result["evidence_snippets"]}

    print(f"Answer ({len(result['answer'])} chars):")
    print(result["answer"][:400])
    print("...")
    print()
    print(f"Cited in answer:  {sorted(cited_in_answer)}")
    print(f"Panel snippets:   {sorted(cited_in_snippets)}")
    print(f"Match: {cited_in_answer == cited_in_snippets}")
    print()
    print("Snippet cards:")
    for s in result["evidence_snippets"]:
        print(f"  [{s['citation_index']}] {s['source']}")
    print()
    scores = result["scores"]
    print(f"Judge: groundedness={scores.groundedness:.3f} completeness={scores.completeness:.3f} unsupported={scores.unsupported_claim}")
    suf = result["evidence_sufficiency"]
    print(f"Gate:  relevance={suf.relevance:.2f} coverage={suf.coverage:.2f} should_answer={suf.should_answer}")
