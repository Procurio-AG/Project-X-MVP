// API endpoint functions - centralized data fetching layer
import { apiClient } from './client';
import type { NewsArticle } from "@/lib/types";
import type {
  ApiSchedulesResponse,
  ApiMatchesResponse,
  ApiLiveMatchResponse,
  ApiEventsResponse,
  ApiPlayerStatsResponse,
  ApiNewsResponse
} from './types';

// Schedules
export async function fetchSchedules(): Promise<ApiSchedulesResponse> {
  return apiClient<ApiSchedulesResponse>('/schedules/');
}

// Matches
export async function fetchMatches(): Promise<ApiMatchesResponse> {
  return apiClient<ApiMatchesResponse>('/matches');
}

// Live Match Score
export async function fetchLiveMatch(matchId: string): Promise<ApiLiveMatchResponse> {
  return apiClient<ApiLiveMatchResponse>(`/matches/${matchId}/live`);
}

// Match Events
export async function fetchMatchEvents(matchId: string): Promise<ApiEventsResponse> {
  return apiClient<ApiEventsResponse>(`/matches/${matchId}/events`);
}

// Player Stats
export async function fetchPlayerStats(playerId: string): Promise<ApiPlayerStatsResponse> {
  return apiClient<ApiPlayerStatsResponse>(`/players/${playerId}/stats`);
}

export async function fetchNews(limit = 20): Promise<ApiNewsResponse> {
  return apiClient<ApiNewsResponse>(`/api/v1/news?limit=${limit}`);
}

export const endpoints = {
  schedules: "/api/v1/schedules",
  liveMatches: "/api/v1/matches/live",

  liveScores: "/api/v1/matches/livescore",
  engagementFeed: "/api/v1/engagement/feed",
  news: "/api/v1/news",
};