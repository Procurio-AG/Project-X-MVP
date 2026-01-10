from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# --- Basic Player Info ---
class PlayerInfo(BaseModel):
    id: int
    name: str
    image: Optional[str]
    position: Optional[str]
    is_captain: bool = False
    is_keeper: bool = False

# --- Stats Rows ---
class BatsmanStats(BaseModel):
    player: PlayerInfo
    runs: int
    balls: int
    fours: int
    sixes: int
    strike_rate: float
    status: str # e.g., "active" (batting), "out", "did_not_bat"
    dismissal_text: Optional[str] = None

class BowlerStats(BaseModel):
    player: PlayerInfo
    overs: float
    runs_conceded: int
    wickets: int
    economy: float

class FallOfWicket(BaseModel):
    player_name: str
    score: int
    overs: str # e.g. "4.2"
    wicket_number: int

class BallLog(BaseModel):
    over: str # "0.1"
    batsman_name: str
    bowler_name: str
    runs: int
    is_wicket: bool
    is_four: bool
    is_six: bool
    extra_type: Optional[str] = None

# --- Inning Container ---
class InningScorecard(BaseModel):
    inning_number: int
    team_id: int
    team_name: str
    score: str # e.g. "150/3"
    overs: str
    extras: int = 0
    fow: List[FallOfWicket] = []
    recent_balls: List[BallLog] = []
    batting: List[BatsmanStats]
    bowling: List[BowlerStats]

# --- Main Match Detail Wrapper ---
class MatchDetail(BaseModel):
    match_id: str
    status: str
    venue: Dict[str, Any]
    toss: Dict[str, Any]
    highlights_url: Optional[str] = None
    scorecard: List[InningScorecard] # List of innings [1st, 2nd]
    lineups: Dict[str, List[PlayerInfo]] # {"home": [], "away": []}