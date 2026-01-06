import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { Radio, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveScores, useSchedules } from "@/hooks/use-cricket-data";
import LiveMatchCard from "@/components/LiveMatchCard";
import MatchCard from "@/components/MatchCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import type {
  LiveScoreMatch,
  ScheduleMatch,
  CombinedMatch,
  FilterStatus,
} from "@/lib/types";

export default function LiveScores() {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: liveScoresData = [],
    isLoading: liveLoading,
    error: liveError,
    refetch: refetchLive,
  } = useLiveScores({ refetchInterval: 30000 });

  const {
    data: schedulesData = [],
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useSchedules();

  const isLoading = liveLoading || scheduleLoading;
  const error = liveError || scheduleError;

  /* ---------------- COMBINE MATCHES ---------------- */

  const combinedMatches = useMemo<CombinedMatch[]>(() => {
    const matches: CombinedMatch[] = [];

    if (Array.isArray(liveScoresData)) {
      liveScoresData
        .filter((m: LiveScoreMatch) => m.match_status === "LIVE")
        .forEach((m) => matches.push({ ...m, _type: "live" }));
    }

    if (Array.isArray(schedulesData)) {
      schedulesData
        .filter((m: ScheduleMatch) => m.status === "Finished")
        .forEach((m) => matches.push({ ...m, _type: "finished" }));
    }

    return matches.sort((a, b) => {
      if (a._type === "live" && b._type === "finished") return -1;
      if (a._type === "finished" && b._type === "live") return 1;
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });
  }, [liveScoresData, schedulesData]);

  /* ---------------- FILTER ---------------- */

  const filteredMatches = useMemo(() => {
    let result = combinedMatches;

    if (filter === "LIVE") result = result.filter((m) => m._type === "live");
    if (filter === "COMPLETED")
      result = result.filter((m) => m._type === "finished");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m._type === "live"
          ? m.teams.batting_first.name.toLowerCase().includes(q) ||
            m.teams.batting_second.name.toLowerCase().includes(q) ||
            m.venue.city.toLowerCase().includes(q)
          : m.home_team.name.toLowerCase().includes(q) ||
            m.away_team.name.toLowerCase().includes(q) ||
            m.league.name.toLowerCase().includes(q) ||
            m.venue.city.toLowerCase().includes(q)
      );
    }

    return result;
  }, [combinedMatches, filter, searchQuery]);

  const liveCount = combinedMatches.filter((m) => m._type === "live").length;

  return (
    <>
      <Helmet>
        <title>Live Cricket Scores | STRYKER</title>
      </Helmet>

      {/* ---------------- HERO (Schedule-style) ---------------- */}
      <section className="relative h-[45vh] min-h-[360px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1730739463889-34c7279277a9?q=80&w=1600&auto=format&fit=crop"
            alt="Live cricket"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background/95" />

        <div className="absolute inset-0 flex items-center z-10">
          <div className="container-content">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="h-6 w-6 text-white" />
                {liveCount > 0 && (
                  <span className="text-white/80 uppercase tracking-widest text-xs font-bold">
                    {liveCount} Live Now
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Live Scores
              </h1>

              <p className="text-white/90 text-lg max-w-2xl">
                Real-time updates from professional matches worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONTENT ---------------- */}
      <div className="bg-background">
        <div className="container-content py-16">
          {/* FILTER + SEARCH */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
                {(["ALL", "LIVE", "COMPLETED"] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                      filter === status
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    {status === "ALL" && "All"}
                    {status === "LIVE" && "Live"}
                    {status === "COMPLETED" && "Finished"}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams, leagues, or city…"
                  className="w-full pl-12 pr-4 py-3 bg-muted border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* MATCH GRID */}
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <LoadingState message="Loading live data…" />
            </div>
          ) : error ? (
            <ErrorState
              message="Unable to load live scores"
              onRetry={() => {
                refetchLive();
                refetchSchedules();
              }}
            />
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-24 border border-dashed rounded-3xl">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold">No Matches Found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search."
                  : "No matches are live or completed."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.map((match) =>
                match._type === "live" ? (
                  <LiveMatchCard key={match.match_id} match={match} />
                ) : (
                  <MatchCard key={match.match_id} match={match} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
