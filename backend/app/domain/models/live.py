from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class InningScore(BaseModel):
    inning: int       # 1 or 2
    team_id: int
    score: int
    wickets: int
    overs: float

class LiveMatch(BaseModel):
    match_id: int
    status: str       # "Live", "2nd Innings", "Finished"
    note: str = ""    # e.g., "Target 115 runs" or "Stars won by..."
    
    #The crucial fix: Storing the list allows us to see 1st innings score
    innings: List[InningScore] = []
    
    #Context
    toss_won_team_id: Optional[int] = None
    toss_elected: Optional[str] = None  # "batting" or "bowling"
    
    #Derived from the latest runs object
    current_batting_team_id: Optional[int] = None
    
    last_updated: datetime