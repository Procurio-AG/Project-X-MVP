// frontend/src/lib/types.ts

export type MatchStatus = "LIVE" | "UPCOMING" | "FINISHED" | "NS" | "Finished" | "ABAN.";

/* ---------- Core Types ---------- */

export interface Team {
  id: number;
  name: string;
  short_name?: string;
  code?: string;
  logo?: string;
  image_path?: string;
  country_id?: number;
  national_team?: boolean;
}

export interface League {
  id: number;
  name: string;
  code?: string;
  image_path?: string;
  season_id?: number;
  country_id?: number;
  type?: string;
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  image_path?: string;
  capacity?: number;
  floodlight?: boolean;
}

/* ---------- LiveScore API Types (/api/v1/matches/livescore) ---------- */

export interface Toss {
  won_by_team_id: number | null;
  elected: 'bat' | 'bowl' | null;
}

export interface InningsScore {
  team_id: number;
  score: string; // e.g., "118/7"
  overs: string; // e.g., "18.4"
}

export interface LiveScoreMatch {
  match_id: string;
  match_status: 'LIVE' | 'FINISHED' | 'NS' | 'ABAN.';
  innings_phase: 'FIRST_INNINGS' | 'SECOND_INNINGS' | 'COMPLETED' | 'NS' | 'INNINGS_BREAK';
  start_time: string;
  result: string | null;
  teams: {
    batting_first: Team;
    batting_second: Team;
  };
  scores: {
    first_innings: InningsScore | null;
    second_innings: InningsScore | null;
    current: InningsScore | null;
  };
  toss: Toss;
  venue: Venue;
}

/* ---------- Schedule API Types (/api/v1/schedules) ---------- */

export interface ScheduleMatch {
  id: number;
  match_id: string;
  status: 'Finished' | 'NS' | 'Aban.' | string;
  title: string;
  league: League;
  home_team: Team;
  away_team: Team;
  home_score: string | null;
  away_score: string | null;
  result_note: string | null;
  start_time: string;
  venue: Venue;
  match_type: string;
  updated_at?: string;
}

/* ---------- Combined Match Type ---------- */

export type CombinedMatch = 
  | (LiveScoreMatch & { _type: 'live' })
  | (ScheduleMatch & { _type: 'finished' });

/* ---------- Filter Types ---------- */

export type FilterStatus = 'ALL' | 'LIVE' | 'COMPLETED';

/* ---------- Legacy Types (for backward compatibility) ---------- */

export interface MatchTeams {
  home: Team;
  away: Team;
}

export interface LiveScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface LiveMatch {
  match_id: number;
  status: MatchStatus;
  current_inning: number;
  score: LiveScore;
  batting_team: Team;
  bowling_team: Team;
  last_updated: string;
}

/* ---------- Events ---------- */

export type EventType =
  | "WICKET"
  | "FOUR"
  | "SIX"
  | "RUNS"
  | "OVER_END"
  | "INNINGS_CHANGE"
  | "MATCH_END";

export interface MatchEvent {
  match_id: number;
  event_type: EventType;
  description: string;
  timestamp: string;
  inning: number;
  over: number;
}

/* ---------- Mock Data Types (Keep for Phase 1) ---------- */

export interface CommentaryBall {
  id: string;
  over: string;
  ball: number;
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  isSix: boolean;
  description: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'news' | 'analysis' | 'opinion';
}

export interface DiscussionPost {
  id: string;
  matchId?: number;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
}

export interface ScorecardEntry {
  batsman: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlingFigures {
  bowler: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
}

export interface FullScorecard {
  innings: number;
  team: Team;
  batting: ScorecardEntry[];
  bowling: BowlingFigures[];
  extras: {
    byes: number;
    legByes: number;
    wides: number;
    noBalls: number;
    penalties: number;
    total: number;
  };
  total: {
    runs: number;
    wickets: number;
    overs: string;
  };
  fallOfWickets: string[];
}