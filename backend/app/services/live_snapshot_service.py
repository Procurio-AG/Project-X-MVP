from app.services.polling_service import get_raw_live_matches, get_raw_live_match
from app.services.normalizers.match_normalizer import normalize_live_match
from app.services.diff_service import detect_changes
from app.infrastructure.redis_client import set_json, get_json, push_event, redis_client
from app.domain.models import LiveMatch
import logging
import time

logger = logging.getLogger(__name__)

async def poll_and_store_live_matches():
    raw_wrapper = await get_raw_live_matches()
    matches = raw_wrapper.get("data", [])
    
    live_match_ids = []
    
    for match_meta in matches:
        match_id = match_meta.get("id")
        if not match_id:
            continue
            
        try:
            raw_detail = await get_raw_live_match(str(match_id))
            
            new_match = normalize_live_match(raw_detail)
            live_match_ids.append(str(match_id))
            
            redis_key = f"live:match:{match_id}"
            old_data = get_json(redis_key)
            old_match = LiveMatch(**old_data) if old_data else None

            events = detect_changes(old_match, new_match)
            
            if events:
                event_key = f"match:events:{match_id}"
                for event in events:
                    push_event(event_key, event.model_dump(mode='json'))
                logger.info(f"Generated {len(events)} events for match {match_id}")

            set_json(redis_key, new_match.model_dump(mode='json'), ttl=60)
            
        except Exception:
            logger.exception(f"Error processing match {match_id}")
            continue

    if live_match_ids:
        redis_client.set("live:matches", ",".join(live_match_ids), ex=60)
    
    logger.info(f"Updated {len(live_match_ids)} live matches with diffing")