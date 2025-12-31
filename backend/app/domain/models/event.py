from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional

class EventType(str, Enum):
    WICKET = "WICKET"
    FOUR = "FOUR"
    SIX = "SIX"
    RUNS = "RUNS"
    OVER_END = "OVER_END"
    INNINGS_CHANGE = "INNINGS_CHANGE"
    MATCH_END = "MATCH_END"

class MatchEvent(BaseModel):
    match_id: str | int
    event_type: EventType
    description: str
    timestamp: datetime = datetime.now()
    inning: int
    over: float