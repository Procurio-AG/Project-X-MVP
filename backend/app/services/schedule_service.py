import logging
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timedelta

from app.infrastructure.external_api import sportmonks_api
from app.models.sql_match import Match

logger = logging.getLogger(__name__)

def calculate_cricket_result(local_id, visitor_id, runs_data, local_name, visitor_name):
    """
    Derives the result string (e.g. 'India won by 10 runs') from raw runs data.
    """
    if not runs_data:
        return None
        
    # Map Innings to Teams
    # We need to find who batted 1st and 2nd to apply standard cricket logic
    inn1 = next((r for r in runs_data if r.get('inning') == 1), None)
    inn2 = next((r for r in runs_data if r.get('inning') == 2), None)
    
    if not inn1 or not inn2:
        return None # Incomplete data

    # Determine Winners
    score1 = inn1.get('score', 0)
    score2 = inn2.get('score', 0)
    
    # Generate String
    # Team batting first wins (Runs logic)
    if score1 > score2:
        winner_name = local_name if inn1.get('team_id') == local_id else visitor_name
        diff = score1 - score2
        return f"{winner_name} won by {diff} runs"
    
    # Team batting second wins (Wickets logic)
    elif score2 > score1:
        winner_name = local_name if inn2.get('team_id') == local_id else visitor_name
        wickets_lost = inn2.get('wickets', 0)
        wickets_remaining = 10 - wickets_lost
        return f"{winner_name} won by {wickets_remaining} wickets"
        
    # Tie
    elif score1 == score2:
        return "Match Tied"
        
    return None

def format_score_string(runs_data, team_id):
    """
    Extracts specific team score from runs list and formats as '150/4 (20.0)'
    """
    if not runs_data: 
        return None
    
    # Find the run object for this team
    team_run = next((r for r in runs_data if r.get('team_id') == team_id), None)
    if not team_run:
        return None
        
    score = team_run.get('score', 0)
    wickets = team_run.get('wickets', 0)
    overs = team_run.get('overs', 0.0)
    
    return f"{score}/{wickets} ({overs})"

async def sync_schedules_to_db(db: Session):
    """
    Fetches fixtures from API and syncs them to Postgres.
    Uses 'upsert' to handle updates efficiently.
    """
    logger.info("Starting schedule sync...")
    
    try:
        raw_data = await sportmonks_api.fetch_fixtures_raw()
        fixtures = raw_data.get("data", [])
        
        if not fixtures:
            logger.warning("No fixtures found in API response.")
            return

        count = 0
        for f in fixtures:
            start_time_str = f.get("starting_at")
            start_time = None
            if start_time_str:
                start_time = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))

            local_team = f.get('localteam', {})
            visitor_team = f.get('visitorteam', {})
            local_id = local_team.get('id')
            visitor_id = visitor_team.get('id')
            
            match_title = f"{local_team.get('name', 'Unknown')} vs {visitor_team.get('name', 'Unknown')}"
            status = f.get("status")

            home_score_str = None
            away_score_str = None
            result_note = None

            # Only calculate for Finished/Live matches to save processing
            if status in ['Finished', 'NS', 'Live', '1st Innings', '2nd Innings', 'Innings Break']:
                runs = f.get('runs', [])
                
                # Format "150/3 (20.0)" strings
                home_score_str = format_score_string(runs, local_id)
                away_score_str = format_score_string(runs, visitor_id)
                
                # Calculate "India won by..." only if finished
                if status == 'Finished':
                    # First try to use the API provided note
                    result_note = f.get('note')
                    # If API note is missing, calculate it manually
                    if not result_note:
                        result_note = calculate_cricket_result(
                            local_id, visitor_id, runs, 
                            local_team.get('name'), visitor_team.get('name')
                        )

            # Upsert Payload
            match_data = {
                "match_id": str(f["id"]),
                "title": match_title,
                "status": status,
                "match_type": f.get("type"),
                "start_time": start_time,
                "league": f.get("league"),        
                "venue": f.get("venue"),          
                "home_team": local_team,  
                "away_team": visitor_team,
                "home_score": home_score_str,
                "away_score": away_score_str,
                "result_note": result_note,
                "updated_at": datetime.now()
            }

            stmt = insert(Match).values(match_data)
            stmt = stmt.on_conflict_do_update(
                index_elements=[Match.match_id],
                set_=match_data
            )
            
            db.execute(stmt)
            count += 1

        db.commit()
        logger.info(f"Successfully synced {count} fixtures (with scores) to Database.")

    except Exception:
        logger.exception("Failed to sync schedules")
        db.rollback()
        raise