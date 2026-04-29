"""Quick smoke test for citation-aligned evidence_snippets."""
from app.workflows.chat_graph import run_chat

result = run_chat("What certifications does Chase hold?")

print("Answer excerpt:")
print(result["answer"][:300])
print()
print("Sources:", result["sources"])
print()
print("Evidence snippets (should only contain cited [N] chunks):")
for s in result["evidence_snippets"]:
    print(f"  [{s['citation_index']}] {s['source']}")
    print(f"       {s['text'][:90]}...")
print()
print(f"Snippet count: {len(result['evidence_snippets'])} cited chunks (out of 12 retrieved)")
print()

# Verify citation_index values in snippets appear in the answer text
import re
cited_in_answer = {int(m) for m in re.findall(r'\[(\d+)\]', result["answer"])}
cited_in_snippets = {s["citation_index"] for s in result["evidence_snippets"]}
print(f"Indices cited in answer:   {sorted(cited_in_answer)}")
print(f"Indices in snippet panel:  {sorted(cited_in_snippets)}")
match = cited_in_answer == cited_in_snippets
print(f"Panel matches answer citations: {match}")
