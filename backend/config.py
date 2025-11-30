# backend/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    JWT_SECRET: str = "change-me"
    JWT_ALG: str = "HS256"
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 14

    # load from .env if present
    model_config = SettingsConfigDict(env_file=".env", env_prefix="")

settings = Settings()
