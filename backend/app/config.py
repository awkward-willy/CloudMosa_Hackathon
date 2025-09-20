from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database settings
    database_url: str = "sqlite+aiosqlite:///./test.db"

    # Application settings
    app_name: str = "CloudMosa Accounting API"
    debug: bool = False

    # JWT settings
    secret_key: str = "super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = {"extra": "ignore"}

    def __init__(self, **data):
        super().__init__(**data)


settings = Settings(_env_file=str(Path(__file__).resolve().parents[1] / ".env"))
