from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.infrastructure.db import get_db
from app.models.sql_news import NewsArticle
from app.domain.models.news import NewsArticleResponse

router = APIRouter(prefix="/api/v1/news", tags=["news"])

@router.get("", response_model=List[NewsArticleResponse])
def get_latest_news(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get latest cricket news with auto-generated image URLs.
    """
    news = db.query(NewsArticle)\
             .order_by(NewsArticle.published_at.desc())\
             .limit(limit)\
             .all()
    return news