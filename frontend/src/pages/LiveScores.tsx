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

    const LIVE_PHASES = ["FIRST", "SECOND", "INNINGS_BREAK"];

    if (Array.isArray(liveScoresData)) {
      liveScoresData
        .filter(
          (m: LiveScoreMatch) =>
            m.match_status !== "ABAN." &&
            (
              LIVE_PHASES.includes(m.innings_phase) ||
              m.match_status?.includes("INNINGS") ||
              m.match_status?.toUpperCase() === "INT."
            )
        )
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
      <section className="relative h-[30vh] min-h-[280px] w-full overflow-hidden bg-[#F8FAFC]">
        {/* Background accents to match Firehose */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-200/50 to-transparent -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />
        
        <div className="absolute inset-0 flex items-center z-10">
          <div className="container-content pt-6">
            <div className="max-w-4xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Radio className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <span className="text-accent font-bold tracking-[0.4em] text-[10px] uppercase">
                  {liveCount > 0 ? `${liveCount} Live Matches` : "Real-time Coverage"}
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-900">
                Live <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-100">Scores</span>
              </h1>

              <p className="text-slate-500 max-w-2xl font-medium leading-relaxed text-lg">
                Real-time updates from professional matches worldwide. Filtered for total coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONTENT ---------------- */}
      <div className="bg-[#F8FAFC] pb-20">
        <div className="container-content">
          {/* FILTER + SEARCH (Editorial Command Style) */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 mb-12 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Status Pills */}
              <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-xl w-fit">
                {(["ALL", "LIVE", "COMPLETED"] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                      filter === status
                        ? "bg-slate-900 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    {status === "ALL" && "All"}
                    {status === "LIVE" && "Live"}
                    {status === "COMPLETED" && "Finished"}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-accent transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search (teams, leagues, city)..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent/20 outline-none transition-all"
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
