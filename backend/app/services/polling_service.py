from app.infrastructure.external_api import sportmonks_api
import logging

logger = logging.getLogger(__name__)


async def get_raw_live_matches():
    try:
        return await sportmonks_api.fetch_live_matches_raw()
    except Exception:
        logger.exception("Failed to fetch live matches from SportMonks API")
        raise

async def get_raw_live_match(match_id: int):
    try:
        # Assuming your API wrapper has a method for single match lookup
        payload = await sportmonks_api.fetch_match_by_id_raw(match_id)
        return payload.get("data", {})
    
    except Exception:
        logger.exception(f"Failed to fetch raw match data for ID: {match_id}")
        raise
