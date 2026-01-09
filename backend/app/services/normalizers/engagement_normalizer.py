import re
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.domain.models.engagement import (
    EngagementPostDomain, 
    EngagementAuthor, 
    EngagementMedia, 
    EngagementMetrics
)

logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
BLACKLIST_KEYWORDS = {
    "surgery", "plastic", "body", "butt", "lipo", "cosmetic", 
    "whatsapp", "betting id", "casino", "jackpot", "teen patti", 
    "prize", "giveaway", "follow me", "dm for", "promoted"
}

CRICKET_CONTEXT_WORDS = {
    "cricket", "match", "run", "wicket", "ball", "six", "four", "century", 
    "inning", "over", "highlight", "score", "team", "vs", "league", 
    "batting", "bowling", "fielding", "stumps", "win", "loss", "play", "game",
    "sport", "tournament", "cup", "trophy", "final", "champion", "highlights",
    "majorleaguecricket", "usacricket", "bigbashleague", "t20cricket", 
    "teamusa", "americancricket", "mlc2025", "ipl", "bbl15", "bbl2025"
}

def is_valid_content(text: str) -> bool:
    if not text:
        return False
    text_lower = text.lower()
    
    # 1. Blacklist Check
    if any(word in text_lower for word in BLACKLIST_KEYWORDS):
        return False
        
    # 2. Context Check
    tokens = set(re.split(r'\W+', text_lower))
    if tokens.intersection(CRICKET_CONTEXT_WORDS):
        return True

    return False

def normalize_twitter_response(raw_data: Dict[str, Any]) -> List[EngagementPostDomain]:
    """
    Parses Twitter241 (RapidAPI) JSON into domain models.
    """
    posts = []
    
    # LOGGING START
    if not raw_data:
        logger.error("❌ Normalizer received EMPTY raw_data")
        return []

    try:
        timeline = raw_data.get("result", {}).get("timeline_response", {}).get("timeline", {})
        instructions = timeline.get("instructions", [])
        
        entries = []
        for instr in instructions:
            if instr.get("__typename") == "TimelineAddEntries":
                entries.extend(instr.get("entries", []))
        
        logger.info(f"🔍 Normalizer found {len(entries)} raw timeline entries.")

        for i, entry in enumerate(entries):
            try:
                content = entry.get("content", {})
                item_content = content.get("content", {})
                tweet_results = item_content.get("tweet_results", {}).get("result", {})
                
                if not tweet_results or tweet_results.get("__typename") == "TweetUnavailable":
                    continue

                # Data Extraction
                legacy = tweet_results.get("legacy", {})
                details = tweet_results.get("details", {})
                core_user = tweet_results.get("core", {}).get("user_results", {}).get("result", {})
                
                tweet_id = tweet_results.get("rest_id")
                text = details.get("full_text") or legacy.get("full_text") or ""
                
                # --- FILTER CHECK ---
                if not is_valid_content(text):
                    # logger.info(f"   🗑️ Filtered Tweet #{i}: {text[:30]}...")
                    continue
                # --------------------

                # Timestamp
                created_at_ms = details.get("created_at_ms") or legacy.get("created_at")
                # Handle standard twitter date format if ms not provided
                if created_at_ms and str(created_at_ms).isdigit():
                    published_at = datetime.fromtimestamp(int(created_at_ms)/1000)
                else:
                    published_at = datetime.now()

                # Media
                media_list = []
                medias = legacy.get("extended_entities", {}).get("media", []) or \
                         tweet_results.get("media_entities", [])
                
                for m in medias:
                    m_url = m.get("media_url_https") or m.get("media_info", {}).get("original_img_url")
                    if m_url:
                        media_list.append(EngagementMedia(type=m.get("type", "image"), url=m_url))

                # Metrics
                counts = tweet_results.get("counts") or legacy
                metrics = EngagementMetrics(
                    likes=counts.get("favorite_count", 0),
                    shares=counts.get("retweet_count", 0),
                    views=int(tweet_results.get("views", {}).get("count", 0) or 0)
                )

                # Author
                user_legacy = core_user.get("legacy", {})
                user_core = core_user.get("core", {})
                avatar = core_user.get("avatar", {}).get("image_url") or user_legacy.get("profile_image_url_https")
                
                author = EngagementAuthor(
                    name=user_core.get("name") or user_legacy.get("name", "Unknown"),
                    handle=user_core.get("screen_name") or user_legacy.get("screen_name", ""),
                    avatar=avatar,
                    profile_url=f"https://twitter.com/{user_core.get('screen_name')}"
                )

                posts.append(EngagementPostDomain(
                    source="twitter",
                    source_id=tweet_id,
                    text=text,
                    url=f"https://twitter.com/x/status/{tweet_id}",
                    media=media_list,
                    author=author,
                    metrics=metrics,
                    published_at=published_at,
                    fetched_at=datetime.now()
                ))

            except Exception as e:
                logger.warning(f"⚠️ Error parsing tweet #{i}: {e}")
                continue

    except Exception as e:
        logger.error(f"❌ Critical Normalizer Failure: {e}")
        return []

    logger.info(f"✅ Normalizer finished. {len(posts)}/{len(entries)} valid tweets extracted.")
    return posts

def normalize_youtube_response(raw_data: Dict[str, Any]) -> List[EngagementPostDomain]:
    posts = []
    items = raw_data.get("items", [])
    logger.info(f"🔍 Normalizer found {len(items)} raw YouTube items.")

    for item in items:
        try:
            id_obj = item.get("id", {})
            if id_obj.get("kind") != "youtube#video":
                continue
                
            video_id = id_obj.get("videoId")
            snippet = item.get("snippet", {})
            
            title = snippet.get("title", "")
            description = snippet.get("description", "")
            full_text = f"{title} {description}"

            if not is_valid_content(full_text):
                continue
            
            published_str = snippet.get("publishedAt")
            published_at = datetime.fromisoformat(published_str.replace("Z", "+00:00")) if published_str else datetime.now()

            thumbnails = snippet.get("thumbnails", {})
            high_res = thumbnails.get("high", {}).get("url") or thumbnails.get("medium", {}).get("url")
            
            media_list = []
            if high_res:
                media_list.append(EngagementMedia(type="thumbnail", url=high_res))
            media_list.append(EngagementMedia(type="embed", url=f"https://www.youtube.com/embed/{video_id}"))

            posts.append(EngagementPostDomain(
                source="youtube",
                source_id=video_id,
                title=title,
                text=description,
                url=f"https://www.youtube.com/watch?v={video_id}",
                media=media_list,
                author=EngagementAuthor(
                    name=snippet.get("channelTitle", "Unknown Channel"),
                    handle=snippet.get("channelId"),
                    profile_url=f"https://youtube.com/channel/{snippet.get('channelId')}"
                ),
                metrics=EngagementMetrics(likes=0, views=0),
                published_at=published_at,
                fetched_at=datetime.now()
            ))
        except Exception:
            continue
            
    return posts