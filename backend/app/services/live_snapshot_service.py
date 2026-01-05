from app.services.polling_service import get_raw_live_matches, get_raw_live_match
from app.services.normalizers.match_normalizer import normalize_live_match
from app.services.diff_service import detect_changes
from app.infrastructure.redis_client import set_json, get_json, push_event, redis_client
from app.domain.models import LiveMatch

from app.infrastructure.db import SessionLocal
from app.models.sql_match import Match

import logging

logger = logging.getLogger(__name__)

async def poll_and_store_live_matches():
    raw_wrapper = await get_raw_live_matches()
    if not raw_wrapper or "data" not in raw_wrapper:
        logger.warning("No live match data received")
        redis_client.delete("live:matches")
        return
    
    matches = raw_wrapper.get("data", [])    
    live_match_ids = []

    with SessionLocal() as db:
        for match_meta in matches:
            match_id = match_meta.get("id")
            if not match_id:
                continue
                
            try:
                # --- A. Fetch Full Details (for Scorecard/Innings) ---
                raw_detail = await get_raw_live_match(str(match_id))
                
                # Check if detail fetch actually got data (SportMonks wrapper inside 'data' key)
                if "data" in raw_detail:
                    raw_detail = raw_detail["data"]
                
                # --- B. Normalize ---
                new_match: LiveMatch = normalize_live_match(raw_detail)
                live_match_ids.append(str(match_id))
                
                # --- C. Redis Logic (Diffing) ---
                redis_key = f"live:match:{match_id}"
                old_data = get_json(redis_key)
                old_match = LiveMatch(**old_data) if old_data else None

                events = detect_changes(old_match, new_match)
                
                if events:
                    event_key = f"match:events:{match_id}"
                    for event in events:
                        push_event(event_key, event.model_dump(mode='json'))
                    # logger.info(f"Pushed {len(events)} events for {match_id}")

                # Save to Redis (TTL 24 hours to keep finished match results available for a while)
                set_json(redis_key, new_match.model_dump(mode='json'), ttl=86400)
                
                # --- D. SQL Status Sync (The Fix) ---
                # We check the DB to see if the status needs updating (e.g., NS -> LIVE)
                sql_match = db.query(Match).filter(Match.match_id == str(match_id)).first()
                
                if sql_match:
                    # Only update if status implies a state change (ignore minor string differences if needed)
                    # For now, we update if strings are not equal
                    if sql_match.status != new_match.status:
                        logger.info(f"SYNC SQL: Match {match_id} status {sql_match.status} -> {new_match.status}")
                        sql_match.status = new_match.status
                        # If the match just finished, we might want to trigger a full update, 
                        # but for now, just updating status is enough for the List View.
                        db.commit()

            except Exception as e:
                logger.exception(f"Error processing match {match_id}: {str(e)}")
                continue
    

    if live_match_ids:
        redis_client.set("live:matches", ",".join(live_match_ids), ex=60)
    
    logger.info(f"Polled {len(live_match_ids)} matches. SQL Sync complete.")