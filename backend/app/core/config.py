from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    openai_api_key: str
    openai_generation_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_eval_model: str = "gpt-4o-mini"
    chroma_persist_dir: str = str(PROJECT_ROOT / "backend" / "data" / "chroma")
    upload_dir: str = str(PROJECT_ROOT / "backend" / "uploads")
    data_dir: str = str(PROJECT_ROOT / "backend" / "data")
    allowed_origins: str = "http://localhost:3000"

    @field_validator("chroma_persist_dir", "upload_dir", "data_dir", mode="before")
    @classmethod
    def resolve_repo_relative_path(cls, value: str) -> str:
        path = Path(value)
        if not path.is_absolute():
            path = (PROJECT_ROOT / path).resolve()
        return str(path)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
