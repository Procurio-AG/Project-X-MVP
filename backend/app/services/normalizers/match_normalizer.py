from app.domain.models.live import LiveMatch, InningScore
from datetime import datetime

def normalize_live_match(raw: dict) -> LiveMatch:
    """
    Converts raw SportMonks fixture detail into a lightweight Redis LiveMatch.
    """
    
    # 1. Parse Runs (Innings History)
    raw_runs = raw.get("runs", [])
    innings_list = []
    
    current_batting_id = None
    
    for r in raw_runs:
        # Create schema object
        inn = InningScore(
            inning=r.get("inning", 1),
            team_id=r.get("team_id", 0),
            score=r.get("score", 0),
            wickets=r.get("wickets", 0),
            overs=float(r.get("overs", 0.0))
        )
        innings_list.append(inn)
        
        # The last team in the runs array is usually the one currently batting
        current_batting_id = r.get("team_id")

    # 2. Extract Status & Notes
    # SportMonks puts "Target 115" or Result text in 'note'
    note = raw.get("note") or ""
    
    # 3. Construct the Object
    return LiveMatch(
        match_id=raw["id"],
        status=raw.get("status", "Unknown"),
        note=note,
        innings=innings_list,
        toss_won_team_id=raw.get("toss_won_team_id"),
        toss_elected=raw.get("elected"),
        current_batting_team_id=current_batting_id,
        last_updated=datetime.now()
    )