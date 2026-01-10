import logging
import re
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from app.infrastructure.external_api import news_api
from app.models.sql_news import NewsArticle

logger = logging.getLogger(__name__)

def generate_cricbuzz_url(story_id: int, headline: str) -> str:
    """
    Generates the valid Cricbuzz URL using the verified logic.
    """
    if not headline:
        return f"https://www.cricbuzz.com/cricket-news/{story_id}/news"
    
    
    return f"https://www.cricbuzz.com/cricket-news/{story_id}"

async def fetch_and_store_news(db: Session):
    logger.info("Starting News Fetch...")
    
    raw_data = await news_api.fetch_top_stories()
    story_list = raw_data.get("storyList", [])
    
    if not story_list:
        logger.info("No news stories found.")
        return

    saved_count = 0
    
    for item in story_list:
        try:
            # We only care about actual stories, not ad placeholders
            story = item.get("story")
            if not story:
                continue

            # Parse Timestamp (Epoch ms -> DateTime)
            pub_ms = story.get("pubTime")
            published_at = datetime.now()
            if pub_ms:
                published_at = datetime.fromtimestamp(int(pub_ms) / 1000)

            news_data = {
                "id": story.get("id"),
                "headline": story.get("hline"),
                "intro": story.get("intro"),
                "image_id": str(story.get("imageId")) if story.get("imageId") else None,
                "context": story.get("context"),
                "story_type": story.get("storyType"),
                "published_at": published_at,
                # match_id is left NULL for now unless we implement fuzzy matching later
            }

            # Upsert (Update if exists, Insert if new)
            stmt = insert(NewsArticle).values(news_data)
            stmt = stmt.on_conflict_do_update(
                index_elements=[NewsArticle.id],
                set_=news_data
            )
            
            db.execute(stmt)
            saved_count += 1
            
        except Exception as e:
            logger.warning(f"Skipping story due to error: {e}")
            continue

    try:
        db.commit()
        logger.info(f"Saved/Updated {saved_count} news articles.")
    except Exception as e:
        db.rollback()
        logger.error(f"Database commit failed for news: {e}")