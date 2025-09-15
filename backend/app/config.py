from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database settings
    database_url: str = (
        "postgresql+asyncpg://user:password@localhost/accounting_db"
    )

    # Application settings
    app_name: str = "CloudMosa Accounting API"
    debug: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
