import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProofHire AI Resume Intelligence"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./proofhire.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "proofhire-jwt-insecure-dev-secret-key-replace-in-prod-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://*.vercel.app")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage/resumes")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Normalize postgres:// URLs (common in Heroku/Render/Supabase) to postgresql://
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure storage directory exists
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
