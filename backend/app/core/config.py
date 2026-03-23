from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    openai_generation_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_eval_model: str = "gpt-4o-mini"
    chroma_persist_dir: str = "./backend/data/chroma"
    upload_dir: str = "./backend/uploads"
    data_dir: str = "./backend/data"
    allowed_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
