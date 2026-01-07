import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL","")
    REDIS_URL = os.getenv("REDIS_URL","")
    EXTERNAL_API_KEY = os.getenv("EXTERNAL_API_KEY","")
    EXTERNAL_API_BASE_URL = os.getenv(
        "EXTERNAL_API_BASE_URL",
        "https://example-cricket-api.com"
    )

settings = Settings()
