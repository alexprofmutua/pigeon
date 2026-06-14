from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Pigeon"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./chess_archive.db"
    ocr_provider: str = "mock"
    storage_dir: str = "./storage"
    max_upload_size_mb: int = 10

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings()
