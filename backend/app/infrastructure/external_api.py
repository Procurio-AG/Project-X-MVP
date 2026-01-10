import httpx
from app.core.config import settings
from datetime import datetime, timedelta

class SportMonksAPI:
    def __init__(self):
        self.base_url = settings.EXTERNAL_API_BASE_URL.rstrip("/")
        self.api_token = settings.EXTERNAL_API_KEY

    async def fetch_live_matches_raw(self) -> dict:
        """
        Calls SportMonks current live scores endpoint.
        Returns raw JSON from SportMonks API.
        """
        url = f"{self.base_url}/livescores"
        params = {"api_token": self.api_token, "include": "localteam,visitorteam"}

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    async def fetch_todays_matches_raw(self) -> dict:
        """
        Calls SportMonks livescores endpoint for today's matches.
        Useful if you need schedule + live data.
        """
        url = f"{self.base_url}/livescores"
        params = {"api_token": self.api_token,
                   "include": "localteam,visitorteam,runs"}

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        
    async def fetch_match_by_id_raw(self, match_id: str) -> dict:
        url = f"{self.base_url}/fixtures/{match_id}"
        params = {
            "api_token": self.api_token,
            "include": "localteam,visitorteam,runs,venue"
        }
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    async def fetch_fixtures_raw(self) -> dict:
            today = datetime.now().date()
            start_date = today - timedelta(days=30)
            end_date = today + timedelta(days=30)
            
            date_range = f"{start_date},{end_date}"

            url = f"{self.base_url}/fixtures"
            params = {
                "api_token": self.api_token,
                "include": "localteam,visitorteam,venue,league,runs",
                "sort": "starting_at",
                "filter[starts_between]": date_range,
            }
            
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
    
    async def fetch_match_details_rich(self, match_id: str) -> dict:
        """
        Fetches FULL match details using the allowed includes for your plan.
        """
        url = f"{self.base_url}/fixtures/{match_id}"
        params = {
            "api_token": self.api_token,
            "include": "localteam,visitorteam,venue,runs,batting,bowling,lineup,tosswon,firstumpire,secondumpire,tvumpire,referee,manofmatch",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        
    async def fetch_match_details_rich(self, match_id: str) -> dict:
        """
        Updated to include balls and wickets for rich scorecard.
        """
        url = f"{self.base_url}/fixtures/{match_id}"

        params = {
            "api_token": self.api_token,
            "include": "localteam,visitorteam,venue,runs,batting,bowling,lineup,tosswon,balls,scoreboards",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

class NewsAPI:
    def __init__(self):
        self.host = "cricbuzz-cricket.p.rapidapi.com"
        self.headers = {
            "x-rapidapi-key": settings.RAPID_API_KEY,
            "x-rapidapi-host": self.host
        }

    async def fetch_top_stories(self):
        """
        Fetches the latest news list (Index).
        """
        url = f"https://{self.host}/news/v1/index"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"News API fetch failed: {e}")
                return {}

sportmonks_api = SportMonksAPI()
news_api = NewsAPI()