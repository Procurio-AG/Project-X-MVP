from pydantic import BaseModel
from typing import Optional, List

#Leaf Nodes
class TeamView(BaseModel):
    id: int
    name: str
    short_name: str
    logo: str

class ScoreView(BaseModel):
    team_id: int
    score: str       # Formatted "145/3"
    overs: str       # Formatted "17.3"

class CurrentView(BaseModel):
    batting_team_id: int
    score: str
    overs: str
    run_rate: Optional[str] = None

class TossView(BaseModel):
    won_by_team_id: Optional[int]
    elected: Optional[str]

class VenueView(BaseModel):
    id: int
    name: str
    city: Optional[str]

#Branch Nodes
class TeamsContainer(BaseModel):
    batting_first: TeamView
    batting_second: TeamView

class ScoresContainer(BaseModel):
    first_innings: Optional[ScoreView] = None
    second_innings: Optional[ScoreView] = None
    current: Optional[CurrentView] = None

#Root Node
class LiveScoreCard(BaseModel):
    match_id: str
    match_status: str     # "LIVE", "FINISHED", "NS"
    innings_phase: str    # "FIRST", "SECOND", "COMPLETED"
    start_time: str
    result: Optional[str] # "Stars won by 7 wickets"
    
    teams: TeamsContainer
    scores: ScoresContainer
    toss: TossView
    venue: VenueView