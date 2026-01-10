// API Response Types - matching exact API contract

// Common types
export interface ApiTeam {
  id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
}

export interface ApiLeague {
  id: string;
  name: string;
}

export interface ApiVenue {
  id: string;
  name: string;
}

// GET /schedules
export interface ApiScheduleItem {
  match_id: string;
  start_time: string;
  format: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  league: ApiLeague;
  stage: string;
  venue: ApiVenue;
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
}

export interface ApiSchedulesResponse {
  schedules: ApiScheduleItem[];
}

// GET /matches
export interface ApiMatchItem {
  match_id: string;
  start_time: string;
  format: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  result: string | null;
}

export interface ApiMatchesResponse {
  matches: ApiMatchItem[];
}

// GET /matches/{match_id}/live
export interface ApiLiveScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface ApiCurrentInnings {
  batting_team_id: string;
  bowling_team_id: string;
  score: ApiLiveScore;
  target: number | null;
  run_rate: number;
  required_run_rate: number | null;
}

export interface ApiLiveMatchResponse {
  match_id: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  stage: string;
  current_innings: ApiCurrentInnings | null;
  last_updated: string;
}

// GET /matches/{match_id}/commentary (MOCKED)
export interface ApiCommentaryItem {
  commentary_id: string;
  over: string;
  event_type: string;
  text: string;
  timestamp: string;
}

export interface ApiCommentaryResponse {
  match_id: string;
  commentary: ApiCommentaryItem[];
}

// GET /matches/{match_id}/events
export type ApiEventType = 'RUN' | 'FOUR' | 'SIX' | 'WICKET' | 'OVER_END' | 'INNINGS_END' | 'MATCH_END';

export interface ApiEventItem {
  event_id: string;
  type: ApiEventType;
  team_id: string;
  player_id: string;
  over: string;
  timestamp: string;
}

export interface ApiEventsResponse {
  match_id: string;
  events: ApiEventItem[];
}

// GET /players/{player_id}/stats
export interface ApiPlayerBattingStats {
  matches: number;
  runs: number;
  average: number;
  strike_rate: number;
}

export interface ApiPlayerBowlingStats {
  matches: number;
  wickets: number;
  economy: number;
}

export interface ApiPlayerStatsResponse {
  player_id: string;
  name: string;
  batting: ApiPlayerBattingStats;
  bowling: ApiPlayerBowlingStats;
}

// GET /news (MOCKED)
export interface ApiNewsItem {
  id: number;
  headline: string;
  intro?: string | null;
  context?: string | null;
  story_type?: string | null;
  published_at: string; // ISO string
  match_id?: string | null;
  image_id?: string | null;
  image_url?: string | null;
}

export type ApiNewsResponse = ApiNewsItem[];
