import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.core.logging import get_logger
from app.evals.scoring import EvalRunResult, run_batch_eval

logger = get_logger(__name__)
router = APIRouter()


@router.post("/eval/run", response_model=EvalRunResult)
async def run_eval():
    """Run batch evaluation against the gold question set and persist results."""
    return run_batch_eval()


@router.get("/eval/results", response_model=EvalRunResult)
async def get_eval_results():
    """Return the most recent batch evaluation results."""
    path = Path(settings.data_dir) / "eval_results.json"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="No evaluation results found. Run POST /eval/run first.",
        )
    return EvalRunResult(**json.loads(path.read_text(encoding="utf-8")))
