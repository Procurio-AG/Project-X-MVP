import pytest
from datetime import datetime
from app.services.normalizers.engagement_normalizer import is_valid_content
from app.services.diff_service import detect_changes
from app.domain.models.live import LiveMatch, InningScore
from app.domain.models.event import EventType

# Engagement Filter Tests (Spam/Context)

def test_engagement_filter_homonym_trap():
    """Test that 'BBL' (Brazilian Butt Lift) spam is blocked."""
    spam_text = "Get your BBL surgery today! best plastic surgery clinic."
    assert is_valid_content(spam_text) is False

def test_engagement_filter_lazy_hashtag():
    """Test that a specific cricket hashtag passes even without other context."""
    valid_text = "Cant wait for #MajorLeagueCricket"
    assert is_valid_content(valid_text) is True

def test_engagement_filter_ambiguous_fail():
    """Test that ambiguous hashtags without context fail."""
    # '#BBL' alone is ambiguous. Needs 'match', 'cricket', 'run', etc.
    ambiguous_text = "I love #BBL" 
    assert is_valid_content(ambiguous_text) is False

def test_engagement_filter_ambiguous_pass():
    """Test that ambiguous hashtags WITH context pass."""
    valid_text = "I love #BBL, what a great cricket match!" 
    assert is_valid_content(valid_text) is True

def test_engagement_filter_spam_keywords():
    """Test that blocked keywords trigger immediate failure."""
    spam_text = "Join my whatsapp group for betting id and jackpot prize #IPL"
    assert is_valid_content(spam_text) is False

def test_engagement_filter_case_insensitivity():
    """Test that capitalization doesn't break the filter."""
    valid_text = "MAJORLEAGUECRICKET IS THE BEST"
    assert is_valid_content(valid_text) is True

# Live Match Diff Tests (Crash Prevention)
def create_mock_match(innings_data):
    """Helper to create a LiveMatch object with specific innings."""
    return LiveMatch(
        match_id="123",
        status="Live",
        note="",
        innings=[InningScore(**i) for i in innings_data],
        venue_id=1,
        toss_won_team_id=1,
        toss_elected="bat",
        last_updated=datetime.now()
    )

def test_diff_service_fresh_match():
    """Test comparing against None (First poll) returns no events."""
    new_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 100, "wickets": 2, "overs": 10.0}
    ])
    events = detect_changes(None, new_match)
    assert events == []

def test_diff_service_wicket_event():
    """Test that a wicket increase is detected."""
    old_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 100, "wickets": 2, "overs": 10.0}
    ])
    new_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 100, "wickets": 3, "overs": 10.1} # +1 Wicket
    ])
    
    events = detect_changes(old_match, new_match)
    assert len(events) == 1
    assert events[0].event_type == EventType.WICKET
    assert "1 Wicket(s) fallen" in events[0].description

def test_diff_service_boundary_four():
    """Test that a score increase of 4 triggers a FOUR event."""
    old_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 100, "wickets": 2, "overs": 10.0}
    ])
    new_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 104, "wickets": 2, "overs": 10.1} # +4 Runs
    ])
    
    events = detect_changes(old_match, new_match)
    assert len(events) >= 1
    # Check if ANY event in the list is a FOUR
    assert any(e.event_type == EventType.FOUR for e in events)

def test_diff_service_new_inning_no_crash():
    """Test transition to 2nd inning doesn't crash comparison."""
    old_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 150, "wickets": 10, "overs": 20.0}
    ])
    # New match has both innings now
    new_match = create_mock_match([
        {"inning": 1, "team_id": 10, "score": 150, "wickets": 10, "overs": 20.0},
        {"inning": 2, "team_id": 20, "score": 0, "wickets": 0, "overs": 0.0}
    ])
    
    # Should return empty list (no events for starting 0/0) or just not crash
    events = detect_changes(old_match, new_match)
    assert isinstance(events, list)