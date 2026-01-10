from sqlalchemy import Column, Integer, String, DateTime, Text, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.db import Base

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(BigInteger, primary_key=True, index=True) # API's ID (e.g. 137205)
    headline = Column(String, nullable=False)
    intro = Column(Text, nullable=True) # The summary
    
    # Image Management
    image_id = Column(String, nullable=True) # "820370" -> We build URL on read
    
    # Context / Filtering
    context = Column(String, nullable=True) # e.g. "WPL 2026"
    story_type = Column(String, nullable=True) # "Reports", "News", etc.
    
    source_url = Column(String, nullable=True)
    match_id = Column(String, ForeignKey("matches.match_id"), nullable=True, index=True)
    
    published_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    match = relationship("Match")