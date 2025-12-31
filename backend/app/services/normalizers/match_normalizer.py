from app.domain.models import LiveMatch, LiveScore, Team
from datetime import datetime

def normalize_live_match(raw: dict) -> LiveMatch:
    # 1. Safely extract runs (SportMonks sends a list of innings)
    runs_data = raw.get("runs", [])
    current_score_data = runs_data[-1] if runs_data else {}

    # 2. Extract Teams (Defensive .get)
    local_team_raw = raw.get("localteam", {})
    visitor_team_raw = raw.get("visitorteam", {})

    # 3. Determine Batting/Bowling Teams
    # (If unknown, default to local/visitor to prevent crash)
    batting_team_id = raw.get("batting_team_id")
    
    if batting_team_id == visitor_team_raw.get("id"):
        batting_team_raw = visitor_team_raw
        bowling_team_raw = local_team_raw
    else:
        # Default to local team batting if unsure
        batting_team_raw = local_team_raw
        bowling_team_raw = visitor_team_raw

    # 4. Construct the Object
    return LiveMatch(
        match_id=raw["id"],
        status=raw.get("status", "Unknown"),
        current_inning=len(runs_data) if runs_data else 1,
        score=LiveScore(
            runs=current_score_data.get("score", 0),
            wickets=current_score_data.get("wickets", 0),
            overs=float(current_score_data.get("overs", 0.0)),
        ),
        batting_team=Team(
            id=batting_team_raw.get("id", 0),
            name=batting_team_raw.get("name", "Unknown"),
        ),
        bowling_team=Team(
            id=bowling_team_raw.get("id", 0),
            name=bowling_team_raw.get("name", "Unknown"),
        ),
        # Handle cases where updated_at might be missing
        last_updated=datetime.now() # Fallback timestamp
    )