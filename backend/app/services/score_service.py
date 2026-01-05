from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import json

from app.models.sql_match import Match
from app.domain.models.live import LiveMatch
from app.domain.models.livescore_view import (
    LiveScoreCard, TeamView, VenueView, 
    TeamsContainer, ScoresContainer, ScoreView, 
    CurrentView, TossView
)
from app.infrastructure.redis_client import redis_client

def get_live_scores_view(db: Session) -> list[LiveScoreCard]:
    # 1. Define Time Window (UTC Now - 24h to + 36h)
    utc_now = datetime.now(timezone.utc)
    start_window = utc_now - timedelta(hours=24)
    end_window = utc_now + timedelta(hours=36)

    # 2. Query SQL
    sql_matches = db.query(Match).filter(
        Match.start_time >= start_window,
        Match.start_time <= end_window,
        Match.status != "Abandoned"
    ).order_by(Match.start_time).all()

    if not sql_matches:
        return []

    # 3. Identify Matches needing Redis (Only actively LIVE ones)
    live_ids = []
    for m in sql_matches:
        if m.status in ["Live", "1st Innings", "2nd Innings", "Innings Break"]:
            live_ids.append(m.match_id)

    # 4. Fetch Live Data
    redis_map = {}
    if live_ids:
        keys = [f"live:match:{mid}" for mid in live_ids]
        raw_list = redis_client.mget(keys)
        for mid, raw in zip(live_ids, raw_list):
            if raw:
                try:
                    redis_map[mid] = LiveMatch(**json.loads(raw))
                except: continue

    results = []

    for m in sql_matches:
        # --- A. Determine Source ---
        is_live = m.match_id in redis_map
        live_data = redis_map.get(m.match_id)
        
        # --- B. Basic Info ---
        home = m.home_team or {}
        away = m.away_team or {}
        
        # --- C. Score Logic ---
        scores_cont = ScoresContainer()
        result_str = None
        phase = "NS"

        # CASE 1: MATCH FINISHED (Use SQL Data)
        if m.status == "Finished":
            phase = "COMPLETED"
            result_str = m.result_note # Fetched/Calculated during schedule sync
            
            # Helper to parse "150/3 (20.0)" string back into view
            # Note: We assign home->first and away->second roughly for finished games
            # unless we have specific inning data. For list views, strict inning mapping 
            # is less critical than showing the correct score for the correct team.
            if m.home_score:
                scores_cont.first_innings = ScoreView(
                    team_id=home.get('id'), score=m.home_score.split('(')[0].strip(), overs=m.home_score.split('(')[1].replace(')', '') if '(' in m.home_score else ""
                )
            if m.away_score:
                scores_cont.second_innings = ScoreView(
                    team_id=away.get('id'), score=m.away_score.split('(')[0].strip(), overs=m.away_score.split('(')[1].replace(')', '') if '(' in m.away_score else ""
                )

        # CASE 2: MATCH LIVE (Use Redis Data)
        elif is_live and live_data:
            result_str = live_data.note
            phase = "FIRST" # Default
            
            for inn in live_data.innings:
                v = ScoreView(team_id=inn.team_id, score=f"{inn.score}/{inn.wickets}", overs=str(inn.overs))
                if inn.inning == 1: 
                    scores_cont.first_innings = v
                elif inn.inning == 2: 
                    scores_cont.second_innings = v
                    phase = "SECOND"
            
            # Current Ticker
            if live_data.current_batting_team_id:
                curr = next((i for i in live_data.innings if i.team_id == live_data.current_batting_team_id), None)
                if curr:
                    scores_cont.current = CurrentView(
                        batting_team_id=curr.team_id, score=f"{curr.score}/{curr.wickets}", overs=str(curr.overs)
                    )

        # CASE 3: UPCOMING (Return Nulls)
        else:
            # Leave scores as None, phase as NS
            pass

        # --- D. Assemble Card ---
        # Note: For finished games, we stick to Home=BattingFirst for simplicity 
        # unless we add a 'batting_first_id' column to SQL later.
        card = LiveScoreCard(
            match_id=m.match_id,
            match_status=m.status.upper() if m.status else "NS",
            innings_phase=phase,
            start_time=str(m.start_time),
            result=result_str,
            teams=TeamsContainer(
                batting_first=TeamView(id=home.get('id',0), name=home.get('name',''), short_name=home.get('code',''), logo=home.get('image_path','')),
                batting_second=TeamView(id=away.get('id',0), name=away.get('name',''), short_name=away.get('code',''), logo=away.get('image_path',''))
            ),
            scores=scores_cont,
            toss=TossView(won_by_team_id=None, elected=None), # Populating toss from SQL would require another column
            venue=VenueView(id=m.venue.get('id',0) if m.venue else 0, name=m.venue.get('name','') if m.venue else "", city=m.venue.get('city','') if m.venue else "")
        )
        results.append(card)

    return results