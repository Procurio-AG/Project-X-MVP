// Custom hooks for data fetching - backend-aligned (NO adapters)

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ScheduleMatch, LiveMatch } from "@/lib/types";
import { endpoints } from "@/lib/api/endpoints";
import {
  fetchMockNews,
  fetchMockDiscussions,
  fetchMockCommentary,
  fetchMockScorecard,
} from "@/lib/mock-data";

/* ---------------- LIVE MATCHES ---------------- */

export function useLiveMatches(options?: { refetchInterval?: number }) {
  return useQuery<LiveMatch[]>({
    queryKey: ["live-matches"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/matches/live");
        return res.data?.data ?? [];
      } catch {
        return [];
      }
    },
    refetchInterval: options?.refetchInterval ?? 30_000,
  });
}

/* ---------------- SCHEDULES ---------------- */

export function useSchedules() {
  return useQuery<ScheduleMatch[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get("/api/v1/schedules");
      console.log("SCHEDULE - ", res.data);
      return res.data.data; 
    },
  });
}

/* ---------------- SINGLE MATCH ---------------- */

/**
 * Hook for basic live match info (normalized data)
 */
export function useLiveMatch(matchId: number | undefined) {
  return useQuery<LiveMatch>({
    queryKey: ["live-match", matchId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/matches/${matchId}/live`);
      console.log(" /api/v1/matches/${matchId}/live- ", res.data);
      return res.data; 
    },
    enabled: typeof matchId === "number",
    refetchInterval: 5_000, // Updated to 5s for consistency with detail page
  });
}

/**
 * General purpose match hook
 */
export function useMatch(matchId: number | undefined, options?: { refetchInterval?: number }) {
  const { data: schedules } = useSchedules();
  const { data: liveMatch } = useLiveMatch(matchId);

  return useQuery<ScheduleMatch | LiveMatch | undefined>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return undefined;
      if (liveMatch) return liveMatch;
      const scheduleMatch = schedules?.find(m => m.match_id === matchId);
      return scheduleMatch;
    },
    enabled: typeof matchId === "number",
    refetchInterval: options?.refetchInterval ?? 30_000,
  });
}

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: fetchMockNews,
  });
}

export function useDiscussions(matchId?: number) {
  return useQuery({
    queryKey: ["discussions", matchId],
    queryFn: () => fetchMockDiscussions(matchId?.toString()),
  });
}

export function useCommentary(matchId: number | undefined) {
  return useQuery({
    queryKey: ["commentary", matchId],
    queryFn: () => fetchMockCommentary(matchId!),
    enabled: typeof matchId === "number",
  });
}

export function useScorecard(matchId: number | undefined) {
  return useQuery({
    queryKey: ["scorecard", matchId],
    queryFn: () => fetchMockScorecard(matchId!),
    enabled: typeof matchId === "number",
  });
}

/**
 * RICH DETAIL HOOK - Use this for LiveMatchDetail.tsx
 * Calls the endpoint: /api/v1/matches/{match_id}
 */
export function useMatchDetail(matchId?: number, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["match-detail", matchId],
    enabled: typeof matchId === "number",
    queryFn: async () => {
      const res = await api.get(`/api/v1/matches/${matchId}`);
      console.log(
        "[FRONTEND] /matches/:id response",
        matchId,
        res.data
      );
      return res.data; 
    },
    // Setting default to 5 seconds to solve the "no data" and "Venue TBC" issues
    refetchInterval: options?.refetchInterval ?? 5_000, 
  });
}

export function useMatchTeams(matchId: number | undefined) {
  return useQuery({
    queryKey: ["match-teams", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const res = await api.get("/api/v1/matches");
      const match = res.data.matches.find(
        (m: any) => String(m.match_id) === String(matchId)
      );
      return match?.teams ?? null;
    },
    enabled: !!matchId,
  });
}

/* ---------------- LIVE SCORE TICKER ---------------- */

export function useLiveScores(options?: { refetchInterval?: number }) {
  return useQuery<any[]>({
    queryKey: ["live-scores"],
    queryFn: async () => {
      const res = await api.get("/api/v1/matches/livescore");
      console.log("/api/v1/matches/livescore -", res.data);
      return res.data;
    },
    refetchInterval: options?.refetchInterval ?? 30000,
  });
}

export interface EngagementMedia {
  type: string;
  url: string;
}

export interface EngagementAuthor {
  name: string;
  handle?: string;
  avatar?: string;
}

export interface EngagementMetrics {
  likes: number;
  shares: number;
  views?: number;
}

export interface EngagementPost {
  id: string;
  source: "twitter" | "youtube";
  source_id: string;
  title?: string;
  text?: string;
  url: string;
  media: EngagementMedia[];
  author: EngagementAuthor;
  metrics: EngagementMetrics;
  published_at: string;
}

export interface EngagementFeedResponse {
  data: EngagementPost[];
  pagination: {
    next_cursor?: string | null;
  };
}

export async function fetchEngagementFeed(params?: {
  source?: "twitter" | "youtube";
  limit?: number;
  cursor?: string;
}) {
  return api.get<EngagementFeedResponse>(endpoints.engagementFeed, {
    params,
  });
}

export function useEngagementFeed(params?: {
  source?: "twitter" | "youtube";
  limit?: number;
  cursor?: string;
}) {
  const { source, limit, cursor } = params ?? {};

  return useQuery({
    queryKey: ["engagement-feed", source ?? "all", limit ?? 20, cursor ?? null],
    queryFn: () =>
      fetchEngagementFeed({ source, limit, cursor }).then(res => res.data),
    placeholderData: (prev) => prev,
  });
}

export function useInfiniteEngagementFeed(params?: {
  source?: "twitter" | "youtube";
  limit?: number;
  // Add options to control caching/refetching
  staleTime?: number;
  refetchInterval?: number;
}) {
  const { source, limit, staleTime, refetchInterval } = params ?? {};

  return useInfiniteQuery({
    queryKey: ["engagement-feed-infinite", source ?? "all", limit ?? 20],
    queryFn: ({ pageParam }) =>
      fetchEngagementFeed({
        source,
        limit,
        cursor: pageParam,
      }).then(res => res.data),

    getNextPageParam: (lastPage) =>
      lastPage.pagination?.next_cursor ?? undefined,

    initialPageParam: undefined as string | undefined,
    
    // OVERRIDE GLOBAL SETTINGS
    staleTime: staleTime, 
    refetchInterval: refetchInterval,
  });
}