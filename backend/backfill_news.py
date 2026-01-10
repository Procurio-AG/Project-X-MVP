# Save as backfill_news.py and run: python backfill_news.py
import re
from app.infrastructure.db import SessionLocal
from app.models.sql_news import NewsArticle

# --- FIX: Import the Match model so SQLAlchemy knows what "Match" is ---
from app.models.sql_match import Match 
# -----------------------------------------------------------------------

def generate_cricbuzz_url(story_id: int, headline: str) -> str:
    if not headline: return ""
    # 1. Lowercase
    slug = headline.lower()
    # 2. Remove special chars
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # 3. Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug).strip()
    
    return f"https://www.cricbuzz.com/cricket-news/{story_id}"

def backfill():
    db = SessionLocal()
    # Filter for articles where source_url is NULL
    articles = db.query(NewsArticle).all()
    
    print(f"Found {len(articles)} articles to update...")
    
    count = 0
    for article in articles:
        new_url = generate_cricbuzz_url(article.id, article.headline)
        article.source_url = new_url
        count += 1
        print(f"[{count}] Updated {article.id} -> {new_url}")
    
    db.commit()
    db.close()
    print("Backfill complete.")

if __name__ == "__main__":
    backfill()