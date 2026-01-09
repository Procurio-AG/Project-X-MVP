import httpx
import logging
import urllib.parse
from typing import Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class SocialAPI:
    def __init__(self):
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    async def fetch_twitter_search(self, query: str, count: int = 20) -> Dict[str, Any]:
        base_url = f"https://{settings.TWITTER_HOST}/search-v3"
        encoded_query = urllib.parse.quote(query)
        full_url = f"{base_url}?type=Latest&count={count}&query={encoded_query}"
        
        headers = {
            "x-rapidapi-key": settings.RAPID_API_KEY,
            "x-rapidapi-host": settings.TWITTER_HOST
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(full_url, headers=headers)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Twitter API fetch failed: {str(e)}")
            return {}

    async def fetch_youtube_search(self, query: str, max_results: int = 10) -> Dict[str, Any]:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": str(max_results),
            "key": settings.YOUTUBE_API_KEY,
            "regionCode": "US",
            "relevanceLanguage": "en"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"YouTube API fetch failed: {str(e)}")
            return {}

social_api = SocialAPI()