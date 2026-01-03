// Custom hooks for data fetching - backend-aligned (NO adapters)

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ScheduleMatch, LiveMatch } from "@/lib/types";
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
      return res.data.data; 
    },
  });
}

/* ---------------- SINGLE MATCH ---------------- */

export function useLiveMatch(matchId: number | undefined) {
  return useQuery<LiveMatch>({
    queryKey: ["live-match", matchId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/matches/${matchId}/live`);
      return res.data; 
    },
    enabled: typeof matchId === "number",
    refetchInterval: 10_000,
  });
}

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

export function useMatchDetail(matchId?: number) {
  return useQuery({
    queryKey: ["match-detail", matchId],
    enabled: typeof matchId === "number",
    queryFn: async () => {
      const res = await api.get(`/api/v1/matches/${matchId}`);
      console.log('FINISHED MATCH DETAIL: ', res.data);
      return res.data; 
    },
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