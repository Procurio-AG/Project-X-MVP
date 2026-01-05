from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.domain.models import LiveMatch
from app.domain.models.livescore_view import LiveScoreCard

from app.infrastructure.external_api import sportmonks_api
from app.infrastructure.redis_client import set_json, get_json, redis_client
from app.infrastructure.db import get_db

from app.services.score_service import get_live_scores_view
from app.services.polling_service import get_raw_live_matches, get_raw_live_match
from app.services.normalizers.match_normalizer import normalize_live_match
from app.services.normalizers.detail_normalizer import normalize_match_detail



router = APIRouter(prefix="/api/v1/matches")

#Raw routes for debugging

@router.get("/live/raw")
async def raw_live_matches():
    return await get_raw_live_matches()

@router.get("/debug/fixtures-raw")
async def debug_fixtures():
    """Temporary route to inspect raw SportMonks fixture data"""
    raw_data = await sportmonks_api.fetch_fixtures_raw()
    return raw_data


@router.get("/{match_id}/raw")
async def debug_matches(match_id: str):
    """Temporary route to inspect raw SportMonks fixture data"""
    raw_data = await sportmonks_api.fetch_match_details_rich(match_id=match_id)
    return raw_data

#Static routes
@router.get("/live")
async def get_live_matches():
    ids = redis_client.get("live:matches")
    if not ids:
        return {"data": []}

    result = []
    for match_id in ids.split(","):
        match = get_json(f"live:match:{match_id}")
        if match:
            result.append(match)

    return {"data": result}

@router.get("/livescore", response_model=List[LiveScoreCard])
def get_unified_livescores(db: Session = Depends(get_db)):
    """
    Unified endpoint for Live Cards.
    Merges SQL (Static) + Redis (Dynamic) data to return a fully resolved view.
    Used for the vertical match list.
    """
    return get_live_scores_view(db)

#Dynamic routes
@router.get("/{match_id}/live", response_model=LiveMatch)
async def get_live_match(match_id: int):
    raw = await get_raw_live_match(match_id)
    return normalize_live_match(raw)

@router.get("/{match_id}")
async def get_match_detail(match_id: str):
    #Try Cache
    cache_key = f"match:detail:{match_id}"
    cached = get_json(cache_key)
    if cached:
        return cached

    #Fetch Fresh from Provider
    raw = await sportmonks_api.fetch_match_details_rich(match_id)
    
    #Normalize
    normalized = normalize_match_detail(raw)
    response_data = normalized.dict()

    #Cache It
    #If match is LIVE -> TTL 60s
    #If match is Finished -> TTL 24h (86400s)
    is_live = raw.get("data", {}).get("live", False)
    ttl = 60 if is_live else 86400
    
    set_json(cache_key, response_data, ttl=ttl)

    return response_data


