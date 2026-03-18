"""
SquintScale backend configuration.

All settings are loaded from environment variables via pydantic-settings.
Never hardcode credentials — use .env or container environment.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Supabase ──────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    # ── Database ──────────────────────────────────────────────────────────
    database_url: str

    # ── Frontend / CORS ───────────────────────────────────────────────────
    frontend_url: str = "http://localhost:5173"

    # ── Storage ───────────────────────────────────────────────────────────
    storage_bucket: str = "squint-images"

    # ── Server ────────────────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"

    # ── Derived helpers ───────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


# Singleton — import this everywhere
settings = Settings()  # type: ignore[call-arg]
