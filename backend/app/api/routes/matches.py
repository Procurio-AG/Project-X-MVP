from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from dateutil import parser # Ensure python-dateutil is installed

from app.domain.models import LiveMatch
from app.domain.models.livescore_view import LiveScoreCard
from app.models.sql_match import Match 

from app.infrastructure.external_api import sportmonks_api
from app.infrastructure.social_api import social_api
from app.infrastructure.redis_client import set_json, get_json, redis_client
from app.infrastructure.db import get_db

from app.services.score_service import get_live_scores_view
from app.services.polling_service import get_raw_live_matches, get_raw_live_match
from app.services.normalizers.match_normalizer import normalize_live_match
from app.services.normalizers.detail_normalizer import normalize_match_detail

import logging

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/v1/matches")

async def fetch_and_store_highlights(match_id: int, team1: str, team2: str, match_start_str: str, db: Session):
    query = f"{team1} vs {team2} highlights"
    logger.info(f"SEARCHING YOUTUBE: {query}")
    
    try:
        if match_start_str:
            match_date = parser.parse(match_start_str).replace(tzinfo=None)
        else:
            match_date = datetime.now()

        results = await social_api.fetch_youtube_search(query, max_results=10)
        items = results.get("items", [])
        
        valid_url = None
        t1_lower = team1.lower().replace(" cricket", "")
        t2_lower = team2.lower().replace(" cricket", "")

        for item in items:
            snippet = item.get("snippet", {})
            title = snippet.get("title", "").lower()
            
            if "highlight" not in title:
                continue

            if t1_lower not in title or t2_lower not in title:
                continue

            upload_date_str = snippet.get("publishedAt") 
            if upload_date_str:
                upload_date = parser.parse(upload_date_str).replace(tzinfo=None)
                diff = (upload_date - match_date).days
                
                if -2 <= diff <= 3:
                    video_id = item["id"]["videoId"]
                    valid_url = f"https://www.youtube.com/watch?v={video_id}"
                    logger.info(f"MATCH FOUND: {title} ({valid_url})")
                    break
                else:
                    logger.warning(f"Date Mismatch: {title} (Diff: {diff} days)")

        if valid_url:
            match_row = db.query(Match).filter(Match.id == match_id).first()
            if match_row:
                match_row.highlights_url = valid_url
                db.commit()
                logger.info(f"SAVED TO DB: Match {match_id}")
        else:
            logger.error(f"No valid highlights found for {query}")

    except Exception as e:
        logger.error(f"Background Task Failed: {e}")
# Raw routes
@router.get("/live/raw")
async def raw_live_matches():
    return await get_raw_live_matches()

@router.get("/debug/fixtures-raw")
async def debug_fixtures():
    raw_data = await sportmonks_api.fetch_fixtures_raw()
    return raw_data

@router.get("/{match_id}/raw")
async def debug_matches(match_id: str):
    raw_data = await sportmonks_api.fetch_match_details_rich(match_id=match_id)
    return raw_data

# Static routes
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
    return get_live_scores_view(db)

# Dynamic routes
@router.get("/{match_id}/live", response_model=LiveMatch)
async def get_live_match(match_id: int):
    raw = await get_raw_live_match(match_id)
    return normalize_live_match(raw)

@router.get("/{match_id}")
async def get_match_detail(
    match_id: str, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # Try Cache
    cache_key = f"match:detail:{match_id}"
    cached = get_json(cache_key)
    
    # CACHE BYPASS LOGIC
    if cached:
        # If we already have the URL, return it immediately.
        if cached.get("highlights_url"):
            return cached
    
    # Fetch Fresh Data
    raw = await sportmonks_api.fetch_match_details_rich(match_id)
    
    # Normalize
    normalized = normalize_match_detail(raw)
    
    # Enhance with DB Data
    db_match = db.query(Match).filter(Match.match_id == match_id).first()
    
    if db_match:
        normalized.highlights_url = db_match.highlights_url
        
        # TRIGGER BACKGROUND TASK
        if normalized.status == "Finished" and not db_match.highlights_url:
            data_part = raw.get("data", raw) # Handle wrapper
            t1_name = data_part.get("localteam", {}).get("name")
            t2_name = data_part.get("visitorteam", {}).get("name")
            start_str = data_part.get("starting_at")
            
            if t1_name and t2_name:
                background_tasks.add_task(
                    fetch_and_store_highlights, 
                    db_match.id, 
                    t1_name, 
                    t2_name, 
                    start_str, 
                    db
                )
            else:
                logger.warning(f"Could not extract team names for match {match_id}")

    response_data = normalized.dict()

    # Cache (Short TTL if missing URL to retry soon, Long if URL found)
    is_live = raw.get("data", {}).get("live", False)
    ttl = 60 if is_live else 86400
    if normalized.status == "Finished" and not normalized.highlights_url:
        ttl = 300 

    set_json(cache_key, response_data, ttl=ttl)

    return response_data