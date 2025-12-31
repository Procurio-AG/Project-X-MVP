from app.domain.models import LiveMatch, MatchEvent, EventType
from datetime import datetime

def detect_changes(old: LiveMatch | None, new: LiveMatch) -> list[MatchEvent]:
    events = []
    
    if not old:
        return []

    if new.score.wickets > old.score.wickets:
        wickets_fallen = new.score.wickets - old.score.wickets
        events.append(MatchEvent(
            match_id=new.match_id,
            event_type=EventType.WICKET,
            description=f"{wickets_fallen} Wicket(s) fallen!",
            inning=new.current_inning,
            over=new.score.overs
        ))

    runs_diff = new.score.runs - old.score.runs
    if runs_diff > 0:
        if runs_diff == 4:
            events.append(MatchEvent(
                match_id=new.match_id,
                event_type=EventType.FOUR,
                description="FOUR runs!",
                inning=new.current_inning,
                over=new.score.overs
            ))
        elif runs_diff == 6:
            events.append(MatchEvent(
                match_id=new.match_id,
                event_type=EventType.SIX,
                description="SIX runs!",
                inning=new.current_inning,
                over=new.score.overs
            ))
    
    if int(new.score.overs) > int(old.score.overs):
        events.append(MatchEvent(
            match_id=new.match_id,
            event_type=EventType.OVER_END,
            description=f"End of Over {int(old.score.overs) + 1}",
            inning=new.current_inning,
            over=new.score.overs
        ))

    return events