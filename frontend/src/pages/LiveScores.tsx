import { Helmet } from "react-helmet-async";
import {
  useSchedules,
  useLiveMatches,
} from "@/hooks/use-cricket-data";
import MatchCard from "@/components/MatchCard";
import LiveMatchCard from "@/components/LiveMatchCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { Radio, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

type FilterStatus = "ALL" | "LIVE" | "UPCOMING" | "FINISHED";

function mapStatus(status: string): FilterStatus {
  const s = status.toLowerCase();
  if (s === "ns") return "UPCOMING";
  if (s === "finished") return "FINISHED";
  return "LIVE";
}

export default function LiveScores() {
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const {
    data: scheduleMatches,
    isLoading,
    error,
    refetch,
  } = useSchedules();

  const { data: liveMatches } = useLiveMatches();

  /* ---------------- FIX: DEDUPLICATION USING MAP ---------------- */
  const filteredMatches = useMemo(() => {
    // We use a Map to ensure match_id is unique. 
    // If a match is in both Live and Schedule, the Live version will be stored.
    const matchMap = new Map<number | string, any>();

    // 1. Process Live matches first (higher priority data)
    if (filter === "ALL" || filter === "LIVE") {
      (liveMatches || []).forEach((match) => {
        matchMap.set(match.match_id, { ...match, _isLive: true });
      });
    }

    // 2. Process Schedule matches
    if (filter !== "LIVE") {
      (scheduleMatches || []).forEach((match) => {
        const status = mapStatus(match.status);
        
        // Only add if it matches the current filter
        if (filter === "ALL" || status === filter) {
          // If filtering "ALL", don't overwrite if we already have a Live version
          if (!matchMap.has(match.match_id)) {
            matchMap.set(match.match_id, { ...match, _isLive: false });
          }
        }
      });
    }

    return Array.from(matchMap.values());
  }, [liveMatches, scheduleMatches, filter]);

  const liveCount = liveMatches?.length || 0;

  return (
    <>
      <Helmet>
        <title>Live Cricket Scores | STRYKER</title>
        <meta
          name="description"
          content="Real-time cricket scores and match updates. Follow every ball, every run, every wicket live."
        />
      </Helmet>

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-10">
        <div className="container-content">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="h-6 w-6" />
            <h1 className="font-display text-3xl font-bold">
              Live Scores
            </h1>
            {liveCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-live text-live-foreground text-sm font-medium animate-pulse-subtle">
                {liveCount} LIVE
              </span>
            )}
          </div>
          <p className="text-primary-foreground/80">
            Real-time updates from matches around the world.
          </p>
        </div>
      </section>

      <div className="container-content py-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {(["ALL", "LIVE", "UPCOMING", "FINISHED"] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "LIVE" && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
                    </span>
                    Live
                  </span>
                )}
                {status === "ALL" && "All Matches"}
                {status === "UPCOMING" && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Upcoming
                  </span>
                )}
                {status === "FINISHED" && "Completed"}
              </button>
            )
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Auto-refreshing every 30 seconds
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <LoadingState message="Fetching latest scores..." />
        ) : error ? (
          <ErrorState
            message="Unable to fetch match data. Please try again."
            onRetry={() => refetch()}
          />
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            title={`No ${filter.toLowerCase()} matches`}
            message="Check back later or adjust your filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) =>
              // Use the internal _isLive flag or duck-typing to choose the component
              match._isLive || "batting_team" in match ? (
                <LiveMatchCard
                  key={`live-${match.match_id}`}
                  match={match}
                />
              ) : (
                <MatchCard
                  key={`sched-${match.match_id}`}
                  match={match}
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}