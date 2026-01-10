from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.infrastructure.db import Base
from sqlalchemy.sql import func

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, unique=True, index=True)
    
    title = Column(String)
    status = Column(String)  # e.g. "NS", "LIVE", "FINISHED"
    match_type = Column(String) # e.g. "T20", "ODI"
    start_time = Column(DateTime(timezone=True), index=True)
    
    # We store snapshot of team/venue data to avoid complex joins in Phase 1
    league = Column(JSON, nullable=True)
    venue = Column(JSON, nullable=True)
    home_team = Column(JSON, nullable=True)
    away_team = Column(JSON, nullable=True)

    # Stores formatted score like "145/3 (20.0)"
    home_score = Column(String, nullable=True) 
    away_score = Column(String, nullable=True)
    # Stores "India won by 7 runs"
    result_note = Column(String, nullable=True)
    highlights_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())